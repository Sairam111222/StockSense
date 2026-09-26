'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Boxes, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { Category, Warehouse, Location } from '@/types';
import { useToast } from '@/components/ui/toast';

export default function CreateProductPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [initialStock, setInitialStock] = useState('0');
  const [reorderLevel, setReorderLevel] = useState('10');
  const [warehouseId, setWarehouseId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [description, setDescription] = useState('');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const cats = inventoryService.getCategories();
    const whs = inventoryService.getWarehouses();
    const locs = inventoryService.getLocations();

    setCategories(cats);
    setWarehouses(whs);
    setLocations(locs);

    if (cats.length > 0) setCategoryId(cats[0].id);
    if (whs.length > 0) {
      setWarehouseId(whs[0].id);
      const firstWhLocs = locs.filter(l => l.warehouse_id === whs[0].id);
      if (firstWhLocs.length > 0) setLocationId(firstWhLocs[0].id);
    }
  }, []);

  const handleWarehouseChange = (whId: string) => {
    setWarehouseId(whId);
    const whLocs = locations.filter(l => l.warehouse_id === whId);
    if (whLocs.length > 0) setLocationId(whLocs[0].id);
    else setLocationId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Zod / validation checks
    if (!name.trim()) {
      setFormError('Product Name is required.');
      return;
    }
    if (!sku.trim()) {
      setFormError('SKU code is required.');
      return;
    }
    const initStockNum = Number(initialStock);
    if (isNaN(initStockNum) || initStockNum < 0) {
      setFormError('Initial stock cannot be negative.');
      return;
    }
    const reorderNum = Number(reorderLevel);
    if (isNaN(reorderNum) || reorderNum < 0) {
      setFormError('Reorder level threshold cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    const result = inventoryService.createProduct({
      name,
      sku,
      category_id: categoryId,
      unit,
      initial_stock: initStockNum,
      reorder_level: reorderNum,
      warehouse_id: warehouseId,
      location_id: locationId,
      description
    });

    setIsSubmitting(false);

    if (result.success && result.product) {
      success('Product Registered', `${result.product.name} (${result.product.sku}) created successfully.`);
      router.push(`/products/${result.product.id}`);
    } else {
      setFormError(result.error || 'Failed to create product.');
      toastError('Registration Failed', result.error);
    }
  };

  const filteredLocations = locations.filter(l => l.warehouse_id === warehouseId);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products Catalog</span>
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            Catalog Creation
          </span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Boxes className="w-6 h-6 text-rose-500" />
            New Product Specification
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Register a new SKU into the warehouse inventory system with automated safety reorder parameters
          </p>
        </div>

        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="command-card p-6 space-y-6">
          {/* Row 1: Name and SKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Product Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Structural Steel Rods 12mm"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                SKU / Product Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. RAW-STL-009"
                value={sku}
                onChange={e => setSku(e.target.value.toUpperCase())}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500/60"
              />
            </div>
          </div>

          {/* Row 2: Category and Unit of Measure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-rose-500/60"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Unit of Measure (UoM)
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-rose-500/60"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="bags">Bags (bags)</option>
                <option value="meters">Meters (m)</option>
                <option value="boxes">Boxes (boxes)</option>
                <option value="pairs">Pairs (pairs)</option>
                <option value="liters">Liters (L)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Initial Stock & Reorder Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Initial Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={initialStock}
                onChange={e => setInitialStock(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-rose-500/60"
              />
              <p className="text-[10px] text-slate-500 mt-1">Starting baseline inventory will be allocated to warehouse.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Reorder Safety Level <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="10"
                value={reorderLevel}
                onChange={e => setReorderLevel(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-rose-500/60"
              />
              <p className="text-[10px] text-slate-500 mt-1">Triggers low-stock warning when available stock falls below this.</p>
            </div>
          </div>

          {/* Row 4: Primary Warehouse & Location Allocation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary Warehouse <span className="text-rose-400">*</span>
              </label>
              <select
                value={warehouseId}
                onChange={e => handleWarehouseChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-rose-500/60"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bay / Storage Location
              </label>
              <select
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-rose-500/60"
              >
                {filteredLocations.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Product Description & Handling Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. ANSI safety rating, batch dimensions, storage requirements..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/60"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link
              href="/products"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white transition-all shadow-lg shadow-rose-900/40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Registering...' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
