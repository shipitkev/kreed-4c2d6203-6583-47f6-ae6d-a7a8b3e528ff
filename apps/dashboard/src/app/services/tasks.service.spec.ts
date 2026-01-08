import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TasksService } from './tasks.service';
import { Task } from '@task-manager/data';

describe('TasksService', () => {
  let service: TasksService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TasksService],
    });
    service = TestBed.inject(TasksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTasks', () => {
    it('should fetch all tasks', () => {
      const mockTasks: Task[] = [
        {
          id: 'task-1',
          title: 'Test Task 1',
          description: 'Description 1',
          status: 'OPEN',
          organizationId: 'org-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-2',
          title: 'Test Task 2',
          description: 'Description 2',
          status: 'IN_PROGRESS',
          organizationId: 'org-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      service.getTasks().subscribe((tasks) => {
        expect(tasks.length).toBe(2);
        expect(tasks[0].title).toBe('Test Task 1');
        expect(tasks[1].status).toBe('IN_PROGRESS');
      });

      const req = httpMock.expectOne('/api/tasks');
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);
    });

    it('should return empty array when no tasks exist', () => {
      service.getTasks().subscribe((tasks) => {
        expect(tasks).toEqual([]);
      });

      const req = httpMock.expectOne('/api/tasks');
      req.flush([]);
    });
  });

  describe('getTask', () => {
    it('should fetch a single task by id', () => {
      const mockTask: Task = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'OPEN',
        organizationId: 'org-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.getTask('task-1').subscribe((task) => {
        expect(task).toEqual(mockTask);
        expect(task.id).toBe('task-1');
      });

      const req = httpMock.expectOne('/api/tasks/task-1');
      expect(req.request.method).toBe('GET');
      req.flush(mockTask);
    });
  });

  describe('createTask', () => {
    it('should create a new task', () => {
      const newTask: Partial<Task> = {
        title: 'New Task',
        description: 'New Description',
        status: 'OPEN',
        organizationId: 'org-1',
      };

      const createdTask: Task = {
        id: 'task-new',
        ...newTask,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Task;

      service.createTask(newTask).subscribe((task) => {
        expect(task.id).toBe('task-new');
        expect(task.title).toBe('New Task');
      });

      const req = httpMock.expectOne('/api/tasks');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTask);
      req.flush(createdTask);
    });

    it('should create task with tags', () => {
      const newTask: Partial<Task> = {
        title: 'Task with Tags',
        description: 'Description',
        status: 'OPEN',
        organizationId: 'org-1',
        tags: ['Work', 'Personal'],
      };

      const createdTask: Task = {
        id: 'task-tagged',
        ...newTask,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Task;

      service.createTask(newTask).subscribe((task) => {
        expect(task.tags).toEqual(['Work', 'Personal']);
      });

      const req = httpMock.expectOne('/api/tasks');
      req.flush(createdTask);
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', () => {
      const updates: Partial<Task> = {
        title: 'Updated Title',
        status: 'DONE',
      };

      const updatedTask: Task = {
        id: 'task-1',
        title: 'Updated Title',
        description: 'Original Description',
        status: 'DONE',
        organizationId: 'org-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.updateTask('task-1', updates).subscribe((task) => {
        expect(task.title).toBe('Updated Title');
        expect(task.status).toBe('DONE');
      });

      const req = httpMock.expectOne('/api/tasks/task-1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush(updatedTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', () => {
      service.deleteTask('task-1').subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne('/api/tasks/task-1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});

