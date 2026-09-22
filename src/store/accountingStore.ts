import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccountType = 'cash' | 'bank' | 'mfs' | 'partner';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  voucherNo: string;
  date: string;
  type: TransactionType;
  amount: number;
  
  // For Income / Expense
  accountId?: string; 
  category?: string;
  feeAmount?: number; // Transaction fee (e.g. bKash cash out charge)
  partnerName?: string; // For Capital/Investment tracking

  // For Transfer
  fromAccountId?: string;
  toAccountId?: string;

  reference: string;
}

interface AccountingState {
  accounts: Account[];
  transactions: Transaction[];
  
  // Account Actions
  addAccount: (account: Omit<Account, 'id' | 'balance'>) => void;
  updateAccount: (id: string, data: Partial<Omit<Account, 'id' | 'balance'>>) => void;
  deleteAccount: (id: string) => void;

  // Transaction Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'voucherNo' | 'date'>) => void;
  deleteTransaction: (id: string) => void;
}

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc-partner-1', name: 'Partner 1 (You)', type: 'partner', balance: 0 },
  { id: 'acc-partner-2', name: 'Partner 2 (Friend)', type: 'partner', balance: 0 },
  { id: 'acc-cash', name: 'Cash in Hand', type: 'cash', balance: 0 },
  { id: 'acc-bkash', name: 'bKash Merchant', type: 'mfs', balance: 0 },
  { id: 'acc-bank', name: 'City Bank', type: 'bank', balance: 0 },
];

export const useAccountingStore = create<AccountingState>()(
  persist(
    (set) => ({
      accounts: DEFAULT_ACCOUNTS,
      transactions: [],

      addAccount: (data) => set((state) => ({
        accounts: [...state.accounts, { ...data, id: `acc-${Date.now()}`, balance: 0 }],
      })),

      updateAccount: (id, data) => set((state) => ({
        accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
      })),

      deleteAccount: (id) => set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== id),
      })),

      addTransaction: (data) => set((state) => {
        const newTransaction: Transaction = {
          ...data,
          id: `TRX-${Date.now()}`,
          voucherNo: `VCH-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          date: new Date().toISOString(),
        };

        // Update Account Balances
        let updatedAccounts = [...state.accounts];
        
        if (data.type === 'income' && data.accountId) {
          const totalAmount = data.amount - (data.feeAmount || 0);
          updatedAccounts = updatedAccounts.map(a => 
            a.id === data.accountId ? { ...a, balance: a.balance + totalAmount } : a
          );
        } else if (data.type === 'expense' && data.accountId) {
          const totalDeduction = data.amount + (data.feeAmount || 0);
          updatedAccounts = updatedAccounts.map(a => 
            a.id === data.accountId ? { ...a, balance: a.balance - totalDeduction } : a
          );
        } else if (data.type === 'transfer' && data.fromAccountId && data.toAccountId) {
          updatedAccounts = updatedAccounts.map(a => {
            if (a.id === data.fromAccountId) return { ...a, balance: a.balance - data.amount };
            if (a.id === data.toAccountId) return { ...a, balance: a.balance + data.amount };
            return a;
          });
        }

        return {
          transactions: [newTransaction, ...state.transactions],
          accounts: updatedAccounts,
        };
      }),

      deleteTransaction: (id) => set((state) => {
        const trx = state.transactions.find((t) => t.id === id);
        if (!trx) return state;

        // Revert Account Balances
        let updatedAccounts = [...state.accounts];
        
        if (trx.type === 'income' && trx.accountId) {
          const totalAmount = trx.amount - (trx.feeAmount || 0);
          updatedAccounts = updatedAccounts.map(a => 
            a.id === trx.accountId ? { ...a, balance: a.balance - totalAmount } : a
          );
        } else if (trx.type === 'expense' && trx.accountId) {
          const totalDeduction = trx.amount + (trx.feeAmount || 0);
          updatedAccounts = updatedAccounts.map(a => 
            a.id === trx.accountId ? { ...a, balance: a.balance + totalDeduction } : a
          );
        } else if (trx.type === 'transfer' && trx.fromAccountId && trx.toAccountId) {
          updatedAccounts = updatedAccounts.map(a => {
            if (a.id === trx.fromAccountId) return { ...a, balance: a.balance + trx.amount };
            if (a.id === trx.toAccountId) return { ...a, balance: a.balance - trx.amount };
            return a;
          });
        }

        return {
          transactions: state.transactions.filter((t) => t.id !== id),
          accounts: updatedAccounts,
        };
      }),
    }),
    {
      name: 'accounting-storage-v2', // Change name to prevent conflicts with previous simpler state
    }
  )
);
