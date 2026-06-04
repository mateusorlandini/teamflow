import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import {
  ActivityFeedItem,
  DashboardMetrics,
  Task,
  TaskTrendPoint,
  TeamProductivityEntry,
  UpcomingDeadline
} from '../../domain/models';
import { environment } from '../../../environments/environment';

/** Shape of the records served by the json-server `/activity` endpoint. */
interface RawActivity {
  id: string;
  userId: string;
  action: ActivityFeedItem['action'];
  taskId: string;
  createdAt: string;
}

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
    return this.http
      .get<Task[]>(`${environment.apiUrl}/tasks`)
      .pipe(
        map((tasks) => {

          return tasks
            .filter(
              (t): t is Task & { dueDate: string } =>
                !!t.dueDate && t.status !== 'done' && t.status !== 'cancelled',
            )
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
        }),
      );
  }

  getActivityFeed(): Observable<ActivityFeedItem[]> {
    return this.http.get<RawActivity[]>(`${environment.apiUrl}/activity`).pipe(
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
