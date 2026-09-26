'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Boxes, ArrowLeft, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useToast, ToastProvider } from '@/components/ui/toast';

function ForgotPasswordContent() {
  const { resetPassword } = useAuth();
  const { success } = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    await resetPassword(email);
    setLoading(false);
    setSubmitted(true);
    success('Reset Link Generated', `Recovery instructions sent to ${email}`);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-xl shadow-rose-900/40 border border-rose-400/40 mb-2">
            <Boxes className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-wider uppercase">StockSense</h1>
          <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
            Credential Recovery
          </p>
        </div>

        <div className="command-card p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Reset Password</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your work email address to receive secure OTP recovery instructions
            </p>
          </div>

          {submitted ? (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Password Recovery Dispatched</span>
              </div>
              <p className="leading-relaxed">
                We have generated a secure password reset token for <strong className="text-white">{email}</strong>. Check your inbox or Supabase authentication mailer.
              </p>
              <Link
                href="/login"
                className="inline-block mt-3 text-xs font-semibold text-rose-400 hover:underline"
              >
                &larr; Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="alex.manager@stocksense.io"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500/60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white transition-all shadow-lg shadow-rose-900/40 mt-2 flex items-center justify-center gap-1.5"
              >
                <span>{loading ? 'Transmitting OTP...' : 'Send Recovery Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
            Remember your credentials?{' '}
            <Link href="/login" className="text-rose-400 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <ToastProvider>
      <ForgotPasswordContent />
    </ToastProvider>
  );
}
