import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { AuthStore, AccountsStore, OrganizationsStore } from './store';
import { ModalComponent } from './modal/modal.component';

@Component({
  imports: [RouterModule, ModalComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  protected title = 'dashboard';
  
  // Inject services to initialize on app startup
  private themeService = inject(ThemeService);
  private authStore = inject(AuthStore);
  private accountsStore = inject(AccountsStore);
  private organizationsStore = inject(OrganizationsStore);

  private organizationCreatedHandler = (() => {
    // Reload user data when an organization is created (backend updates user's organizationId)
    this.authStore.loadCurrentUser();
  }) as EventListener;

  ngOnInit() {
    // Initialize accounts store (loads from localStorage)
    // Then load current user if token exists
    if (this.authStore.token()) {
      this.authStore.loadCurrentUser();
      // Load organizations after user is loaded
      this.organizationsStore.loadOrganizations();
    }
    
    // Listen for organization creation to reload user data
    window.addEventListener('organization-created', this.organizationCreatedHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('organization-created', this.organizationCreatedHandler);
  }
}
