import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UpdateUserPayload, User, UserProfile } from '../../domain/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  getProfile(id: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}/${id}`);
  }

  update(id: string, payload: UpdateUserPayload): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}`, payload);
  }

  updatePreferences(id: string, preferences: Partial<User['preferences']>): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}`, { preferences });
  }
}
