'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Database, Send, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface EmailTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailTestModal: React.FC<EmailTestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [statusData, setStatusData] = useState<any>(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/test-email')
        .then((res) => res.json())
        .then((data) => setStatusData(data))
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendTestEmail = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: testEmailAddress || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to send test email.',
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const isGmailConfigured = statusData?.services?.gmail?.configured;
  const isSupabaseConfigured = statusData?.services?.supabase?.configured;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl text-stone-100 p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-stone-800">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-white">Integration Diagnostics</h3>
            <p className="text-xs text-stone-400">
              Supabase table <code className="text-amber-400">orders</code> & Gmail SMTP notification status
            </p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
          
          {/* Supabase status */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-stone-300 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Supabase</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isSupabaseConfigured
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isSupabaseConfigured ? 'Connected' : 'Demo Fallback'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Target Table: <strong className="text-stone-200">orders</strong>. Orders are saved with status <strong className="text-amber-400">Pending</strong>.
            </p>
          </div>

          {/* Gmail status */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-stone-300 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Gmail SMTP</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isGmailConfigured
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isGmailConfigured ? 'Active' : 'Demo Fallback'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              {isGmailConfigured
                ? `Ready to send notifications from ${statusData?.services?.gmail?.sender}`
                : 'Formatted email previews are logged and displayed in demo mode.'}
            </p>
          </div>

        </div>

        {/* Test Email Section */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 mb-6">
          <div className="font-bold text-xs text-stone-300 uppercase tracking-wider">
            Test Gmail SMTP Connection
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="Recipient email (optional, defaults to GMAIL_USER)"
              className="flex-1 px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSendTestEmail}
              disabled={testing}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Send Test</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/80 border border-red-500/40 text-red-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-[11px] text-stone-400 bg-stone-900 p-3.5 rounded-xl border border-stone-800">
          <strong className="text-stone-300">Quick Configuration Guide:</strong>
          <p className="mt-1">
            To connect your live Gmail and Supabase, update the variables in <code className="text-amber-400">restaurant-website/.env.local</code> and run the <code className="text-amber-400">supabase_schema.sql</code> script in your Supabase SQL editor.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
