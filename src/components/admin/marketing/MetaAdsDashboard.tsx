"use client";

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, MousePointerClick, Eye, Target, Calendar, AlertCircle } from 'lucide-react';

// Mock Data for Charts
const performanceData = [
  { date: 'Sep 01', spend: 120, conversions: 24, roas: 3.2 },
  { date: 'Sep 02', spend: 150, conversions: 35, roas: 3.5 },
  { date: 'Sep 03', spend: 180, conversions: 42, roas: 3.8 },
  { date: 'Sep 04', spend: 140, conversions: 28, roas: 3.1 },
  { date: 'Sep 05', spend: 200, conversions: 50, roas: 4.0 },
  { date: 'Sep 06', spend: 250, conversions: 65, roas: 4.2 },
  { date: 'Sep 07', spend: 220, conversions: 58, roas: 4.1 },
];

// Mock Data for Campaigns Table
const campaigns = [
  { id: '1', name: 'Eid Special 2026 - Conversion', status: 'ACTIVE', budget: '৳1000/day', spend: 15400, roas: 4.2, cpc: 4.5, purchases: 124 },
  { id: '2', name: 'Retargeting - All Website Visitors', status: 'ACTIVE', budget: '৳300/day', spend: 4200, roas: 6.8, cpc: 2.1, purchases: 85 },
  { id: '3', name: 'New Arrivals - Catalog Sales', status: 'PAUSED', budget: '৳500/day', spend: 8500, roas: 2.4, cpc: 6.2, purchases: 32 },
  { id: '4', name: 'Brand Awareness - Video Views', status: 'ACTIVE', budget: '৳200/day', spend: 1200, roas: 1.1, cpc: 1.5, purchases: 5 },
];

export default function MetaAdsDashboard() {
  const [dateRange, setDateRange] = useState('Last 7 Days');

  return (
    <div className="space-y-6">
      {/* Header section with alert */}
      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
        <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-2 rounded-full mt-0.5">
          <AlertCircle size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-1">Demo Mode Activated</h3>
          <p className="text-blue-600 dark:text-blue-400/80 text-sm">
            You are currently viewing mock data. To view real-time Meta Ads performance, please connect your Facebook Business account with the required Marketing API tokens in the settings.
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-blue-500/20">
          Connect Meta
        </button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="bg-[#1877F2] text-white p-1.5 rounded-lg shadow-sm">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </span>
            Ads Performance
          </h2>
          <p className="text-sm text-slate-500 mt-1">Monitor your Facebook and Instagram ad campaigns.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 text-sm text-slate-600 dark:text-slate-300">
            <Calendar size={16} />
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 dark:bg-primary-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Ad Spend</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">৳29,300</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm relative z-10">
            <span className="flex items-center gap-1 text-green-500 font-medium bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-md">
              <TrendingUp size={14} /> 12.5%
            </span>
            <span className="text-slate-400">vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 dark:bg-green-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Overall ROAS</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">3.8x</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500">
              <Target size={20} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm relative z-10">
            <span className="flex items-center gap-1 text-green-500 font-medium bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-md">
              <TrendingUp size={14} /> 0.4
            </span>
            <span className="text-slate-400">vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Purchases</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">246</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
              <MousePointerClick size={20} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm relative z-10">
            <span className="flex items-center gap-1 text-green-500 font-medium bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-md">
              <TrendingUp size={14} /> 18.2%
            </span>
            <span className="text-slate-400">vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 dark:bg-purple-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Impressions</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">124K</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Eye size={20} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm relative z-10">
            <span className="flex items-center gap-1 text-red-500 font-medium bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-md">
              <TrendingDown size={14} /> 2.1%
            </span>
            <span className="text-slate-400">vs last period</span>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Spend vs Conversions Trend</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(value) => `৳${value}`} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area yAxisId="left" type="monotone" dataKey="spend" name="Ad Spend" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
              <Area yAxisId="right" type="monotone" dataKey="conversions" name="Purchases" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorConversions)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaigns Table Section */}
      <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Active Campaigns</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <th className="pb-4 font-medium">Campaign Name</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Budget</th>
                <th className="pb-4 font-medium">Amount Spent</th>
                <th className="pb-4 font-medium">Purchases</th>
                <th className="pb-4 font-medium">Cost per Result</th>
                <th className="pb-4 font-medium text-right">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors group">
                  <td className="py-4">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{campaign.name}</p>
                    <p className="text-xs text-slate-500">ID: {campaign.id}8374920194</p>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'ACTIVE' 
                        ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${campaign.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{campaign.budget}</td>
                  <td className="py-4 text-sm font-medium text-slate-900 dark:text-white">৳{campaign.spend.toLocaleString()}</td>
                  <td className="py-4 text-sm font-medium text-slate-900 dark:text-white">{campaign.purchases}</td>
                  <td className="py-4 text-sm text-slate-600 dark:text-slate-400">৳{campaign.cpc.toFixed(2)}</td>
                  <td className="py-4 text-right">
                    <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${
                      campaign.roas > 3 
                        ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                        : campaign.roas > 1.5
                        ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400'
                        : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                    }`}>
                      {campaign.roas}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
