---
name: angular-best-pratices
description: "Use this skill whenever the user wants to create, scaffold, or work with Angular applications, components, services, modules, or any Angular-related code. Triggers include: any mention of 'Angular', 'ng', '.component.ts', '.service.ts', '.module.ts', NgModule, standalone components, Angular CLI, RxJS in Angular context, Angular Material, NgRx, Angular Router, or requests to build SPAs (Single Page Applications) with Angular. Also use when generating Angular pipes, directives, guards, interceptors, resolvers, or when migrating Angular versions. Do NOT use for React, Vue, Svelte, or other frontend frameworks."
---

# Angular Best Practices Skill

## Overview

This skill guides the creation of production-grade Angular applications following current Angular best practices (Angular 17+). It covers standalone components (the modern default), signals, RxJS patterns, project structure, performance, and testing.

---

## Quick Reference

| Task | Approach |
|------|----------|
| New project | `ng new my-app --standalone --routing --style=scss` |
| Generate component | `ng g c feature/my-component --standalone` |
| Generate service | `ng g s core/services/my-service` |
| Generate guard | `ng g guard core/guards/auth` |
| Generate pipe | `ng g pipe shared/pipes/my-pipe --standalone` |
| Build production | `ng build --configuration production` |
| Run tests | `ng test --code-coverage` |

---

## Project Structure

Use a feature-based folder structure. Never dump everything in one flat folder.

```
src/
├── app/
│   ├── core/                  # Singleton services, guards, interceptors
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── services/
│   │   └── core.providers.ts
│   ├── shared/                # Reusable components, pipes, directives
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── index.ts           # Barrel export
│   ├── features/              # Feature modules/domains
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── store/         # NgRx state (if used)
│   │   │   └── auth.routes.ts
│   │   └── dashboard/
│   ├── app.component.ts
│   ├── app.config.ts          # Application providers (standalone)
│   └── app.routes.ts
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
└── styles/
    ├── _variables.scss
    ├── _mixins.scss
    └── styles.scss
```

---

## Components

### Always Use Standalone Components (Angular 17+)

```typescript
// ✅ CORRECT - modern standalone component
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent implements OnInit {
  private readonly userService = inject(UserService);

  // Prefer signals over class properties for reactive state
  readonly user = signal<User | null>(null);
  readonly isLoading = signal(false);
  readonly displayName = computed(() => this.user()?.name ?? 'Guest');

  ngOnInit(): void {
    this.loadUser();
  }

  private loadUser(): void {
    this.isLoading.set(true);
    this.userService.getUser().subscribe({
      next: (user) => this.user.set(user),
      error: () => this.user.set(null),
      complete: () => this.isLoading.set(false),
    });
  }
}
```

```typescript
// ❌ WRONG - avoid NgModule-based components for new code
@NgModule({
  declarations: [UserProfileComponent],
  imports: [CommonModule],
})
export class UserModule {}
```

### Input/Output with Modern Syntax

```typescript
// ✅ Angular 17+ - use input() and output() signals
import { Component, input, output, model } from '@angular/core';

@Component({ /* ... */ })
export class ButtonComponent {
  // Required input
  label = input.required<string>();

  // Optional input with default
  disabled = input(false);

  // Two-way binding with model()
  value = model<string>('');

  // Output event
  clicked = output<void>();
  valueChange = output<string>();

  handleClick(): void {
    this.clicked.emit();
  }
}

// ❌ WRONG - old @Input()/@Output() decorators (still valid but avoid for new code)
@Input() label!: string;
@Output() clicked = new EventEmitter<void>();
```

### Change Detection

Always use `OnPush` for performance. With signals, Angular handles updates automatically.

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyComponent {
  // Signals automatically trigger OnPush updates
  count = signal(0);

  increment(): void {
    this.count.update(v => v + 1); // triggers re-render
  }
}
```

---

## Services

### Injection Pattern

```typescript
// ✅ CORRECT - use inject() in constructor or field initializer
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}

