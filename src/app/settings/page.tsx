'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import {
  Settings,
  Database,
  RotateCcw,
  Shield,
  CheckCircle2,
  Server,
  Bell,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { inventoryService } from '@/lib/inventory/service';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth/context';

export default function SettingsPage() {
  const { success } = useToast();
  const { role, switchRole } = useAuth();
  const [supabaseConnected] = useState(isSupabaseConfigured());
  const [safetyBufferPct, setSafetyBufferPct] = useState('20');
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleResetData = () => {
    if (confirm('Reset all inventory records and seed demo operations?')) {
      inventoryService.resetToDemo();
      success('Database Reinitialized', 'Demo seed datasets successfully restored.');
      window.location.reload();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    success('Settings Saved', 'System operational thresholds and preferences updated.');
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-rose-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              System Settings & Architecture
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure database connectivity, operational safety buffers, and demo data reinitialization
          </p>
        </div>

        {/* Database Connectivity Card */}
        <div className="command-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-rose-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Database Connection Status</h2>
            </div>
            {supabaseConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Supabase Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                <Server className="w-3.5 h-3.5 text-indigo-400" /> In-App Memory Store Active
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              StockSense is configured with dual persistence architecture. When <code className="text-rose-300 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-rose-300 font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> are provided in <code className="text-rose-300 font-mono">.env.local</code>, operations connect to Supabase PostgreSQL.
            </p>
            <p className="text-slate-400">
              Migration files and seed scripts are located in <code className="text-slate-200 font-mono">supabase/migrations/</code> and <code className="text-slate-200 font-mono">supabase/seed.sql</code>.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="text-xs font-bold text-white">Reset Database State</h4>
              <p className="text-[11px] text-slate-400">Reload demo inventory, Azure Interior deliveries, and steel receipts.</p>
            </div>
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>

        {/* Operational Safety Buffer */}
        <form onSubmit={handleSave} className="command-card p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Sliders className="w-5 h-5 text-rose-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Inventory Safety Configuration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dynamic Reorder Safety Buffer (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={safetyBufferPct}
                onChange={e => setSafetyBufferPct(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono outline-none focus:border-rose-500/60"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Extra percentage buffer applied over manufacturer reorder points to account for vendor lead time variances.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Active Role Sandbox
              </label>
              <select
                value={role}
                onChange={e => switchRole(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-rose-500/60 font-mono"
              >
                <option value="manager">Inventory Manager (Full Authorization)</option>
                <option value="staff">Warehouse Staff (Operational Floor Mode)</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                Toggle roles during the hackathon demo to inspect role permissions and access views.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="alert-notifications"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="alert-notifications" className="text-xs text-slate-300 cursor-pointer">
                Send critical out-of-stock telemetry notifications to warehouse supervisor
              </label>
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-900/30"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
