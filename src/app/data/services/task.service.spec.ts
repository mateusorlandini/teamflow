import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { TaskService } from './task.service';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { TaskPriority } from '../../domain/enums/task-priority.enum';
import { Task } from '../../domain/models/task.model';

const API = 'http://localhost:3001';

const mockTask: Task = {
  id: 'task-1',
  title: 'Implement login page',
  description: 'Build the login page with Angular Reactive Forms',
  status: TaskStatus.InProgress,
  priority: TaskPriority.High,
  teamId: 't1',
  reporterId: 'u1',
  assigneeId: 'u2',
  labelIds: [],
  checklist: [
    { id: 'c1', text: 'Create form group', completed: true, order: 0 },
    { id: 'c2', text: 'Add validation', completed: false, order: 1 },
  ],
  attachments: [],
  tags: ['frontend', 'auth'],
  dueDate: '2026-04-01T00:00:00.000Z',
  estimatedHours: 8,
  loggedHours: 3,
  position: 0,
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-10T00:00:00.000Z',
};

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll()', () => {
    it('should fetch all tasks', async () => {
      const p = lastValueFrom(service.getAll());
      const req = httpMock.expectOne((r) => r.url === `${API}/tasks`);
      expect(req.request.method).toBe('GET');
      req.flush([mockTask]);
      const tasks = await p;
      expect(tasks.length).toBe(1);
      expect(tasks[0].id).toBe('task-1');
    });

    it('should apply teamId filter as query param', async () => {
      const p = lastValueFrom(service.getAll({ teamId: 't1' }));
      const req = httpMock.expectOne(
        (r) => r.url === `${API}/tasks` && r.params.get('teamId') === 't1',
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockTask]);
      await p;
    });

    it('should apply status filter as query param', async () => {
      const p = lastValueFrom(service.getAll({ status: [TaskStatus.InProgress] }));
      const req = httpMock.expectOne(
        (r) => r.url === `${API}/tasks` && r.params.get('status') === TaskStatus.InProgress,
      );
      req.flush([mockTask]);
      await p;
    });
  });

  describe('getById()', () => {
    it('should fetch a single task by ID', async () => {
      const p = lastValueFrom(service.getById('task-1'));
      const req = httpMock.expectOne(`${API}/tasks/task-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTask);
      const task = await p;
      expect(task.id).toBe('task-1');
      expect(task.title).toBe('Implement login page');
    });
  });

  describe('create()', () => {
    it('should POST a new task', async () => {
      const payload = { title: 'New Task', status: TaskStatus.Todo, priority: TaskPriority.Medium };
      const p = lastValueFrom(service.create(payload as any));
      const req = httpMock.expectOne(`${API}/tasks`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.title).toBe('New Task');
      req.flush({ ...mockTask, id: 'task-2', ...payload });
      const task = await p;
      expect(task.id).toBe('task-2');
    });
  });

  describe('update()', () => {
    it('should PATCH an existing task', async () => {
      const p = lastValueFrom(service.update('task-1', { title: 'Updated Title' }));
      const req = httpMock.expectOne(`${API}/tasks/task-1`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ ...mockTask, title: 'Updated Title' });
      const task = await p;
      expect(task.title).toBe('Updated Title');
    });
  });

  describe('updateStatus()', () => {
    it('should PATCH task status only', async () => {
      const p = lastValueFrom(service.updateStatus('task-1', TaskStatus.Done));
      const req = httpMock.expectOne(`${API}/tasks/task-1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body.status).toBe(TaskStatus.Done);
      req.flush({ ...mockTask, status: TaskStatus.Done });
      const task = await p;
      expect(task.status).toBe(TaskStatus.Done);
    });
  });

  describe('delete()', () => {
    it('should DELETE a task by ID', async () => {
      const p = lastValueFrom(service.delete('task-1'));
      const req = httpMock.expectOne(`${API}/tasks/task-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
      await p;
    });
  });

  describe('getWithDetails()', () => {
    it('should combine task, comments and activity in a single observable', async () => {
      const p = lastValueFrom(service.getWithDetails('task-1'));
      httpMock.expectOne(`${API}/tasks/task-1`).flush(mockTask);
      httpMock
        .expectOne((r) => r.url === `${API}/comments` && r.url.includes('taskId=task-1'))
        .flush([]);
      httpMock
        .expectOne((r) => r.url === `${API}/activity` && r.url.includes('taskId=task-1'))
        .flush([]);
      const { task, comments, activity } = await p;
      expect(task.id).toBe('task-1');
      expect(comments).toEqual([]);
      expect(activity).toEqual([]);
    });
  });

  describe('addComment()', () => {
    it('should POST a new comment', async () => {
      const payload = {
        taskId: 'task-1',
        authorId: 'u1',
        content: 'Looks good!',
        mentions: [],
        reactions: [],
      };
      const p = lastValueFrom(service.addComment(payload));
      const req = httpMock.expectOne(`${API}/comments`);
      expect(req.request.method).toBe('POST');
      req.flush({ id: 'cmt-1', ...payload, createdAt: new Date().toISOString() });
      const comment = await p;
      expect(comment.content).toBe('Looks good!');
    });
  });
});
