'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  Building2,
  MapPin,
  Boxes,
  User,
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { Warehouse } from '@/types';
import { formatNumber } from '@/lib/utils';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    setWarehouses(inventoryService.getWarehouses());
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-rose-500" />
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Warehouses & Fulfillment Facilities
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-facility distribution network, bay capacities, and cross-facility logistics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {warehouses.map(w => {
            const prods = inventoryService.getProducts({ warehouseId: w.id });
            const totalStock = prods.reduce((sum, p) => sum + p.total_stock, 0);
            const lowStock = prods.filter(p => p.total_stock <= p.reorder_level).length;
            const locs = inventoryService.getLocations(w.id);

            return (
              <div
                key={w.id}
                className="command-card p-6 flex flex-col justify-between hover:border-rose-500/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-900 text-rose-400 border border-slate-700 font-bold">
                      {w.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                      {w.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-wide">{w.name}</h3>

                  <p className="text-xs text-slate-400 mt-2 flex items-start gap-1.5 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{w.address}</span>
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Facility Manager: <strong className="text-white">{w.manager_name || 'Alex Vance'}</strong></span>
                  </div>

                  {/* Summary Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center font-mono">
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">Bays</span>
                      <span className="text-sm font-bold text-white">{locs.length}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">SKUs</span>
                      <span className="text-sm font-bold text-slate-200">{prods.length}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">Stock</span>
                      <span className="text-sm font-bold text-emerald-400">{formatNumber(totalStock)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    {lowStock > 0 ? (
                      <span className="text-amber-400 font-semibold">{lowStock} SKUs Low</span>
                    ) : (
                      <span className="text-emerald-400">Nominal</span>
                    )}
                  </span>
                  <Link
                    href={`/warehouses/${w.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 group"
                  >
                    <span>Inspect Facility</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
