'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { SlidersHorizontal, ArrowLeft, CheckCircle2, Save, AlertCircle } from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { Product, Warehouse, Location, AdjustmentReason, OperationStatus } from '@/types';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth/context';

export default function NewAdjustmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Form Fields
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [systemQuantity, setSystemQuantity] = useState(0);
  const [countedQuantity, setCountedQuantity] = useState(0);
  const [reason, setReason] = useState<AdjustmentReason>('Damaged');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const prods = inventoryService.getProducts();
    const whs = inventoryService.getWarehouses();
    const locs = inventoryService.getLocations();

    setProducts(prods);
    setWarehouses(whs);
    setLocations(locs);

    if (prods.length > 0) {
      setProductId(prods[0].id);
      setSystemQuantity(prods[0].total_stock);
      setCountedQuantity(prods[0].total_stock);
    }
    if (whs.length > 0) {
      setWarehouseId(whs[0].id);
      const whLocs = locs.filter(l => l.warehouse_id === whs[0].id);
      if (whLocs.length > 0) setLocationId(whLocs[0].id);
    }
  }, []);

  const handleProductChange = (prodId: string) => {
    setProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setSystemQuantity(prod.total_stock);
      setCountedQuantity(prod.total_stock);
    }
  };

  const handleWarehouseChange = (whId: string) => {
    setWarehouseId(whId);
    const whLocs = locations.filter(l => l.warehouse_id === whId);
    if (whLocs.length > 0) setLocationId(whLocs[0].id);
    else setLocationId('');
  };

  // Automatic calculation: Difference = Counted Quantity - System Quantity
  const difference = countedQuantity - systemQuantity;

  const handleCreate = (statusToSet: OperationStatus, andValidate = false) => {
    setFormError('');

    if (!productId) {
      setFormError('Please select a product.');
      return;
    }
    if (!warehouseId || !locationId) {
      setFormError('Warehouse and Location are required.');
      return;
    }
    if (countedQuantity < 0) {
      setFormError('Counted quantity cannot be negative.');
      return;
    }

    const payload = {
      product_id: productId,
      warehouse_id: warehouseId,
      location_id: locationId,
      counted_quantity: Number(countedQuantity),
      reason,
      notes,
      responsible_name: user?.full_name || 'Alex Vance',
      status: andValidate ? 'ready' as OperationStatus : statusToSet
    };

    const res = inventoryService.createAdjustment(payload);
    if (res.success && res.adjustment) {
      if (andValidate) {
        const valRes = inventoryService.validateAdjustment(res.adjustment.id);
        if (valRes.success) {
          success('Adjustment Validated', `${res.adjustment.reference} applied! Inventory adjusted by ${difference}.`);
          router.push(`/operations/adjustments/${res.adjustment.id}`);
          return;
        } else {
          setFormError(valRes.error || 'Failed to validate adjustment.');
          toastError('Validation Failed', valRes.error);
          return;
        }
      }
      success('Adjustment Draft Created', `${res.adjustment.reference} saved.`);
      router.push(`/operations/adjustments/${res.adjustment.id}`);
    } else {
      setFormError(res.error || 'Failed to create adjustment.');
      toastError('Creation Failed', res.error);
    }
  };

  const selectedProd = products.find(p => p.id === productId);
  const filteredLocs = locations.filter(l => l.warehouse_id === warehouseId);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Link
            href="/operations/adjustments"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Adjustments</span>
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Stock Count Discrepancy
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-amber-400" />
            New Inventory Adjustment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reconcile physical warehouse counts with digital system stock and record audit log reason
          </p>
        </div>

        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <div className="command-card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Product to Reconcile <span className="text-rose-400">*</span>
              </label>
              <select
                value={productId}
                onChange={e => handleProductChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-amber-500/60"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Discrepancy Reason <span className="text-rose-400">*</span>
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value as AdjustmentReason)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-amber-500/60"
              >
                <option value="Damaged">Damaged</option>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
                <option value="Counting Error">Counting Error</option>
                <option value="Quality Issue">Quality Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Warehouse
              </label>
              <select
                value={warehouseId}
                onChange={e => handleWarehouseChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-amber-500/60"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Storage Bay / Location
              </label>
              <select
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-amber-500/60"
              >
                {filteredLocs.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Automatic Calculation Card (Section 6) */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Discrepancy Calculation Matrix
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-mono mb-1">Digital System Quantity</label>
                <div className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-mono font-bold text-slate-300">
                  {systemQuantity} {selectedProd?.unit || 'pcs'}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-amber-300 font-mono mb-1">
                  Physical Counted Quantity <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={countedQuantity}
                  onChange={e => setCountedQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/60 text-sm font-mono font-bold text-white outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono mb-1">Calculated Difference</label>
                <div
                  className={`px-3 py-2.5 rounded-xl font-mono font-bold text-sm border ${
                    difference > 0
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : difference < 0
                      ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {difference > 0 ? `+${difference}` : difference} {selectedProd?.unit || 'pcs'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Adjustment Notes & Incident Report
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Three units damaged due to water leak on Rack A during heavy storm inspection..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-800">
            <Link
              href="/operations/adjustments"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleCreate('draft')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:text-white text-slate-300 transition-colors"
              >
                <Save className="w-3.5 h-3.5 text-slate-400" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleCreate('ready', true)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg shadow-amber-900/40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Validate & Adjust Stock</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
