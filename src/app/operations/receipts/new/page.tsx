'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Truck, ArrowLeft, Plus, Trash2, CheckCircle2, Save, AlertCircle } from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { Product, Supplier, Warehouse, OperationStatus } from '@/types';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth/context';

interface ReceiptLine {
  productId: string;
  expectedQty: number;
  receivedQty: number;
}

function NewReceiptPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProduct = searchParams?.get('product');

  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Form Fields
  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState<ReceiptLine[]>([]);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const sups = inventoryService.getSuppliers();
    const whs = inventoryService.getWarehouses();
    const prods = inventoryService.getProducts();

    setSuppliers(sups);
    setWarehouses(whs);
    setProducts(prods);

    if (sups.length > 0) setSupplierId(sups[0].id);
    if (whs.length > 0) setWarehouseId(whs[0].id);

    if (prods.length > 0) {
      const initialProdId = preselectedProduct || prods[0].id;
      setLines([
        {
          productId: initialProdId,
          expectedQty: 50,
          receivedQty: 50
        }
      ]);
    }
  }, [preselectedProduct]);

  const addLine = () => {
    if (products.length === 0) return;
    setLines(prev => [
      ...prev,
      {
        productId: products[0].id,
        expectedQty: 10,
        receivedQty: 10
      }
    ]);
  };

  const removeLine = (index: number) => {
    setLines(prev => prev.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof ReceiptLine, value: any) => {
    setLines(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCreate = (statusToSet: OperationStatus, andValidate = false) => {
    setFormError('');

    if (!supplierId) {
      setFormError('Vendor / Supplier selection is required.');
      return;
    }
    if (!warehouseId) {
      setFormError('Destination warehouse is required.');
      return;
    }
    if (lines.length === 0) {
      setFormError('At least one product line item is required.');
      return;
    }

    for (const line of lines) {
      if (line.expectedQty <= 0) {
        setFormError('Expected quantity must be greater than zero.');
        return;
      }
    }

    const payload = {
      supplier_id: supplierId,
      warehouse_id: warehouseId,
      schedule_date: scheduleDate,
      responsible_name: user?.full_name || 'Alex Vance',
      status: andValidate ? 'ready' as OperationStatus : statusToSet,
      items: lines.map(l => ({
        product_id: l.productId,
        expected_quantity: lineItemQty(l.expectedQty),
        received_quantity: lineItemQty(l.receivedQty)
      }))
    };

    const res = inventoryService.createReceipt(payload);
    if (res.success && res.receipt) {
      if (andValidate) {
        // Automatically validate and increase stock immediately
        const valRes = inventoryService.validateReceipt(res.receipt.id);
        if (valRes.success) {
          success('Receipt Validated', `${res.receipt.reference} processed! Inventory increased.`);
          router.push(`/operations/receipts/${res.receipt.id}`);
          return;
        }
      }
      success('Receipt Created', `${res.receipt.reference} saved with status ${statusToSet.toUpperCase()}.`);
      router.push(`/operations/receipts/${res.receipt.id}`);
    } else {
      setFormError(res.error || 'Failed to create receipt.');
      toastError('Creation Failed', res.error);
    }
  };

  const lineItemQty = (val: any) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Link
            href="/operations/receipts"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Receipts</span>
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Inbound Intake
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-400" />
            New Vendor Receipt
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Receive incoming materials from certified vendors and record physical inventory intake
          </p>
        </div>

        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <div className="command-card p-6 space-y-6">
          {/* Top Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Vendor / Supplier <span className="text-rose-400">*</span>
              </label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500/60"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Destination Warehouse <span className="text-rose-400">*</span>
              </label>
              <select
                value={warehouseId}
                onChange={e => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500/60"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Scheduled Intake Date
              </label>
              <input
                type="date"
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          {/* Product Lines Table */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Product Line Items</h3>
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-emerald-500/40 text-slate-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="space-y-2">
              {lines.map((line, idx) => {
                const selProd = products.find(p => p.id === line.productId);
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
                            {p.name} ({p.sku}) - Current stock: {p.total_stock} {p.unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full md:w-32">
                      <label className="block text-[10px] text-slate-400 font-mono mb-1">Expected Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={line.expectedQty}
                        onChange={e => updateLine(idx, 'expectedQty', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono outline-none"
                      />
                    </div>

                    <div className="w-full md:w-32">
                      <label className="block text-[10px] text-slate-400 font-mono mb-1">Received Qty</label>
                      <input
                        type="number"
                        min="0"
                        value={line.receivedQty}
                        onChange={e => updateLine(idx, 'receivedQty', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-300 font-mono font-bold outline-none"
                      />
                    </div>

                    <div className="w-full md:w-20">
                      <label className="block text-[10px] text-slate-400 font-mono mb-1">Unit</label>
                      <input
                        type="text"
                        readOnly
                        value={selProd?.unit || 'pcs'}
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

          {/* Workflow Action Buttons (Requirement 3: Save Draft, Confirm, Validate, Cancel) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-800">
            <Link
              href="/operations/receipts"
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
                onClick={() => handleCreate('ready')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors"
              >
                <span>Confirm Intake</span>
              </button>

              <button
                type="button"
                onClick={() => handleCreate('ready', true)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-900/40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Validate & Receive Stock</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function NewReceiptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090D16] flex items-center justify-center"><div className="text-slate-400 text-sm">Loading...</div></div>}>
      <NewReceiptPageContent />
    </Suspense>
  );
}
