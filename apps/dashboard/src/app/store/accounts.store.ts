import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { User } from '@task-manager/data';

type Account = {
  userId: string;
  email: string;
  token: string;
  user: User;
};

type AccountsState = {
  accounts: Account[];
  currentAccountId: string | null;
};

const STORAGE_KEY = 'user_accounts';
const CURRENT_ACCOUNT_KEY = 'current_account_id';

// Load accounts from localStorage
const loadAccounts = (): Account[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const loadCurrentAccountId = (): string | null => {
  return localStorage.getItem(CURRENT_ACCOUNT_KEY);
};

const accounts = loadAccounts();
const currentAccountId = loadCurrentAccountId();

const initialState: AccountsState = {
  accounts,
  currentAccountId,
};

export const AccountsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    addAccount(user: User, token: string) {
      const accounts = store.accounts();
      // Check if account already exists
      const existingIndex = accounts.findIndex(acc => acc.userId === user.id);
      
      if (existingIndex >= 0) {
        // Update existing account
        const updatedAccounts = [...accounts];
        updatedAccounts[existingIndex] = { userId: user.id, email: user.email, token, user };
        patchState(store, { accounts: updatedAccounts, currentAccountId: user.id });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
        localStorage.setItem(CURRENT_ACCOUNT_KEY, user.id);
      } else {
        // Add new account
        const newAccount: Account = { userId: user.id, email: user.email, token, user };
        const updatedAccounts = [...accounts, newAccount];
        patchState(store, { accounts: updatedAccounts, currentAccountId: user.id });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
        localStorage.setItem(CURRENT_ACCOUNT_KEY, user.id);
      }
    },
    
    switchAccount(userId: string) {
      const accounts = store.accounts();
      const account = accounts.find(acc => acc.userId === userId);
      if (account) {
        patchState(store, { currentAccountId: userId });
        localStorage.setItem(CURRENT_ACCOUNT_KEY, userId);
        // Update main token and user in localStorage for auth interceptor
        localStorage.setItem('token', account.token);
        localStorage.setItem('user', JSON.stringify(account.user));
      }
    },
    
    removeAccount(userId: string) {
      const accounts = store.accounts();
      const updatedAccounts = accounts.filter(acc => acc.userId !== userId);
      patchState(store, { accounts: updatedAccounts });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
      
      // If we removed the current account, switch to another or clear
      if (store.currentAccountId() === userId) {
        if (updatedAccounts.length > 0) {
          this.switchAccount(updatedAccounts[0].userId);
        } else {
          patchState(store, { currentAccountId: null });
          localStorage.removeItem(CURRENT_ACCOUNT_KEY);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    },
    
    getOtherAccounts(): Account[] {
      const accounts = store.accounts();
      const currentId = store.currentAccountId();
      return accounts.filter(acc => acc.userId !== currentId);
    },
    
    getCurrentAccount(): Account | null {
      const accounts = store.accounts();
      const currentId = store.currentAccountId();
      return accounts.find(acc => acc.userId === currentId) || null;
    }
  }))
);

