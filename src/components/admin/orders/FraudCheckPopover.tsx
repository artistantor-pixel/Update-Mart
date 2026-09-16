"use client";

import { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';

interface FraudCheckProps {
  phone: string;
}

interface HistoryData {
  totalOrders: number;
  delivered: number;
  returned: number;
  successRate: number;
  totalSpent: number;
  lastOrderDate?: string;
}

export default function FraudCheckPopover({ phone }: FraudCheckProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<HistoryData | null>(null);

  const checkHistory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    if (!data && !isLoading) {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/customers/history?phone=${phone}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch customer history");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getShieldIcon = () => {
    if (!data) return <Shield size={12} />;
    if (data.totalOrders === 0) return <Shield size={12} className="text-slate-400" />;
    if (data.successRate >= 80) return <ShieldCheck size={12} className="text-green-500" />;
    if (data.successRate < 50) return <ShieldAlert size={12} className="text-red-500" />;
    return <Shield size={12} className="text-amber-500" />;
  };

  const getStatusColor = () => {
    if (!data) return 'bg-slate-100 text-slate-600 dark:bg-dark-700 dark:text-slate-400';
    if (data.totalOrders === 0) return 'bg-slate-100 text-slate-600 dark:bg-dark-700 dark:text-slate-400';
    if (data.successRate >= 80) return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20';
    if (data.successRate < 50) return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
  };

  return (
    <div className="relative inline-flex items-center">
      <button 
        onClick={checkHistory}
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${getStatusColor()}`}
        title="Check Customer History (Fraud Check)"
      >
        {getShieldIcon()}
        {data ? (data.totalOrders > 0 ? `${data.successRate}% Success` : 'New') : 'Check'}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 p-3 text-left">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2 mb-2">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <Shield size={14} className="text-primary-500"/> Order History
            </h4>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs">✕</button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-4 text-primary-500">
              <Loader2 size={16} className="animate-spin" />
            </div>
          ) : data ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Orders:</span>
                <span className="font-bold text-slate-900 dark:text-white">{data.totalOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Delivered:</span>
                <span className="font-medium text-green-600 dark:text-green-400">{data.delivered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Returned/Rejected:</span>
                <span className="font-medium text-red-600 dark:text-red-400">{data.returned}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Success Rate:</span>
                <span className={`font-bold ${data.successRate >= 80 ? 'text-green-600 dark:text-green-400' : data.successRate < 50 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {data.totalOrders > 0 ? `${data.successRate}%` : 'N/A'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-center text-slate-500 py-2">Failed to load</div>
          )}
        </div>
      )}
    </div>
  );
}
