import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalStore, OrganizationsStore, AuthStore } from '../store';
import { TasksService } from '../services/tasks.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ionAdd, ionClose } from '@ng-icons/ionicons';
import { Role } from '@task-manager/data';

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  providers: [provideIcons({ ionAdd, ionClose })],
  templateUrl: './create-task-modal.component.html',
})
export class CreateTaskModalComponent implements OnInit {
  modalStore = inject(ModalStore);
  organizationsStore = inject(OrganizationsStore);
  authStore = inject(AuthStore);
  tasksService = inject(TasksService);
  fb = inject(FormBuilder);

  tags = signal<Set<string>>(new Set());
  availableTags = ['Work', 'Personal'];
  selectedTag = signal<string>('');

  createForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    status: ['OPEN'],
    organizationId: ['']
  });

  // Get organizations where user has ADMIN or OWNER role
  editableOrganizations = computed(() => {
    const user = this.authStore.user();
    if (!user) return [];
    
    return this.organizationsStore.organizations().filter(org => {
      const role = this.organizationsStore.getUserRoleInOrganization(user.id, org.id);
      return role === Role.OWNER || role === Role.ADMIN;
    });
  });

  hasMultipleOrganizations = computed(() => {
    return this.editableOrganizations().length > 1;
  });

  getCurrentOrganizationId(): string | null {
    const orgs = this.editableOrganizations();
    if (orgs.length === 0) return null;
    const currentOrg = this.organizationsStore.getCurrentOrganization();
    // Check if current org is editable, otherwise use first editable org
    if (currentOrg && orgs.some(org => org.id === currentOrg.id)) {
      return currentOrg.id;
    }
    return orgs[0].id;
  }

  ngOnInit() {
    // Wait for organizations to load if they're still loading
    if (this.organizationsStore.isLoading()) {
      // Use an effect to wait for loading to complete
      const checkOrgs = () => {
        if (!this.organizationsStore.isLoading()) {
          this.initializeForm();
        } else {
          setTimeout(checkOrgs, 100);
        }
      };
      checkOrgs();
    } else {
      this.initializeForm();
    }
  }

  private initializeForm() {
    const editableOrgs = this.editableOrganizations();
    if (editableOrgs.length === 0) {
      // No editable organizations - user can't create tasks
      console.warn('User has no organizations with ADMIN or OWNER role');
      return;
    }
    const defaultOrgId = this.getCurrentOrganizationId() || editableOrgs[0].id;
    this.createForm.patchValue({ organizationId: defaultOrgId });
  }

  createTask() {
    if (this.createForm.invalid) return;
    const formValue = this.createForm.value;
    
    // Ensure we have editable organizations loaded
    const editableOrgs = this.editableOrganizations();
    if (editableOrgs.length === 0) {
      console.error('No editable organizations available');
      return;
    }
    
    // Use the form value if it exists and is not empty, otherwise fall back to current organization
    let organizationId = (formValue.organizationId && formValue.organizationId.trim() !== '') 
      ? formValue.organizationId 
      : this.getCurrentOrganizationId();
    
    // Verify the organizationId is in the editable organizations list
    if (!organizationId || !editableOrgs.some(org => org.id === organizationId)) {
      // If the selected org is not editable, use the first editable org
      organizationId = editableOrgs[0].id;
      console.warn(`Selected organization is not editable, using first editable organization: ${organizationId}`);
    }
    
    if (!organizationId) {
      console.error('No organization ID available');
      return;
    }
    
    const taskData = {
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
      organizationId,
      tags: Array.from(this.tags())
    };
    
    this.tasksService.createTask(taskData as any).subscribe({
      next: (newTask) => {
        // Dispatch event to notify dashboard to reload tasks
        window.dispatchEvent(new CustomEvent('task-created', { detail: { task: newTask } }));
        this.modalStore.setModal('');
        const defaultOrgId = this.getCurrentOrganizationId() || '';
        this.createForm.reset({ status: 'OPEN', organizationId: defaultOrgId });
        this.tags.set(new Set());
        this.selectedTag.set('');
      },
      error: (err) => {
        console.error('Failed to create task:', err);
        if (err.status === 403) {
          console.error('Forbidden: User may not have permission for this organization. OrganizationId:', organizationId);
          console.error('Editable organizations:', editableOrgs.map(o => ({ id: o.id, name: o.name })));
        }
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

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}