// ❌ WRONG - avoid constructor injection for new code (verbose, harder to tree-shake)
constructor(private http: HttpClient) {}
```

### State Management with Signals

For local and shared state, prefer signals over BehaviorSubject for simplicity:

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(null);

  // Expose as readonly
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  login(credentials: Credentials): Observable<void> {
    return this.http.post<User>('/api/auth/login', credentials).pipe(
      tap(user => this._user.set(user)),
      map(() => void 0),
    );
  }

  logout(): void {
    this._user.set(null);
  }
}
```

---

## RxJS Best Practices

### Always Unsubscribe

```typescript
// ✅ CORRECT - use takeUntilDestroyed (Angular 16+)
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({ /* ... */ })
export class MyComponent {
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.service.data$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => { /* ... */ });
  }
}

// ✅ Also fine - use async pipe in template (auto-unsubscribes)
// In template: {{ data$ | async }}

// ❌ WRONG - manual unsubscribe with ngOnDestroy (boilerplate-heavy)
private destroy$ = new Subject<void>();
ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
```

### Operator Patterns

```typescript
// ✅ Prefer pipeable operators, avoid nested subscribes
this.searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  filter(term => term.length >= 2),
  switchMap(term => this.searchService.search(term)),   // cancels previous
  catchError(() => of([])),
  takeUntilDestroyed(this.destroyRef),
).subscribe(results => this.results.set(results));

// ❌ WRONG - nested subscribe (memory leaks, hard to read)
this.searchTerm$.subscribe(term => {
  this.searchService.search(term).subscribe(results => { /* ... */ });
});
```

### Common Operators Reference

| Use case | Operator |
|----------|----------|
| HTTP request, cancel previous | `switchMap` |
| Parallel requests, wait all | `forkJoin` |
| Sequential requests | `concatMap` |
| Ignore cancellation | `mergeMap` |
| Handle errors gracefully | `catchError` |
| Side effects without altering stream | `tap` |
| Deduplicate rapid emissions | `debounceTime` + `distinctUntilChanged` |
| Convert observable → signal | `toSignal()` |

---

## Routing

### Modern Lazy Loading with Routes

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
  },
  { path: '**', loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
```

### Functional Guards (Angular 15+)

```typescript
// ✅ CORRECT - functional guard
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated()
    ? true
    : router.createUrlTree(['/auth/login']);
};

// ❌ WRONG - class-based guards (deprecated in Angular 15+)
@Injectable()
export class AuthGuard implements CanActivate { /* ... */ }
```

---

## HTTP & Interceptors

### Functional Interceptors (Angular 15+)

```typescript
// ✅ CORRECT - functional interceptor
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (!token) return next(req);

  return next(req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  }));
};

// Register in app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, loggingInterceptor])),
  ],
};
```

### Error Handling Interceptor

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) router.navigate(['/auth/login']);
      if (error.status === 403) router.navigate(['/forbidden']);
      return throwError(() => error);
    }),
  );
};
```

---

## Forms

### Reactive Forms (Preferred)

```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    const { email, password } = this.loginForm.getRawValue();
    // submit...
  }
}
```

```html
<!-- Template -->
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
  <input formControlName="email" type="email" />
  @if (loginForm.controls.email.hasError('email') && loginForm.controls.email.touched) {
    <span>Invalid email</span>
  }
  <button type="submit" [disabled]="loginForm.invalid">Login</button>
</form>
```

---

## Templates

### Control Flow (Angular 17+ — prefer over *ngIf / *ngFor)

