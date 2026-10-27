"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Bell, CheckCircle2, AlertCircle, Send, Loader2, Info, ShieldCheck } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';

export default function OrderEmailSettings() {
  const { 
    isOrderEmailEnabled, 
    adminNotificationEmail, 
    setOrderEmailSettings
  } = useSettingsStore();

  const [enabled, setEnabled] = useState<boolean>(() => isOrderEmailEnabled ?? false);
  const [email, setEmail] = useState<string>(() => adminNotificationEmail ?? '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showConfigGuide, setShowConfigGuide] = useState<boolean>(false);

  // Sync with store when external settings change
  useEffect(() => {
    if (isOrderEmailEnabled !== undefined) setEnabled(isOrderEmailEnabled);
    if (adminNotificationEmail !== undefined) setEmail(adminNotificationEmail);
  }, [isOrderEmailEnabled, adminNotificationEmail]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setTestResult(null);

    try {
      await setOrderEmailSettings({
        isOrderEmailEnabled: enabled,
        adminNotificationEmail: email.trim()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error('Failed to save email settings:', err);
      alert('Failed to save settings: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address before sending a test notification.');
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/email/order-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: email.trim(),
          isTest: true
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || `Test email sent successfully to ${email}!`
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to send test email. Check server email credentials.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error while attempting to send test email.'
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <section className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between flex-wrap gap-4 bg-slate-50/50 dark:bg-dark-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Mail size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Order Email Notification System
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Receive instant email alerts whenever a customer places an order on your store.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowConfigGuide(!showConfigGuide)}
          className="text-xs text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1.5 transition-colors font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-500"
        >
          <Info size={14} />
          {showConfigGuide ? 'Hide Setup Guide' : 'Email Setup Guide (.env)'}
        </button>
      </div>

      {/* SMTP/Resend Configuration Helper (Collapsible) */}
      {showConfigGuide && (
        <div className="p-6 bg-slate-900 text-slate-200 border-b border-slate-800 text-sm">
          <div className="flex items-center gap-2 text-primary-400 font-semibold mb-2">
            <ShieldCheck size={18} />
            How to configure email delivery in your environment:
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Add either <strong>Gmail / Custom SMTP</strong> or <strong>Resend</strong> in your <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">.env.local</code>:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-emerald-400 font-sans font-semibold mb-1">Option A: Gmail SMTP (Free)</div>
              <div className="text-slate-400 select-all">
                SMTP_HOST=smtp.gmail.com<br/>
                SMTP_PORT=465<br/>
                SMTP_USER=your_email@gmail.com<br/>
                SMTP_PASS=your_16_digit_app_password<br/>
                SMTP_FROM=&quot;Update Mart&quot; &lt;your_email@gmail.com&gt;
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-sky-400 font-sans font-semibold mb-1">Option B: Resend API</div>
              <div className="text-slate-400 select-all">
                RESEND_API_KEY=re_123456789...<br/>
                RESEND_FROM=orders@yourbrand.com
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="p-6 space-y-6">
        
        {/* Toggle Notification Switch */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-900/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="space-y-0.5 pr-4">
            <label htmlFor="email-toggle" className="font-semibold text-slate-900 dark:text-white cursor-pointer flex items-center gap-2">
              <Bell size={16} className={enabled ? 'text-emerald-500' : 'text-slate-400'} />
              Enable Order Email Notifications
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              When turned on, the system automatically dispatches a formatted order receipt to your admin inbox immediately upon checkout.
            </p>
          </div>

          <button
            id="email-toggle"
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`w-14 h-7 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary-500 flex-shrink-0 ${
              enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform shadow-sm ${
                enabled ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Email Address Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Admin Notification Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. orders@updatemart.com or your_name@gmail.com"
              className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
              required={enabled}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            All order summary alerts (Customer info, items, totals, payment method) will be delivered to this address.
          </p>
        </div>

        {/* Feedback Messages */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium">{testResult.message}</p>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={16} />
            Settings saved successfully to database!
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between flex-wrap gap-3 border-t border-slate-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={isSendingTest || isSaving || !email}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingTest ? (
              <>
                <Loader2 size={16} className="animate-spin text-primary-500" />
                Sending Test Email...
              </>
            ) : (
              <>
                <Send size={15} />
                Send Test Email
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving Changes...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>

      </form>
    </section>
  );
}
