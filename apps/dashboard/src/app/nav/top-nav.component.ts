import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ionPersonCircle, ionMoon, ionSunny, ionSettings } from '@ng-icons/ionicons';
import { AuthStore } from '../store';
import { ThemeService } from '../services/theme.service';
import { ModalStore } from '../store';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  templateUrl: './top-nav.component.html',
  providers: [provideIcons({ 
    ionPersonCircle, ionMoon, ionSunny, ionSettings
  })]
})
export class TopNavComponent {
  authStore = inject(AuthStore);
  themeService = inject(ThemeService);
  modalStore = inject(ModalStore);

  openSettings() {
    this.modalStore.setModal('settings');
  }

  openProfileMenu() {
    this.modalStore.setModal('profile-menu');
  }
}
