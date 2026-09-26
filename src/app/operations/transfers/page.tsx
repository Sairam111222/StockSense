'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  ArrowLeftRight,
  Plus,
  Search,
  CheckCircle2,
  Eye,
  Building2,
  Calendar
} from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { InternalTransfer } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { EmptyState } from '@/components/ui/empty-state';

export default function TransfersPage() {
  const { success, error: toastError } = useToast();
  const [transfers, setTransfers] = useState<InternalTransfer[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = () => {
    let list = inventoryService.getTransfers({ status: statusFilter });
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        t =>
          t.reference.toLowerCase().includes(q) ||
          t.source_warehouse_name?.toLowerCase().includes(q) ||
          t.destination_warehouse_name?.toLowerCase().includes(q) ||
          t.items.some(it => it.product_name?.toLowerCase().includes(q) || it.sku?.toLowerCase().includes(q))
      );
    }
    setTransfers(list);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('stocksense_state_updated', handleUpdate);
    return () => window.removeEventListener('stocksense_state_updated', handleUpdate);
  }, [search, statusFilter]);

  const handleQuickValidate = (id: string, ref: string) => {
    if (confirm(`Execute and validate transfer ${ref}? Total company inventory will remain constant while locations update.`)) {
      const res = inventoryService.validateTransfer(id);
      if (res.success) {
        success('Transfer Completed', `${ref} executed! Source decreased, destination increased.`);
        loadData();
      } else {
        toastError('Transfer Blocked', res.error);
      }
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Internal Inventory Transfers
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Rebalance stock between warehouse locations and production floors with conservation of total inventory
            </p>
          </div>

          <Link
            href="/operations/transfers/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-900/30 w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Create Transfer</span>
          </Link>
        </div>

        <div className="command-card p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference (e.g. WH/INT/0001), source, or destination..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
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
                  <th className="p-3.5">Source Location</th>
                  <th className="p-3.5">Destination Location</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Products Moved</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <EmptyState
                        icon={ArrowLeftRight}
                        title="No Transfers Found"
                        description="Move items between warehouse bays or storage racks."
                        actionText="Create Transfer"
                        actionHref="/operations/transfers/new"
                      />
                    </td>
                  </tr>
                ) : (
                  transfers.map(tr => (
                    <tr key={tr.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <Link
                          href={`/operations/transfers/${tr.id}`}
                          className="font-mono font-bold text-rose-400 hover:underline"
                        >
                          {tr.reference}
                        </Link>
                      </td>
                      <td className="p-3.5 font-semibold text-white">
                        {tr.source_warehouse_name} &bull; <span className="text-slate-400 font-mono">{tr.source_location_name}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-white">
                        {tr.destination_warehouse_name} &bull; <span className="text-slate-400 font-mono">{tr.destination_location_name}</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">
                        {formatDate(tr.schedule_date)}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {tr.items.map(it => (
                          <div key={it.id}>
                            {it.product_name} ({it.quantity} {it.unit})
                          </div>
                        ))}
                      </td>
                      <td className="p-3.5 text-center">
                        <StatusBadge status={tr.status} size="sm" />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {tr.status !== 'done' && tr.status !== 'canceled' && (
                            <button
                              onClick={() => handleQuickValidate(tr.id, tr.reference)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Validate</span>
                            </button>
                          )}
                          <Link
                            href={`/operations/transfers/${tr.id}`}
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
