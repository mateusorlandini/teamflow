<div align="center">
  <h1>🚀 TeamFlow</h1>
  <p><strong>A professional SaaS team-management platform built with Angular 21</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white" alt="Angular 21" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Angular_Material-21-757DE8?logo=angular&logoColor=white" alt="Angular Material" />
    <img src="https://img.shields.io/badge/Chart.js-4.5-FF6384?logo=chartdotjs&logoColor=white" alt="Chart.js" />
    <img src="https://img.shields.io/badge/SCSS-Design_System-CC6699?logo=sass&logoColor=white" alt="SCSS" />
  </p>
  <p>
    <a href="#-quick-start">Quick Start</a> ·
    <a href="#-architecture">Architecture</a> ·
    <a href="#-features">Features</a> ·
    <a href="#-tech-stack">Tech Stack</a> ·
    <a href="#-roadmap">Roadmap</a>
  </p>
</div>

---

## 🎯 Overview

TeamFlow is a **production-grade SaaS application** for engineering team management, built to demonstrate Angular mastery at a senior/lead level. It is inspired by Jira, ClickUp, and Linear — but with a distinct identity and a clean, modern UI.

The project intentionally avoids tutorial-style patterns and instead implements real-world engineering choices: layered architecture, Angular Signals for reactive state, CDK Drag-and-Drop, role-based access control enforced at every layer, Chart.js analytics, and a fully custom design system.

> **Portfolio goal:** Show that you can architect, build, and ship a complete, complex frontend application — not just wire up a CRUD form.

---

## ✨ Features

| Module | Details |
|--------|---------|
| **Authentication** | Login with three roles (Admin, Manager, Member), session persistence, JWT simulation, demo accounts |
| **Dashboard** | KPI cards with trend indicators, Chart.js line chart (task trend), team productivity bars, upcoming deadlines, active members |
| **Task Management** | Full CRUD, advanced table with search/multi-filter/sort/pagination, CSV export, bulk delete |
| **Task Detail** | Rich detail view: checklist with progress bar, comment thread with reactions, full activity history, metadata sidebar |
| **Kanban Board** | CDK Drag-and-Drop across 5 columns, optimistic status update, card previews, per-column task creation |
| **Teams** | Team cards with metrics, avatar color picker, team detail with member grid and task list |
| **User Profile** | Tabbed profile (personal info, preferences, security), theme switcher, notification toggles |
| **Settings** | Workspace appearance (3 themes), RBAC permissions matrix, i18n architecture, tech stack about page |
| **Notifications** | Real-time badge, notification panel with mark-as-read, icon mapping by type |
| **Error Pages** | Styled 403 Forbidden and 404 Not Found pages with gradient code typography |
| **UI States** | Skeleton loaders, empty states with CTA, loading spinners throughout |

---

## 🏗 Architecture

```
src/
├── app/
│   ├── core/                    # Singleton services, guards, interceptors, layout
│   │   ├── auth/
│   │   │   ├── guards/          # authGuard, roleGuard (functional)
│   │   │   ├── interceptors/    # authInterceptor, errorInterceptor
│   │   │   └── services/        # AuthService (Angular Signals)
│   │   ├── layout/              # ShellComponent, SidebarComponent, TopbarComponent
│   │   └── services/            # ThemeService, NotificationService, ToastService
│   │
│   ├── data/                    # Data access layer (HttpClient wrappers)
│   │   └── services/            # TaskService, TeamService, UserService, DashboardService
│   │
│   ├── domain/                  # Pure TypeScript — no Angular dependencies
│   │   ├── enums/               # TaskStatus, TaskPriority, UserRole, NotificationType
│   │   └── models/              # Task, User, Team, Notification, AuthUser, Dashboard
│   │
│   ├── features/                # Lazy-loaded feature modules
│   │   ├── auth/                # Login, ForgotPassword, AuthLayout
│   │   ├── dashboard/           # DashboardComponent
│   │   ├── tasks/               # TasksList, TaskDetail, TaskFormDialog
│   │   ├── kanban/              # KanbanBoard (CDK DnD)
│   │   ├── teams/               # TeamsList, TeamDetail, TeamFormDialog
│   │   ├── profile/             # ProfileComponent
│   │   ├── settings/            # SettingsComponent
│   │   └── error-pages/         # ForbiddenComponent, NotFoundComponent
│   │
│   └── shared/                  # Reusable presentational components & pipes
│       ├── components/          # AvatarComponent, StatusBadge, PriorityBadge, Skeleton, EmptyState
│       └── pipes/               # RelativeTimePipe
│
├── environments/                # environment.ts + environment.production.ts
└── styles/                      # Design system: _tokens.scss, _mixins.scss, _material-overrides.scss
```

