import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TeamService } from '../../../data/services/team.service';
import { UserService } from '../../../data/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { Team, TeamMetrics, User } from '../../../domain/models';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TeamFormDialogComponent } from '../team-form-dialog/team-form-dialog.component';
import { forkJoin } from 'rxjs';

interface TeamWithMetrics extends Team {
  metrics?: TeamMetrics;
  members: User[];
}

@Component({
  selector: 'tf-teams-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatButtonModule, MatIconModule, MatTooltipModule,
    MatProgressBarModule, AvatarComponent, SkeletonComponent, EmptyStateComponent,
  ],
  template: `
    <div class="tf-page-container">
      <div class="tf-page-header">
        <div>
          <h1 class="tf-page-title">Teams</h1>
          <p class="tf-page-subtitle">{{ teams().length }} teams in your workspace</p>
        </div>
        <button mat-flat-button color="primary" (click)="openCreateDialog()">
          <mat-icon>group_add</mat-icon> New Team
        </button>
      </div>

      @if (isLoading()) {
        <div class="teams-grid">
          @for (_ of [1,2,3]; track $index) {
            <div class="tf-card team-card-skeleton">
              <tf-skeleton height="48px" width="48px" [rounded]="true" />
              <tf-skeleton height="22px" width="60%" />
              <tf-skeleton height="16px" />
              <tf-skeleton height="8px" />
            </div>
          }
        </div>
      } @else if (teams().length === 0) {
        <tf-empty-state
          icon="group"
          title="No teams yet"
          description="Create your first team to start collaborating."
          actionLabel="Create Team"
          (action)="openCreateDialog()"
        />
      } @else {
        <div class="teams-grid">
          @for (team of teams(); track team.id) {
            <div class="tf-card team-card">
              <div class="team-card__header">
                <div class="team-card__avatar" [style.background]="team.avatarColor">
                  {{ team.avatarInitials }}
                </div>
                <div class="team-card__info">
                  <a class="team-card__name" [routerLink]="['/teams', team.id]">{{ team.name }}</a>
                  <span class="team-card__member-count">{{ team.memberIds.length }} members</span>
                </div>
                <button mat-icon-button class="team-card__menu-btn" (click)="openEditDialog(team)" matTooltip="Edit team">
                  <mat-icon>edit</mat-icon>
                </button>
              </div>

              <p class="team-card__desc">{{ team.description }}</p>

              @if (team.metrics) {
                <div class="team-card__metrics">
                  <div class="team-metric">
                    <span class="team-metric__value">{{ team.metrics.totalTasks }}</span>
                    <span class="team-metric__label">Tasks</span>
                  </div>
                  <div class="team-metric">
                    <span class="team-metric__value">{{ team.metrics.completedTasks }}</span>
                    <span class="team-metric__label">Done</span>
                  </div>
                  <div class="team-metric">
                    <span class="team-metric__value team-metric__value--warn">{{ team.metrics.overdueTasks }}</span>
                    <span class="team-metric__label">Overdue</span>
                  </div>
                  <div class="team-metric">
                    <span class="team-metric__value team-metric__value--primary">{{ team.metrics.completionRate }}%</span>
                    <span class="team-metric__label">Rate</span>
                  </div>
                </div>
                <mat-progress-bar
                  mode="determinate"
                  [value]="team.metrics.completionRate"
                  color="primary"
                  class="team-card__progress"
                />
              }

              <div class="team-card__members">
                <div class="avatar-stack">
                  @for (member of team.members.slice(0, 5); track member.id) {
                    <tf-avatar
                      [src]="member.avatar"
                      [name]="member.name"
                      size="sm"
                      [tooltip]="member.name"
                      class="avatar-stack__item"
                    />
                  }
                  @if (team.members.length > 5) {
                    <span class="avatar-stack__extra">+{{ team.members.length - 5 }}</span>
                  }
                </div>
                <a class="team-card__view-link" [routerLink]="['/teams', team.id]">
                  View team <mat-icon>arrow_forward</mat-icon>
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './teams-list.component.scss',
})
export class TeamsListComponent implements OnInit {
  private readonly teamService = inject(TeamService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  readonly isLoading = signal(true);
  readonly teams = signal<TeamWithMetrics[]>([]);

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.isLoading.set(true);
    forkJoin({
      teams: this.teamService.getAll(),
      users: this.userService.getAll(),
    }).subscribe(({ teams, users }) => {
      const enriched = teams.map((team) => ({
        ...team,
        members: users.filter((u) => team.memberIds.includes(u.id)),
      }));
      this.teams.set(enriched);
      this.isLoading.set(false);

      enriched.forEach((team) => {
        this.teamService.getTeamMetrics(team.id).subscribe((metrics) => {
          this.teams.update((ts) =>
            ts.map((t) => (t.id === team.id ? { ...t, metrics } : t)),
          );
        });
      });
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(TeamFormDialogComponent, { width: '520px', data: { team: null } });
    ref.afterClosed().subscribe((r) => { if (r) { this.toast.success('Team created.'); this.loadTeams(); } });
  }

  openEditDialog(team: Team): void {
    const ref = this.dialog.open(TeamFormDialogComponent, { width: '520px', data: { team } });
    ref.afterClosed().subscribe((r) => { if (r) { this.toast.success('Team updated.'); this.loadTeams(); } });
  }
}
