import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../../data/services/task.service';
import { UserService } from '../../../data/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { Task } from '../../../domain/models/task.model';
import { TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '../../../domain/enums/task-status.enum';
import { TaskPriority } from '../../../domain/enums/task-priority.enum';
import { User } from '../../../domain/models/user.model';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { TaskFormDialogComponent } from '../../tasks/task-form-dialog/task-form-dialog.component';

interface KanbanColumn {
  status: TaskStatus;
  label: string;
  color: string;
  tasks: Task[];
}

@Component({
  selector: 'tf-kanban-board',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    PriorityBadgeComponent,
    AvatarComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="tf-page-container kanban-page">
      <div class="tf-page-header">
        <div>
          <h1 class="tf-page-title">Kanban Board</h1>
          <p class="tf-page-subtitle">Drag cards between columns to update status</p>
        </div>
        <button mat-flat-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon> New Task
        </button>
      </div>

      <!-- Filter Bar -->
      <div class="kanban-filters tf-card">
        <mat-form-field appearance="outline" class="filter-search">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput placeholder="Search cards…" [formControl]="searchCtrl" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-select">
          <mat-label>Priority</mat-label>
          <mat-select [formControl]="priorityCtrl" multiple>
            @for (p of priorityOptions; track p) {
              <mat-option [value]="p">{{ p | titlecase }}</mat-option>
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

        @if (hasFilters()) {
          <button mat-button (click)="clearFilters()">
            <mat-icon>filter_alt_off</mat-icon> Clear
          </button>
        }
      </div>

      <!-- Board -->
      @if (isLoading()) {
        <div class="kanban-skeleton-row">
          @for (_ of [1,2,3,4,5]; track $index) {
            <div class="kanban-col-skeleton">
              <tf-skeleton height="32px" />
              <tf-skeleton height="100px" />
              <tf-skeleton height="80px" />
            </div>
          }
        </div>
      } @else {
        <div class="kanban-board" [attr.aria-label]="'Kanban board'">
          @for (col of filteredColumns(); track col.status) {
            <div class="kanban-col">
              <div class="kanban-col__header">
                <div class="kanban-col__title-row">
                  <span class="kanban-col__dot" [style.background]="col.color"></span>
                  <span class="kanban-col__label">{{ col.label }}</span>
                  <span class="kanban-col__count">{{ col.tasks.length }}</span>
                </div>
                <button
                  mat-icon-button
                  class="kanban-col__add-btn"
                  (click)="openCreateDialog(col.status)"
                  [matTooltip]="'Add to ' + col.label"
                >
                  <mat-icon>add</mat-icon>
                </button>
              </div>

              <div
                class="kanban-col__body"
                cdkDropList
                [id]="col.status"
                [cdkDropListData]="col.tasks"
                [cdkDropListConnectedTo]="columnIds"
                (cdkDropListDropped)="onDrop($event)"
                [attr.aria-label]="col.label + ' column'"
              >
                @if (col.tasks.length === 0) {
                  <div class="kanban-col__empty">
                    <mat-icon>add_circle_outline</mat-icon>
                    <span>Drop tasks here</span>
                  </div>
                }

                @for (task of col.tasks; track task.id) {
                  <div
                    class="kanban-card"
                    cdkDrag
                    [cdkDragData]="task"
                    [attr.aria-label]="task.title"
                    role="article"
                  >
                    <div class="kanban-card__drag-preview" *cdkDragPreview>
                      <p>{{ task.title }}</p>
                    </div>

                    <div class="kanban-card__header">
                      <tf-priority-badge [priority]="task.priority" [showLabel]="false" />
                      @if (task.dueDate) {
                        <span
                          class="kanban-card__due"
                          [class.overdue]="isOverdue(task)"
                        >
                          <mat-icon>schedule</mat-icon>
                          {{ task.dueDate | date:'MMM d' }}
                        </span>
                      }
                    </div>

                    <a class="kanban-card__title" [routerLink]="['/tasks', task.id]">
                      {{ task.title }}
                    </a>

                    @if (task.checklist.length > 0) {
                      <div class="kanban-card__checklist">
                        <mat-icon>checklist</mat-icon>
                        <span>{{ checklistDone(task) }}/{{ task.checklist.length }}</span>
                      </div>
                    }

                    @if (task.labelIds.length > 0) {
                      <div class="kanban-card__labels">
                        @for (labelId of task.labelIds.slice(0,3); track labelId) {
                          <span class="kanban-card__label-dot"></span>
                        }
                      </div>
                    }

                    <div class="kanban-card__footer">
                      @if (getUserById(task.assigneeId); as user) {
                        <tf-avatar [src]="user.avatar" [name]="user.name" size="xs" [tooltip]="user.name" />
                      } @else {
                        <div class="kanban-card__unassigned" matTooltip="Unassigned">
                          <mat-icon>person_outline</mat-icon>
                        </div>
                      }
                      @if (task.checklist.length > 0) {
                        <div class="kanban-card__progress-bar">
                          <div
                            class="kanban-card__progress-fill"
                            [style.width.%]="checklistPercent(task)"
                          ></div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './kanban-board.component.scss',
})
export class KanbanBoardComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  readonly isLoading = signal(true);
  private readonly allTasks = signal<Task[]>([]);
  readonly users = signal<User[]>([]);

  readonly searchCtrl = new FormControl('');
  readonly priorityCtrl = new FormControl<TaskPriority[]>([]);
  readonly assigneeCtrl = new FormControl<string[]>([]);

  readonly priorityOptions: TaskPriority[] = [
    TaskPriority.Critical, TaskPriority.High, TaskPriority.Medium, TaskPriority.Low,
  ];

  readonly columnIds = Object.values(TaskStatus);

  private readonly columnDefs: { status: TaskStatus; label: string; color: string }[] = [
    { status: TaskStatus.Backlog,    label: TASK_STATUS_LABELS[TaskStatus.Backlog],    color: TASK_STATUS_COLORS[TaskStatus.Backlog] },
    { status: TaskStatus.Todo,       label: TASK_STATUS_LABELS[TaskStatus.Todo],       color: TASK_STATUS_COLORS[TaskStatus.Todo] },
    { status: TaskStatus.InProgress, label: TASK_STATUS_LABELS[TaskStatus.InProgress], color: TASK_STATUS_COLORS[TaskStatus.InProgress] },
    { status: TaskStatus.InReview,   label: TASK_STATUS_LABELS[TaskStatus.InReview],   color: TASK_STATUS_COLORS[TaskStatus.InReview] },
    { status: TaskStatus.Done,       label: TASK_STATUS_LABELS[TaskStatus.Done],       color: TASK_STATUS_COLORS[TaskStatus.Done] },
  ];

  readonly hasFilters = computed(() =>
    !!(this.searchCtrl.value || this.priorityCtrl.value?.length || this.assigneeCtrl.value?.length)
  );

  readonly filteredColumns = computed((): KanbanColumn[] => {
    const search = this.searchCtrl.value?.toLowerCase() ?? '';
    const priorities = this.priorityCtrl.value ?? [];
    const assignees = this.assigneeCtrl.value ?? [];

    let tasks = this.allTasks().filter((t) => t.status !== TaskStatus.Cancelled);
    if (search)     tasks = tasks.filter((t) => t.title.toLowerCase().includes(search));
    if (priorities.length) tasks = tasks.filter((t) => priorities.includes(t.priority));
    if (assignees.length)  tasks = tasks.filter((t) => t.assigneeId != null && assignees.includes(t.assigneeId));

    return this.columnDefs.map((col) => ({
      ...col,
      tasks: tasks.filter((t) => t.status === col.status).sort((a, b) => a.position - b.position),
    }));
  });

  ngOnInit(): void {
    this.loadData();
    this.searchCtrl.valueChanges.subscribe(() => {});
    this.priorityCtrl.valueChanges.subscribe(() => {});
    this.assigneeCtrl.valueChanges.subscribe(() => {});
  }

  loadData(): void {
    this.isLoading.set(true);
    this.taskService.getAll().subscribe((tasks) => { this.allTasks.set(tasks); this.isLoading.set(false); });
    this.userService.getAll().subscribe((u) => this.users.set(u));
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task: Task = event.item.data;
      const newStatus = event.container.id as TaskStatus;

      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

      this.taskService.updateStatus(task.id, newStatus).subscribe({
        next: () => {
          this.allTasks.update((tasks) =>
            tasks.map((t) => t.id === task.id ? { ...t, status: newStatus } : t)
          );
        },
        error: () => {
          transferArrayItem(event.container.data, event.previousContainer.data, event.currentIndex, event.previousIndex);
          this.toast.error('Failed to update task status.');
        },
      });
    }
  }

  getUserById(id: string | null): User | undefined {
    return id ? this.users().find((u) => u.id === id) : undefined;
  }

  isOverdue(task: Task): boolean {
    return !!(task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Done);
  }

  checklistDone(task: Task): number {
    return task.checklist.filter((i) => i.completed).length;
  }

  checklistPercent(task: Task): number {
    const total = task.checklist.length;
    return total > 0 ? Math.round((this.checklistDone(task) / total) * 100) : 0;
  }

  clearFilters(): void {
    this.searchCtrl.setValue('');
    this.priorityCtrl.setValue([]);
    this.assigneeCtrl.setValue([]);
  }

  openCreateDialog(status?: TaskStatus): void {
    const ref = this.dialog.open(TaskFormDialogComponent, {
      width: '560px',
      data: { task: status ? { status } : null, users: this.users() },
    });
    ref.afterClosed().subscribe((result) => { if (result) this.loadData(); });
  }

  protected readonly TaskPriority = TaskPriority;
}