```html
<!-- ✅ New control flow syntax -->
@if (isLoading()) {
  <app-spinner />
} @else if (error()) {
  <app-error [message]="error()!" />
} @else {
  <ul>
    @for (item of items(); track item.id) {
      <li>{{ item.name }}</li>
    } @empty {
      <li>No items found.</li>
    }
  </ul>
}

@switch (status()) {
  @case ('active') { <span class="badge--green">Active</span> }
  @case ('inactive') { <span class="badge--red">Inactive</span> }
  @default { <span>Unknown</span> }
}

<!-- ❌ AVOID - old structural directives (still work, but migrate away) -->
<li *ngFor="let item of items; trackBy: trackById">
<div *ngIf="isVisible">
```

### Async Pipe vs toSignal

```typescript
// ✅ Convert Observable to Signal to use in template without async pipe
readonly items = toSignal(this.service.items$, { initialValue: [] });
// Template: {{ items() }}

// ✅ Also fine - async pipe (auto-manages subscription)
// Template: {{ items$ | async }}
```

---

## Performance

### Key rules

1. **Always use `trackBy` / `track`** in lists — avoids full DOM re-renders.
2. **Use `OnPush` change detection** on every component.
3. **Lazy load all feature routes** — never eagerly import feature components in root.
4. **Use `@defer` blocks** for non-critical UI (Angular 17+).
5. **Use `ng-content` and `ng-template`** instead of boolean flags for slot-based layouts.

```html
<!-- ✅ Defer non-critical sections -->
@defer (on viewport) {
  <app-heavy-chart [data]="chartData()" />
} @placeholder {
  <div class="chart-skeleton"></div>
} @loading (minimum 500ms) {
  <app-spinner />
}
```

---

## Application Config (Standalone Bootstrap)

```typescript
// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from '@core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};

// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(console.error);
```

---

## Testing

### Component Testing

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { UserProfileComponent } from './user-profile.component';
import { UserService } from '@core/services/user.service';
import { of } from 'rxjs';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUser']);
    userServiceSpy.getUser.and.returnValue(of({ id: '1', name: 'Alice' }));

    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [{ provide: UserService, useValue: userServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display the user name', () => {
    const el = fixture.nativeElement.querySelector('[data-testid="user-name"]');
    expect(el.textContent).toContain('Alice');
  });
});
```

### Service Testing

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should set user on login', () => {
    const mockUser = { id: '1', name: 'Alice' };
    service.login({ email: 'a@b.com', password: 'pass' }).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    req.flush(mockUser);

    expect(service.user()).toEqual(mockUser);
  });
});
```

---

## Critical Rules

- **Standalone first** — never create `NgModule` for new features; use standalone components and `app.config.ts` providers.
- **Signals over BehaviorSubject** — for new state, use `signal()`, `computed()`, and `effect()`.
- **`inject()` over constructor injection** — cleaner, works in functional contexts.
- **`OnPush` everywhere** — set `changeDetection: ChangeDetectionStrategy.OnPush` on every component.
- **`takeUntilDestroyed` over manual unsubscribe** — pass `DestroyRef` for use outside injection context.
- **Functional guards and interceptors** — class-based versions are deprecated.
- **`@for` with `track`** — always provide a unique track expression to avoid full list re-renders.
- **Lazy-load all routes** — use `loadComponent` or `loadChildren` for every feature route.
- **Type everything strictly** — enable `"strict": true` in `tsconfig.json`; never use `any`.
- **Path aliases** — configure `@core`, `@shared`, `@features` in `tsconfig.json` to avoid relative import hell.
- **Environment variables** — always use `environment.ts` files, never hardcode API URLs.
- **Single responsibility** — one component per file, one concern per service.

---

## TypeScript Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@env/*": ["src/environments/*"]
    }
  }
}
```

---

## Dependencies

- **Angular CLI**: `npm install -g @angular/cli`
- **Angular CDK/Material**: `ng add @angular/material`
- **NgRx** (if needed): `ng add @ngrx/store@latest`
- **Node.js**: LTS version required (check `engines` field in `package.json`)
- **RxJS**: Bundled with Angular; prefer `rxjs/operators` imports
