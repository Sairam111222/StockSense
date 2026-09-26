'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  History,
  Search,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Calendar,
  Filter
} from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { StockMove } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { EmptyState } from '@/components/ui/empty-state';

export default function MoveHistoryPage() {
  const { success } = useToast();
  const [moves, setMoves] = useState<StockMove[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = () => {
    const list = inventoryService.getMoveHistory({
      search,
      type: typeFilter,
      status: statusFilter
    });
    setMoves(list);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('stocksense_state_updated', handleUpdate);
    return () => window.removeEventListener('stocksense_state_updated', handleUpdate);
  }, [search, typeFilter, statusFilter]);

  // Export CSV
  const handleExportCSV = () => {
    if (moves.length === 0) return;
    const headers = ['Reference', 'Date', 'Type', 'Contact', 'From', 'To', 'Product', 'SKU', 'Quantity', 'Unit', 'Status'];
    const rows = moves.map(m => [
      m.reference,
      m.date,
      m.type,
      `"${m.contact || ''}"`,
      `"${m.from || ''}"`,
      `"${m.to || ''}"`,
      `"${m.product_name}"`,
      m.sku,
      m.quantity,
      m.unit,
      m.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stocksense_moves_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success('CSV Exported', `${moves.length} movement records exported successfully.`);
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-rose-500" />
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Stock Move History
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-product granular movement ledger tracing all inbound, outbound, transfer, and adjustment lines
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-rose-500/40 text-slate-200 hover:text-white transition-all shadow-sm w-fit"
          >
            <Download className="w-4 h-4 text-rose-400" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="command-card p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, contact, product name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full md:w-44 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none"
          >
            <option value="all">All Move Types</option>
            <option value="incoming">Incoming (Receipts)</option>
            <option value="outgoing">Outgoing (Deliveries)</option>
            <option value="internal">Internal Transfers</option>
            <option value="adjustment">Adjustments</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full md:w-40 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="ready">Ready</option>
            <option value="waiting">Waiting</option>
            <option value="done">Done</option>
            <option value="draft">Draft</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        {/* Move History Table matching mockup */}
        <div className="command-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0A0E18] text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Reference</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">From</th>
                  <th className="p-3.5">To</th>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5 text-right">Quantity</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {moves.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <EmptyState
                        icon={History}
                        title="No Stock Moves Found"
                        description="Operations will log granular individual lines as they occur."
                      />
                    </td>
                  </tr>
                ) : (
                  moves.map(m => {
                    const isIncoming = m.type === 'incoming';
                    const isOutgoing = m.type === 'outgoing';
                    const isInternal = m.type === 'internal';

                    return (
                      <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-rose-400">
                            {isIncoming && <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            {isOutgoing && <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                            {isInternal && <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                            <span>{m.reference}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">
                          {formatDate(m.date)}
                        </td>
                        <td className="p-3.5 text-slate-200 font-medium">
                          {m.contact || '-'}
                        </td>
                        <td className="p-3.5 text-slate-400 max-w-xs truncate">
                          {m.from}
                        </td>
                        <td className="p-3.5 text-slate-300 max-w-xs truncate">
                          {m.to}
                        </td>
                        <td className="p-3.5">
                          <Link href={`/products/${m.product_id}`} className="font-semibold text-white hover:text-rose-400">
                            {m.product_name}
                          </Link>
                          <span className="font-mono text-slate-500 block text-[10px]">{m.sku}</span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold">
                          <span className={isIncoming ? 'text-emerald-400' : isOutgoing ? 'text-rose-400' : 'text-sky-400'}>
                            {isIncoming ? `+${m.quantity}` : isOutgoing ? `-${m.quantity}` : m.quantity} {m.unit}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <StatusBadge status={m.status} size="sm" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
