"use client";

import { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { Lock, Mail, Loader2, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Invalid email or password');
      setIsLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-dark-800 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
        
        <div className="p-8 pb-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-dark-900/30 text-center">
          <Image src="/logo.svg" alt="Update Mart" width={180} height={50} className="w-auto h-10 mx-auto mb-6 transition-all dark:hidden" />
          <Image src="/logo-dark.svg" alt="Update Mart" width={180} height={50} className="w-auto h-10 mx-auto mb-6 transition-all hidden dark:block" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Access Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in manually with your credentials</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-2">
            <Lock size={32} />
          </div>
          
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-3.5 rounded-xl transition-all shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-dark-900/50 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 text-center">
          <p>Only authorized personnel can access the admin dashboard.</p>
        </div>
      </div>
    </div>
  );
}
