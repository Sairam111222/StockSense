'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Boxes, ArrowLeft, Plus, Trash2, CheckCircle2, Save, AlertCircle } from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { Product, Warehouse, OperationStatus } from '@/types';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth/context';

interface DeliveryLine {
  productId: string;
  quantity: number;
}

export default function NewDeliveryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Form Fields
  const [contact, setContact] = useState('Azure Interior');
  const [deliveryAddress, setDeliveryAddress] = useState('45 Design Center Way, Suite 10, Chicago, IL');
  const [warehouseId, setWarehouseId] = useState('');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [operationType, setOperationType] = useState('Customer Delivery');
  const [lines, setLines] = useState<DeliveryLine[]>([]);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const whs = inventoryService.getWarehouses();
    const prods = inventoryService.getProducts();

    setWarehouses(whs);
    setProducts(prods);

    if (whs.length > 0) setWarehouseId(whs[0].id);
    if (prods.length > 0) {
      setLines([
        {
          productId: prods[0].id,
          quantity: 2
        }
      ]);
    }
  }, []);

  const addLine = () => {
    if (products.length === 0) return;
    setLines(prev => [
      ...prev,
      {
        productId: products[0].id,
        quantity: 1
      }
    ]);
  };

  const removeLine = (index: number) => {
    setLines(prev => prev.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof DeliveryLine, value: any) => {
    setLines(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCreate = (statusToSet: OperationStatus, andValidate = false) => {
    setFormError('');

    if (!contact.trim()) {
      setFormError('Recipient / Customer contact name is required.');
      return;
    }
    if (!deliveryAddress.trim()) {
      setFormError('Delivery destination address is required.');
      return;
    }
    if (!warehouseId) {
      setFormError('Source fulfillment warehouse is required.');
      return;
    }
    if (lines.length === 0) {
      setFormError('At least one product line item is required.');
      return;
    }

    for (const line of lines) {
      if (line.quantity <= 0) {
        setFormError('Delivery quantity must be greater than zero.');
        return;
      }

      // Check stock availability
      const prod = products.find(p => p.id === line.productId);
      const available = prod?.available_stock ?? prod?.total_stock ?? 0;
      if (andValidate && line.quantity > available) {
        setFormError(`Insufficient stock for ${prod?.name || 'Product'}. Available: ${available}, requested: ${line.quantity}.`);
        toastError('Insufficient Stock', `Requested ${line.quantity} units, but only ${available} available.`);
        return;
      }
    }

    const payload = {
      warehouse_id: warehouseId,
      contact: contact.trim(),
      delivery_address: deliveryAddress.trim(),
      schedule_date: scheduleDate,
      operation_type: operationType,
      responsible_name: user?.full_name || 'Alex Vance',
      status: andValidate ? 'ready' as OperationStatus : statusToSet,
      items: lines.map(l => ({
        product_id: l.productId,
        quantity: Number(l.quantity)
      }))
    };

    const res = inventoryService.createDelivery(payload);
    if (res.success && res.delivery) {
      if (andValidate) {
        const valRes = inventoryService.validateDelivery(res.delivery.id);
        if (valRes.success) {
          success('Delivery Dispatched', `${res.delivery.reference} validated! Inventory decreased.`);
          router.push(`/operations/deliveries/${res.delivery.id}`);
          return;
        } else {
          setFormError(valRes.error || 'Validation failed.');
          toastError('Validation Failed', valRes.error);
          return;
        }
      }
      success('Delivery Order Created', `${res.delivery.reference} saved with status ${statusToSet.toUpperCase()}.`);
      router.push(`/operations/deliveries/${res.delivery.id}`);
    } else {
      setFormError(res.error || 'Failed to create delivery.');
      toastError('Creation Failed', res.error);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Link
            href="/operations/deliveries"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Delivery Orders</span>
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            Outbound Dispatch
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Boxes className="w-6 h-6 text-rose-500" />
            New Delivery Order
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch items to customers or job sites with mandatory inventory availability safeguards
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
                Contact / Customer <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Azure Interior"
                value={contact}
                onChange={e => setContact(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fulfillment Warehouse <span className="text-rose-400">*</span>
              </label>
              <select
                value={warehouseId}
                onChange={e => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-rose-500/60"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Delivery Destination Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 45 Design Center Way, Suite 10, Chicago, IL"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Schedule Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-rose-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Operation Type
                </label>
                <select
                  value={operationType}
                  onChange={e => setOperationType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-rose-500/60"
                >
                  <option value="Customer Delivery">Customer Delivery</option>
                  <option value="Site Project Outflow">Site Project Outflow</option>
                  <option value="Sample Dispatch">Sample Dispatch</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Lines Table */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Requested Line Items</h3>
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-rose-500/40 text-slate-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-rose-400" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="space-y-2">
              {lines.map((line, idx) => {
                const prod = products.find(p => p.id === line.productId);
                const available = prod?.available_stock ?? prod?.total_stock ?? 0;
                const isInsufficient = line.quantity > available;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl bg-slate-900/60 border ${isInsufficient ? 'border-rose-500/70 bg-rose-950/20' : 'border-slate-800'} flex flex-col md:flex-row items-center gap-3 transition-colors`}
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
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full md:w-36">
                      <label className="block text-[10px] text-slate-400 font-mono mb-1">Available In Stock</label>
                      <div className="px-3 py-2 rounded-lg bg-slate-800 text-xs font-mono font-bold text-slate-300">
                        {available} {prod?.unit || 'pcs'}
                      </div>
                    </div>

                    <div className="w-full md:w-36">
                      <label className="block text-[10px] text-slate-400 font-mono mb-1">
                        Quantity To Deliver
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={e => updateLine(idx, 'quantity', Number(e.target.value))}
                        className={`w-full px-3 py-2 rounded-lg bg-slate-900 border ${isInsufficient ? 'border-rose-500 text-rose-300 font-bold' : 'border-slate-700 text-white'} text-xs font-mono outline-none`}
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

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-800">
            <Link
              href="/operations/deliveries"
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
                <span>Ready for Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => handleCreate('ready', true)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-900/40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Validate & Ship Stock</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
