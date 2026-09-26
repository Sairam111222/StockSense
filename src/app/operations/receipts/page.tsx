'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Eye,
  FileCheck2,
  Calendar,
  Building2,
  User
} from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { Receipt, Warehouse } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { EmptyState } from '@/components/ui/empty-state';

export default function ReceiptsPage() {
  const { success, error: toastError } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  const loadData = () => {
    let list = inventoryService.getReceipts({
      status: statusFilter,
      warehouseId: warehouseFilter
    });
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        r =>
          r.reference.toLowerCase().includes(q) ||
          (r.supplier_name && r.supplier_name.toLowerCase().includes(q)) ||
          r.items.some(it => it.product_name?.toLowerCase().includes(q) || it.sku?.toLowerCase().includes(q))
      );
    }
    setReceipts(list);
    setWarehouses(inventoryService.getWarehouses());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('stocksense_state_updated', handleUpdate);
    return () => window.removeEventListener('stocksense_state_updated', handleUpdate);
  }, [search, statusFilter, warehouseFilter]);

  const handleQuickValidate = (id: string, ref: string) => {
    if (confirm(`Validate receipt ${ref}? This will increase inventory stock immediately.`)) {
      const res = inventoryService.validateReceipt(id);
      if (res.success) {
        success('Receipt Validated', `${ref} validated successfully. Stock levels increased.`);
        loadData();
      } else {
        toastError('Validation Failed', res.error);
      }
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Vendor Receipts (Incoming Stock)
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Process procurement orders, inspect vendor items, and validate warehouse inventory increases
            </p>
          </div>

          <Link
            href="/operations/receipts/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-900/30 w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Create Receipt</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="command-card p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference (e.g. WH/IN/0001), supplier, or product..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
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

          <select
            value={warehouseFilter}
            onChange={e => setWarehouseFilter(e.target.value)}
            className="w-full md:w-48 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        {/* Receipts Table */}
        <div className="command-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0A0E18] text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Reference</th>
                  <th className="p-3.5">Vendor / Supplier</th>
                  <th className="p-3.5">Destination Warehouse</th>
                  <th className="p-3.5">Schedule Date</th>
                  <th className="p-3.5">Products Included</th>
                  <th className="p-3.5 text-right">Total Qty</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5">Responsible</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {receipts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center">
                      <EmptyState
                        icon={Truck}
                        title="No Receipts Found"
                        description="Create a vendor intake order to start receiving inventory."
                        actionText="Create Receipt"
                        actionHref="/operations/receipts/new"
                      />
                    </td>
                  </tr>
                ) : (
                  receipts.map(receipt => {
                    const totalQty = receipt.items.reduce((s, it) => s + (it.received_quantity || it.expected_quantity), 0);
                    return (
                      <tr key={receipt.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5">
                          <Link
                            href={`/operations/receipts/${receipt.id}`}
                            className="font-mono font-bold text-rose-400 hover:underline"
                          >
                            {receipt.reference}
                          </Link>
                        </td>
                        <td className="p-3.5 font-semibold text-white">
                          {receipt.supplier_name || 'Vendor'}
                        </td>
                        <td className="p-3.5 text-slate-300">
                          {receipt.warehouse_name}
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">
                          {formatDate(receipt.schedule_date)}
                        </td>
                        <td className="p-3.5 text-slate-300">
                          <div className="flex flex-col gap-0.5">
                            {receipt.items.map(it => (
                              <span key={it.id} className="truncate max-w-xs">
                                {it.product_name} ({it.received_quantity || it.expected_quantity} {it.unit})
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                          {totalQty}
                        </td>
                        <td className="p-3.5 text-center">
                          <StatusBadge status={receipt.status} size="sm" />
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {receipt.responsible_name}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {receipt.status !== 'done' && receipt.status !== 'canceled' && (
                              <button
                                onClick={() => handleQuickValidate(receipt.id, receipt.reference)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                                title="Validate and increase inventory"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Validate</span>
                              </button>
                            )}
                            <Link
                              href={`/operations/receipts/${receipt.id}`}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Inspect Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
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
