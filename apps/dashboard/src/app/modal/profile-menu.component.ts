import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ionPerson, ionPower, ionAdd } from '@ng-icons/ionicons';
import { ModalStore } from '../store';
import { AuthStore } from '../store';
import { AccountsStore } from '../store';
import { OrganizationsStore } from '../store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ ionPerson, ionPower, ionAdd })],
  templateUrl: './profile-menu.component.html'
})
export class ProfileMenuComponent {
  modalStore = inject(ModalStore);
  authStore = inject(AuthStore);
  accountsStore = inject(AccountsStore);
  organizationsStore = inject(OrganizationsStore);
  router = inject(Router);

  otherAccounts = computed(() => this.accountsStore.getOtherAccounts());
  hasOtherAccounts = computed(() => this.otherAccounts().length > 0);
  
  getCurrentUserRole() {
    const user = this.authStore.user();
    if (!user) return 'N/A';
    return this.organizationsStore.getCurrentUserRole(user.id) || 'N/A';
  }
  
  getAccountRole(userId: string) {
    // For other accounts, we'd need to get their role from their current organization
    // For now, return a placeholder or get from the account's stored data
    const account = this.accountsStore.accounts().find(acc => acc.userId === userId);
    // The account might have role stored, but ideally we'd get it from the org
    return 'N/A'; // Placeholder - would need to load org for that account
  }

  logout() {
    this.authStore.logout();
    this.modalStore.setModal('');
  }

  addAccount() {
    // Close modal and navigate to login
    this.modalStore.setModal('');
    this.router.navigate(['/login']);
  }

  switchToAccount(userId: string) {
    this.authStore.switchToAccount(userId);
    this.modalStore.setModal('');
  }
}

