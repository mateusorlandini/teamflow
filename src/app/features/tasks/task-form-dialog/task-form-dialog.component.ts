import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TaskService } from '../../../data/services/task.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { CreateTaskPayload, Task, User } from '../../../domain/models';
import { TaskStatus, TASK_STATUS_LABELS, TaskPriority, TASK_PRIORITY_LABELS } from '../../../domain/enums';

@Component({
  selector: 'tf-task-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatDialogModule,
  ],
  template: `
    <div class="task-dialog">
      <div mat-dialog-title class="task-dialog__header">
        <mat-icon>{{ isEdit ? 'edit' : 'add_task' }}</mat-icon>
        <span>{{ isEdit ? 'Edit Task' : 'Create Task' }}</span>
      </div>

      <mat-dialog-content class="task-dialog__content">
        <form [formGroup]="form" class="task-form">
          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" placeholder="Enter task title…" />
            @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
              <mat-error>Title is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" placeholder="Describe the task…"></textarea>
          </mat-form-field>

          <div class="task-form__row">
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                @for (s of statusOptions; track s.value) {
                  <mat-option [value]="s.value">{{ s.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Priority</mat-label>
              <mat-select formControlName="priority">
                @for (p of priorityOptions; track p.value) {
                  <mat-option [value]="p.value">{{ p.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="task-form__row">
            <mat-form-field appearance="outline">
              <mat-label>Assignee</mat-label>
              <mat-select formControlName="assigneeId">
                <mat-option [value]="null">Unassigned</mat-option>
                @for (u of data.users; track u.id) {
                  <mat-option [value]="u.id">{{ u.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Due Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="dueDate" />
              <mat-datepicker-toggle matSuffix [for]="picker" />
              <mat-datepicker #picker />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Estimated Hours</mat-label>
            <input matInput type="number" formControlName="estimatedHours" min="0" />
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="task-dialog__actions">
        <button mat-button (click)="dialogRef.close()">Cancel</button>
        <button
          mat-flat-button
          color="primary"
          [disabled]="form.invalid || isSaving"
          (click)="onSave()"
        >
          {{ isSaving ? 'Saving…' : (isEdit ? 'Save changes' : 'Create task') }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .task-dialog {
      &__header {
        display: flex !important;
        align-items: center;
        gap: 10px;
        font-size: 18px !important;
        font-weight: 600 !important;
        padding: 20px 24px 0 !important;
        mat-icon { color: var(--tf-primary-500); }
      }
      &__content { padding: 16px 24px !important; }
      &__actions { padding: 8px 24px 20px !important; gap: 8px; justify-content: flex-end !important; }
    }
    .task-form {
      display: flex; flex-direction: column; gap: 4px;
      mat-form-field { width: 100%; }
      &__row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    }
  `],
})
export class TaskFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  readonly dialogRef = inject(MatDialogRef<TaskFormDialogComponent>);
  readonly data = inject<{ task: Task | null; users: User[] }>(MAT_DIALOG_DATA);

  isSaving = false;

  readonly statusOptions = Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({ value, label }));
  readonly priorityOptions = Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({ value, label }));

  get isEdit(): boolean { return !!this.data.task; }

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    status: [TaskStatus.Todo, Validators.required],
    priority: [TaskPriority.Medium, Validators.required],
    assigneeId: [null as string | null],
    dueDate: [null as Date | null],
    estimatedHours: [null as number | null],
  });

  ngOnInit(): void {
    if (this.data.task) {
      this.form.patchValue({
        ...this.data.task,
        dueDate: this.data.task.dueDate ? new Date(this.data.task.dueDate) : null,
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const user = this.auth.currentUser();
    if (!user) return;
    this.isSaving = true;
    const value = this.form.getRawValue();
    const existing = this.data.task;
    const payload: CreateTaskPayload = {
      ...value,
      dueDate: value.dueDate ? value.dueDate.toISOString() : null,
      teamId: existing?.teamId ?? 't1',
      reporterId: user.id,
      labelIds: existing?.labelIds ?? [],
      checklist: existing?.checklist ?? [],
      attachments: existing?.attachments ?? [],
      tags: existing?.tags ?? [],
    };

    const op$ = existing
      ? this.taskService.update(existing.id, payload)
      : this.taskService.create(payload);

    op$.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Task updated.' : 'Task created.');
        this.dialogRef.close(true);
      },
      error: () => { this.toast.error('Something went wrong.'); this.isSaving = false; },
    });
  }
}
