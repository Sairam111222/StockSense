'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  ArrowLeftRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  AlertTriangle,
  History
} from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { InternalTransfer } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

export default function TransferDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { success, error: toastError } = useToast();

  const [transfer, setTransfer] = useState<InternalTransfer | undefined>(undefined);

  const loadData = () => {
    if (!id) return;
    setTransfer(inventoryService.getTransferById(id));
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('stocksense_state_updated', handleUpdate);
    return () => window.removeEventListener('stocksense_state_updated', handleUpdate);
  }, [id]);

  if (!transfer) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-slate-400 text-sm">Internal transfer order not found.</p>
          <Link href="/operations/transfers" className="mt-4 inline-block text-xs font-semibold text-rose-400 hover:underline">
            &larr; Return to Internal Transfers
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleValidate = () => {
    const res = inventoryService.validateTransfer(transfer.id);
    if (res.success) {
      success('Transfer Completed', `${transfer.reference} executed! Stock successfully moved.`);
      loadData();
    } else {
      toastError('Validation Failed', res.error);
    }
  };

  const steps = ['draft', 'waiting', 'ready', 'done'];
  const currentStepIdx = steps.indexOf(transfer.status);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Link
            href="/operations/transfers"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Internal Transfers</span>
          </Link>

          <div className="flex items-center gap-2">
            {transfer.status !== 'done' && transfer.status !== 'canceled' && (
              <button
                onClick={handleValidate}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-900/40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Validate & Move Stock</span>
              </button>
            )}
          </div>
        </div>

        {/* Stepper */}
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
                          ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-900/40'
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
                        isPast || (isCurrent && idx < currentStepIdx) ? 'bg-indigo-500/60' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Transfer Spec Card */}
        <div className="command-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wide">
                  {transfer.reference}
                </span>
                <StatusBadge status={transfer.status} size="md" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Inter-Facility Stock Movement</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Scheduled Date</span>
              <span className="text-xs font-mono font-semibold text-slate-200">{formatDate(transfer.schedule_date)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-indigo-400 block mb-1">Source (Origin)</span>
              <p className="text-xs font-bold text-white">{transfer.source_warehouse_name}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{transfer.source_location_name}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-emerald-400 block mb-1">Destination (Arrival)</span>
              <p className="text-xs font-bold text-white">{transfer.destination_warehouse_name}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{transfer.destination_location_name}</p>
            </div>
          </div>

          {/* Items */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Transferred Items</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0A0E18] text-slate-400 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-right">Transfer Quantity</th>
                    <th className="py-2.5 px-3">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transfer.items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-semibold text-white">
                        <Link href={`/products/${item.product_id}`} className="hover:text-indigo-400">
                          {item.product_name}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">{item.sku}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-indigo-400">{item.quantity}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{item.unit || 'pcs'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {transfer.status === 'done' && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                Transfer executed successfully. Source location quantity decreased, destination location quantity increased, and company-wide total stock was conserved.
              </span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
