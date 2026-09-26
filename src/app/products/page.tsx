'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  Boxes,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package
} from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { Product, Category, Warehouse } from '@/types';
import { formatNumber } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { EmptyState } from '@/components/ui/empty-state';

export default function ProductsPage() {
  const { success, error: toastError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'sku' | 'total_stock'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadData = () => {
    setProducts(
      inventoryService.getProducts({
        search,
        categoryId: categoryFilter,
        warehouseId: warehouseFilter,
        stockStatus: stockFilter
      })
    );
    setCategories(inventoryService.getCategories());
    setWarehouses(inventoryService.getWarehouses());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('stocksense_state_updated', handleUpdate);
    return () => window.removeEventListener('stocksense_state_updated', handleUpdate);
  }, [search, categoryFilter, warehouseFilter, stockFilter]);

  // Sort
  const sortedProducts = [...products].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'name') comparison = a.name.localeCompare(b.name);
    else if (sortField === 'sku') comparison = a.sku.localeCompare(b.sku);
    else if (sortField === 'total_stock') comparison = a.total_stock - b.total_stock;
    return sortAsc ? comparison : -comparison;
  });

  // Paginate
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This will remove its inventory records.`)) {
      const res = inventoryService.deleteProduct(id);
      if (res.success) {
        success('Product Deleted', `${name} has been removed from catalog.`);
        loadData();
      } else {
        toastError('Action Failed', res.error);
      }
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-rose-500" />
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Products & Inventory Catalog
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Centralized product registry, SKU indexing, and stock reservation tracking
            </p>
          </div>

          <Link
            href="/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-900/30 w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Create Product</span>
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div className="command-card p-4 flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-44 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Warehouse Filter */}
          <select
            value={warehouseFilter}
            onChange={e => {
              setWarehouseFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-44 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={stockFilter}
            onChange={e => {
              setStockFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-40 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="command-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0A0E18] text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                  <th
                    className="p-3.5 cursor-pointer hover:text-white transition-colors"
                    onClick={() => {
                      if (sortField === 'name') setSortAsc(!sortAsc);
                      else { setSortField('name'); setSortAsc(true); }
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Product</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-white transition-colors"
                    onClick={() => {
                      if (sortField === 'sku') setSortAsc(!sortAsc);
                      else { setSortField('sku'); setSortAsc(true); }
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>SKU</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Unit</th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-white transition-colors text-right"
                    onClick={() => {
                      if (sortField === 'total_stock') setSortAsc(!sortAsc);
                      else { setSortField('total_stock'); setSortAsc(true); }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Available</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5 text-right">Reserved</th>
                  <th className="p-3.5 text-right">Reorder Level</th>
                  <th className="p-3.5">Warehouse</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center">
                      <EmptyState
                        icon={Package}
                        title="No Products Found"
                        description="Try modifying your search keywords or adjusting your filters."
                        actionText="Create Product"
                        actionHref="/products/new"
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map(product => {
                    const isOutOfStock = product.total_stock <= 0;
                    const isLowStock = !isOutOfStock && product.total_stock <= product.reorder_level;

                    return (
                      <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5">
                          <Link href={`/products/${product.id}`} className="font-semibold text-white hover:text-rose-400 transition-colors">
                            {product.name}
                          </Link>
                          {product.description && (
                            <p className="text-[10px] text-slate-500 line-clamp-1 max-w-xs">{product.description}</p>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-slate-300 font-medium">
                          {product.sku}
                        </td>
                        <td className="p-3.5 text-slate-300">
                          {product.category_name || 'General'}
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono">
                          {product.unit}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-white">
                          {formatNumber(product.available_stock)}
                        </td>
                        <td className="p-3.5 text-right font-mono text-slate-400">
                          {product.reserved_stock}
                        </td>
                        <td className="p-3.5 text-right font-mono text-slate-400">
                          {product.reorder_level}
                        </td>
                        <td className="p-3.5 text-slate-300">
                          {product.warehouse_name || 'Main Warehouse'}
                        </td>
                        <td className="p-3.5 text-center">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-500/40">
                              <XCircle className="w-3 h-3 text-rose-400" /> OUT
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40">
                              <AlertTriangle className="w-3 h-3 text-amber-400" /> LOW
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> OK
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/products/${product.id}`}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/products/${product.id}/edit`}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3.5 border-t border-slate-800/80 bg-[#0A0E18] text-xs">
              <span className="text-slate-400 font-mono">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} items
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                >
                  Previous
                </button>
                <span className="px-3 py-1 font-mono text-slate-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
