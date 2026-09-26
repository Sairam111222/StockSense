'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Boxes,
  ArrowRight,
  User,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Copy,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '@/lib/auth/context';
import { useToast } from '@/components/ui/toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Email address is required.');
      return;
    }
    if (!password) {
      setErrorMsg('Password is required.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      success('Welcome to StockSense', 'Authentication verified successfully.');
      router.push('/dashboard');
    } else {
      setErrorMsg(res.error || 'Authentication failed.');
      toastError('Login Error', res.error);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
  };

  const handleQuickLogin = async (demoEmail: string, demoPassword: string) => {
    setErrorMsg('');
    setLoading(true);
    const res = await login(demoEmail, demoPassword);
    setLoading(false);
    if (res.success) {
      const account = DEMO_ACCOUNTS.find(a => a.email === demoEmail);
      success(`Welcome, ${account?.name || 'User'}`, `Logged in as ${account?.role.toUpperCase()}.`);
      router.push('/dashboard');
    } else {
      setErrorMsg(res.error || 'Login failed.');
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const roleColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    manager: {
      bg: 'bg-rose-600/15',
      border: 'border-rose-500/30',
      text: 'text-rose-300',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    staff: {
      bg: 'bg-sky-600/15',
      border: 'border-sky-500/30',
      text: 'text-sky-300',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    },
    admin: {
      bg: 'bg-amber-600/15',
      border: 'border-amber-500/30',
      text: 'text-amber-300',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B0A_1px,transparent_1px),linear-gradient(to_bottom,#1E293B0A_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-5 relative z-10">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-xl shadow-rose-900/40 border border-rose-400/40 mb-2">
            <Boxes className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-wider uppercase">StockSense</h1>
          <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
            Smart Inventory Management System
          </p>
        </div>

        {/* Main Card */}
        <div className="command-card p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Sign in to Terminal</h2>
            <p className="text-xs text-slate-400 mt-1">Authenticate with your operator credentials to access warehouse operations</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── Demo Credentials Panel ── */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-700/60 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-700/50 bg-slate-800/30">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[10px] font-mono uppercase text-rose-400 font-bold tracking-wider">
                Demo Accounts — Click to auto-fill
              </span>
            </div>
            <div className="p-3 space-y-2">
              {DEMO_ACCOUNTS.map((account) => {
                const colors = roleColors[account.role];
                return (
                  <div
                    key={account.email}
                    className={`group rounded-lg ${colors.bg} border ${colors.border} p-3 cursor-pointer hover:brightness-125 transition-all`}
                    onClick={() => handleQuickFill(account.email, account.password)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <User className={`w-3.5 h-3.5 ${colors.text}`} />
                        <span className="text-xs font-bold text-white">{account.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-mono font-bold uppercase ${colors.badge}`}>
                          {account.role}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickLogin(account.email, account.password);
                        }}
                        className={`text-[10px] font-semibold ${colors.text} hover:text-white transition-colors flex items-center gap-0.5`}
                      >
                        <span>Quick Login</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-300 font-mono truncate">{account.email}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(account.email, `email-${account.role}`);
                          }}
                          className="ml-auto shrink-0 text-slate-500 hover:text-white transition-colors"
                          title="Copy email"
                        >
                          {copiedField === `email-${account.role}` ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-300 font-mono">{account.password}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(account.password, `pass-${account.role}`);
                          }}
                          className="ml-auto shrink-0 text-slate-500 hover:text-white transition-colors"
                          title="Copy password"
                        >
                          {copiedField === `pass-${account.role}` ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5">{account.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Login Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500/60 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-[11px] text-rose-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-lg shadow-rose-900/40 mt-2 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
            Need a new operator account?{' '}
            <Link href="/signup" className="text-rose-400 font-semibold hover:underline">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