### Key Architecture Decisions

- **Standalone Components** everywhere — no `NgModule` boilerplate.
- **Angular Signals** for all reactive state in services (not BehaviorSubject soup).
- **Functional Guards & Interceptors** using the modern `inject()` pattern.
- **Domain layer is framework-agnostic** — models and enums have zero Angular imports.
- **Data layer is decoupled** from UI — services return `Observable<T>`, never raw `HttpResponse`.
- **Lazy loading + PreloadAllModules** for fast initial load with background pre-caching.
- **CDK Drag-and-Drop** with optimistic updates and rollback on error.
- **Design tokens as CSS custom properties** for seamless dark/light theming without JS.

---

## 🔐 Role-Based Access Control

Three roles with distinct permission sets, enforced at three layers:

| Layer | Mechanism |
|-------|-----------|
| **Routes** | `roleGuard` checks `ActivatedRouteData.roles` array |
| **Services** | `AuthService.hasPermission(resource, action)` |
| **UI** | Conditional rendering based on `auth.currentUser()?.role` |

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@teamflow.io` | `admin123` |
| Manager | `manager@teamflow.io` | `manager123` |
| Member | `member@teamflow.io` | `member123` |

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Angular 21 (Standalone, Signals, functional APIs) |
| Language | TypeScript 5.9 (strict mode) |
| UI Library | Angular Material 21 + custom SCSS design system |
| Drag & Drop | Angular CDK DnD |
| Charts | Chart.js 4.5 + ng2-charts 10 |
| Mock API | json-server 0.17 |
| State | Angular Signals (`signal`, `computed`, `effect`) |
| Styling | SCSS with CSS custom property design tokens |
| Linting | angular-eslint + typescript-eslint + eslint-config-prettier |
| Formatting | Prettier |
| Testing | Jasmine + Karma + Angular Testing Utilities |
| CI/CD | GitHub Actions (build, lint, test, Vercel deploy) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 20
- npm ≥ 9

### Installation

```bash
git clone https://github.com/your-org/teamflow.git
cd teamflow
npm install
```

### Development (Angular + JSON Server concurrently)

```bash
npm start
```

This runs:
- Angular dev server → `http://localhost:4200`
- JSON Server mock API → `http://localhost:3000`

### Individual commands

```bash
npm run dev           # Angular dev server only
npm run mock-server   # JSON Server only
npm run build         # Production build
npm run test          # Unit tests (watch mode)
npm run lint          # ESLint
npm run format        # Prettier format
npm run format:check  # Prettier check (CI)
```

---

## 🌍 Environment Configuration

| File | Used in |
|------|---------|
| `src/environments/environment.ts` | Development (default) |
| `src/environments/environment.production.ts` | Production (`ng build`) |

The `angular.json` `fileReplacements` config swaps the environment file automatically on production builds.

---

## 🧪 Testing Strategy

### Unit Tests

Located adjacent to source files (`*.spec.ts`). Key coverage:

- `AuthService` — login flow, session restoration, logout, `hasPermission`, `hasRole`
- `TaskService` — CRUD operations, filtering, status updates, comment creation

