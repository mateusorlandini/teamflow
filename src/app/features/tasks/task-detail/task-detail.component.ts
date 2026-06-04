import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TaskService } from '../../../data/services/task.service';
import { UserService } from '../../../data/services/user.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Task, TaskActivity, TaskComment, User } from '../../../domain/models';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { TASK_STATUS_LABELS } from '../../../domain/enums';

@Component({
  selector: 'tf-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressBarModule,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    AvatarComponent,
    SkeletonComponent,
    RelativeTimePipe,
  ],
  template: `
    <div class="tf-page-container">
      <div class="task-detail-back">
        <a routerLink="/tasks" mat-button>
          <mat-icon>arrow_back</mat-icon> Back to Tasks
        </a>
      </div>

      @if (isLoading()) {
        <div class="task-detail-skeleton">
          <tf-skeleton height="40px" width="60%" />
          <tf-skeleton height="20px" width="40%" />
          <tf-skeleton height="120px" />
        </div>
      } @else if (task()) {
        <div class="task-detail-layout">
          <!-- Main Content -->
          <div class="task-detail-main">
            <div class="tf-card task-detail-card">
              <div class="task-detail-card__header">
                <h1 class="task-detail-card__title">{{ task()!.title }}</h1>
                <div class="task-detail-card__badges">
                  <tf-status-badge [status]="task()!.status" />
                  <tf-priority-badge [priority]="task()!.priority" />
                </div>
              </div>

              @if (task()!.description) {
                <p class="task-detail-card__desc">{{ task()!.description }}</p>
              }

              <!-- Checklist -->
              @if (task()!.checklist.length > 0) {
                <div class="task-checklist">
                  <div class="task-checklist__header">
                    <span class="tf-section-title">Checklist</span>
                    <span class="task-checklist__progress">
                      {{ checklistDone() }}/{{ task()!.checklist.length }}
                    </span>
                  </div>
                  <mat-progress-bar
                    mode="determinate"
                    [value]="checklistPercent()"
                    class="task-checklist__bar"
                  />
                  <div class="task-checklist__items">
                    @for (item of task()!.checklist; track item.id) {
                      <div class="checklist-item">
                        <mat-checkbox
                          [checked]="item.completed"
                          (change)="toggleChecklist(item.id)"
                          color="primary"
                        >
                          <span [class.done]="item.completed">{{ item.text }}</span>
                        </mat-checkbox>
                      </div>
                    }
                  </div>
                </div>
              }

              <mat-divider class="tf-divider" />

              <!-- Comments -->
              <div class="task-comments">
                <h3 class="tf-section-title">Comments ({{ comments().length }})</h3>

                <div class="comment-input">
                  @if (auth.currentUser(); as user) {
                    <tf-avatar [src]="user.avatar" [name]="user.name" size="sm" />
                  }
                  <div class="comment-input__field">
                    <textarea
                      class="comment-input__textarea"
                      placeholder="Add a comment… (supports @mentions)"
                      [formControl]="commentCtrl"
                      rows="2"
                    ></textarea>
                    <div class="comment-input__actions">
                      <button
                        mat-flat-button
                        color="primary"
                        [disabled]="commentCtrl.invalid || isSavingComment"
                        (click)="addComment()"
                      >
                        {{ isSavingComment ? 'Posting…' : 'Post comment' }}
                      </button>
                    </div>
                  </div>
                </div>

                <div class="comment-list">
                  @for (comment of comments(); track comment.id) {
                    <div class="comment-item">
                      @if (getUserById(comment.authorId); as author) {
                        <tf-avatar [src]="author.avatar" [name]="author.name" size="sm" />
                        <div class="comment-item__body">
                          <div class="comment-item__header">
                            <span class="comment-item__author">{{ author.name }}</span>
                            <span class="comment-item__time">{{ comment.createdAt | relativeTime }}</span>
                          </div>
                          <p class="comment-item__content">{{ comment.content }}</p>
                          @if (comment.reactions.length > 0) {
                            <div class="comment-item__reactions">
                              @for (r of comment.reactions; track r.emoji) {
                                <span class="reaction-chip">{{ r.emoji }} {{ r.userIds.length }}</span>
                              }
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }

                  @if (comments().length === 0) {
                    <p class="no-comments">No comments yet. Be the first to comment!</p>
                  }
                </div>
              </div>
            </div>

            <!-- Activity -->
            <div class="tf-card">
              <h3 class="tf-section-title">Activity History</h3>
              <div class="activity-list">
                @for (act of activity(); track act.id) {
                  <div class="activity-item">
                    <div class="activity-item__dot"></div>
                    <div class="activity-item__body">
                      <span class="activity-item__actor">{{ getUserById(act.userId)?.name ?? 'Unknown' }}</span>
                      <span class="activity-item__action"> {{ formatAction(act) }}</span>
                      <span class="activity-item__time">{{ act.createdAt | relativeTime }}</span>
                    </div>
                  </div>
                }
                @if (activity().length === 0) {
                  <p class="no-activity">No activity recorded yet.</p>
                }
              </div>
            </div>
          </div>

          <!-- Sidebar Meta -->
          <div class="task-detail-sidebar">
            <div class="tf-card task-meta">
              <h3 class="tf-section-title">Details</h3>

              <div class="meta-item">
                <span class="meta-item__label">Assignee</span>
                @if (getUserById(task()!.assigneeId); as assignee) {
                  <div class="meta-item__user">
                    <tf-avatar [src]="assignee.avatar" [name]="assignee.name" size="sm" />
                    <span>{{ assignee.name }}</span>
                  </div>
                } @else {
                  <span class="meta-item__empty">Unassigned</span>
                }
              </div>

              <div class="meta-item">
                <span class="meta-item__label">Reporter</span>
                @if (getUserById(task()!.reporterId); as reporter) {
                  <div class="meta-item__user">
                    <tf-avatar [src]="reporter.avatar" [name]="reporter.name" size="sm" />
                    <span>{{ reporter.name }}</span>
                  </div>
                }
              </div>

              <div class="meta-item">
                <span class="meta-item__label">Due Date</span>
                <span [class.overdue]="isOverdue()">
                  {{ task()!.dueDate ? (task()!.dueDate | date:'MMM d, yyyy') : '—' }}
                </span>
              </div>

              <div class="meta-item">
                <span class="meta-item__label">Estimated</span>
                <span>{{ task()!.estimatedHours ? task()!.estimatedHours + 'h' : '—' }}</span>
              </div>

              <div class="meta-item">
                <span class="meta-item__label">Logged</span>
                <span>{{ task()!.loggedHours }}h</span>
              </div>

              <div class="meta-item">
                <span class="meta-item__label">Created</span>
                <span>{{ task()!.createdAt | relativeTime }}</span>
              </div>

              @if (task()!.tags.length > 0) {
                <div class="meta-item meta-item--tags">
                  <span class="meta-item__label">Tags</span>
                  <div class="tag-list">
                    @for (tag of task()!.tags; track tag) {
                      <span class="tag-chip">{{ tag }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './task-detail.component.scss',
})
export class TaskDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly userService = inject(UserService);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(true);
  readonly task = signal<Task | null>(null);
  readonly comments = signal<TaskComment[]>([]);
  readonly activity = signal<TaskActivity[]>([]);
  readonly users = signal<User[]>([]);

  isSavingComment = false;
  readonly commentCtrl = new FormControl('', [Validators.required, Validators.minLength(1)]);

  readonly checklistDone = () => this.task()?.checklist.filter((i) => i.completed).length ?? 0;
  readonly checklistPercent = () => {
    const total = this.task()?.checklist.length ?? 0;
    return total > 0 ? Math.round((this.checklistDone() / total) * 100) : 0;
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/tasks']);
      return;
    }
    this.userService.getAll().subscribe((u) => this.users.set(u));
    this.taskService.getWithDetails(id).subscribe({
      next: ({ task, comments, activity }) => {
        this.task.set(task);
        this.comments.set(comments);
        this.activity.set(activity);
        this.isLoading.set(false);
      },
      error: () => { this.toast.error('Task not found.'); this.router.navigate(['/tasks']); },
    });
  }

  getUserById(id: string | null): User | undefined {
    return id ? this.users().find((u) => u.id === id) : undefined;
  }

  isOverdue(): boolean {
    const t = this.task();
    return !!(t?.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done');
  }

  toggleChecklist(itemId: string): void {
    const t = this.task();
    if (!t) return;
    const updated = t.checklist.map((i) => i.id === itemId ? { ...i, completed: !i.completed } : i);
    this.taskService.update(t.id, { checklist: updated }).subscribe((updated) => this.task.set(updated));
  }

  addComment(): void {
    const content = this.commentCtrl.value?.trim();
    const user = this.auth.currentUser();
    const task = this.task();
    if (!content || !user || !task) return;
    this.isSavingComment = true;
    this.taskService.addComment({
      taskId: task.id,
      authorId: user.id,
      content,
      mentions: [],
      reactions: [],
    }).subscribe({
      next: (c) => {
        this.comments.update((prev) => [...prev, c]);
        this.commentCtrl.setValue('');
        this.isSavingComment = false;
      },
      error: () => { this.isSavingComment = false; },
    });
  }

  formatAction(act: TaskActivity): string {
    switch (act.action) {
      case 'created': return 'created this task';
      case 'status_changed': return `changed status from ${(TASK_STATUS_LABELS as Record<string, string>)[act.oldValue ?? ''] ?? act.oldValue} to ${(TASK_STATUS_LABELS as Record<string, string>)[act.newValue ?? ''] ?? act.newValue}`;
      case 'assigned': return `assigned this task to ${this.getUserById(act.newValue ?? null)?.name ?? 'someone'}`;
      case 'commented': return 'added a comment';
      default: return act.action.replace(/_/g, ' ');
    }
  }
}
