'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  SlidersHorizontal,
  Plus,
  Search,
  CheckCircle2,
  Eye,
  AlertTriangle,
  History
} from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { InventoryAdjustment } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { EmptyState } from '@/components/ui/empty-state';

export default function AdjustmentsPage() {
  const { success, error: toastError } = useToast();
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = () => {
    let list = inventoryService.getAdjustments({ status: statusFilter });
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        a =>
          a.reference.toLowerCase().includes(q) ||
          a.product_name?.toLowerCase().includes(q) ||
          a.sku?.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q) ||
          (a.notes && a.notes.toLowerCase().includes(q))
      );
    }
    setAdjustments(list);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('stocksense_state_updated', handleUpdate);
    return () => window.removeEventListener('stocksense_state_updated', handleUpdate);
  }, [search, statusFilter]);

  const handleQuickValidate = (id: string, ref: string) => {
    if (confirm(`Validate adjustment ${ref}? Physical stock and ledger will be updated.`)) {
      const res = inventoryService.validateAdjustment(id);
      if (res.success) {
        success('Adjustment Applied', `${ref} validated! Difference updated in inventory and logged in ledger.`);
        loadData();
      } else {
        toastError('Adjustment Failed', res.error);
      }
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-amber-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Inventory Adjustments & Stock Counts
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Reconcile physical stock counts with digital system inventory and document discrepancy causes
            </p>
          </div>

          <Link
            href="/operations/adjustments/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg shadow-amber-900/30 w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Create Adjustment</span>
          </Link>
        </div>

        <div className="command-card p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference (e.g. WH/ADJ/0001), product, or reason..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full md:w-44 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="waiting">Waiting</option>
            <option value="ready">Ready</option>
            <option value="done">Done</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        <div className="command-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0A0E18] text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Reference</th>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Warehouse / Location</th>
                  <th className="p-3.5 text-right">System Qty</th>
                  <th className="p-3.5 text-right">Counted Qty</th>
                  <th className="p-3.5 text-right">Difference</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {adjustments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center">
                      <EmptyState
                        icon={SlidersHorizontal}
                        title="No Adjustments Found"
                        description="Log a physical stock count variance to correct system stock."
                        actionText="Create Adjustment"
                        actionHref="/operations/adjustments/new"
                      />
                    </td>
                  </tr>
                ) : (
                  adjustments.map(adj => (
                    <tr key={adj.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <Link
                          href={`/operations/adjustments/${adj.id}`}
                          className="font-mono font-bold text-rose-400 hover:underline"
                        >
                          {adj.reference}
                        </Link>
                      </td>
                      <td className="p-3.5 font-semibold text-white">
                        {adj.product_name} <span className="font-mono text-slate-400 text-[11px]">({adj.sku})</span>
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {adj.warehouse_name} &bull; <span className="font-mono text-slate-400">{adj.location_name}</span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-400">
                        {adj.system_quantity}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-white">
                        {adj.counted_quantity}
                      </td>
                      <td className={`p-3.5 text-right font-mono font-bold ${adj.difference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {adj.difference >= 0 ? `+${adj.difference}` : adj.difference} {adj.unit}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-amber-300 border border-amber-500/30">
                          {adj.reason}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <StatusBadge status={adj.status} size="sm" />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {adj.status !== 'done' && adj.status !== 'canceled' && (
                            <button
                              onClick={() => handleQuickValidate(adj.id, adj.reference)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Validate</span>
                            </button>
                          )}
                          <Link
                            href={`/operations/adjustments/${adj.id}`}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
