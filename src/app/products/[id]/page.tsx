'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  Boxes,
  ArrowLeft,
  Edit,
  Building2,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowLeftRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { Product, StockLedgerEntry } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [locations, setLocations] = useState<{ warehouse: string; location: string; quantity: number }[]>([]);
  const [history, setHistory] = useState<StockLedgerEntry[]>([]);

  useEffect(() => {
    if (!id) return;
    const p = inventoryService.getProductById(id);
    setProduct(p);
    if (p) {
      setLocations(inventoryService.getProductLocations(p.id));
      const ledger = inventoryService.getStockLedger().filter(l => l.product_id === p.id);
      setHistory(ledger);
    }
  }, [id]);

  if (!product) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-slate-400 text-sm">Product not found or has been deleted.</p>
          <Link href="/products" className="mt-4 inline-block text-xs font-semibold text-rose-400 hover:underline">
            &larr; Return to Products Catalog
          </Link>
        </div>
      </AppShell>
    );
  }

  const isOutOfStock = product.total_stock <= 0;
  const isLowStock = !isOutOfStock && product.total_stock <= product.reorder_level;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/operations/receipts/new?product=${product.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40 transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Receive Stock</span>
            </Link>
            <Link
              href={`/products/${product.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-rose-500/40 text-white transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </Link>
          </div>
        </div>

        {/* Product Overview Header Card */}
        <div className="command-card p-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">{product.name}</h1>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-800 text-rose-300 border border-rose-500/30">
                  {product.sku}
                </span>
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" /> OUT OF STOCK
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> LOW STOCK
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> HEALTHY STOCK
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
                {product.description || 'No detailed specifications provided for this product.'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Category</span>
              <span className="text-xs font-semibold text-slate-200">{product.category_name}</span>
              <span className="text-[10px] uppercase font-mono text-slate-400 block mt-2">Unit of Measure</span>
              <span className="text-xs font-semibold text-slate-200 uppercase font-mono">{product.unit}</span>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Stock</span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                {formatNumber(product.total_stock)} <span className="text-xs font-normal text-slate-400">{product.unit}</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Available Stock</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
                {formatNumber(product.available_stock)} <span className="text-xs font-normal text-slate-400">{product.unit}</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Reserved Stock</span>
              <span className="text-xl font-bold font-mono text-amber-400 mt-0.5 block">
                {formatNumber(product.reserved_stock)} <span className="text-xs font-normal text-slate-400">{product.unit}</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Reorder Threshold</span>
              <span className="text-xl font-bold font-mono text-rose-400 mt-0.5 block">
                {formatNumber(product.reorder_level)} <span className="text-xs font-normal text-slate-400">{product.unit}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Locations Table (Requirement 2) */}
        <div className="command-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">Warehouse Locations Breakdown</h2>
            </div>
            <Link
              href="/operations/transfers/new"
              className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Transfer between locations
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Warehouse</th>
                  <th className="py-2.5 px-3">Storage Bay / Location</th>
                  <th className="py-2.5 px-3 text-right">Physical Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {locations.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-500">
                      No location allocations registered yet.
                    </td>
                  </tr>
                ) : (
                  locations.map((loc, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-white">{loc.warehouse}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{loc.location}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        {formatNumber(loc.quantity)} {product.unit}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Movement History Table (Requirement 2) */}
        <div className="command-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">Movement & Ledger Audit Trail</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {history.length} logged events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">From</th>
                  <th className="py-2.5 px-3">To</th>
                  <th className="py-2.5 px-3 text-right">Delta</th>
                  <th className="py-2.5 px-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No movement recorded for this product yet.
                    </td>
                  </tr>
                ) : (
                  history.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{formatDate(item.date || item.created_at)}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-rose-400">{item.reference}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {item.operation_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{item.source || item.warehouse_name}</td>
                      <td className="py-2.5 px-3 text-slate-300">{item.destination || item.location_name}</td>
                      <td className={`py-2.5 px-3 text-right font-mono font-bold ${item.quantity_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.quantity_change >= 0 ? `+${item.quantity_change}` : item.quantity_change}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{item.user_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
