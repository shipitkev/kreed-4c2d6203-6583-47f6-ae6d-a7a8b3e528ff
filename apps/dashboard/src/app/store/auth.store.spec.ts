import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthStore } from './auth.store';
import { AuthService } from '../services/auth.service';
import { AccountsStore } from './accounts.store';
import { OrganizationsStore } from './organizations.store';
import { AuthResponse, User } from '@task-manager/data';

describe('AuthStore', () => {
  let store: AuthStore;
  let authService: AuthService;
  let router: Router;
  let accountsStore: AccountsStore;
  let organizationsStore: OrganizationsStore;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthStore,
        AuthService,
        AccountsStore,
        OrganizationsStore,
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            url: '/',
          },
        },
      ],
    });

    store = TestBed.inject(AuthStore);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    accountsStore = TestBed.inject(AccountsStore);
    organizationsStore = TestBed.inject(OrganizationsStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should have initial state with no user when localStorage is empty', () => {
    expect(store.user()).toBeNull();
    expect(store.token()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should restore user from localStorage on initialization', () => {
    const mockUser: User = {
      id: 'user-1',
      email: 'test@example.com',
    };
    const mockToken = 'mock-token';

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', mockToken);

    // Create a new store instance to test initialization
    const newStore = TestBed.inject(AuthStore);
    // Note: SignalStore initializes state in constructor, so we check the actual state
    // The store should have restored the user from localStorage
    expect(newStore.user()).toBeTruthy();
  });

  describe('login', () => {
    it('should set loading state when login starts', (done) => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      
      // Mock the login method to track state changes
      jest.spyOn(authService, 'login').mockReturnValue(
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              access_token: 'token',
              user: { id: '1', email: 'test@example.com' },
            } as AuthResponse);
          }, 100);
        }) as any
      );

      store.login(credentials);
      
      // Check loading state immediately
      expect(store.isLoading()).toBe(true);
      done();
    });

    it('should handle login success', (done) => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse: AuthResponse = {
        access_token: 'mock-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
        },
      };

      jest.spyOn(authService, 'login').mockReturnValue(
        Promise.resolve(mockResponse) as any
      );
      jest.spyOn(accountsStore, 'addAccount');
      jest.spyOn(organizationsStore, 'loadOrganizations');
      jest.spyOn(router, 'navigate');

      store.login(credentials);

      setTimeout(() => {
        expect(store.user()?.email).toBe('test@example.com');
        expect(store.token()).toBe('mock-token');
        expect(store.isAuthenticated()).toBe(true);
        expect(accountsStore.addAccount).toHaveBeenCalled();
        expect(organizationsStore.loadOrganizations).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/']);
        done();
      }, 100);
    });

    it('should handle login error', (done) => {
      const credentials = { email: 'test@example.com', password: 'wrong' };
      const error = { error: { message: 'Invalid credentials' } };

      jest.spyOn(authService, 'login').mockReturnValue(
        Promise.reject(error) as any
      );

      store.login(credentials);

      setTimeout(() => {
        expect(store.isLoading()).toBe(false);
        expect(store.error()).toBeTruthy();
        expect(store.isAuthenticated()).toBe(false);
        done();
      }, 100);
    });
  });

  describe('logout', () => {
    it('should clear user and token on logout when no other accounts', () => {
      const mockUser: User = { id: 'user-1', email: 'test@example.com' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'token');

      jest.spyOn(accountsStore, 'getOtherAccounts').mockReturnValue([]);
      jest.spyOn(accountsStore, 'currentAccountId').mockReturnValue('user-1');
      jest.spyOn(accountsStore, 'removeAccount');
      jest.spyOn(router, 'navigate');

      store.logout();

      expect(store.user()).toBeNull();
      expect(store.token()).toBeNull();
      expect(store.isAuthenticated()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should switch to another account if available', () => {
      const mockUser: User = { id: 'user-1', email: 'test@example.com' };
      const otherAccount = {
        userId: 'user-2',
        user: { id: 'user-2', email: 'other@example.com' },
        token: 'token-2',
      };

      jest.spyOn(accountsStore, 'getOtherAccounts').mockReturnValue([otherAccount]);
      jest.spyOn(accountsStore, 'switchAccount');

      store.logout();

      expect(store.user()?.id).toBe('user-2');
      expect(store.isAuthenticated()).toBe(true);
      expect(accountsStore.switchAccount).toHaveBeenCalledWith('user-2');
    });
  });

  describe('switchToAccount', () => {
    it('should switch to specified account', () => {
      const account = {
        userId: 'user-2',
        user: { id: 'user-2', email: 'other@example.com' },
        token: 'token-2',
      };

      jest.spyOn(accountsStore, 'accounts').mockReturnValue([
        {
          userId: 'user-1',
          user: { id: 'user-1', email: 'test@example.com' },
          token: 'token-1',
        },
        account,
      ]);
      jest.spyOn(accountsStore, 'switchAccount');
      jest.spyOn(organizationsStore, 'loadOrganizations');

      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

      store.switchToAccount('user-2');

      expect(store.user()?.id).toBe('user-2');
      expect(store.token()).toBe('token-2');
      expect(store.isAuthenticated()).toBe(true);
      expect(accountsStore.switchAccount).toHaveBeenCalledWith('user-2');
      expect(organizationsStore.loadOrganizations).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should not switch if account not found', () => {
      jest.spyOn(accountsStore, 'accounts').mockReturnValue([]);

      const initialUser = store.user();
      store.switchToAccount('non-existent');

      expect(store.user()).toBe(initialUser);
    });
  });
});

