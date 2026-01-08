import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { OrganizationsService } from '../services/organizations.service';
import { Organization } from '@task-manager/data';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of, mergeMap } from 'rxjs';

type OrganizationsState = {
  organizations: Organization[];
  currentOrganizationId: string | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: OrganizationsState = {
  organizations: [],
  currentOrganizationId: null,
  isLoading: false,
  error: null,
};

export const OrganizationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, organizationsService = inject(OrganizationsService)) => ({
    loadOrganizations: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          organizationsService.getUserOrganizations().pipe(
            tap((orgs) => {
              patchState(store, {
                organizations: orgs,
                currentOrganizationId: orgs.length > 0 ? orgs[0].id : null,
                isLoading: false,
              });
            }),
            catchError((err) => {
              patchState(store, {
                isLoading: false,
                error: err.error?.message || 'Failed to load organizations',
              });
              return of(null);
            })
          )
        )
      )
    ),
    
    updateOrganizationName: rxMethod<{id: string, name: string}>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, name }) =>
          organizationsService.updateOrganization(id, name).pipe(
            tap((updatedOrg) => {
              const orgs = store.organizations();
              const updatedOrgs = orgs.map(org =>
                org.id === id ? updatedOrg : org
              );
              patchState(store, {
                organizations: updatedOrgs,
                isLoading: false,
              });
            }),
            catchError((err) => {
              patchState(store, {
                isLoading: false,
                error: err.error?.message || 'Failed to update organization',
              });
              return of(null);
            })
          )
        )
      )
    ),
    
    setCurrentOrganization(id: string) {
      patchState(store, { currentOrganizationId: id });
    },
    
    getCurrentOrganization(): Organization | null {
      const orgs = store.organizations();
      const currentId = store.currentOrganizationId();
      return orgs.find(org => org.id === currentId) || (orgs.length > 0 ? orgs[0] : null);
    },
    
    getCurrentUserRole(userId: string): string | null {
      const orgs = store.organizations();
      const currentId = store.currentOrganizationId();
      const org = orgs.find(org => org.id === currentId) || (orgs.length > 0 ? orgs[0] : null);
      if (!org || !org.roles) {
        return null;
      }
      return org.roles[userId] || null;
    },
    
    getUserRoleInOrganization(userId: string, organizationId: string): string | null {
      const orgs = store.organizations();
      const org = orgs.find(org => org.id === organizationId);
      if (!org || !org.roles) {
        return null;
      }
      return org.roles[userId] || null;
    },
    
    createOrganization: rxMethod<{name: string}>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ name }) =>
          organizationsService.createOrganization(name).pipe(
            mergeMap((newOrg) => {
              // Reload organizations to get fresh state
              // The backend updates the user's organizationId, so reloading will show the new org
              return organizationsService.getUserOrganizations().pipe(
                tap((orgs) => {
                  patchState(store, {
                    organizations: orgs,
                    currentOrganizationId: orgs.length > 0 ? orgs[0].id : null,
                    isLoading: false,
                  });
                  // Dispatch event to notify auth store to reload user data
                  window.dispatchEvent(new CustomEvent('organization-created'));
                })
              );
            }),
            catchError((err) => {
              patchState(store, {
                isLoading: false,
                error: err.error?.message || 'Failed to create organization',
              });
              return of(null);
            })
          )
        )
      )
    )
  }))
);

