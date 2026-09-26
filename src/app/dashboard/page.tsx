'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell, useWarehouseFilter } from '@/components/layout/app-shell';
import {
  Boxes,
  AlertTriangle,
  XCircle,
  Truck,
  ArrowLeftRight,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Package,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { StockMovementChart } from '@/components/dashboard/stock-chart';
import { CategoryStockChart } from '@/components/dashboard/category-chart';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatNumber, formatDate } from '@/lib/utils';
import { DashboardStats, SmartInsight, Product, StockMove, Warehouse } from '@/types';

export default function DashboardPage() {
  const { selectedWarehouse } = useWarehouseFilter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProductsInStock: 0,
    totalQuantity: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    internalTransfersCount: 0,
    totalWarehouses: 0
  });

  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentOperations, setRecentOperations] = useState<StockMove[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [chartDays, setChartDays] = useState<7 | 30 | 90>(7);

  // Filters
  const [docFilter, setDocFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = () => {
    const s = inventoryService.getDashboardStats(selectedWarehouse);
    setStats(s);

    setInsights(inventoryService.getSmartInsights());

    const prods = inventoryService.getProducts({ warehouseId: selectedWarehouse });
    setLowStockProducts(prods.filter(p => p.total_stock <= p.reorder_level));

    const recOps = inventoryService.getMoveHistory({
      type: docFilter !== 'all' ? docFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined
    });
    setRecentOperations(recOps.slice(0, 6));

    setWarehouses(inventoryService.getWarehouses());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('stocksense_state_updated', handleUpdate);
    return () => window.removeEventListener('stocksense_state_updated', handleUpdate);
  }, [selectedWarehouse, docFilter, statusFilter]);

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Top Header / Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Inventory Command Center
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live operational metrics, automated safety alerts, and stock ledger telemetry
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/operations/receipts/new"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-rose-500/40 text-slate-200 hover:text-white transition-all shadow-sm"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Receipt</span>
            </Link>
            <Link
              href="/operations/deliveries/new"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-900/30"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>+ Delivery</span>
            </Link>
          </div>
        </div>

        {/* TOP KPI CARDS (Calculated strictly from live database state) */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* 1. In Stock */}
          <div className="command-card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total In Stock</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-white tracking-tight">
                {formatNumber(stats.totalProductsInStock)}
              </span>
              <span className="text-[10px] text-slate-400 ml-1.5 font-mono">active SKUs</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">{formatNumber(stats.totalQuantity)} units held</p>
          </div>

          {/* 2. Low Stock */}
          <div className="command-card p-4 flex flex-col justify-between border-amber-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">Low Stock</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-amber-300 tracking-tight">
                {formatNumber(stats.lowStockCount)}
              </span>
              <span className="text-[10px] text-amber-400/80 ml-1.5 font-mono">below reorder</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Requires procurement</p>
          </div>

          {/* 3. Out of Stock */}
          <div className="command-card p-4 flex flex-col justify-between border-rose-500/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400">Out of Stock</span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-rose-400 tracking-tight">
                {formatNumber(stats.outOfStockCount)}
              </span>
              <span className="text-[10px] text-rose-300/80 ml-1.5 font-mono">critical items</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">0 units remaining</p>
          </div>

          {/* 4. Pending Receipts */}
          <div className="command-card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Pending Receipts</span>
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-white tracking-tight">
                {formatNumber(stats.pendingReceipts)}
              </span>
              <span className="text-[10px] text-sky-400 ml-1.5 font-mono">inbound</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Awaiting verification</p>
          </div>

          {/* 5. Pending Deliveries */}
          <div className="command-card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Pending Deliveries</span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-white tracking-tight">
                {formatNumber(stats.pendingDeliveries)}
              </span>
              <span className="text-[10px] text-rose-400 ml-1.5 font-mono">outbound</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Pending dispatch</p>
          </div>

          {/* 6. Internal Transfers */}
          <div className="command-card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Transfers</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-white tracking-tight">
                {formatNumber(stats.internalTransfersCount)}
              </span>
              <span className="text-[10px] text-indigo-400 ml-1.5 font-mono">active</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Inter-warehouse moves</p>
          </div>
        </div>

        {/* SMART INSIGHTS SECTION (Requirement 32) */}
        <div className="command-card p-4 sm:p-5 bg-gradient-to-r from-[#0F172A] via-[#111A2E] to-[#0F172A] border-rose-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Smart Inventory Insights</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300">
                Rule-Based Telemetry
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.map(ins => (
              <div
                key={ins.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-white tracking-wide">{ins.title}</span>
                    {ins.metric && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {ins.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{ins.description}</p>
                </div>
                {ins.actionLink && (
                  <Link
                    href={ins.actionLink}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 mt-3 group"
                  >
                    <span>{ins.actionText || 'Take Action'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION B & C: CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Stock Movement Chart (2 Columns) */}
          <div className="command-card p-5 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Stock Movement Telemetry
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inflow, Outflow & Internal Transfer volume across time
                </p>
              </div>

              {/* 7d / 30d / 90d Selector */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                {([7, 30, 90] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setChartDays(d)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      chartDays === d ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>

            <StockMovementChart days={chartDays} />
          </div>

          {/* Category Breakdown Chart (1 Column) */}
          <div className="command-card p-5">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Boxes className="w-4 h-4 text-rose-400" />
                Inventory by Category
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current unit quantity distribution
              </p>
            </div>

            <CategoryStockChart />
          </div>
        </div>

        {/* SECTION D & E: LOW STOCK ALERTS & RECENT OPERATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Low Stock Alerts */}
          <div className="command-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">Low Stock & Safety Alerts</h3>
              </div>
              <Link href="/alerts" className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-semibold">
                Manage Alerts <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800/60 mt-2 max-h-80 overflow-y-auto">
              {lowStockProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2 opacity-80" />
                  All active products are above safety threshold levels.
                </div>
              ) : (
                lowStockProducts.map(p => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/products/${p.id}`} className="text-xs font-semibold text-white hover:text-rose-400 truncate">
                          {p.name}
                        </Link>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {p.sku}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Warehouse: <span className="text-slate-300">{p.warehouse_name || 'Main Warehouse'}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className={`text-xs font-bold font-mono ${p.total_stock <= 0 ? 'text-rose-400' : 'text-amber-300'}`}>
                          {p.total_stock} {p.unit}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">/ reorder: {p.reorder_level}</span>
                      </div>
                      <Link
                        href={`/operations/receipts/new?product=${p.id}`}
                        className="inline-block mt-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                      >
                        Reorder Stock
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Operations */}
          <div className="command-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">Recent Operations</h3>
              </div>

              {/* Filters for Document Type & Status */}
              <div className="flex items-center gap-2">
                <select
                  value={docFilter}
                  onChange={e => setDocFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="incoming">Receipts</option>
                  <option value="outgoing">Deliveries</option>
                  <option value="internal">Transfers</option>
                  <option value="adjustment">Adjustments</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="ready">Ready</option>
                  <option value="waiting">Waiting</option>
                  <option value="done">Done</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-800/60 mt-2 max-h-80 overflow-y-auto">
              {recentOperations.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No operations match the selected criteria.
                </div>
              ) : (
                recentOperations.map(op => (
                  <div key={op.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-rose-400">{op.reference}</span>
                        <StatusBadge status={op.status} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                        {op.product_name} &bull; <span className="font-mono text-white">{op.quantity} {op.unit}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {op.from} &rarr; {op.to}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono block">{formatDate(op.date)}</span>
                      <Link
                        href={
                          op.reference.startsWith('WH/IN')
                            ? `/operations/receipts/${op.reference}`
                            : op.reference.startsWith('WH/OUT')
                            ? `/operations/deliveries/${op.reference}`
                            : op.reference.startsWith('WH/INT')
                            ? `/operations/transfers/${op.reference}`
                            : `/operations/adjustments`
                        }
                        className="text-[10px] text-rose-400 hover:underline mt-1 inline-block"
                      >
                        Inspect &rarr;
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SECTION F: WAREHOUSE SUMMARY */}
        <div className="command-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">Multi-Warehouse Facility Overview</h3>
            </div>
            <Link href="/warehouses" className="text-xs text-rose-400 hover:underline font-semibold flex items-center gap-1">
              All Facilities <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {warehouses.map(w => {
              const whProds = inventoryService.getProducts({ warehouseId: w.id });
              const whQty = whProds.reduce((sum, p) => sum + p.total_stock, 0);
              const whLow = whProds.filter(p => p.total_stock <= p.reorder_level).length;
              return (
                <div key={w.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-white tracking-wide">{w.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-rose-300 border border-slate-700">
                      {w.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-3">{w.address}</p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">SKUs</span>
                      <span className="text-xs font-bold text-slate-200">{whProds.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Stock</span>
                      <span className="text-xs font-bold text-emerald-400">{formatNumber(whQty)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Low</span>
                      <span className={`text-xs font-bold ${whLow > 0 ? 'text-amber-400' : 'text-slate-400'}`}>{whLow}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
