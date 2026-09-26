'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Boxes, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { Category, Product } from '@/types';
import { useToast } from '@/components/ui/toast';

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | undefined>(undefined);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [reorderLevel, setReorderLevel] = useState('10');
  const [description, setDescription] = useState('');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const cats = inventoryService.getCategories();
    setCategories(cats);

    if (id) {
      const p = inventoryService.getProductById(id);
      if (p) {
        setProduct(p);
        setName(p.name);
        setSku(p.sku);
        setCategoryId(p.category_id);
        setUnit(p.unit);
        setReorderLevel(p.reorder_level.toString());
        setDescription(p.description || '');
      }
    }
  }, [id]);

  if (!product) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto py-12 text-center">
          <p className="text-slate-400 text-sm">Product not found.</p>
          <Link href="/products" className="mt-4 inline-block text-xs font-semibold text-rose-400 hover:underline">
            &larr; Return to Products
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Product Name is required.');
      return;
    }
    if (!sku.trim()) {
      setFormError('SKU code is required.');
      return;
    }
    const reorderNum = Number(reorderLevel);
    if (isNaN(reorderNum) || reorderNum < 0) {
      setFormError('Reorder level threshold cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    const cat = categories.find(c => c.id === categoryId);
    const res = inventoryService.updateProduct(product.id, {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category_id: categoryId,
      category_name: cat?.name || product.category_name,
      unit,
      reorder_level: reorderNum,
      description
    });

    setIsSubmitting(false);

    if (res.success && res.product) {
      success('Product Updated', `${res.product.name} updated successfully.`);
      router.push(`/products/${product.id}`);
    } else {
      setFormError(res.error || 'Failed to update product.');
      toastError('Update Failed', res.error);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Link
            href={`/products/${product.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Product Details</span>
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            Edit Mode
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Boxes className="w-6 h-6 text-rose-500" />
            Edit Product: {product.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Update catalogue metadata, SKU classification, and safety reorder thresholds
          </p>
        </div>

        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="command-card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Product Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
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
                value={sku}
                onChange={e => setSku(e.target.value.toUpperCase())}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Unit of Measure
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Reorder Threshold <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={e => setReorderLevel(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-rose-500/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description & Specifications
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/60"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link
              href={`/products/${product.id}`}
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
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
