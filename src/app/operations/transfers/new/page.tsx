'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { ArrowLeftRight, ArrowLeft, Plus, Trash2, CheckCircle2, Save, AlertCircle } from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { Product, Warehouse, Location, OperationStatus } from '@/types';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth/context';

export default function NewTransferPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Form Fields
  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [sourceLocationId, setSourceLocationId] = useState('');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);

  const [lines, setLines] = useState<{ productId: string; quantity: number }[]>([]);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const whs = inventoryService.getWarehouses();
    const locs = inventoryService.getLocations();
    const prods = inventoryService.getProducts();

    setWarehouses(whs);
    setLocations(locs);
    setProducts(prods);

    if (whs.length >= 2) {
      setSourceWarehouseId(whs[0].id);
      const srcLocs = locs.filter(l => l.warehouse_id === whs[0].id);
      if (srcLocs.length > 0) setSourceLocationId(srcLocs[0].id);

      setDestinationWarehouseId(whs[1].id);
      const destLocs = locs.filter(l => l.warehouse_id === whs[1].id);
      if (destLocs.length > 0) setDestinationLocationId(destLocs[0].id);
    } else if (whs.length === 1) {
      setSourceWarehouseId(whs[0].id);
      setDestinationWarehouseId(whs[0].id);
    }

    if (prods.length > 0) {
      setLines([{ productId: prods[0].id, quantity: 10 }]);
    }
  }, []);

  const handleSourceWhChange = (whId: string) => {
    setSourceWarehouseId(whId);
    const locs = locations.filter(l => l.warehouse_id === whId);
    if (locs.length > 0) setSourceLocationId(locs[0].id);
  };

  const handleDestWhChange = (whId: string) => {
    setDestinationWarehouseId(whId);
    const locs = locations.filter(l => l.warehouse_id === whId);
    if (locs.length > 0) setDestinationLocationId(locs[0].id);
  };

  const addLine = () => {
    if (products.length === 0) return;
    setLines(prev => [...prev, { productId: products[0].id, quantity: 5 }]);
  };

  const removeLine = (idx: number) => {
    setLines(prev => prev.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, field: 'productId' | 'quantity', val: any) => {
    setLines(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleCreate = (statusToSet: OperationStatus, andValidate = false) => {
    setFormError('');

    if (!sourceWarehouseId || !sourceLocationId) {
      setFormError('Source warehouse and location must be selected.');
      return;
    }
    if (!destinationWarehouseId || !destinationLocationId) {
      setFormError('Destination warehouse and location must be selected.');
      return;
    }
    if (sourceWarehouseId === destinationWarehouseId && sourceLocationId === destinationLocationId) {
      setFormError('Source and Destination cannot be the exact same location.');
      return;
    }
    if (lines.length === 0) {
      setFormError('At least one product item is required.');
      return;
    }

    const payload = {
      source_warehouse_id: sourceWarehouseId,
      source_location_id: sourceLocationId,
      destination_warehouse_id: destinationWarehouseId,
      destination_location_id: destinationLocationId,
      schedule_date: scheduleDate,
      responsible_name: user?.full_name || 'Alex Vance',
      status: andValidate ? 'ready' as OperationStatus : statusToSet,
      items: lines.map(l => ({
        product_id: l.productId,
        quantity: Number(l.quantity)
      }))
    };

    const res = inventoryService.createTransfer(payload);
    if (res.success && res.transfer) {
      if (andValidate) {
        const valRes = inventoryService.validateTransfer(res.transfer.id);
        if (valRes.success) {
          success('Transfer Completed', `${res.transfer.reference} executed! Stock moved between locations.`);
          router.push(`/operations/transfers/${res.transfer.id}`);
          return;
        } else {
          setFormError(valRes.error || 'Failed to validate transfer.');
          toastError('Transfer Blocked', valRes.error);
          return;
        }
      }
      success('Transfer Order Created', `${res.transfer.reference} saved.`);
      router.push(`/operations/transfers/${res.transfer.id}`);
    } else {
      setFormError(res.error || 'Failed to create transfer.');
      toastError('Creation Failed', res.error);
    }
  };

  const srcLocations = locations.filter(l => l.warehouse_id === sourceWarehouseId);
  const destLocations = locations.filter(l => l.warehouse_id === destinationWarehouseId);

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
          <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            Internal Movement
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-indigo-400" />
            New Internal Stock Transfer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Move materials between warehouses, storage bays, or production floors while conserving total inventory
          </p>
        </div>

        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <div className="command-card p-6 space-y-6">
          {/* Source Location Spec */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Source (Origin)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Source Warehouse</label>
                <select
                  value={sourceWarehouseId}
                  onChange={e => handleSourceWhChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Source Bay / Location</label>
                <select
                  value={sourceLocationId}
                  onChange={e => setSourceLocationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                >
                  {srcLocations.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Destination Location Spec */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Destination (Arrival)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination Warehouse</label>
                <select
                  value={destinationWarehouseId}
                  onChange={e => handleDestWhChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination Bay / Location</label>
                <select
                  value={destinationLocationId}
                  onChange={e => setDestinationLocationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                >
                  {destLocations.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Schedule Date</label>
            <input
              type="date"
              value={scheduleDate}
              onChange={e => setScheduleDate(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
            />
          </div>

          {/* Items */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Products To Move</h3>
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-indigo-500/40 text-slate-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="space-y-2">
              {lines.map((line, idx) => {
                const prod = products.find(p => p.id === line.productId);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center gap-3"
                  >
                    <div className="flex-1 w-full">
                      <label className="block text-[10px] text-slate-400 font-mono mb-1">Product</label>
                      <select
                        value={line.productId}
                        onChange={e => updateLine(idx, 'productId', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku}) - {p.total_stock} {p.unit} in company stock
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full md:w-36">
                      <label className="block text-[10px] text-slate-400 font-mono mb-1">Transfer Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={e => updateLine(idx, 'quantity', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono outline-none"
                      />
                    </div>

                    <div className="w-full md:w-20">
                      <label className="block text-[10px] text-slate-400 font-mono mb-1">Unit</label>
                      <input
                        type="text"
                        readOnly
                        value={prod?.unit || 'pcs'}
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 text-xs text-slate-400 font-mono text-center outline-none"
                      />
                    </div>

                    {lines.length > 1 && (
                      <div className="pt-4 md:pt-4">
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-800">
            <Link
              href="/operations/transfers"
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
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-900/40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Validate & Move Stock</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
