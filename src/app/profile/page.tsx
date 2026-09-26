'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { User, Shield, Mail, Calendar, Key, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const { user, role, switchRole } = useAuth();
  const { success } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || 'Alex Vance');
  const [email] = useState(user?.email || 'alex.manager@stocksense.io');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    success('Profile Updated', 'User details updated successfully.');
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <div className="pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-rose-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              Operator Profile
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your credentials, role privileges, and system authorization badge
          </p>
        </div>

        <div className="command-card p-6 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white text-2xl font-bold border border-rose-400/40 shadow-xl shadow-rose-900/40">
              {user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                fullName.charAt(0)
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">{fullName}</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-rose-300 border border-slate-700 uppercase font-bold">
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{email}</p>
              <p className="text-[10px] font-mono text-slate-500 mt-1">
                Authorized Operator ID: <span className="text-slate-300">{user?.id || 'AUTH-001'}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-rose-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Email</label>
              <input
                type="email"
                readOnly
                value={email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-400 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">System Role & Security Level</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => switchRole('manager')}
                  className={`flex-1 p-3 rounded-xl border text-left text-xs transition-all ${
                    role === 'manager'
                      ? 'border-rose-500 bg-rose-500/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-rose-400" /> Inventory Manager
                  </p>
                  <p className="text-[10px] font-normal text-slate-400 mt-1">Full control, adjustments, ledger & catalog editing.</p>
                </button>

                <button
                  type="button"
                  onClick={() => switchRole('staff')}
                  className={`flex-1 p-3 rounded-xl border text-left text-xs transition-all ${
                    role === 'staff'
                      ? 'border-rose-500 bg-rose-500/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="font-bold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-400" /> Warehouse Staff
                  </p>
                  <p className="text-[10px] font-normal text-slate-400 mt-1">Operational intake, dispatch & counting access.</p>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-900/30"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
