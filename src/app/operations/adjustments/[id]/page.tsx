'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  SlidersHorizontal,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Calendar,
  AlertTriangle,
  History
} from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { InventoryAdjustment } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

export default function AdjustmentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { success, error: toastError } = useToast();

  const [adjustment, setAdjustment] = useState<InventoryAdjustment | undefined>(undefined);

  const loadData = () => {
    if (!id) return;
    setAdjustment(inventoryService.getAdjustmentById(id));
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('stocksense_state_updated', handleUpdate);
    return () => window.removeEventListener('stocksense_state_updated', handleUpdate);
  }, [id]);

  if (!adjustment) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-slate-400 text-sm">Adjustment record not found.</p>
          <Link href="/operations/adjustments" className="mt-4 inline-block text-xs font-semibold text-rose-400 hover:underline">
            &larr; Return to Adjustments
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleValidate = () => {
    const res = inventoryService.validateAdjustment(adjustment.id);
    if (res.success) {
      success('Adjustment Validated', `${adjustment.reference} applied to physical stock and ledger.`);
      loadData();
    } else {
      toastError('Validation Failed', res.error);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Link
            href="/operations/adjustments"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Adjustments</span>
          </Link>

          <div className="flex items-center gap-2">
            {adjustment.status !== 'done' && adjustment.status !== 'canceled' && (
              <button
                onClick={handleValidate}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg shadow-amber-900/40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Validate & Adjust Stock</span>
              </button>
            )}
          </div>
        </div>

        <div className="command-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wide">
                  {adjustment.reference}
                </span>
                <StatusBadge status={adjustment.status} size="md" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Discrepancy Reason: <span className="text-amber-300 font-semibold">{adjustment.reason}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Logged Date</span>
              <span className="text-xs font-mono font-semibold text-slate-200">{formatDate(adjustment.created_at)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Product</span>
              <p className="text-xs font-bold text-white">{adjustment.product_name}</p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">{adjustment.sku}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Facility / Location</span>
              <p className="text-xs font-bold text-white">{adjustment.warehouse_name}</p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">{adjustment.location_name}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Responsible Staff</span>
              <p className="text-xs font-bold text-white">{adjustment.responsible_name}</p>
            </div>
          </div>

          {/* Quantities matrix */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">System Quantity</span>
              <span className="text-base font-bold text-slate-300">{adjustment.system_quantity} {adjustment.unit}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Counted Quantity</span>
              <span className="text-base font-bold text-white">{adjustment.counted_quantity} {adjustment.unit}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Difference</span>
              <span className={`text-base font-bold ${adjustment.difference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {adjustment.difference >= 0 ? `+${adjustment.difference}` : adjustment.difference} {adjustment.unit}
              </span>
            </div>
          </div>

          {adjustment.notes && (
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Audit Notes</span>
              <p className="text-xs text-slate-300 leading-relaxed">{adjustment.notes}</p>
            </div>
          )}

          {adjustment.status === 'done' && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                This adjustment is validated. The stock ledger contains the immutable variance log.
              </span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