Run:
```bash
ng test --watch=false --browsers=ChromeHeadless
```

### E2E Strategy (Playwright — planned)

| Flow | Scenarios |
|------|-----------|
| Auth | Login success, login failure, role redirect |
| Tasks | Create task, filter by status, export CSV |
| Kanban | Drag card between columns, verify status change |
| Profile | Update preferences, theme toggle |

---

## 📋 Roadmap

- [x] Authentication with role-based access
- [x] Dashboard with analytics
- [x] Task management (list, detail, CRUD)
- [x] Kanban board with drag-and-drop
- [x] Team management
- [x] User profile & preferences
- [x] Settings (RBAC matrix, theme, i18n architecture)
- [x] Dark / light / system theme
- [x] Notification panel
- [x] CSV export
- [x] Unit tests (core services)
- [x] CI/CD pipeline
- [ ] Playwright E2E tests
- [ ] @ngx-translate/core integration (pt-BR, es, fr)
- [ ] Real-time updates via WebSocket / SSE
- [ ] Comment @mention autocomplete
- [ ] File attachment upload (S3/Cloudflare R2)
- [ ] Gantt/Timeline view
- [ ] Team capacity planning
- [ ] Docker + docker-compose

---

## 📁 GitHub Issues (Suggested)

```
#1  [feat] Playwright E2E test suite
#2  [feat] ngx-translate i18n (pt-BR first)
#3  [feat] WebSocket real-time notifications
#4  [feat] @mention autocomplete in comments
#5  [feat] File attachment upload to task
#6  [feat] Gantt/Timeline view
#7  [feat] Team capacity heatmap
#8  [feat] Docker containerization
#9  [chore] Increase unit test coverage to 80%
#10 [chore] Storybook component docs
```

---

## 📝 Commit Sequence (Reference)

```
feat: initialize Angular 21 workspace with standalone architecture
feat(domain): add enums (TaskStatus, TaskPriority, UserRole, NotificationType)
feat(domain): add TypeScript models (Task, User, Team, Notification, Dashboard)
feat(mock): add db.json with realistic mock data for json-server
feat(design): add SCSS design tokens, mixins, and Angular Material overrides
feat(core): implement AuthService with Angular Signals and session persistence
feat(core): add authGuard, roleGuard, authInterceptor, errorInterceptor
feat(core): implement ThemeService, NotificationService, ToastService
feat(data): implement TaskService, TeamService, UserService, DashboardService
feat(config): wire app.config.ts with HTTP client, animations, router
feat(routes): define lazy-loaded application routes with preloading
feat(layout): build ShellComponent, SidebarComponent, TopbarComponent
feat(shared): add Avatar, StatusBadge, PriorityBadge, Skeleton, EmptyState
feat(auth): implement login page, forgot-password, and auth layout
feat(dashboard): build dashboard with metrics, Chart.js trend, deadlines
feat(tasks): implement tasks list with table, filters, sort, CSV export
feat(tasks): add task detail with checklist, comments, and activity log
feat(tasks): add TaskFormDialog for create/edit
feat(kanban): implement Kanban board with CDK drag-and-drop
feat(teams): build teams list, team detail, and team form dialog
feat(profile): implement profile page with preferences and theme toggle
feat(settings): add settings page with RBAC matrix and i18n architecture
feat(errors): add 403 and 404 error pages
chore: configure ESLint (angular-eslint + typescript-eslint)
chore: add GitHub Actions CI/CD pipeline
test: add unit tests for AuthService and TaskService
docs: write full portfolio-grade README with architecture and roadmap
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist/teamflow/browser`
5. Add environment secrets in Vercel dashboard if using a real backend

> The CI pipeline auto-deploys PR previews via `amondnet/vercel-action`.

### Manual (any static host)

```bash
npm run build
# Upload dist/teamflow/browser/ to S3, Netlify, Firebase Hosting, etc.
```

---

## 📄 License

MIT © TeamFlow Contributors
