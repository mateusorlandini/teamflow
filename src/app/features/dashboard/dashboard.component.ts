import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService } from '../../data/services/dashboard.service';
import { UserService } from '../../data/services/user.service';
import { AuthService } from '../../core/auth/services/auth.service';
import { DashboardMetrics, TaskTrendPoint, TeamProductivityEntry, UpcomingDeadline } from '../../domain/models/dashboard.model';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { TASK_PRIORITY_COLORS } from '../../domain/enums/task-priority.enum';
import { User } from '../../domain/models/user.model';

@Component({
  selector: 'tf-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    BaseChartDirective,
    SkeletonComponent,
  ],
  template: `
    <div class="tf-page-container">
      <div class="tf-page-header">
        <div>
          <h1 class="tf-page-title">Dashboard</h1>
          <p class="tf-page-subtitle">
            Welcome back, {{ auth.currentUser()?.name?.split(' ')?.[0] }} 👋
          </p>
        </div>
        <a mat-flat-button color="primary" routerLink="/tasks" [queryParams]="{new: true}">
          <mat-icon>add</mat-icon>
          New Task
        </a>
      </div>

      <!-- Metrics Grid -->
      <div class="metrics-grid">
        @if (isLoading()) {
          @for (_ of [1,2,3,4]; track $index) {
            <div class="metric-card">
              <tf-skeleton height="80px" />
            </div>
          }
        } @else if (metrics()) {
          <div class="metric-card metric-card--primary">
            <div class="metric-card__icon">
              <mat-icon>task_alt</mat-icon>
            </div>
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics()!.totalTasks }}</span>
              <span class="metric-card__label">Total Tasks</span>
            </div>
            <div class="metric-card__trend" [class.positive]="metrics()!.weeklyTrend > 0">
              <mat-icon>{{ metrics()!.weeklyTrend > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
              <span>{{ metrics()!.weeklyTrend }}% this week</span>
            </div>
          </div>

          <div class="metric-card metric-card--success">
            <div class="metric-card__icon">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics()!.completedTasks }}</span>
              <span class="metric-card__label">Completed</span>
            </div>
            <div class="metric-card__sub">
              {{ metrics()!.completionRate }}% completion rate
            </div>
          </div>

          <div class="metric-card metric-card--warning">
            <div class="metric-card__icon">
              <mat-icon>pending</mat-icon>
            </div>
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics()!.inProgressTasks }}</span>
              <span class="metric-card__label">In Progress</span>
            </div>
            <div class="metric-card__sub">
              Across {{ metrics()!.totalTeams }} teams
            </div>
          </div>

          <div class="metric-card metric-card--danger">
            <div class="metric-card__icon">
              <mat-icon>schedule</mat-icon>
            </div>
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics()!.overdueTasks }}</span>
              <span class="metric-card__label">Overdue</span>
            </div>
            <div class="metric-card__sub">
              Need attention
            </div>
          </div>
        }
      </div>

      <!-- Charts + Productivity Row -->
      <div class="dashboard-row">
        <div class="tf-card chart-card">
          <h3 class="tf-section-title">Task Trend — Last 7 Days</h3>
          @if (!isLoading() && trendChartData) {
            <div class="chart-wrapper">
              <canvas baseChart
                [data]="trendChartData"
                [options]="lineChartOptions"
                type="line">
              </canvas>
            </div>
          } @else {
            <tf-skeleton height="220px" />
          }
        </div>

        <div class="tf-card productivity-card">
          <h3 class="tf-section-title">Team Productivity</h3>
          @if (!isLoading() && productivity().length > 0) {
            <div class="team-productivity-list">
              @for (entry of productivity(); track entry.teamId) {
                <div class="team-prod-item">
                  <div class="team-prod-item__header">
                    <span class="team-prod-item__name">{{ entry.teamName }}</span>
                    <span class="team-prod-item__rate">{{ entry.completionRate }}%</span>
                  </div>
                  <mat-progress-bar
                    mode="determinate"
                    [value]="entry.completionRate"
                    [color]="entry.completionRate >= 50 ? 'primary' : 'warn'"
                  />
                  <div class="team-prod-item__stats">
                    <span>{{ entry.completedTasks }} done</span>
                    <span>{{ entry.totalTasks }} total</span>
                  </div>
                </div>
              }
            </div>
          } @else {
            <tf-skeleton height="180px" />
          }
        </div>
      </div>

      <!-- Deadlines + Activity Row -->
      <div class="dashboard-row">
        <div class="tf-card">
          <div class="card-header-row">
            <h3 class="tf-section-title">Upcoming Deadlines</h3>
            <a routerLink="/tasks" class="view-all-link">View all</a>
          </div>
          @if (!isLoading()) {
            @if (deadlines().length === 0) {
              <div class="empty-info">
                <mat-icon>celebration</mat-icon>
                <span>No deadlines in the next 7 days!</span>
              </div>
            } @else {
              <div class="deadline-list">
                @for (d of deadlines(); track d.taskId) {
                  <a class="deadline-item" [routerLink]="['/tasks', d.taskId]">
                    <div class="deadline-item__info">
                      <span class="deadline-item__title">{{ d.title }}</span>
                      <span
                        class="deadline-item__due"
                        [class.overdue]="d.daysUntilDue < 0"
                        [class.urgent]="d.daysUntilDue >= 0 && d.daysUntilDue <= 1"
                      >
                        {{ d.daysUntilDue < 0 ? 'Overdue by ' + (-d.daysUntilDue) + 'd' :
                           d.daysUntilDue === 0 ? 'Due today' :
                           'In ' + d.daysUntilDue + ' day(s)' }}
                      </span>
                    </div>
                    <span
                      class="deadline-item__priority"
                      [style.color]="getPriorityColor(d.priority)"
                    >{{ d.priority }}</span>
                  </a>
                }
              </div>
            }
          } @else {
            <tf-skeleton height="140px" />
          }
        </div>

        <div class="tf-card">
          <div class="card-header-row">
            <h3 class="tf-section-title">Active Members</h3>
          </div>
          @if (!isLoading() && members().length > 0) {
            <div class="member-list">
              @for (member of members(); track member.id) {
                <div class="member-item">
                  <img class="member-item__avatar" [src]="member.avatar" [alt]="member.name" />
                  <div class="member-item__info">
                    <span class="member-item__name">{{ member.name }}</span>
                    <span class="member-item__title">{{ member.jobTitle }}</span>
                  </div>
                  <span class="member-item__role">{{ member.role }}</span>
                </div>
              }
            </div>
          } @else {
            <tf-skeleton height="180px" />
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly userService = inject(UserService);
  readonly auth = inject(AuthService);

  readonly isLoading = signal(true);
  readonly metrics = signal<DashboardMetrics | null>(null);
  readonly productivity = signal<TeamProductivityEntry[]>([]);
  readonly deadlines = signal<UpcomingDeadline[]>([]);
  readonly members = signal<User[]>([]);

  trendChartData: ChartData<'line'> | null = null;

  readonly lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12, family: 'Inter' } } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11, family: 'Inter' } } },
      y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11, family: 'Inter' } } },
    },
    elements: { line: { tension: 0.4 }, point: { radius: 4, hoverRadius: 6 } },
  };

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: ({ metrics, trend, productivity, deadlines }) => {
        this.metrics.set(metrics);
        this.productivity.set(productivity);
        this.deadlines.set(deadlines);
        this.trendChartData = this.buildTrendChart(trend);
        this.isLoading.set(false);
      },
    });
    this.userService.getAll().subscribe((users) => this.members.set(users.filter((u) => u.isActive)));
  }

  getPriorityColor(priority: string): string {
    return (TASK_PRIORITY_COLORS as any)[priority] ?? '#6b7280';
  }

  private buildTrendChart(trend: TaskTrendPoint[]): ChartData<'line'> {
    return {
      labels: trend.map((t) =>
        new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ),
      datasets: [
        {
          label: 'Completed',
          data: trend.map((t) => t.completed),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          fill: true,
        },
        {
          label: 'Created',
          data: trend.map((t) => t.created),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.1)',
          fill: true,
        },
      ],
    };
  }
}
