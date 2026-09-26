'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  Boxes,
  ArrowLeft,
  CheckCircle2,
  Printer,
  XCircle,
  Building2,
  MapPin,
  Calendar,
  AlertTriangle,
  User,
  Plus,
  Trash2
} from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { Delivery, Product } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';

export default function DeliveryDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [delivery, setDelivery] = useState<Delivery | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAddProductId, setSelectedAddProductId] = useState('');
  const [addQty, setAddQty] = useState(1);
  const [validationError, setValidationError] = useState('');

  const loadData = () => {
    if (!id) return;
    const d = inventoryService.getDeliveryById(id);
    setDelivery(d);
    setProducts(inventoryService.getProducts());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('stocksense_state_updated', handleUpdate);
    return () => window.removeEventListener('stocksense_state_updated', handleUpdate);
  }, [id]);

  if (!delivery) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-slate-400 text-sm">Delivery order not found.</p>
          <Link href="/operations/deliveries" className="mt-4 inline-block text-xs font-semibold text-rose-400 hover:underline">
            &larr; Return to Delivery Orders
          </Link>
        </div>
      </AppShell>
    );
  }

  // Pre-validate check for UI warning
  const insufficientItems = delivery.items.filter(it => {
    const prod = products.find(p => p.id === it.product_id);
    const available = prod?.available_stock ?? prod?.total_stock ?? 0;
    return it.quantity > available;
  });

  const handleValidate = () => {
    setValidationError('');
    const res = inventoryService.validateDelivery(delivery.id);
    if (res.success) {
      success('Delivery Validated', `${delivery.reference} completed! Stock deducted and recorded in ledger.`);
      loadData();
    } else {
      setValidationError(res.error || 'Validation failed due to stock shortfall.');
      toastError('Validation Blocked', res.error);
    }
  };

  const handleCancel = () => {
    if (confirm(`Cancel delivery ${delivery.reference}?`)) {
      inventoryService.updateDeliveryStatus(delivery.id, 'canceled');
      success('Delivery Canceled', `${delivery.reference} marked as canceled.`);
      loadData();
    }
  };

  const handleAddProduct = () => {
    if (!selectedAddProductId) return;
    const prod = products.find(p => p.id === selectedAddProductId);
    if (!prod) return;

    // Append product item to delivery
    const updatedItems = [
      ...delivery.items,
      {
        id: `di-${Date.now()}`,
        delivery_id: delivery.id,
        product_id: prod.id,
        product_name: prod.name,
        sku: prod.sku,
        unit: prod.unit,
        quantity: addQty,
        available_quantity: prod.available_stock
      }
    ];

    delivery.items = updatedItems;
    setIsAddModalOpen(false);
    success('Line Added', `${prod.name} added to delivery.`);
  };

  const steps = ['draft', 'waiting', 'ready', 'done'];
  const currentStepIdx = steps.indexOf(delivery.status);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/operations/deliveries"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Delivery Orders</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/operations/deliveries/${delivery.id}/print`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:text-white text-slate-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </Link>
            {delivery.status !== 'done' && delivery.status !== 'canceled' && (
              <>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-rose-400 hover:bg-rose-950/20 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleValidate}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-900/40"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Validate Delivery</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Workflow Progression Stepper (Mockup: Draft -> Waiting -> Ready -> Done) */}
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
                          ? 'bg-rose-500 text-white ring-4 ring-rose-500/20 shadow-lg shadow-rose-900/40'
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
                        isPast || (isCurrent && idx < currentStepIdx) ? 'bg-rose-500/60' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning if insufficient stock */}
        {(validationError || insufficientItems.length > 0) && delivery.status !== 'done' && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500 text-rose-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-100">Insufficient Warehouse Stock Detected</p>
              <p className="mt-1 leading-relaxed text-rose-200/90">
                {validationError ||
                  `One or more requested product lines exceed available stock. Validation is prohibited until inventory is replenished.`}
              </p>
            </div>
          </div>
        )}

        {/* Delivery Spec Card (Mockup detail layout) */}
        <div className="command-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wide">
                  {delivery.reference}
                </span>
                <StatusBadge status={delivery.status} size="md" />
              </div>
              <p className="text-xs text-slate-400 mt-1">{delivery.operation_type}</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Schedule Date</span>
              <span className="text-xs font-mono font-semibold text-slate-200">{formatDate(delivery.schedule_date)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Customer / Contact</span>
              <p className="text-xs font-bold text-white">{delivery.contact || 'Client'}</p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{delivery.delivery_address}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Source Warehouse</span>
              <p className="text-xs font-bold text-white">{delivery.warehouse_name}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Responsible Agent</span>
              <p className="text-xs font-bold text-white">{delivery.responsible_name}</p>
            </div>
          </div>

          {/* Products Table */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Products To Deliver</h3>
              {delivery.status !== 'done' && delivery.status !== 'canceled' && (
                <button
                  onClick={() => {
                    if (products.length > 0) setSelectedAddProductId(products[0].id);
                    setIsAddModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-rose-500/40 text-slate-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-rose-400" />
                  <span>Add New Product</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0A0E18] text-slate-400 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-right">Available</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3 text-center">Stock Check</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {delivery.items.map(item => {
                    const prod = products.find(p => p.id === item.product_id);
                    const avail = prod?.available_stock ?? prod?.total_stock ?? 0;
                    const isShort = item.quantity > avail;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-semibold text-white">
                          <Link href={`/products/${item.product_id}`} className="hover:text-rose-400">
                            {item.product_name}
                          </Link>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">{item.sku}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-400">{avail}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-white">{item.quantity}</td>
                        <td className="py-3 px-3 font-mono text-slate-400">{item.unit || 'pcs'}</td>
                        <td className="py-3 px-3 text-center">
                          {isShort && delivery.status !== 'done' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
                              <AlertTriangle className="w-3 h-3 text-rose-400" /> Shortage
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Available
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {delivery.status === 'done' && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                This delivery order has been validated and dispatched. Inventory was deducted transactionally and logged in the Stock Ledger.
              </span>
            </div>
          )}
        </div>

        {/* Modal: Add New Product Line to Delivery */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Product to Delivery"
          description="Select an available inventory SKU and specify requested quantity"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Product</label>
              <select
                value={selectedAddProductId}
                onChange={e => setSelectedAddProductId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) - {p.available_stock} {p.unit} available
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quantity</label>
              <input
                type="number"
                min="1"
                value={addQty}
                onChange={e => setAddQty(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Add Line Item
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
