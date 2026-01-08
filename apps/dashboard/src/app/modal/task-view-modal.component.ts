import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalStore } from '../store';
import { TasksService } from '../services/tasks.service';
import { OrganizationsStore } from '../store';
import { Task } from '@task-manager/data';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ionAdd, ionClose } from '@ng-icons/ionicons';

@Component({
  selector: 'app-task-view-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgIconComponent],
  providers: [provideIcons({ ionAdd, ionClose })],
  templateUrl: './task-view-modal.component.html'
})
export class TaskViewModalComponent implements OnInit {
  modalStore = inject(ModalStore);
  tasksService = inject(TasksService);
  organizationsStore = inject(OrganizationsStore);
  private fb = inject(FormBuilder);

  task = signal<Task | null>(null);
  isEditing = signal(false);
  tags = signal<Set<string>>(new Set());
  availableTags = ['Work', 'Personal'];
  selectedTag = signal<string>('');
  
  editForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    status: ['OPEN', Validators.required]
  });

  ngOnInit() {
    this.loadTask();
  }

  getTaskId(): string | null {
    const modal = this.modalStore.modal();
    if (!modal) return null;
    const parts = modal.split('&');
    const idPart = parts.find(part => part.startsWith('id='));
    return idPart ? idPart.split('=')[1] : null;
  }

  loadTask() {
    const taskId = this.getTaskId();
    if (taskId) {
      this.tasksService.getTask(taskId).subscribe({
        next: (task) => {
          this.task.set(task);
          this.tags.set(new Set(task.tags || []));
          this.editForm.patchValue({
            title: task.title,
            description: task.description,
            status: task.status
          });
        },
        error: (err) => {
          console.error('Failed to load task:', err);
        }
      });
    }
  }

  getOrganizationName(organizationId: string): string {
    const org = this.organizationsStore.organizations().find(o => o.id === organizationId);
    return org?.name || 'Unknown';
  }

  startEdit() {
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
    // Reset form to original values
    const task = this.task();
    if (task) {
      this.editForm.patchValue({
        title: task.title,
        description: task.description,
        status: task.status
      });
      this.tags.set(new Set(task.tags || []));
    }
  }

  saveTask() {
    if (this.editForm.invalid || !this.task()) return;
    
    const taskId = this.task()!.id;
    const updateData = {
      ...this.editForm.value,
      tags: Array.from(this.tags())
    };
    
    this.tasksService.updateTask(taskId, updateData as any).subscribe({
      next: (updatedTask) => {
        this.task.set(updatedTask);
        this.tags.set(new Set(updatedTask.tags || []));
        this.isEditing.set(false);
        // Dispatch event to notify dashboard to reload tasks
        window.dispatchEvent(new CustomEvent('task-updated', { detail: { taskId } }));
      },
      error: (err) => {
        console.error('Failed to update task:', err);
      }
    });
  }

  addTag() {
    const tag = this.selectedTag();
    if (tag && !this.tags().has(tag)) {
      this.tags.update(tags => new Set([...tags, tag]));
      this.selectedTag.set('');
    }
  }

  removeTag(tag: string) {
    this.tags.update(tags => {
      const newTags = new Set(tags);
      newTags.delete(tag);
      return newTags;
    });
  }

  getAvailableTags(): string[] {
    return this.availableTags.filter(tag => !this.tags().has(tag));
  }

  close() {
    this.modalStore.setModal('');
  }
}

