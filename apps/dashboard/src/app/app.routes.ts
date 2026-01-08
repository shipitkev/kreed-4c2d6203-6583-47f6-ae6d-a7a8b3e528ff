import { Route, Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { DashboardComponent } from './dashboard.component';
import { inject } from '@angular/core';
import { AuthStore } from './store';

const authGuard = () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  
  // If we have a token but no user, try to load the user first
  if (store.token() && !store.user()) {
    store.loadCurrentUser();
    // Allow access while loading - the user will be validated
    // If invalid, they'll be redirected on the next navigation
    return true;
  }
  
  if (store.isAuthenticated()) {
    return true;
  }
  
  return router.parseUrl('/login');
};

export const appRoutes: Route[] = [
  { path: 'login', component: LoginComponent },
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
];
