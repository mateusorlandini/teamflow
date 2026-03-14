import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { ActivityFeedItem, DashboardMetrics, TaskTrendPoint, TeamProductivityEntry, UpcomingDeadline } from '../../domain/models/dashboard.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${environment.apiUrl}/dashboardMetrics`);
  }

  getTaskTrend(): Observable<TaskTrendPoint[]> {
    return this.http.get<TaskTrendPoint[]>(`${environment.apiUrl}/taskTrend`);
  }

  getTeamProductivity(): Observable<TeamProductivityEntry[]> {
    return this.http.get<TeamProductivityEntry[]>(`${environment.apiUrl}/teamProductivity`);
  }

  getUpcomingDeadlines(): Observable<UpcomingDeadline[]> {
    const now = new Date().toISOString();
    return this.http
      .get<any[]>(`${environment.apiUrl}/tasks`)
      .pipe(
        map((tasks) => {
          const upcoming = tasks
            .filter((t) => t.dueDate && t.status !== 'done' && t.status !== 'cancelled')
            .map((t) => {
              const due = new Date(t.dueDate);
              const today = new Date();
              const diffMs = due.getTime() - today.getTime();
              const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              return {
                taskId: t.id,
                title: t.title,
                dueDate: t.dueDate,
                priority: t.priority,
                assigneeId: t.assigneeId,
                daysUntilDue,
              } as UpcomingDeadline;
            })
            .filter((t) => t.daysUntilDue <= 7)
            .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
          return upcoming;
        }),
      );
  }

  getActivityFeed(): Observable<ActivityFeedItem[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/activity`).pipe(
      map((activities) =>
        activities
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
          .map((a) => ({
            id: a.id,
            userId: a.userId,
            action: a.action,
            resourceType: 'task' as const,
            resourceId: a.taskId,
            resourceTitle: a.taskId,
            createdAt: a.createdAt,
          })),
      ),
    );
  }

  getDashboardData(): Observable<{
    metrics: DashboardMetrics;
    trend: TaskTrendPoint[];
    productivity: TeamProductivityEntry[];
    deadlines: UpcomingDeadline[];
  }> {
    return forkJoin({
      metrics: this.getMetrics(),
      trend: this.getTaskTrend(),
      productivity: this.getTeamProductivity(),
      deadlines: this.getUpcomingDeadlines(),
    });
  }
}
