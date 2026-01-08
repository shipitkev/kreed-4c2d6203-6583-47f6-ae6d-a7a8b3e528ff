import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { User } from '@task-manager/data';
import { Router } from '@angular/router';
import { AccountsStore } from './accounts.store';
import { OrganizationsStore } from './organizations.store';

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

// Try to restore user from localStorage
const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Try to restore from accounts store
const getCurrentAccountFromStorage = (): { user: User; token: string } | null => {
  try {
    const currentAccountId = localStorage.getItem('current_account_id');
    if (!currentAccountId) return null;
    
    const accounts = localStorage.getItem('user_accounts');
    if (!accounts) return null;
    
    const accountsArray = JSON.parse(accounts);
    const account = accountsArray.find((acc: any) => acc.userId === currentAccountId);
    if (account) {
      return { user: account.user, token: account.token };
    }
  } catch {
    // Fall through to regular localStorage check
  }
  return null;
};

const accountData = getCurrentAccountFromStorage();
const token = accountData?.token || localStorage.getItem('token');
const storedUser = accountData?.user || getStoredUser();

const initialState: AuthState = {
  user: storedUser,
  token: token,
  isAuthenticated: !!(token && storedUser),
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, authService = inject(AuthService), router = inject(Router), accountsStore = inject(AccountsStore), organizationsStore = inject(OrganizationsStore)) => ({
    login: rxMethod<{email: string, password: string}>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((credentials) =>
          authService.login(credentials).pipe(
            tap((response) => {
              // Add account to accounts store
              accountsStore.addAccount(response.user, response.access_token);
              
              localStorage.setItem('token', response.access_token);
              localStorage.setItem('user', JSON.stringify(response.user));
              patchState(store, {
                user: response.user,
                token: response.access_token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
              // Load organizations after login
              organizationsStore.loadOrganizations();
              router.navigate(['/']);
            }),
            catchError((err) => {
              const errorMessage = err.error?.message || err.message || err.statusText || 'Invalid credentials. Please try again.';
              patchState(store, { isLoading: false, error: errorMessage });
              return of(null); // Return a safe value to complete the stream
            })
          )
        )
      )
    ),
    register: rxMethod<{email: string, password: string, organizationId: string}>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((payload) =>
          authService.register(payload).pipe(
            tap({
              next: () => {
                patchState(store, { isLoading: false });
              },
              error: (err) => {
                patchState(store, { isLoading: false, error: err.error?.message || 'Registration failed' });
              }
            })
          )
        )
      )
    ),
    loadCurrentUser: rxMethod<void>(
      pipe(
        switchMap(() => {
          const token = store.token();
          if (!token) {
            return of(null);
          }
          return authService.getCurrentUser().pipe(
            tap((user) => {
              localStorage.setItem('user', JSON.stringify(user));
              patchState(store, { user, isAuthenticated: true });
              // Load organizations when user is loaded
              organizationsStore.loadOrganizations();
            }),
            catchError(() => {
              // Token might be invalid, clear it
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              patchState(store, { user: null, token: null, isAuthenticated: false });
              // Redirect to login if we're not already there
              if (router.url !== '/login') {
                router.navigate(['/login']);
              }
              return of(null);
            })
          );
        })
      )
    ),
    logout() {
      const otherAccounts = accountsStore.getOtherAccounts();
      
      if (otherAccounts.length > 0) {
        // Switch to another account
        const nextAccount = otherAccounts[0];
        accountsStore.switchAccount(nextAccount.userId);
        patchState(store, {
          user: nextAccount.user,
          token: nextAccount.token,
          isAuthenticated: true,
        });
        // Don't navigate, stay on current page
      } else {
        // No other accounts, full logout
        const currentAccountId = accountsStore.currentAccountId();
        if (currentAccountId) {
          accountsStore.removeAccount(currentAccountId);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        patchState(store, { user: null, token: null, isAuthenticated: false });
        router.navigate(['/login']);
      }
    },
    
    switchToAccount(userId: string) {
      const accounts = accountsStore.accounts();
      const account = accounts.find(acc => acc.userId === userId);
      if (account) {
        accountsStore.switchAccount(userId);
        patchState(store, {
          user: account.user,
          token: account.token,
          isAuthenticated: true,
        });
        // Load organizations for the new account
        organizationsStore.loadOrganizations();
        // Dispatch event to notify components (like dashboard) to clear and reload data
        window.dispatchEvent(new CustomEvent('account-switched', { detail: { userId } }));
      }
    }
  }))
);

