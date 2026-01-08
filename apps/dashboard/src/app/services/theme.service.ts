import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal<boolean>(true);

  constructor() {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.isDarkMode.set(false);
      this.applyTheme(false);
    } else {
      this.isDarkMode.set(true);
      this.applyTheme(true);
    }

    // Watch for theme changes and save to localStorage
    effect(() => {
      const isDark = this.isDarkMode();
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      this.applyTheme(isDark);
    });
  }

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
  }

  private applyTheme(isDark: boolean) {
    const root = document.documentElement;
    if (isDark) {
      // Dark theme (default)
      root.style.setProperty('--core-primary', '#0d0d0d');
      root.style.setProperty('--core-secondary', '#303030');
      root.style.setProperty('--core-tertiary', '#25edc4');
      root.style.setProperty('--core-primary-text', '#ffffff');
      root.style.setProperty('--core-secondary-text', '#111111');
    } else {
      // Light theme
      root.style.setProperty('--core-primary', '#ffffff');
      root.style.setProperty('--core-secondary', '#f5f5f5');
      root.style.setProperty('--core-tertiary', '#25edc4');
      root.style.setProperty('--core-primary-text', '#0d0d0d');
      root.style.setProperty('--core-secondary-text', '#ffffff');
    }
  }
}

