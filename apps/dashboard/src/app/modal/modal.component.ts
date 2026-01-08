import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalStore } from '../store';
import { DeleteConfirmationComponent } from './delete-confirmation.component';
import { ProfileMenuComponent } from './profile-menu.component';
import { SettingsModalComponent } from './settings-modal.component';
import { TaskViewModalComponent } from './task-view-modal.component';
import { CreateTaskModalComponent } from './create-task-modal.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, DeleteConfirmationComponent, ProfileMenuComponent, SettingsModalComponent, TaskViewModalComponent, CreateTaskModalComponent],
  templateUrl: './modal.component.html'
})
export class ModalComponent {
  modalStore = inject(ModalStore);

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: Event) {
    if (this.modalStore.modal() !== '') {
      this.modalStore.setModal('');
    }
  }

  handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.modalStore.setModal('');
    }
  }

  closeModal() {
    this.modalStore.setModal('');
  }

  getModalName(): string {
    const modal = this.modalStore.modal();
    if (!modal) return '';
    // Extract modal name from query string (e.g., "reset-password&token=abc" -> "reset-password")
    return modal.split('&')[0].split('.')[0];
  }

  isProfileMenu(): boolean {
    return this.getModalName() === 'profile-menu';
  }
}

