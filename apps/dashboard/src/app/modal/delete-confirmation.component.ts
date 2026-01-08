import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalStore } from '../store';
import { TasksService } from '../services/tasks.service';

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirmation.component.html'
})
export class DeleteConfirmationComponent {
  modalStore = inject(ModalStore);
  tasksService = inject(TasksService);

  getTaskId(): string | null {
    const modal = this.modalStore.modal();
    if (!modal) return null;
    // Extract task ID from modal string (e.g., "delete-task&id=123" -> "123")
    const parts = modal.split('&');
    const idPart = parts.find(part => part.startsWith('id='));
    return idPart ? idPart.split('=')[1] : null;
  }

  confirmDelete() {
    const taskId = this.getTaskId();
    if (taskId) {
      this.tasksService.deleteTask(taskId).subscribe({
        next: () => {
          // Emit event or use a callback - for now, just close modal
          // The parent component should handle refreshing the task list
          this.modalStore.setModal('');
          // Dispatch a custom event that the dashboard can listen to
          window.dispatchEvent(new CustomEvent('task-deleted', { detail: { taskId } }));
        },
        error: (err) => {
          console.error('Failed to delete task:', err);
          // Could show an error message here
        }
      });
    }
  }

  cancel() {
    this.modalStore.setModal('');
  }
}

