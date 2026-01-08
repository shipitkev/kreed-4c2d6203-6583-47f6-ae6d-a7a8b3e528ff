import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from './store';
import { AuthService } from './services/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ionEye, ionEyeOff, ionArrowBack } from '@ng-icons/ionicons';
import { matRefresh } from '@ng-icons/material-icons/baseline';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './login.component.html',
  providers: [provideIcons({ ionEye, ionEyeOff, matRefresh, ionArrowBack })]
})
export class LoginComponent {
  readonly authStore = inject(AuthStore);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  email = signal('');
  showPassword = signal(false);
  onSecondStep = signal(false);
  isSecondStepSignUp = signal(false);
  isEmailLoading = signal(false);
  emailError = signal(false);
  emailMessage = signal('');
  passwordError = signal(false);
  passwordMessage = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12)]]
  });

  passwordStrength = signal<{
    score: number;
    feedback: { text: string; met: boolean }[];
    isValid: boolean;
  }>({
    score: 0,
    feedback: [],
    isValid: false
  });

  constructor() {
    // Watch for auth store errors and display them
    effect(() => {
      const error = this.authStore.error();
      const isLoading = this.authStore.isLoading();
      
      if (error && this.onSecondStep() && !this.isSecondStepSignUp() && !isLoading) {
        this.passwordError.set(true);
        this.passwordMessage.set(error);
      }
      
      // Clear error when loading starts (new attempt)
      if (isLoading) {
        this.passwordError.set(false);
        this.passwordMessage.set('');
      }
    });
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  clearEmailFlow() {
    this.onSecondStep.set(false);
    this.email.set('');
    this.emailError.set(false);
    this.emailMessage.set('');
    this.passwordError.set(false);
    this.passwordMessage.set('');
    this.form.patchValue({ email: '', password: '' });
    this.passwordStrength.set({ score: 0, feedback: [], isValid: false });
  }

  validatePassword(password: string) {
    const requirements = [
      { text: 'At least 12 characters', met: password.length >= 12 },
      { text: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { text: 'One number', met: /[0-9]/.test(password) },
      { text: 'One special character', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) }
    ];

    let score = 0;
    requirements.forEach(req => {
      if (req.met) score += 1;
    });

    if (password.length >= 16) {
      score += 1;
    }

    const uniqueChars = new Set(password).size;
    if (uniqueChars >= 8) {
      score += 1;
    }

    const isValid = requirements.every(req => req.met);

    this.passwordStrength.set({
      score,
      feedback: requirements,
      isValid
    });
  }

  async handleEmailValidate() {
    const emailValue = this.email().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValue) {
      this.emailMessage.set('Please enter an email address');
      this.emailError.set(true);
      this.passwordError.set(false);
      this.passwordMessage.set('');
      return;
    }

    if (!emailRegex.test(emailValue)) {
      this.emailMessage.set('Please enter a valid email address');
      this.emailError.set(true);
      this.passwordError.set(false);
      this.passwordMessage.set('');
      return;
    }

    this.isEmailLoading.set(true);
    this.emailMessage.set('');
    this.emailError.set(false);
    this.passwordError.set(false);
    this.passwordMessage.set('');

    this.authService.checkEmailExists(emailValue).subscribe({
      next: (response) => {
        this.isEmailLoading.set(false);
        if (response.exists) {
          this.isSecondStepSignUp.set(false);
        } else {
          this.isSecondStepSignUp.set(true);
          // Clear email message when moving to sign up step
          this.emailMessage.set('');
          this.emailError.set(false);
        }
        this.onSecondStep.set(true);
        this.form.patchValue({ email: emailValue });
      },
      error: (err) => {
        this.isEmailLoading.set(false);
        this.emailMessage.set('Failed to check if email exists. Please try again.');
        this.emailError.set(true);
      }
    });
  }

  async handleEmailSignUp() {
    const { email, password } = this.form.value;
    if (!email || !password) return;

    this.passwordError.set(false);
    this.passwordMessage.set('');

    this.authService.register({ email, password }).subscribe({
      next: (response) => {
        // Auto-login after successful registration, then redirect to dashboard
        this.authStore.login({ email, password });
      },
      error: (err) => {
        this.passwordMessage.set(err.error?.message || 'Failed to sign up. Please try again.');
        this.passwordError.set(true);
      }
    });
  }

  async handleEmailSignIn() {
    const emailValue = this.email() || this.form.get('email')?.value;
    const password = this.form.get('password')?.value;
    
    if (!emailValue || !password) return;

    // Clear previous errors
    this.passwordError.set(false);
    this.passwordMessage.set('');
    
    // Clear auth store error before attempting login
    // The effect will handle displaying the error if login fails
    this.authStore.login({ email: emailValue, password });
  }
}