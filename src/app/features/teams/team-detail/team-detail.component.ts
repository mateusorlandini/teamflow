import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { TeamService } from '../../../data/services/team.service';
import { TaskService } from '../../../data/services/task.service';
import { Team, TeamMetrics } from '../../../domain/models/team.model';
import { User } from '../../../domain/models/user.model';
import { Task } from '../../../domain/models/task.model';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'tf-team-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatTabsModule,
    AvatarComponent, StatusBadgeComponent, PriorityBadgeComponent, SkeletonComponent, RelativeTimePipe,
  ],
  template: `
    <div class="tf-page-container">
      <a routerLink="/teams" mat-button class="back-btn">
        <mat-icon>arrow_back</mat-icon> Back to Teams
      </a>

      @if (isLoading()) {
        <tf-skeleton height="80px" />
      } @else if (team()) {
        <div class="team-header tf-card">
          <div class="team-header__avatar" [style.background]="team()!.avatarColor">
            {{ team()!.avatarInitials }}
          </div>
          <div class="team-header__info">
            <h1 class="team-header__name">{{ team()!.name }}</h1>
            <p class="team-header__desc">{{ team()!.description }}</p>
          </div>
          @if (metrics()) {
            <div class="team-header__stats">
              <div class="stat-chip">
                <span class="stat-chip__value">{{ metrics()!.totalTasks }}</span>
                <span class="stat-chip__label">Tasks</span>
              </div>
              <div class="stat-chip">
                <span class="stat-chip__value stat-chip__value--success">{{ metrics()!.completionRate }}%</span>
                <span class="stat-chip__label">Completion</span>
              </div>
              <div class="stat-chip">
                <span class="stat-chip__value stat-chip__value--warn">{{ metrics()!.overdueTasks }}</span>
                <span class="stat-chip__label">Overdue</span>
              </div>
            </div>
          }
        </div>

        <mat-tab-group class="team-tabs" animationDuration="200ms">
          <mat-tab label="Members">
            <div class="tab-content">
              <div class="member-grid">
                @for (member of members(); track member.id) {
                  <div class="member-card tf-card">
                    <tf-avatar [src]="member.avatar" [name]="member.name" size="lg" />
                    <div class="member-card__info">
                      <span class="member-card__name">{{ member.name }}</span>
                      <span class="member-card__title">{{ member.jobTitle }}</span>
                      <span class="member-card__dept">{{ member.department }}</span>
                    </div>
                    <span class="member-card__role" [class]="'role-' + member.role">{{ member.role }}</span>
                  </div>
                }
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Tasks ({{ tasks().length }})">
            <div class="tab-content">
              <div class="team-tasks">
                @for (task of tasks(); track task.id) {
                  <a class="team-task-row" [routerLink]="['/tasks', task.id]">
                    <div class="team-task-row__info">
                      <span class="team-task-row__title">{{ task.title }}</span>
                      <span class="team-task-row__date">{{ task.updatedAt | relativeTime }}</span>
                    </div>
                    <tf-status-badge [status]="task.status" />
                    <tf-priority-badge [priority]="task.priority" [showLabel]="false" />
                  </a>
                }
                @if (tasks().length === 0) {
                  <p class="no-data">No tasks assigned to this team yet.</p>
                }
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .back-btn { margin-bottom: 16px; color: var(--tf-text-secondary) !important; }
    .team-header {
      display: flex; align-items: flex-start; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;
      &__avatar { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #fff; flex-shrink: 0; }
      &__info { flex: 1; }
      &__name { font-size: 24px; font-weight: 700; color: var(--tf-text-primary); margin: 0 0 6px; }
      &__desc { font-size: 14px; color: var(--tf-text-secondary); margin: 0; }
      &__stats { display: flex; gap: 16px; align-self: center; }
    }
    .stat-chip {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 10px 16px; background: var(--tf-surface-secondary); border-radius: var(--tf-radius-md);
      &__value { font-size: 22px; font-weight: 700; color: var(--tf-text-primary); line-height: 1; &--success { color: var(--tf-success-500); } &--warn { color: var(--tf-danger-500); } }
      &__label { font-size: 11px; font-weight: 600; color: var(--tf-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    }
    .team-tabs { margin-top: 0; }
    .tab-content { padding: 20px 0; }
    .member-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .member-card {
      display: flex; align-items: center; gap: 14px; padding: 16px !important;
      &__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
      &__name { font-size: 14px; font-weight: 600; color: var(--tf-text-primary); }
      &__title { font-size: 12px; color: var(--tf-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      &__dept { font-size: 11px; color: var(--tf-text-muted); }
      &__role { font-size: 11px; font-weight: 600; text-transform: capitalize; padding: 2px 8px; border-radius: 9999px; flex-shrink: 0;
        &.role-admin   { background: rgba(99,102,241,0.1); color: var(--tf-primary-600); }
        &.role-manager { background: rgba(245,158,11,0.1); color: var(--tf-warning-600); }
        &.role-member  { background: var(--tf-surface-tertiary); color: var(--tf-text-secondary); }
      }
    }
    .team-tasks { display: flex; flex-direction: column; }
    .team-task-row {
      display: flex; align-items: center; gap: 16px; padding: 12px 4px;
      border-bottom: 1px solid var(--tf-border); text-decoration: none;
      transition: background var(--tf-transition-fast);
      &:hover { background: var(--tf-surface-secondary); }
      &:last-child { border-bottom: none; }
      &__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
      &__title { font-size: 14px; font-weight: 500; color: var(--tf-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      &__date { font-size: 11px; color: var(--tf-text-muted); }
    }
    .no-data { color: var(--tf-text-muted); font-style: italic; font-size: 13px; padding: 16px 0; }
  `],
})
export class TeamDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly teamService = inject(TeamService);
  private readonly taskService = inject(TaskService);

  readonly isLoading = signal(true);
  readonly team = signal<Team | null>(null);
  readonly members = signal<User[]>([]);
  readonly tasks = signal<Task[]>([]);
  readonly metrics = signal<TeamMetrics | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    forkJoin({
      team: this.teamService.getById(id),
      tasks: this.taskService.getAll({ teamId: id }),
      metrics: this.teamService.getTeamMetrics(id),
    }).subscribe(({ team, tasks, metrics }) => {
      this.team.set(team);
      this.tasks.set(tasks);
      this.metrics.set(metrics);
      this.teamService.getTeamMembers(team).subscribe((m) => this.members.set(m));
      this.isLoading.set(false);
    });
  }
}
