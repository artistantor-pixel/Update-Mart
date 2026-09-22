"use client";

import { useState, useMemo } from 'react';
import { useAccountingStore, TransactionType, AccountType } from '@/store/accountingStore';
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2, X, Wallet, ArrowRightLeft, CreditCard, Banknote, History, BarChart3, Receipt, Download, Users } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CATEGORIES = {
  income: ['Sales Revenue', 'Partner Capital', 'Wholesale', 'Services', 'Refunds', 'Other Income'],
  expense: ['Cost of Goods Sold (COGS)', 'Marketing & Ads', 'Salaries', 'Logistics & Courier', 'Utilities', 'Office Rent', 'Maintenance', 'Other Expense'],
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
  const [trxFeeAmount, setTrxFeeAmount] = useState('');
  const [trxRef, setTrxRef] = useState('');
  const [trxPartnerName, setTrxPartnerName] = useState('');
  const [trxAccountId, setTrxAccountId] = useState(accounts[0]?.id || '');
  const [trxFromId, setTrxFromId] = useState(accounts[0]?.id || '');
  const [trxToId, setTrxToId] = useState(accounts.length > 1 ? accounts[1]?.id : accounts[0]?.id || '');

  const handleOpenTrxModal = (type: TransactionType = 'income') => {
    setTrxType(type);
    if (type !== 'transfer') setTrxCategory(CATEGORIES[type][0]);
    setTrxAmount('');
    setTrxFeeAmount('');
    setTrxRef('');
    setTrxPartnerName('');
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
      feeAmount: Number(trxFeeAmount) || 0,
      reference: trxRef.trim(),
      partnerName: trxCategory === 'Partner Capital' ? trxPartnerName.trim() : undefined,
      category: trxType !== 'transfer' ? trxCategory : undefined,
      accountId: trxType !== 'transfer' ? trxAccountId : undefined,
      fromAccountId: trxType === 'transfer' ? trxFromId : undefined,
      toAccountId: trxType === 'transfer' ? trxToId : undefined,
    });
    setIsTrxModalOpen(false);
  };

  // Add Account State
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<AccountType>('bank');

  const handleAccSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;
    addAccount({ name: accName.trim(), type: accType });
    setAccName('');
    setIsAccModalOpen(false);
  };

  // Calculations
  const netWorth = useMemo(() => accounts.reduce((acc, curr) => acc + curr.balance, 0), [accounts]);
  
  const plData = useMemo(() => {
    let revenue = 0;
    let capital = 0;
    let cogs = 0;
    let opex = 0;
    let totalFees = 0;

    transactions.forEach(t => {
      const fee = t.feeAmount || 0;
      totalFees += fee;
      
      if (t.type === 'income') {
         if (t.category === 'Partner Capital') capital += t.amount;
         else revenue += t.amount;
      } else if (t.type === 'expense') {
         if (t.category === 'Cost of Goods Sold (COGS)') cogs += (t.amount + fee);
         else opex += (t.amount + fee);
      }
    });
    
    const netProfit = revenue - cogs - opex;
    return { revenue, capital, cogs, opex, totalFees, netProfit };
  }, [transactions]);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  // Download PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Update Mart - Financial Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Financial Summary
    doc.setFontSize(14);
    doc.text('Profit & Loss Summary', 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Amount (BDT)']],
      body: [
        ['Total Revenue (Sales)', `+ ${plData.revenue.toLocaleString()}`],
        ['Cost of Goods Sold (COGS)', `- ${plData.cogs.toLocaleString()}`],
        ['Gross Profit', `= ${(plData.revenue - plData.cogs).toLocaleString()}`],
        ['Operating & Marketing Expenses', `- ${plData.opex.toLocaleString()}`],
        ['Total Gateway/Transaction Fees', `${plData.totalFees.toLocaleString()}`],
        ['Net Profit', `${plData.netProfit > 0 ? '+' : ''} ${plData.netProfit.toLocaleString()}`],
        ['---', '---'],
        ['Partner Capital / Investment', `+ ${plData.capital.toLocaleString()}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Transactions Table
    doc.text('Transaction Ledger (All)', 14, (doc as any).lastAutoTable.finalY + 15);
    
    const tableBody = transactions.map(t => {
      const typeStr = t.type === 'income' ? 'IN' : t.type === 'expense' ? 'OUT' : 'TRANSFER';
      const feeStr = t.feeAmount ? `\n(Fee: ${t.feeAmount})` : '';
      const catStr = t.type === 'transfer' ? 'Transfer' : t.category;
      return [
        formatDate(t.date),
        typeStr,
        `${catStr}${t.partnerName ? ` - ${t.partnerName}` : ''}`,
        t.reference || '-',
        `${t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}${t.amount.toLocaleString()}${feeStr}`
      ];
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'Type', 'Category / Partner', 'Reference', 'Amount (BDT)']],
      body: tableBody,
      theme: 'striped',
    });

    doc.save(`update-mart-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="bg-slate-50 dark:bg-dark-900 rounded-2xl min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 px-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-primary-500" /> Accounting & P&L
          </h2>
          <p className="text-slate-500 mt-1">Track business profit, expenses, and partner capital.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={downloadPDF}
            className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 mr-2"
          >
            <Download size={16} /> PDF Report
          </button>
          <button 
            onClick={() => handleOpenTrxModal('income')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20"
          >
            <TrendingUp size={16} /> Income / Capital
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
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-200 dark:border-white/10 pb-2">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <BarChart3 size={18} /> P&L Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'accounts' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <Wallet size={18} /> Accounts Balance
        </button>
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'transactions' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <History size={18} /> All Ledger (Transactions)
        </button>
      </div>

      {/* ----------------- TAB: DASHBOARD ----------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Revenue (Sales)</p>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">৳{plData.revenue.toLocaleString()}</h3>
            </div>
            
            {/* Total COGS */}
            <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total COGS (Product Cost)</p>
              <h3 className="text-2xl font-bold text-red-500">৳{plData.cogs.toLocaleString()}</h3>
            </div>
            
            {/* Operating Expenses */}
            <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Expenses (Ads, etc)</p>
              <h3 className="text-2xl font-bold text-orange-500">৳{plData.opex.toLocaleString()}</h3>
              <p className="text-xs text-slate-400 mt-1">Includes ৳{plData.totalFees.toLocaleString()} Gateway Fees</p>
            </div>
            
            {/* Partner Capital */}
            <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Partner Capital</p>
              <h3 className="text-2xl font-bold text-blue-500">৳{plData.capital.toLocaleString()}</h3>
            </div>
          </div>
          
          {/* NET PROFIT BIG CARD */}
          <div className={`p-8 rounded-3xl shadow-xl relative overflow-hidden group ${plData.netProfit >= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-700' : 'bg-gradient-to-br from-red-500 to-rose-700'}`}>
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center text-white">
                <div>
                  <p className="text-white/80 font-semibold text-lg mb-1 uppercase tracking-wider">Business Net Profit</p>
                  <h2 className="text-5xl font-black mb-2">৳{plData.netProfit.toLocaleString()}</h2>
                  <p className="text-white/90">Revenue - COGS - Expenses</p>
                </div>
                <div className="mt-6 md:mt-0 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                  <div className="text-sm font-medium text-white/90 mb-1 flex items-center gap-1"><Wallet size={16}/> Available Fund Balance</div>
                  <div className="text-3xl font-bold tracking-tight">৳{netWorth.toLocaleString()}</div>
                </div>
             </div>
             <DollarSign className="absolute -right-10 -bottom-10 text-white/10 w-64 h-64 transform group-hover:scale-110 transition-transform duration-500" />
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
              <div key={acc.id} className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm relative group hover:border-primary-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${acc.type === 'cash' ? 'bg-green-50 text-green-600' : acc.type === 'mfs' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'} dark:bg-opacity-10`}>
                    {acc.type === 'cash' ? <Banknote size={24} /> : acc.type === 'mfs' ? <Users size={24} /> : <CreditCard size={24} />}
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
                  <span className={`text-xl font-black ${acc.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
                    ৳{acc.balance.toLocaleString()}
                  </span>
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
                  <th className="pb-4 font-medium px-4 text-right">Amount & Fee</th>
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
                            {t.partnerName ? ` - ${t.partnerName}` : ''}
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
                        {!!t.feeAmount && (
                          <div className="text-[11px] font-medium text-slate-500 mt-1 leading-none">
                            Fee: ৳{t.feeAmount}
                          </div>
                        )}
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
          
          <div className="bg-white dark:bg-dark-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="sticky top-0 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 z-20">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">New {trxType}</h3>
              <button type="button" onClick={() => setIsTrxModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleTrxSubmit} className="p-6 space-y-5">
              
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
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Category *</label>
                    <select 
                      value={trxCategory} 
                      onChange={(e) => setTrxCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    >
                      {CATEGORIES[trxType].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
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

              {trxCategory === 'Partner Capital' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Partner Name *</label>
                  <input 
                    type="text"
                    required
                    value={trxPartnerName}
                    onChange={(e) => setTrxPartnerName(e.target.value)}
                    placeholder="e.g. Rakib"
                    className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div className={trxType === 'transfer' ? 'col-span-2' : 'col-span-2 sm:col-span-1'}>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {trxType === 'expense' ? 'Main Expense Amount *' : 'Amount *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-bold">৳</div>
                    <input 
                      type="number" 
                      value={trxAmount}
                      onChange={(e) => setTrxAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      min="1"
                      className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>

                {/* Gateway Fee (Only for Income/Expense) */}
                {trxType !== 'transfer' && (
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex justify-between">
                      <span>Gateway / Txn Fee</span>
                      <span className="text-slate-400 font-normal">Optional</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-bold">৳</div>
                      <input 
                        type="number" 
                        value={trxFeeAmount}
                        onChange={(e) => setTrxFeeAmount(e.target.value)}
                        placeholder="e.g. 86.15"
                        min="0"
                        step="0.01"
                        className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

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
                  placeholder="e.g. FB Marketing or Bkash Charge Note"
                  className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800">
                <button type="submit" className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2">
                  <Receipt size={20} /> Record Transaction
                </button>
                {trxType !== 'transfer' && Number(trxFeeAmount) > 0 && (
                  <p className="text-xs text-center text-slate-500 mt-3">
                    {trxType === 'expense' 
                      ? `Total ৳${(Number(trxAmount) + Number(trxFeeAmount)).toLocaleString()} will be deducted from account.` 
                      : `Net ৳${(Number(trxAmount) - Number(trxFeeAmount)).toLocaleString()} will be deposited to account.`}
                  </p>
                )}
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
