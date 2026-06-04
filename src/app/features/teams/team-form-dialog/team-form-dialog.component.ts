import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TeamService } from '../../../data/services/team.service';
import { CreateTeamPayload, Team } from '../../../domain/models';

const AVATAR_COLORS = ['#6366f1','#ec4899','#14b8a6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#10b981'];

@Component({
  selector: 'tf-team-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatDialogModule],
  template: `
    <div class="team-dialog">
      <div mat-dialog-title class="team-dialog__header">
        <mat-icon>{{ isEdit ? 'edit' : 'group_add' }}</mat-icon>
        <span>{{ isEdit ? 'Edit Team' : 'Create Team' }}</span>
      </div>
      <mat-dialog-content class="team-dialog__content">
        <form [formGroup]="form" class="team-form">
          <mat-form-field appearance="outline">
            <mat-label>Team Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g. Engineering" />
            @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" placeholder="What does this team do?" ></textarea>
          </mat-form-field>
          <div class="color-picker">
            <span class="color-picker__label">Avatar Color</span>
            <div class="color-picker__swatches">
              @for (c of colors; track c) {
                <button type="button" class="color-swatch"
                  [style.background]="c"
                  [class.selected]="form.get('avatarColor')?.value === c"
                  (click)="form.get('avatarColor')?.setValue(c)"
                  [attr.aria-label]="'Color ' + c"
                ></button>
              }
            </div>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions class="team-dialog__actions">
        <button mat-button (click)="dialogRef.close()">Cancel</button>
        <button mat-flat-button color="primary" [disabled]="form.invalid || isSaving" (click)="onSave()">
          {{ isSaving ? 'Saving…' : (isEdit ? 'Save changes' : 'Create team') }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .team-dialog {
      &__header { display: flex !important; align-items: center; gap: 10px; font-size: 18px !important; font-weight: 600 !important; padding: 20px 24px 0 !important; mat-icon { color: var(--tf-primary-500); } }
      &__content { padding: 16px 24px !important; }
      &__actions { padding: 8px 24px 20px !important; gap: 8px; justify-content: flex-end !important; }
    }
    .team-form { display: flex; flex-direction: column; gap: 4px; mat-form-field { width: 100%; } }
    .color-picker {
      &__label { font-size: 12px; font-weight: 600; color: var(--tf-text-secondary); display: block; margin-bottom: 8px; }
      &__swatches { display: flex; flex-wrap: wrap; gap: 8px; }
    }
    .color-swatch {
      width: 28px; height: 28px; border-radius: 50%; border: 3px solid transparent;
      cursor: pointer; transition: transform 0.15s, border-color 0.15s;
      &:hover { transform: scale(1.15); }
      &.selected { border-color: var(--tf-text-primary); transform: scale(1.15); }
    }
  `],
})
export class TeamFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly teamService = inject(TeamService);
  readonly dialogRef = inject(MatDialogRef<TeamFormDialogComponent>);
  readonly data = inject<{ team: Team | null }>(MAT_DIALOG_DATA);

  isSaving = false;
  readonly colors = AVATAR_COLORS;
  get isEdit(): boolean { return !!this.data.team; }

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    avatarColor: [AVATAR_COLORS[0], Validators.required],
  });

  ngOnInit(): void {
    if (this.data.team) {
      this.form.patchValue({
        name: this.data.team.name,
        description: this.data.team.description,
        avatarColor: this.data.team.avatarColor,
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    const v = this.form.getRawValue();
    const existing = this.data.team;
    const createPayload: CreateTeamPayload = {
      ...v,
      ownerId: '',
      memberIds: [],
      isArchived: false,
      settings: {
        allowMembersToCreateTasks: true,
        allowMembersToInvite: false,
        defaultTaskStatus: 'todo',
        taskLabelIds: [],
      },
    };
    const op$ = existing
      ? this.teamService.update(existing.id, v)
      : this.teamService.create(createPayload);

    op$.subscribe({
      next: () => this.dialogRef.close(true),
      error: () => { this.isSaving = false; },
    });
  }
}
