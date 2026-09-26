'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  Building2,
  ArrowLeft,
  MapPin,
  User,
  Boxes,
  Truck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { Warehouse, Location, Product } from '@/types';
import { formatNumber } from '@/lib/utils';

export default function WarehouseDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [warehouse, setWarehouse] = useState<Warehouse | undefined>(undefined);
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!id) return;
    const w = inventoryService.getWarehouseById(id);
    setWarehouse(w);
    if (w) {
      setLocations(inventoryService.getLocations(w.id));
      setProducts(inventoryService.getProducts({ warehouseId: w.id }));
    }
  }, [id]);

  if (!warehouse) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-slate-400 text-sm">Warehouse not found.</p>
          <Link href="/warehouses" className="mt-4 inline-block text-xs font-semibold text-rose-400 hover:underline">
            &larr; Return to Warehouses
          </Link>
        </div>
      </AppShell>
    );
  }

  const totalStock = products.reduce((sum, p) => sum + p.total_stock, 0);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Link
            href="/warehouses"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Warehouses</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/operations/receipts/new?warehouse=${warehouse.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Incoming Intake</span>
            </Link>
            <Link
              href={`/operations/deliveries/new?warehouse=${warehouse.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-sm"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>New Outflow</span>
            </Link>
          </div>
        </div>

        {/* Facility Header Card */}
        <div className="command-card p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">{warehouse.name}</h1>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-900 text-rose-400 border border-rose-500/30 font-bold">
                  {warehouse.code}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                  {warehouse.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{warehouse.address}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Facility Manager</span>
              <span className="text-xs font-semibold text-white">{warehouse.manager_name || 'Alex Vance'}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 text-center font-mono">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 block">Storage Bays</span>
              <span className="text-lg font-bold text-white mt-0.5 block">{locations.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 block">Active SKUs</span>
              <span className="text-lg font-bold text-slate-200 mt-0.5 block">{products.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 block">Total Units Held</span>
              <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{formatNumber(totalStock)}</span>
            </div>
          </div>
        </div>

        {/* Locations / Storage Bays Table (Requirement 9) */}
        <div className="command-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">Storage Bays & Rack Capacities</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0A0E18] text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Bay Code</th>
                  <th className="py-2.5 px-3">Location Name</th>
                  <th className="py-2.5 px-3 text-right">Capacity (Max Units)</th>
                  <th className="py-2.5 px-3 text-right">Current Occupancy</th>
                  <th className="py-2.5 px-3">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {locations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No designated storage locations mapped for this warehouse.
                    </td>
                  </tr>
                ) : (
                  locations.map(loc => {
                    const currentQty = loc.current_quantity || 0;
                    const pct = Math.min(100, Math.round((currentQty / loc.capacity) * 100));
                    return (
                      <tr key={loc.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-mono font-bold text-rose-400">{loc.code}</td>
                        <td className="py-3 px-3 font-semibold text-white">{loc.name}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-400">{formatNumber(loc.capacity)}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">{formatNumber(currentQty)}</td>
                        <td className="py-3 px-3 w-48">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  pct > 85 ? 'bg-rose-500' : pct > 60 ? 'bg-amber-400' : 'bg-emerald-400'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-slate-400 w-8">{pct}%</span>
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

        {/* Assigned Products in this warehouse */}
        <div className="command-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">Products Assigned to this Facility</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{products.length} registered SKUs</span>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
            {products.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No products currently registered to this facility.</p>
            ) : (
              products.map(p => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <Link href={`/products/${p.id}`} className="text-xs font-semibold text-white hover:text-rose-400">
                      {p.name}
                    </Link>
                    <span className="text-[10px] font-mono text-slate-400 ml-2">({p.sku})</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-white">
                    {formatNumber(p.total_stock)} {p.unit}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
