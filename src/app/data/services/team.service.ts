import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { CreateTeamPayload, Team, TeamMetrics, UpdateTeamPayload } from '../../domain/models';
import { Task } from '../../domain/models';
import { User } from '../../domain/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/teams`;

  getAll(): Observable<Team[]> {
    return this.http.get<Team[]>(this.base);
  }

  getById(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.base}/${id}`);
  }

  getTeamMembers(team: Team): Observable<User[]> {
    const requests = team.memberIds.map((id) =>
      this.http.get<User>(`${environment.apiUrl}/users/${id}`),
    );
    return forkJoin(requests);
  }

  getTeamMetrics(teamId: string): Observable<TeamMetrics> {
    return this.http
      .get<Task[]>(`${environment.apiUrl}/tasks?teamId=${teamId}`)
      .pipe(
        map((tasks) => {
          const total = tasks.length;
          const completed = tasks.filter((t) => t.status === 'done').length;
          const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
          const now = new Date();
          const overdue = tasks.filter(
            (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done',
          ).length;
          return {
            teamId,
            totalTasks: total,
            completedTasks: completed,
            inProgressTasks: inProgress,
            overdueTasks: overdue,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            avgCompletionDays: 3.5,
            memberProductivity: [],
          } as TeamMetrics;
        }),
      );
  }

  create(payload: CreateTeamPayload): Observable<Team> {
    const initials = payload.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
    const team: Omit<Team, 'id'> = {
      ...payload,
      avatarInitials: initials,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.http.post<Team>(this.base, team);
  }

  update(id: string, payload: UpdateTeamPayload): Observable<Team> {
    return this.http.patch<Team>(`${this.base}/${id}`, {
      ...payload,
      updatedAt: new Date().toISOString(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  addMember(teamId: string, userId: string): Observable<Team> {
    return this.getById(teamId).pipe(
      map((team) => ({ ...team, memberIds: [...new Set([...team.memberIds, userId])] })),
    );
  }
}
