'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  BookOpen,
  Search,
  Download,
  Calendar,
  Filter,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { StockLedgerEntry } from '@/types';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { EmptyState } from '@/components/ui/empty-state';

export default function StockLedgerPage() {
  const { success } = useToast();
  const [entries, setEntries] = useState<StockLedgerEntry[]>([]);
  const [search, setSearch] = useState('');
  const [operationFilter, setOperationFilter] = useState('all');

  const loadData = () => {
    const list = inventoryService.getStockLedger({
      search,
      operationType: operationFilter
    });
    setEntries(list);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('stocksense_state_updated', handleUpdate);
    return () => window.removeEventListener('stocksense_state_updated', handleUpdate);
  }, [search, operationFilter]);

  const handleExportCSV = () => {
    if (entries.length === 0) return;
    const headers = [
      'ID',
      'Date',
      'Reference',
      'Operation Type',
      'Product',
      'SKU',
      'Warehouse',
      'Location',
      'Quantity Before',
      'Quantity Change',
      'Quantity After',
      'Source / From',
      'Destination / To',
      'User',
      'Reason'
    ];

    const rows = entries.map(e => [
      e.id,
      e.date,
      e.reference,
      e.operation_type,
      `"${e.product_name}"`,
      e.sku,
      `"${e.warehouse_name}"`,
      `"${e.location_name}"`,
      e.quantity_before,
      e.quantity_change,
      e.quantity_after,
      `"${e.source || ''}"`,
      `"${e.destination || ''}"`,
      `"${e.user_name}"`,
      `"${e.reason || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stocksense_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success('Ledger Exported', `${entries.length} immutable ledger records exported to CSV.`);
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-rose-500" />
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Immutable Stock Ledger (Audit Trail)
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Complete chronological audit trail recording exact before, change, and after quantities for every inventory mutation
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-rose-500/40 text-slate-200 hover:text-white transition-all shadow-sm w-fit"
          >
            <Download className="w-4 h-4 text-rose-400" />
            <span>Export Audit Ledger</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="command-card p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, product, reason or user..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          <select
            value={operationFilter}
            onChange={e => setOperationFilter(e.target.value)}
            className="w-full md:w-56 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none"
          >
            <option value="all">All Operation Types</option>
            <option value="RECEIPT">RECEIPT (Vendor Inflow)</option>
            <option value="DELIVERY">DELIVERY (Fulfillment Outflow)</option>
            <option value="INTERNAL_TRANSFER">INTERNAL TRANSFER</option>
            <option value="ADJUSTMENT">ADJUSTMENT (Variance)</option>
            <option value="INITIAL_STOCK">INITIAL_STOCK (Baseline)</option>
          </select>
        </div>

        {/* Ledger Table */}
        <div className="command-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0A0E18] text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Reference</th>
                  <th className="p-3.5">Operation</th>
                  <th className="p-3.5">Product & SKU</th>
                  <th className="p-3.5">Warehouse & Bay</th>
                  <th className="p-3.5 text-center">Quantity Delta Matrix</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Reason / Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <EmptyState
                        icon={BookOpen}
                        title="No Ledger Records Found"
                        description="Mutations performed across receipts, deliveries, and adjustments will create permanent entries here."
                      />
                    </td>
                  </tr>
                ) : (
                  entries.map(entry => {
                    const isPositive = entry.quantity_change > 0;
                    const isNegative = entry.quantity_change < 0;

                    return (
                      <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                          {formatDate(entry.created_at || entry.date)}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-rose-400">
                          {entry.reference}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                              entry.operation_type === 'RECEIPT'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                : entry.operation_type === 'DELIVERY'
                                ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                                : entry.operation_type === 'INTERNAL_TRANSFER'
                                ? 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40'
                                : entry.operation_type === 'ADJUSTMENT'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {entry.operation_type}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <Link href={`/products/${entry.product_id}`} className="font-semibold text-white hover:text-rose-400">
                            {entry.product_name}
                          </Link>
                          <span className="font-mono text-slate-400 block text-[10px]">{entry.sku}</span>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          {entry.warehouse_name} &bull; <span className="font-mono text-slate-400">{entry.location_name}</span>
                        </td>
                        <td className="p-3.5 text-center font-mono">
                          {/* Matrix: Before -> Change -> After */}
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-slate-400">{entry.quantity_before}</span>
                            <span className="text-slate-600">&rarr;</span>
                            <span
                              className={`font-bold ${
                                isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-300'
                              }`}
                            >
                              {isPositive ? `+${entry.quantity_change}` : entry.quantity_change}
                            </span>
                            <span className="text-slate-600">&rarr;</span>
                            <span className="font-bold text-white">{entry.quantity_after}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-400 font-medium">
                          {entry.user_name}
                        </td>
                        <td className="p-3.5 text-slate-400 max-w-xs truncate">
                          {entry.reason || '-'}
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
