'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, ArrowRight, Warehouse, FileText, ArrowLeftRight, SlidersHorizontal } from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    id: string;
    title: string;
    subtitle: string;
    category: 'Product' | 'Receipt' | 'Delivery' | 'Transfer' | 'Warehouse' | 'Nav';
    href: string;
  }[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
          window.dispatchEvent(new CustomEvent('open_command_palette'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }

    const q = query.toLowerCase().trim();
    if (!q) {
      // Default navigation shortcuts
      setResults([
        { id: 'nav-dash', title: 'Dashboard', subtitle: 'Command Center & Analytics', category: 'Nav', href: '/dashboard' },
        { id: 'nav-prod', title: 'Products', subtitle: 'Catalog, stock levels & SKUs', category: 'Nav', href: '/products' },
        { id: 'nav-rec', title: 'Receipts (Vendor Inflow)', subtitle: 'Incoming vendor orders', category: 'Nav', href: '/operations/receipts' },
        { id: 'nav-del', title: 'Delivery Orders (Outflow)', subtitle: 'Customer shipments & fulfillment', category: 'Nav', href: '/operations/deliveries' },
        { id: 'nav-trans', title: 'Internal Transfers', subtitle: 'Inter-warehouse movement', category: 'Nav', href: '/operations/transfers' },
        { id: 'nav-adj', title: 'Inventory Adjustments', subtitle: 'Discrepancy count reconciliation', category: 'Nav', href: '/operations/adjustments' },
        { id: 'nav-led', title: 'Stock Ledger', subtitle: 'Immutable audit trail', category: 'Nav', href: '/ledger' }
      ]);
      return;
    }

    const items: typeof results = [];

    // Search products
    inventoryService.getProducts().forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) {
        items.push({
          id: `p-${p.id}`,
          title: p.name,
          subtitle: `SKU: ${p.sku} | ${p.total_stock} ${p.unit} in stock`,
          category: 'Product',
          href: `/products/${p.id}`
        });
      }
    });

    // Search receipts
    inventoryService.getReceipts().forEach(r => {
      if (r.reference.toLowerCase().includes(q) || (r.supplier_name && r.supplier_name.toLowerCase().includes(q))) {
        items.push({
          id: `r-${r.id}`,
          title: r.reference,
          subtitle: `Receipt from ${r.supplier_name || 'Vendor'} (${r.status.toUpperCase()})`,
          category: 'Receipt',
          href: `/operations/receipts/${r.id}`
        });
      }
    });

    // Search deliveries
    inventoryService.getDeliveries().forEach(d => {
      if (d.reference.toLowerCase().includes(q) || (d.contact && d.contact.toLowerCase().includes(q))) {
        items.push({
          id: `d-${d.id}`,
          title: d.reference,
          subtitle: `Delivery to ${d.contact || 'Customer'} (${d.status.toUpperCase()})`,
          category: 'Delivery',
          href: `/operations/deliveries/${d.id}`
        });
      }
    });

    // Search warehouses
    inventoryService.getWarehouses().forEach(w => {
      if (w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q)) {
        items.push({
          id: `w-${w.id}`,
          title: w.name,
          subtitle: `Code: ${w.code} - ${w.address}`,
          category: 'Warehouse',
          href: `/warehouses/${w.id}`
        });
      }
    });

    setResults(items.slice(0, 10));
  }, [query, isOpen]);

  if (!isOpen) return null;

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#0F172A] border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-rose-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, product, SKU, or reference (e.g. Steel, WH/OUT/0001)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No matching products, references, or commands found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            results.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.href)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 transition-colors text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 text-slate-300 group-hover:text-rose-400 group-hover:border-rose-500/30 transition-colors">
                    {item.category === 'Product' && <Package className="w-4 h-4" />}
                    {item.category === 'Receipt' && <FileText className="w-4 h-4" />}
                    {item.category === 'Delivery' && <FileText className="w-4 h-4" />}
                    {item.category === 'Transfer' && <ArrowLeftRight className="w-4 h-4" />}
                    {item.category === 'Warehouse' && <Warehouse className="w-4 h-4" />}
                    {item.category === 'Nav' && <SlidersHorizontal className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white group-hover:text-rose-300 truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
