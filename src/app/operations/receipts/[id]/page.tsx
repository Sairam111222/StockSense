'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  Truck,
  ArrowLeft,
  CheckCircle2,
  Printer,
  XCircle,
  Building2,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { Receipt } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

export default function ReceiptDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { success, error: toastError } = useToast();

  const [receipt, setReceipt] = useState<Receipt | undefined>(undefined);

  const loadData = () => {
    if (!id) return;
    setReceipt(inventoryService.getReceiptById(id));
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('stocksense_state_updated', handleUpdate);
    return () => window.removeEventListener('stocksense_state_updated', handleUpdate);
  }, [id]);

  if (!receipt) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-slate-400 text-sm">Receipt order not found.</p>
          <Link href="/operations/receipts" className="mt-4 inline-block text-xs font-semibold text-rose-400 hover:underline">
            &larr; Return to Receipts
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleValidate = () => {
    const res = inventoryService.validateReceipt(receipt.id);
    if (res.success) {
      success('Receipt Validated', `Stock inventory for ${receipt.reference} increased and recorded in ledger.`);
      loadData();
    } else {
      toastError('Validation Failed', res.error);
    }
  };

  const handleCancel = () => {
    if (confirm(`Cancel receipt ${receipt.reference}?`)) {
      inventoryService.updateReceiptStatus(receipt.id, 'canceled');
      success('Receipt Canceled', `${receipt.reference} status set to Canceled.`);
      loadData();
    }
  };

  const steps = ['draft', 'waiting', 'ready', 'done'];
  const currentStepIdx = steps.indexOf(receipt.status);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/operations/receipts"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Receipts</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:text-white text-slate-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            {receipt.status !== 'done' && receipt.status !== 'canceled' && (
              <>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/40 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleValidate}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-900/40"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Validate Receipt</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Workflow Progression Stepper (Requirement 14 & 19) */}
        <div className="command-card p-4">
          <div className="flex items-center justify-between">
            {steps.map((st, idx) => {
              const isPast = currentStepIdx > idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div key={st} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-emerald-500 text-black ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-900/40'
                          : isPast
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-[10px] uppercase font-mono mt-1.5 tracking-wider ${
                        isCurrent ? 'text-white font-bold' : isPast ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-full mx-2 transition-all ${
                        isPast || (isCurrent && idx < currentStepIdx) ? 'bg-emerald-500/60' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Receipt Spec Card */}
        <div className="command-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wide">
                  {receipt.reference}
                </span>
                <StatusBadge status={receipt.status} size="md" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Vendor Procurement Inflow Order</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Scheduled Date</span>
              <span className="text-xs font-mono font-semibold text-slate-200">{formatDate(receipt.schedule_date)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Vendor / Supplier</span>
              <p className="text-xs font-bold text-white">{receipt.supplier_name}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Destination Facility</span>
              <p className="text-xs font-bold text-white">{receipt.warehouse_name}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Responsible Agent</span>
              <p className="text-xs font-bold text-white">{receipt.responsible_name}</p>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Received Product Items</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0A0E18] text-slate-400 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-right">Expected</th>
                    <th className="py-2.5 px-3 text-right">Received Qty</th>
                    <th className="py-2.5 px-3">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {receipt.items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-semibold text-white">
                        <Link href={`/products/${item.product_id}`} className="hover:text-emerald-400">
                          {item.product_name}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">{item.sku}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-400">{item.expected_quantity}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        {item.received_quantity || item.expected_quantity}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">{item.unit || 'pcs'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {receipt.status === 'done' && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                This receipt has been validated. Total stock for the above products was increased in the inventory database and recorded in the Stock Ledger.
              </span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
