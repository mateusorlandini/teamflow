import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { CreateTaskPayload, Task, TaskActivity, TaskComment, TaskFilters, TaskLabel, UpdateTaskPayload } from '../../domain/models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/tasks`;

  getAll(filters?: TaskFilters): Observable<Task[]> {
    let params = new HttpParams();
    if (filters?.teamId) params = params.set('teamId', filters.teamId);
    if (filters?.status?.length) {
      filters.status.forEach((s) => (params = params.append('status', s)));
    }
    if (filters?.priority?.length) {
      filters.priority.forEach((p) => (params = params.append('priority', p)));
    }
    if (filters?.assigneeIds?.length) {
      filters.assigneeIds.forEach((id) => (params = params.append('assigneeId', id)));
    }
    return this.http.get<Task[]>(this.base, { params }).pipe(
      map((tasks) => {
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          tasks = tasks.filter(
            (t) =>
              t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
          );
        }
        if (filters?.overdue) {
          const now = new Date();
          tasks = tasks.filter(
            (t) =>
              t.dueDate &&
              new Date(t.dueDate) < now &&
              t.status !== 'done' &&
              t.status !== 'cancelled',
          );
        }
        return tasks.sort((a, b) => a.position - b.position);
      }),
    );
  }

  getById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.base}/${id}`);
  }

  getWithDetails(id: string): Observable<{ task: Task; comments: TaskComment[]; activity: TaskActivity[] }> {
    return forkJoin({
      task: this.getById(id),
      comments: this.getComments(id),
      activity: this.getActivity(id),
    });
  }

  create(payload: CreateTaskPayload): Observable<Task> {
    const task: Omit<Task, 'id'> = {
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      loggedHours: 0,
      position: Date.now(),
    };
    return this.http.post<Task>(this.base, task);
  }

  update(id: string, payload: UpdateTaskPayload): Observable<Task> {
    return this.http.patch<Task>(`${this.base}/${id}`, {
      ...payload,
      updatedAt: new Date().toISOString(),
    });
  }

  updateStatus(id: string, status: string): Observable<Task> {
    return this.update(id, { status: status as any });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getComments(taskId: string): Observable<TaskComment[]> {
    return this.http.get<TaskComment[]>(`${environment.apiUrl}/comments?taskId=${taskId}`).pipe(
      map((comments) => comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())),
    );
  }

  addComment(comment: Omit<TaskComment, 'id' | 'createdAt' | 'updatedAt'>): Observable<TaskComment> {
    const payload: Omit<TaskComment, 'id'> = {
      ...comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.http.post<TaskComment>(`${environment.apiUrl}/comments`, payload);
  }

  getActivity(taskId: string): Observable<TaskActivity[]> {
    return this.http.get<TaskActivity[]>(`${environment.apiUrl}/activity?taskId=${taskId}`).pipe(
      map((activity) => activity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
    );
  }

  getLabels(teamId?: string): Observable<TaskLabel[]> {
    const url = teamId
      ? `${environment.apiUrl}/labels?teamId=${teamId}`
      : `${environment.apiUrl}/labels`;
    return this.http.get<TaskLabel[]>(url);
  }
}
