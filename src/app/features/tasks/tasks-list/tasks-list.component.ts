import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TaskService } from '../../../data/services/task.service';
import { UserService } from '../../../data/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { Task } from '../../../domain/models/task.model';
import { TaskStatus, TASK_STATUS_LABELS } from '../../../domain/enums/task-status.enum';
import { TaskPriority, TASK_PRIORITY_LABELS } from '../../../domain/enums/task-priority.enum';
import { User } from '../../../domain/models/user.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { TaskFormDialogComponent } from '../task-form-dialog/task-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'tf-tasks-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatChipsModule,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    AvatarComponent,
    EmptyStateComponent,
    SkeletonComponent,
    RelativeTimePipe,
  ],
  template: `
    <div class="tf-page-container">
      <div class="tf-page-header">
        <div>
          <h1 class="tf-page-title">Tasks</h1>
          <p class="tf-page-subtitle">{{ filteredTasks().length }} tasks found</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="exportCsv()" [disabled]="filteredTasks().length === 0">
            <mat-icon>download</mat-icon>
            Export CSV
          </button>
          <button mat-flat-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            New Task
          </button>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="filters-bar tf-card">
        <mat-form-field appearance="outline" class="filter-search">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput placeholder="Search tasks…" [formControl]="searchCtrl" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-select">
          <mat-label>Status</mat-label>
          <mat-select [formControl]="statusCtrl" multiple>
            @for (s of statusOptions; track s.value) {
              <mat-option [value]="s.value">{{ s.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-select">
          <mat-label>Priority</mat-label>
          <mat-select [formControl]="priorityCtrl" multiple>
            @for (p of priorityOptions; track p.value) {
              <mat-option [value]="p.value">{{ p.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-select">
          <mat-label>Assignee</mat-label>
          <mat-select [formControl]="assigneeCtrl" multiple>
            @for (u of users(); track u.id) {
              <mat-option [value]="u.id">{{ u.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (hasActiveFilters()) {
          <button mat-button (click)="clearFilters()" class="clear-filters-btn">
            <mat-icon>filter_alt_off</mat-icon>
            Clear filters
          </button>
        }
      </div>

      <!-- Table -->
      <div class="tf-card table-card">
        @if (isLoading()) {
          <div class="table-skeleton">
            @for (_ of [1,2,3,4,5]; track $index) {
              <tf-skeleton height="52px" />
            }
          </div>
        } @else if (filteredTasks().length === 0) {
          <tf-empty-state
            icon="task_alt"
            title="No tasks found"
            description="Try adjusting your filters or create a new task to get started."
            actionLabel="New Task"
            actionIcon="add"
            (action)="openCreateDialog()"
          />
        } @else {
          <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSort($event)" class="tasks-table">

            <ng-container matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef>
                <mat-checkbox
                  [checked]="allSelected()"
                  [indeterminate]="someSelected()"
                  (change)="toggleAll($event.checked)"
                  aria-label="Select all tasks"
                />
              </th>
              <td mat-cell *matCellDef="let row">
                <mat-checkbox
                  [checked]="isSelected(row.id)"
                  (change)="toggleSelect(row.id)"
                  [attr.aria-label]="'Select task: ' + row.title"
                />
              </td>
            </ng-container>

            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
              <td mat-cell *matCellDef="let row">
                <a class="task-title-link" [routerLink]="['/tasks', row.id]">{{ row.title }}</a>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let row">
                <tf-status-badge [status]="row.status" />
              </td>
            </ng-container>

            <ng-container matColumnDef="priority">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Priority</th>
              <td mat-cell *matCellDef="let row">
                <tf-priority-badge [priority]="row.priority" />
              </td>
            </ng-container>

            <ng-container matColumnDef="assignee">
              <th mat-header-cell *matHeaderCellDef>Assignee</th>
              <td mat-cell *matCellDef="let row">
                @if (getUserById(row.assigneeId); as user) {
                  <tf-avatar
                    [src]="user.avatar"
                    [name]="user.name"
                    size="sm"
                    [tooltip]="user.name"
                  />
                } @else {
                  <span class="unassigned">Unassigned</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="dueDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Due Date</th>
              <td mat-cell *matCellDef="let row">
                @if (row.dueDate) {
                  <span [class.overdue-text]="isOverdue(row)">
                    {{ row.dueDate | date:'MMM d, y' }}
                  </span>
                } @else {
                  <span class="no-date">—</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="updatedAt">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Updated</th>
              <td mat-cell *matCellDef="let row">
                <span class="date-muted">{{ row.updatedAt | relativeTime }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button [matMenuTriggerFor]="rowMenu" (click)="$event.stopPropagation()" aria-label="Row actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #rowMenu>
                  <button mat-menu-item [routerLink]="['/tasks', row.id]">
                    <mat-icon>open_in_new</mat-icon><span>View details</span>
                  </button>
                  <button mat-menu-item (click)="openEditDialog(row)">
                    <mat-icon>edit</mat-icon><span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="deleteTask(row.id)" class="delete-action">
                    <mat-icon>delete</mat-icon><span>Delete</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: displayedColumns;"
              class="task-row"
              [class.task-row--selected]="isSelected(row.id)"
            ></tr>
          </table>

          @if (selectedIds().size > 0) {
            <div class="bulk-actions">
              <span>{{ selectedIds().size }} selected</span>
              <button mat-button color="warn" (click)="bulkDelete()">
                <mat-icon>delete</mat-icon> Delete selected
              </button>
              <button mat-button (click)="clearSelection()">
                <mat-icon>close</mat-icon> Deselect
              </button>
            </div>
          }

          <mat-paginator
            [pageSize]="10"
            [pageSizeOptions]="[5, 10, 25, 50]"
            showFirstLastButtons
            (page)="onPage($event)"
            aria-label="Tasks pagination"
          />
        }
      </div>
    </div>
  `,
  styleUrl: './tasks-list.component.scss',
})
export class TasksListComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  private readonly allTasks = signal<Task[]>([]);
  readonly users = signal<User[]>([]);
  readonly selectedIds = signal<Set<string>>(new Set());

  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<TaskStatus[]>([]);
  readonly priorityCtrl = new FormControl<TaskPriority[]>([]);
  readonly assigneeCtrl = new FormControl<string[]>([]);

  readonly displayedColumns = ['select', 'title', 'status', 'priority', 'assignee', 'dueDate', 'updatedAt', 'actions'];

  readonly statusOptions = Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({ value, label }));
  readonly priorityOptions = Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({ value, label }));

  dataSource = new MatTableDataSource<Task>([]);

  readonly filteredTasks = computed(() => {
    let tasks = this.allTasks();
    const search = this.searchCtrl.value?.toLowerCase() ?? '';
    const statuses = this.statusCtrl.value ?? [];
    const priorities = this.priorityCtrl.value ?? [];
    const assignees = this.assigneeCtrl.value ?? [];

    if (search) tasks = tasks.filter((t) => t.title.toLowerCase().includes(search) || t.description.toLowerCase().includes(search));
    if (statuses.length) tasks = tasks.filter((t) => statuses.includes(t.status));
    if (priorities.length) tasks = tasks.filter((t) => priorities.includes(t.priority));
    if (assignees.length) tasks = tasks.filter((t) => t.assigneeId && assignees.includes(t.assigneeId));
    return tasks;
  });

  readonly allSelected = computed(() => this.filteredTasks().length > 0 && this.filteredTasks().every((t) => this.selectedIds().has(t.id)));
  readonly someSelected = computed(() => this.filteredTasks().some((t) => this.selectedIds().has(t.id)) && !this.allSelected());
  readonly hasActiveFilters = computed(() =>
    !!(this.searchCtrl.value || this.statusCtrl.value?.length || this.priorityCtrl.value?.length || this.assigneeCtrl.value?.length)
  );

  ngOnInit(): void {
    this.loadTasks();
    this.userService.getAll().subscribe((u) => this.users.set(u));
    this.searchCtrl.valueChanges.pipe(debounceTime(250), distinctUntilChanged()).subscribe(() => this.updateDataSource());
    this.statusCtrl.valueChanges.subscribe(() => this.updateDataSource());
    this.priorityCtrl.valueChanges.subscribe(() => this.updateDataSource());
    this.assigneeCtrl.valueChanges.subscribe(() => this.updateDataSource());
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.taskService.getAll().subscribe({
      next: (tasks) => { this.allTasks.set(tasks); this.updateDataSource(); this.isLoading.set(false); },
    });
  }

  updateDataSource(): void { this.dataSource.data = this.filteredTasks(); }

  onSort(sort: Sort): void {
    const data = [...this.filteredTasks()];
    if (!sort.active || sort.direction === '') { this.dataSource.data = data; return; }
    this.dataSource.data = data.sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      const va = a[sort.active] ?? '';
      const vb = b[sort.active] ?? '';
      return (va < vb ? -1 : va > vb ? 1 : 0) * (isAsc ? 1 : -1);
    });
  }

  onPage(_: PageEvent): void {}

  getUserById(id: string | null): User | undefined {
    return id ? this.users().find((u) => u.id === id) : undefined;
  }

  isOverdue(task: Task): boolean {
    return !!(task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' && task.status !== 'cancelled');
  }

  isSelected(id: string): boolean { return this.selectedIds().has(id); }
  toggleSelect(id: string): void {
    const set = new Set(this.selectedIds());
    set.has(id) ? set.delete(id) : set.add(id);
    this.selectedIds.set(set);
  }
  toggleAll(checked: boolean): void {
    this.selectedIds.set(checked ? new Set(this.filteredTasks().map((t) => t.id)) : new Set());
  }

  clearFilters(): void {
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue([]);
    this.priorityCtrl.setValue([]);
    this.assigneeCtrl.setValue([]);
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(TaskFormDialogComponent, { width: '560px', data: { task: null, users: this.users() } });
    ref.afterClosed().subscribe((result) => { if (result) this.loadTasks(); });
  }

  openEditDialog(task: Task): void {
    const ref = this.dialog.open(TaskFormDialogComponent, { width: '560px', data: { task, users: this.users() } });
    ref.afterClosed().subscribe((result) => { if (result) this.loadTasks(); });
  }

  deleteTask(id: string): void {
    this.taskService.delete(id).subscribe({ next: () => { this.toast.success('Task deleted.'); this.loadTasks(); } });
  }

  bulkDelete(): void {
    const ids = [...this.selectedIds()];
    let done = 0;
    ids.forEach((id) => this.taskService.delete(id).subscribe({ next: () => { done++; if (done === ids.length) { this.toast.success(`${ids.length} tasks deleted.`); this.selectedIds.set(new Set()); this.loadTasks(); } } }));
  }

  exportCsv(): void {
    const rows = this.filteredTasks();
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Assignee', 'Due Date', 'Updated'];
    const lines = rows.map((t) => [
      t.id, `"${t.title}"`, t.status, t.priority,
      this.getUserById(t.assigneeId)?.name ?? 'Unassigned',
      t.dueDate ?? '', t.updatedAt,
    ].join(','));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'teamflow-tasks.csv'; a.click();
    URL.revokeObjectURL(url);
    this.toast.success('Tasks exported to CSV.');
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }
}
