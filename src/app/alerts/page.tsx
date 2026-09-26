'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  Bell,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Truck,
  ArrowRight,
  Check
} from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { Alert } from '@/types';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { EmptyState } from '@/components/ui/empty-state';

export default function AlertsPage() {
  const { success } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filterSeverity, setFilterSeverity] = useState('all');

  const loadData = () => {
    setAlerts(inventoryService.getAlerts());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('stocksense_state_updated', handleUpdate);
    return () => window.removeEventListener('stocksense_state_updated', handleUpdate);
  }, []);

  const handleMarkRead = (id: string) => {
    inventoryService.markAlertRead(id);
    success('Alert Dismissed', 'Notification marked as resolved.');
    loadData();
  };

  const filtered = filterSeverity === 'all' ? alerts : alerts.filter(a => a.severity === filterSeverity);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-rose-500" />
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Live Inventory Alerts & Safety Thresholds
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous safety monitors tracking depleted SKUs, low-stock thresholds, and reorder alerts
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterSeverity === 'all' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterSeverity === 'critical' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Critical ({alerts.filter(a => a.severity === 'critical').length})
            </button>
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterSeverity === 'warning' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Warnings ({alerts.filter(a => a.severity === 'warning').length})
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="command-card p-12 text-center">
              <EmptyState
                icon={CheckCircle2}
                title="All Inventory Levels Healthy"
                description="No active stock shortages, depleted materials, or safety threshold triggers detected."
              />
            </div>
          ) : (
            filtered.map(alert => {
              const isCritical = alert.severity === 'critical';
              return (
                <div
                  key={alert.id}
                  className={`command-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isCritical ? 'border-rose-500/50 bg-rose-950/20' : 'border-amber-500/40 bg-amber-950/20'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {isCritical ? <XCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                            isCritical
                              ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                              : 'bg-amber-950 text-amber-300 border-amber-500/50'
                          }`}
                        >
                          {alert.type}
                        </span>
                        <span className="text-xs font-semibold text-white">{alert.product_name}</span>
                        {alert.sku && (
                          <span className="text-[10px] font-mono text-slate-400">({alert.sku})</span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.message}</p>

                      <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 mt-2">
                        <span>Facility: <strong className="text-slate-200">{alert.warehouse_name}</strong></span>
                        <span>Logged: {formatDate(alert.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:self-center shrink-0">
                    {alert.product_id && (
                      <Link
                        href={`/operations/receipts/new?product=${alert.product_id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Reorder</span>
                      </Link>
                    )}
                    <button
                      onClick={() => handleMarkRead(alert.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:text-white text-slate-300 transition-colors"
                      title="Mark as handled"
                    >
                      <Check className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dismiss</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
