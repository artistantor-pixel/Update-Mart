"use client";

import { useState, useMemo } from 'react';
import { useAccountingStore, TransactionType, AccountType } from '@/store/accountingStore';
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2, X, Wallet, ArrowRightLeft, CreditCard, Banknote, History, BarChart3, Receipt } from 'lucide-react';

const CATEGORIES = {
  income: ['Sales', 'Wholesale', 'Services', 'Investments', 'Refunds', 'Other Income'],
  expense: ['Cost of Goods Sold (COGS)', 'Salaries', 'Marketing', 'Logistics & Courier', 'Utilities', 'Office Rent', 'Maintenance', 'Other Expense'],
};

export default function AccountingManager() {
  const { accounts, transactions, addTransaction, deleteTransaction, addAccount, deleteAccount } = useAccountingStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'transactions'>('dashboard');
  
  // Modals State
  const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);

  // Add Transaction State
  const [trxType, setTrxType] = useState<TransactionType>('income');
  const [trxCategory, setTrxCategory] = useState(CATEGORIES.income[0]);
  const [trxAmount, setTrxAmount] = useState('');
  const [trxRef, setTrxRef] = useState('');
  const [trxAccountId, setTrxAccountId] = useState(accounts[0]?.id || '');
  const [trxFromId, setTrxFromId] = useState(accounts[0]?.id || '');
  const [trxToId, setTrxToId] = useState(accounts[1]?.id || '');

  // Add Account State
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<AccountType>('bank');
  const [accInitialBalance, setAccInitialBalance] = useState('');

  const handleOpenTrxModal = (type: TransactionType = 'income') => {
    setTrxType(type);
    if (type !== 'transfer') setTrxCategory(CATEGORIES[type][0]);
    setTrxAmount('');
    setTrxRef('');
    setIsTrxModalOpen(true);
  };

  const handleTrxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxAmount || isNaN(Number(trxAmount)) || Number(trxAmount) <= 0) return;

    if (trxType === 'transfer' && trxFromId === trxToId) {
      alert("Source and Destination accounts must be different.");
      return;
    }

    addTransaction({
      type: trxType,
      amount: Number(trxAmount),
      reference: trxRef.trim(),
      category: trxType !== 'transfer' ? trxCategory : undefined,
      accountId: trxType !== 'transfer' ? trxAccountId : undefined,
      fromAccountId: trxType === 'transfer' ? trxFromId : undefined,
      toAccountId: trxType === 'transfer' ? trxToId : undefined,
    });
    setIsTrxModalOpen(false);
  };

  const handleAccSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;
    addAccount({ name: accName.trim(), type: accType });
    
    // Initial balance could be implemented as a deposit transaction, but we keep it simple for now.
    if (Number(accInitialBalance) > 0) {
       // Optional: Auto-create an income transaction for opening balance
    }
    
    setAccName('');
    setAccInitialBalance('');
    setIsAccModalOpen(false);
  };

  // Calculations
  const netWorth = useMemo(() => accounts.reduce((acc, curr) => acc + curr.balance, 0), [accounts]);
  
  const currentMonthTotals = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (t.type === 'income') income += t.amount;
        if (t.type === 'expense') expense += t.amount;
      }
    });
    return { income, expense };
  }, [transactions]);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-dark-900 rounded-2xl min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="text-primary-500" /> Business Accounting
          </h2>
          <p className="text-slate-500 mt-1">Manage ledgers, cash flows, and overall net worth.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleOpenTrxModal('income')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20"
          >
            <TrendingUp size={16} /> Income
          </button>
          <button 
            onClick={() => handleOpenTrxModal('expense')}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20"
          >
            <TrendingDown size={16} /> Expense
          </button>
          <button 
            onClick={() => handleOpenTrxModal('transfer')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/20"
          >
            <ArrowRightLeft size={16} /> Transfer
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-white/10 pb-2">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <BarChart3 size={18} /> Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'accounts' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <Banknote size={18} /> Ledgers / Accounts
        </button>
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'transactions' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <History size={18} /> Journal (Transactions)
        </button>
      </div>

      {/* ----------------- TAB: DASHBOARD ----------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Net Worth */}
            <div className="bg-slate-900 dark:bg-dark-800 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent"></div>
              <div className="relative z-10">
                <p className="text-slate-400 text-sm font-medium mb-1">Total Net Worth</p>
                <h3 className="text-3xl font-black text-white">৳{netWorth.toLocaleString()}</h3>
                <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-sm text-slate-300">
                  <span>Across {accounts.length} accounts</span>
                </div>
              </div>
              <DollarSign className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 transform group-hover:scale-110 transition-transform" />
            </div>

            {/* Current Month Income */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">This Month's Income</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">৳{currentMonthTotals.income.toLocaleString()}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 text-green-500 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>

            {/* Current Month Expense */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">This Month's Expenses</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">৳{currentMonthTotals.expense.toLocaleString()}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center">
                  <TrendingDown size={20} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Transactions</h3>
            <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-white/5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Category/Account</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {transactions.slice(0, 5).map(t => (
                    <tr key={t.id}>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(t.date)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${t.type === 'income' ? 'bg-green-50 text-green-700 dark:bg-green-500/10' : t.type === 'expense' ? 'bg-red-50 text-red-700 dark:bg-red-500/10' : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t.type === 'transfer' ? 'Transfer' : t.category}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold text-sm ${t.type === 'income' ? 'text-green-600' : t.type === 'expense' ? 'text-red-500' : 'text-blue-500'}`}>
                        {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}৳{t.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">No transactions recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {transactions.length > 5 && (
                <div className="bg-slate-50 dark:bg-dark-900/50 py-3 text-center border-t border-slate-200 dark:border-white/5">
                  <button onClick={() => setActiveTab('transactions')} className="text-sm font-medium text-primary-500 hover:underline">View All Transactions</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: ACCOUNTS ----------------- */}
      {activeTab === 'accounts' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Chart of Accounts</h3>
            <button 
              onClick={() => setIsAccModalOpen(true)}
              className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> New Account
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map(acc => (
              <div key={acc.id} className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm relative group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${acc.type === 'cash' ? 'bg-green-50 text-green-600' : acc.type === 'bank' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'} dark:bg-opacity-10`}>
                    {acc.type === 'cash' ? <Banknote size={24} /> : acc.type === 'bank' ? <CreditCard size={24} /> : <Wallet size={24} />}
                  </div>
                  <button 
                    onClick={() => {
                      if(window.confirm(`Delete account ${acc.name}?`)) deleteAccount(acc.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">{acc.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize mb-4">{acc.type} Account</p>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">Current Balance</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">৳{acc.balance.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- TAB: TRANSACTIONS (JOURNAL) ----------------- */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <th className="pb-4 font-medium px-4">Date / Voucher</th>
                  <th className="pb-4 font-medium px-4">Details</th>
                  <th className="pb-4 font-medium px-4 text-right">Amount</th>
                  <th className="pb-4 font-medium px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">No transactions found.</td>
                  </tr>
                ) : (
                  transactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors group">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600 dark:text-slate-400">{formatDate(t.date)}</div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">{t.voucherNo}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${t.type === 'income' ? 'bg-green-50 text-green-700 dark:bg-green-500/10' : t.type === 'expense' ? 'bg-red-50 text-red-700 dark:bg-red-500/10' : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10'}`}>
                            {t.type}
                          </span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {t.type === 'transfer' ? 'Internal Transfer' : t.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1">
                          {t.type === 'transfer' ? (
                            <>From: <span className="font-medium text-slate-700 dark:text-slate-300">{accounts.find(a=>a.id===t.fromAccountId)?.name}</span> To: <span className="font-medium text-slate-700 dark:text-slate-300">{accounts.find(a=>a.id===t.toAccountId)?.name}</span></>
                          ) : (
                            <>Account: <span className="font-medium text-slate-700 dark:text-slate-300">{accounts.find(a=>a.id===t.accountId)?.name}</span></>
                          )}
                          {t.reference && <span className="mx-1">•</span>}
                          {t.reference && <span>Ref: {t.reference}</span>}
                        </div>
                      </td>
                      <td className={`py-4 px-4 text-right font-bold whitespace-nowrap ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : t.type === 'expense' ? 'text-red-500' : 'text-blue-500'}`}>
                        {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}৳{t.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this transaction? Account balances will be reverted.")) {
                              deleteTransaction(t.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: ADD TRANSACTION ----------------- */}
      {isTrxModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsTrxModalOpen(false)} />
          
          <div className="bg-white dark:bg-dark-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">New {trxType}</h3>
              <button onClick={() => setIsTrxModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleTrxSubmit} className="p-6 space-y-5">
              
              {/* Type Selector Tabs inside Modal (Optional convenience) */}
              <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-dark-800 p-1 rounded-xl">
                {(['income', 'expense', 'transfer'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setTrxType(type);
                      if (type !== 'transfer') setTrxCategory(CATEGORIES[type][0]);
                    }}
                    className={`py-2 text-sm font-semibold rounded-lg capitalize transition-colors ${trxType === type ? 'bg-white dark:bg-dark-900 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Amount (৳) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-bold">৳</div>
                  <input 
                    type="number" 
                    value={trxAmount}
                    onChange={(e) => setTrxAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    min="1"
                    className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white font-bold text-lg"
                  />
                </div>
              </div>

              {/* Conditional Fields based on Type */}
              {trxType === 'transfer' ? (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">From Account *</label>
                    <select 
                      value={trxFromId} 
                      onChange={(e) => setTrxFromId(e.target.value)}
                      className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (৳{acc.balance})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">To Account *</label>
                    <select 
                      value={trxToId} 
                      onChange={(e) => setTrxToId(e.target.value)}
                      className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Category *</label>
                    <select 
                      value={trxCategory} 
                      onChange={(e) => setTrxCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    >
                      {CATEGORIES[trxType].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Account *</label>
                    <select 
                      value={trxAccountId} 
                      onChange={(e) => setTrxAccountId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    >
                      {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Reference */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex justify-between">
                  <span>Reference / Note</span>
                  <span className="text-slate-400 font-normal">Optional</span>
                </label>
                <input 
                  type="text"
                  value={trxRef}
                  onChange={(e) => setTrxRef(e.target.value)}
                  placeholder="e.g. Order #1234 or Salary for John"
                  className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800">
                <button type="submit" className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2">
                  <Receipt size={20} /> Record Transaction
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: ADD ACCOUNT ----------------- */}
      {isAccModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAccModalOpen(false)} />
          
          <div className="bg-white dark:bg-dark-900 rounded-3xl shadow-2xl w-full max-w-sm relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Account</h3>
              <button onClick={() => setIsAccModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAccSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Account Name</label>
                <input 
                  type="text" 
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="e.g. Dutch Bangla Bank"
                  required
                  className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Account Type</label>
                <select 
                  value={accType} 
                  onChange={(e) => setAccType(e.target.value as AccountType)}
                  className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                >
                  <option value="bank">Bank Account</option>
                  <option value="mfs">Mobile Financial Service (MFS)</option>
                  <option value="cash">Cash / Drawer</option>
                </select>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold shadow-xl transition-all">
                  Create Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
