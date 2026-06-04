import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { UserRole } from '../../../domain/enums';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser = {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@teamflow.io',
    password: 'admin123',
    role: UserRole.Admin,
    avatar: 'https://example.com/avatar.jpg',
    teamIds: ['t1'],
    preferences: {
      theme: 'light',
      dashboardLayout: 'comfortable',
      notifications: {
        taskAssigned: true,
        taskDeadline: true,
        taskComment: true,
        taskMention: true,
        teamUpdates: true,
        emailDigest: false,
      },
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start with no authenticated user', () => {
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should restore session from localStorage if token exists', () => {
      localStorage.setItem('tf_access_token', 'test-token');
      localStorage.setItem('tf_user', JSON.stringify(mockUser));
      localStorage.setItem('tf_expires_at', String(Date.now() + 86_400_000));
      const freshService = TestBed.runInInjectionContext(() => new AuthService());
      expect(freshService.isAuthenticated()).toBe(true);
      expect(freshService.currentUser()?.email).toBe('admin@teamflow.io');
    });
  });

  describe('login()', () => {
    it('should authenticate user and store session on success', async () => {
      const loginPromise = lastValueFrom(
        service.login({ email: 'admin@teamflow.io', password: 'admin123' }),
      );
      const req = httpMock.expectOne((r) => r.url.includes('/users'));
      req.flush([mockUser]);
      const response = await loginPromise;
      expect(response.email).toBe('admin@teamflow.io');
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.role).toBe(UserRole.Admin);
      expect(localStorage.getItem('tf_access_token')).toBeTruthy();
    });

    it('should set authError signal on failed login', async () => {
      const loginPromise = lastValueFrom(
        service.login({ email: 'wrong@email.com', password: 'wrong' }),
      ).catch(() => null);
      const req = httpMock.expectOne((r) => r.url.includes('/users'));
      req.flush([]);
      await loginPromise;
      expect(service.authError()).toBeTruthy();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should set isLoading to true during request and false after', async () => {
      const loginPromise = lastValueFrom(
        service.login({ email: 'admin@teamflow.io', password: 'admin123' }),
      );
      expect(service.isLoading()).toBe(true);
      const req = httpMock.expectOne((r) => r.url.includes('/users'));
      req.flush([mockUser]);
      await loginPromise;
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('logout()', () => {
    it('should clear user state and localStorage on logout', () => {
      localStorage.setItem('tf_access_token', 'test-token');
      localStorage.setItem('tf_user', JSON.stringify(mockUser));
      const freshService = TestBed.runInInjectionContext(() => new AuthService());
      freshService.logout();
      expect(freshService.currentUser()).toBeNull();
      expect(freshService.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('tf_access_token')).toBeNull();
    });
  });

  describe('hasPermission()', () => {
    beforeEach(() => {
      localStorage.setItem('tf_access_token', 'tok');
      localStorage.setItem('tf_user', JSON.stringify(mockUser));
      service = TestBed.runInInjectionContext(() => new AuthService());
    });

    it('should return true for admin creating tasks', () => {
      expect(service.hasPermission('tasks', 'create')).toBe(true);
    });

    it('should return true for admin deleting users', () => {
      expect(service.hasPermission('users', 'delete')).toBe(true);
    });

    it('should return false if user is not authenticated', () => {
      service.logout();
      expect(service.hasPermission('tasks', 'create')).toBe(false);
    });
  });

  describe('hasRole()', () => {
    beforeEach(() => {
      localStorage.setItem('tf_access_token', 'tok');
      localStorage.setItem('tf_user', JSON.stringify(mockUser));
      service = TestBed.runInInjectionContext(() => new AuthService());
    });

    it('should return true when user has the required role', () => {
      expect(service.hasRole(UserRole.Admin)).toBe(true);
    });

    it('should return false when user lacks the required role', () => {
      expect(service.hasRole(UserRole.Member)).toBe(false);
    });
  });
});
