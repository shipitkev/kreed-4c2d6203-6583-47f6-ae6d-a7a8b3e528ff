import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ionPencil, ionCheckmark, ionClose, ionAdd, ionTrash } from '@ng-icons/ionicons';
import { AuthStore, OrganizationsStore } from '../store';
import { ModalStore } from '../store';
import { Role } from '@task-manager/data';
import { OrganizationsService, OrganizationMember } from '../services/organizations.service';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, NgIconComponent, FormsModule],
  providers: [provideIcons({ ionPencil, ionCheckmark, ionClose, ionAdd, ionTrash })],
  templateUrl: './settings-modal.component.html'
})
export class SettingsModalComponent implements OnInit {
  authStore = inject(AuthStore);
  organizationsStore = inject(OrganizationsStore);
  modalStore = inject(ModalStore);
  organizationsService = inject(OrganizationsService);

  editingOrgName = signal(false);
  editOrgNameValue = signal('');
  addingOrg = signal(false);
  newOrgName = signal('');
  members = signal<OrganizationMember[]>([]);
  editingMemberRole = signal<string | null>(null);
  deletingMember = signal<string | null>(null);
  addingMember = signal(false);
  newMemberEmail = signal('');
  newMemberRole = signal<Role>(Role.VIEWER);

  currentUserRole = computed(() => {
    const user = this.authStore.user();
    if (!user) return null;
    return this.organizationsStore.getCurrentUserRole(user.id);
  });

  currentUserId = computed(() => {
    return this.authStore.user()?.id || null;
  });

  Role = Role; // Expose Role enum to template

  constructor() {
    // Watch for organization changes and reload members
    effect(() => {
      const currentOrg = this.organizationsStore.getCurrentOrganization();
      if (currentOrg) {
        this.loadMembers(currentOrg.id);
      } else {
        this.members.set([]);
      }
    });
  }

  ngOnInit() {
    // Load organizations if not already loaded
    const orgs = this.organizationsStore.organizations();
    if (orgs.length === 0) {
      this.organizationsStore.loadOrganizations();
    }
  }

  loadMembers(organizationId: string) {
    this.organizationsService.getOrganizationMembers(organizationId).subscribe({
      next: (members) => {
        // Sort members: current user first, then by role (OWNER -> ADMIN -> VIEWER)
        const sortedMembers = this.sortMembers(members);
        this.members.set(sortedMembers);
      },
      error: (err) => {
        console.error('Failed to load members:', err);
        this.members.set([]);
      }
    });
  }

  sortMembers(members: OrganizationMember[]): OrganizationMember[] {
    const currentUserId = this.currentUserId();
    const roleOrder = { [Role.OWNER]: 0, [Role.ADMIN]: 1, [Role.VIEWER]: 2 };
    
    return [...members].sort((a, b) => {
      // Current user always comes first
      if (a.userId === currentUserId) return -1;
      if (b.userId === currentUserId) return 1;
      
      // Then sort by role: OWNER -> ADMIN -> VIEWER
      const roleA = roleOrder[a.role] ?? 999;
      const roleB = roleOrder[b.role] ?? 999;
      return roleA - roleB;
    });
  }

  startEditMemberRole(member: OrganizationMember) {
    this.editingMemberRole.set(member.userId);
  }

  cancelEditMemberRole() {
    this.editingMemberRole.set(null);
  }

  onRoleChange(organizationId: string, userId: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    const role = select.value as Role;
    this.saveMemberRole(organizationId, userId, role);
  }

  saveMemberRole(organizationId: string, userId: string, role: Role) {
    this.organizationsService.updateMemberRole(organizationId, userId, role).subscribe({
      next: (members) => {
        this.members.set(members);
        this.editingMemberRole.set(null);
        // Reload organizations to refresh roles
        this.organizationsStore.loadOrganizations();
      },
      error: (err) => {
        console.error('Failed to update member role:', err);
        this.editingMemberRole.set(null);
      }
    });
  }

  startDeleteMember(userId: string) {
    this.deletingMember.set(userId);
  }

  cancelDeleteMember() {
    this.deletingMember.set(null);
  }

  confirmDeleteMember(organizationId: string, userId: string) {
    this.organizationsService.removeMember(organizationId, userId).subscribe({
      next: (members) => {
        this.members.set(members);
        this.deletingMember.set(null);
        // Reload organizations to refresh roles
        this.organizationsStore.loadOrganizations();
      },
      error: (err) => {
        console.error('Failed to remove member:', err);
      }
    });
  }

  startAddMember() {
    this.addingMember.set(true);
    this.newMemberEmail.set('');
    this.newMemberRole.set(Role.VIEWER);
  }

  cancelAddMember() {
    this.addingMember.set(false);
    this.newMemberEmail.set('');
    this.newMemberRole.set(Role.VIEWER);
  }

  saveNewMember() {
    const org = this.getCurrentOrganization();
    if (!org) return;

    const email = this.newMemberEmail().trim();
    if (!email) return;

    this.organizationsService.addMember(org.id, email, this.newMemberRole()).subscribe({
      next: (members) => {
        this.members.set(members);
        this.addingMember.set(false);
        this.newMemberEmail.set('');
        this.newMemberRole.set(Role.VIEWER);
        // Reload organizations to refresh roles
        this.organizationsStore.loadOrganizations();
      },
      error: (err) => {
        console.error('Failed to add member:', err);
        // You could show an error message to the user here
      }
    });
  }

  onNewMemberKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.saveNewMember();
    } else if (event.key === 'Escape') {
      this.cancelAddMember();
    }
  }

  canEditOrganization(): boolean {
    const role = this.currentUserRole();
    return role === Role.OWNER || role === Role.ADMIN;
  }

  getCurrentOrganization() {
    return this.organizationsStore.getCurrentOrganization();
  }

  startEditOrgName() {
    const org = this.getCurrentOrganization();
    if (org) {
      this.editOrgNameValue.set(org.name);
      this.editingOrgName.set(true);
    }
  }

  cancelEditOrgName() {
    this.editingOrgName.set(false);
    this.editOrgNameValue.set('');
  }

  saveOrgName() {
    const org = this.getCurrentOrganization();
    if (org && this.editOrgNameValue().trim()) {
      this.organizationsStore.updateOrganizationName({
        id: org.id,
        name: this.editOrgNameValue().trim()
      });
      this.editingOrgName.set(false);
    }
  }

  onOrgNameKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.saveOrgName();
    } else if (event.key === 'Escape') {
      this.cancelEditOrgName();
    }
  }

  startAddOrg() {
    this.addingOrg.set(true);
    this.newOrgName.set('');
  }

  cancelAddOrg() {
    this.addingOrg.set(false);
    this.newOrgName.set('');
  }

  saveNewOrg() {
    const name = this.newOrgName().trim();
    if (name) {
      this.organizationsStore.createOrganization({ name });
      this.addingOrg.set(false);
      this.newOrgName.set('');
    }
  }

  onNewOrgNameKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.saveNewOrg();
    } else if (event.key === 'Escape') {
      this.cancelAddOrg();
    }
  }

  closeModal() {
    this.modalStore.setModal('');
  }
}

