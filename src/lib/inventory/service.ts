import {
  Product,
  InventoryItem,
  Warehouse,
  Location,
  Category,
  Supplier,
  Receipt,
  Delivery,
  InternalTransfer,
  InventoryAdjustment,
  StockLedgerEntry,
  StockMove,
  Alert,
  SmartInsight,
  DashboardStats,
  OperationStatus
} from '@/types';

import {
  INITIAL_PROFILES,
  INITIAL_CATEGORIES,
  INITIAL_WAREHOUSES,
  INITIAL_LOCATIONS,
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_INVENTORY,
  INITIAL_RECEIPTS,
  INITIAL_DELIVERIES,
  INITIAL_TRANSFERS,
  INITIAL_ADJUSTMENTS,
  INITIAL_LEDGER,
  INITIAL_ALERTS
} from '@/lib/store/demo-data';

interface AppState {
  categories: Category[];
  warehouses: Warehouse[];
  locations: Location[];
  suppliers: Supplier[];
  products: Product[];
  inventory: InventoryItem[];
  receipts: Receipt[];
  deliveries: Delivery[];
  transfers: InternalTransfer[];
  adjustments: InventoryAdjustment[];
  ledger: StockLedgerEntry[];
  alerts: Alert[];
}

const STORAGE_KEY = 'stocksense_app_state_v1';

// Server-side baseline memory state
let memoryState: AppState = {
  categories: [...INITIAL_CATEGORIES],
  warehouses: [...INITIAL_WAREHOUSES],
  locations: [...INITIAL_LOCATIONS],
  suppliers: [...INITIAL_SUPPLIERS],
  products: [...INITIAL_PRODUCTS],
  inventory: [...INITIAL_INVENTORY],
  receipts: [...INITIAL_RECEIPTS],
  deliveries: [...INITIAL_DELIVERIES],
  transfers: [...INITIAL_TRANSFERS],
  adjustments: [...INITIAL_ADJUSTMENTS],
  ledger: [...INITIAL_LEDGER],
  alerts: [...INITIAL_ALERTS]
};

function getState(): AppState {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using memory state', e);
    }
  }
  return memoryState;
}

function saveState(state: AppState) {
  memoryState = state;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new Event('stocksense_state_updated'));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }
}

// -------------------------------------------------------------
// RECALCULATE STOCK AND REORDER ALERTS
// -------------------------------------------------------------
function syncProductStockAndAlerts(state: AppState) {
  state.products = state.products.map(p => {
    const items = state.inventory.filter(i => i.product_id === p.id);
    const total = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const reserved = items.reduce((sum, item) => sum + Number(item.reserved_quantity || 0), 0);
    const available = Math.max(0, total - reserved);
    return {
      ...p,
      total_stock: total,
      reserved_stock: reserved,
      available_stock: available,
      updated_at: new Date().toISOString()
    };
  });

  // Dynamic alerts generation
  const activeAlerts: Alert[] = [];

  state.products.forEach(product => {
    if (product.total_stock <= 0) {
      activeAlerts.push({
        id: `al-oos-${product.id}`,
        type: 'OUT_OF_STOCK',
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        warehouse_id: product.warehouse_id,
        warehouse_name: product.warehouse_name || 'Warehouse',
        current_stock: 0,
        reorder_level: product.reorder_level,
        message: `${product.name} (${product.sku}) is completely OUT OF STOCK! Immediate reorder required.`,
        severity: 'critical',
        read: false,
        created_at: new Date().toISOString()
      });
    } else if (product.total_stock <= product.reorder_level) {
      activeAlerts.push({
        id: `al-low-${product.id}`,
        type: 'LOW_STOCK',
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        warehouse_id: product.warehouse_id,
        warehouse_name: product.warehouse_name || 'Warehouse',
        current_stock: product.total_stock,
        reorder_level: product.reorder_level,
        message: `${product.name} is running low (${product.total_stock} ${product.unit} remaining, reorder threshold is ${product.reorder_level}).`,
        severity: 'warning',
        read: false,
        created_at: new Date().toISOString()
      });
    }
  });

  state.alerts = activeAlerts;
}

// -------------------------------------------------------------
// INVENTORY SERVICE
// -------------------------------------------------------------
export const inventoryService = {
  resetToDemo(): void {
    const freshState: AppState = {
      categories: [...INITIAL_CATEGORIES],
      warehouses: [...INITIAL_WAREHOUSES],
      locations: [...INITIAL_LOCATIONS],
      suppliers: [...INITIAL_SUPPLIERS],
      products: [...INITIAL_PRODUCTS],
      inventory: [...INITIAL_INVENTORY],
      receipts: [...INITIAL_RECEIPTS],
      deliveries: [...INITIAL_DELIVERIES],
      transfers: [...INITIAL_TRANSFERS],
      adjustments: [...INITIAL_ADJUSTMENTS],
      ledger: [...INITIAL_LEDGER],
      alerts: [...INITIAL_ALERTS]
    };
    saveState(freshState);
  },

  // --- DASHBOARD ---
  getDashboardStats(warehouseId?: string): DashboardStats {
    const state = getState();
    let prods = state.products;
    let receipts = state.receipts;
    let deliveries = state.deliveries;
    let transfers = state.transfers;

    if (warehouseId && warehouseId !== 'all') {
      prods = prods.filter(p => p.warehouse_id === warehouseId);
      receipts = receipts.filter(r => r.warehouse_id === warehouseId);
      deliveries = deliveries.filter(d => d.warehouse_id === warehouseId);
      transfers = transfers.filter(t => t.source_warehouse_id === warehouseId || t.destination_warehouse_id === warehouseId);
    }

    const totalProductsInStock = prods.filter(p => p.total_stock > 0).length;
    const totalQuantity = prods.reduce((sum, p) => sum + p.total_stock, 0);
    const lowStockCount = prods.filter(p => p.total_stock > 0 && p.total_stock <= p.reorder_level).length;
    const outOfStockCount = prods.filter(p => p.total_stock <= 0).length;
    const pendingReceipts = receipts.filter(r => r.status === 'draft' || r.status === 'waiting' || r.status === 'ready').length;
    const pendingDeliveries = deliveries.filter(d => d.status === 'draft' || d.status === 'waiting' || d.status === 'ready').length;
    const internalTransfersCount = transfers.filter(t => t.status === 'draft' || t.status === 'waiting' || t.status === 'ready').length;

    return {
      totalProductsInStock,
      totalQuantity,
      lowStockCount,
      outOfStockCount,
      pendingReceipts,
      pendingDeliveries,
      internalTransfersCount,
      totalWarehouses: state.warehouses.length
    };
  },

  getStockMovementChart(days: 7 | 30 | 90 = 7) {
    const state = getState();
    const result: { date: string; incoming: number; outgoing: number; adjustments: number; transfers: number }[] = [];

    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Match ledger records on this day
      const dayLedger = state.ledger.filter(l => l.date && l.date.startsWith(dateStr));

      let incoming = 0;
      let outgoing = 0;
      let adjustments = 0;
      let transfers = 0;

      dayLedger.forEach(l => {
        if (l.operation_type === 'RECEIPT' || l.operation_type === 'INITIAL_STOCK') {
          incoming += Math.max(0, l.quantity_change);
        } else if (l.operation_type === 'DELIVERY') {
          outgoing += Math.abs(l.quantity_change);
        } else if (l.operation_type === 'ADJUSTMENT') {
          adjustments += Math.abs(l.quantity_change);
        } else if (l.operation_type === 'INTERNAL_TRANSFER') {
          transfers += Math.abs(l.quantity_change);
        }
      });

      // Add baseline simulation for demo sparkle if ledger is sparse in early history
      if (i > 3 && incoming === 0 && outgoing === 0) {
        incoming = ((i * 13) % 40) + 10;
        outgoing = ((i * 17) % 30) + 5;
        transfers = (i % 3 === 0) ? 15 : 0;
      }

      result.push({
        date: displayStr,
        incoming,
        outgoing,
        adjustments,
        transfers
      });
    }

    return result;
  },

  getCategoryBreakdown() {
    const state = getState();
    const map = new Map<string, { name: string; quantity: number; count: number }>();

    state.categories.forEach(c => {
      map.set(c.id, { name: c.name, quantity: 0, count: 0 });
    });

    state.products.forEach(p => {
      const cat = map.get(p.category_id);
      if (cat) {
        cat.quantity += p.total_stock;
        cat.count += 1;
      }
    });

    return Array.from(map.values()).filter(c => c.count > 0 || c.quantity > 0);
  },

  getSmartInsights(): SmartInsight[] {
    const state = getState();
    const insights: SmartInsight[] = [];

    // 1. Critical replenishment
    const lowItems = state.products.filter(p => p.total_stock <= p.reorder_level);
    if (lowItems.length > 0) {
      insights.push({
        id: 'ins-replenish',
        title: `${lowItems.length} Products Require Replenishment`,
        description: `${lowItems.map(p => p.name).slice(0, 3).join(', ')} ${lowItems.length > 3 ? `and ${lowItems.length - 3} more` : ''} are at or below safety reorder levels.`,
        type: 'replenishment',
        priority: 'high',
        metric: `${lowItems.length} SKUs`,
        actionText: 'View Low Stock',
        actionLink: '/alerts'
      });
    }

    // 2. Warehouse concentration
    const totalInventoryQty = state.products.reduce((acc, p) => acc + p.total_stock, 0);
    const mainWhProducts = state.products.filter(p => p.warehouse_name === 'Main Warehouse');
    const mainWhQty = mainWhProducts.reduce((acc, p) => acc + p.total_stock, 0);
    if (totalInventoryQty > 0) {
      const pct = Math.round((mainWhQty / totalInventoryQty) * 100);
      insights.push({
        id: 'ins-distribution',
        title: `Main Warehouse Holds ${pct}% of Total Inventory`,
        description: `High concentration of stock in Chicago Hub. Consider load-balancing transfers to Production Warehouse to optimize fulfillment speed.`,
        type: 'distribution',
        priority: 'medium',
        metric: `${pct}% Share`,
        actionText: 'Transfer Stock',
        actionLink: '/operations/transfers/new'
      });
    }

    // 3. Operational pipeline
    const readyReceipts = state.receipts.filter(r => r.status === 'ready');
    const readyDeliveries = state.deliveries.filter(d => d.status === 'ready');
    insights.push({
      id: 'ins-ops',
      title: `${readyReceipts.length + readyDeliveries.length} Operations Ready for Validation`,
      description: `${readyReceipts.length} incoming vendor receipts and ${readyDeliveries.length} customer deliveries are verified and await warehouse manager sign-off.`,
      type: 'operations',
      priority: 'low',
      metric: 'Active Pipeline',
      actionText: 'Inspect Deliveries',
      actionLink: '/operations/deliveries'
    });

    return insights;
  },

  // --- PRODUCTS ---
  getProducts(filters?: { search?: string; categoryId?: string; warehouseId?: string; stockStatus?: string }): Product[] {
    const state = getState();
    let list = state.products;

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (filters?.categoryId && filters.categoryId !== 'all') {
      list = list.filter(p => p.category_id === filters.categoryId);
    }
    if (filters?.warehouseId && filters.warehouseId !== 'all') {
      list = list.filter(p => p.warehouse_id === filters.warehouseId);
    }
    if (filters?.stockStatus && filters.stockStatus !== 'all') {
      if (filters.stockStatus === 'in_stock') list = list.filter(p => p.total_stock > p.reorder_level);
      if (filters.stockStatus === 'low_stock') list = list.filter(p => p.total_stock > 0 && p.total_stock <= p.reorder_level);
      if (filters.stockStatus === 'out_of_stock') list = list.filter(p => p.total_stock <= 0);
    }

    return list;
  },

  getProductById(id: string): Product | undefined {
    return getState().products.find(p => p.id === id);
  },

  createProduct(data: {
    name: string;
    sku: string;
    category_id: string;
    unit: string;
    initial_stock?: number;
    reorder_level: number;
    warehouse_id: string;
    location_id?: string;
    description?: string;
  }): { success: boolean; product?: Product; error?: string } {
    const state = getState();

    // Check duplicate SKU
    if (state.products.some(p => p.sku.toUpperCase() === data.sku.toUpperCase().trim())) {
      return { success: false, error: `SKU "${data.sku.toUpperCase()}" already exists in the system.` };
    }

    const category = state.categories.find(c => c.id === data.category_id);
    const warehouse = state.warehouses.find(w => w.id === data.warehouse_id);
    const location = state.locations.find(l => l.id === data.location_id) || state.locations.find(l => l.warehouse_id === data.warehouse_id);

    const productId = `p-${Date.now()}`;
    const initialQty = Number(data.initial_stock || 0);

    const newProduct: Product = {
      id: productId,
      name: data.name.trim(),
      sku: data.sku.trim().toUpperCase(),
      category_id: data.category_id,
      category_name: category?.name || 'General',
      unit: data.unit || 'pcs',
      reorder_level: Number(data.reorder_level || 10),
      description: data.description,
      active: true,
      total_stock: initialQty,
      available_stock: initialQty,
      reserved_stock: 0,
      warehouse_id: data.warehouse_id,
      warehouse_name: warehouse?.name || 'Main Warehouse',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    state.products.unshift(newProduct);

    if (location && warehouse) {
      const inventoryId = `i-${Date.now()}`;
      state.inventory.push({
        id: inventoryId,
        product_id: productId,
        warehouse_id: warehouse.id,
        location_id: location.id,
        quantity: initialQty,
        reserved_quantity: 0,
        updated_at: new Date().toISOString()
      });

      if (initialQty > 0) {
        state.ledger.unshift({
          id: `g-${Date.now()}`,
          reference: 'INIT-MANUAL',
          date: new Date().toISOString(),
          operation_type: 'INITIAL_STOCK',
          product_id: productId,
          product_name: newProduct.name,
          sku: newProduct.sku,
          warehouse_id: warehouse.id,
          warehouse_name: warehouse.name,
          location_id: location.id,
          location_name: location.name,
          quantity_before: 0,
          quantity_change: initialQty,
          quantity_after: initialQty,
          user_name: 'Alex Vance',
          reason: 'Initial setup quantity',
          created_at: new Date().toISOString()
        });
      }
    }

    syncProductStockAndAlerts(state);
    saveState(state);
    return { success: true, product: newProduct };
  },

  updateProduct(id: string, updates: Partial<Product>): { success: boolean; product?: Product; error?: string } {
    const state = getState();
    const index = state.products.findIndex(p => p.id === id);
    if (index === -1) return { success: false, error: 'Product not found' };

    // Check duplicate SKU if changed
    if (updates.sku) {
      const duplicate = state.products.some(p => p.id !== id && p.sku.toUpperCase() === updates.sku!.toUpperCase());
      if (duplicate) return { success: false, error: `SKU "${updates.sku}" already in use by another product.` };
    }

    state.products[index] = {
      ...state.products[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    syncProductStockAndAlerts(state);
    saveState(state);
    return { success: true, product: state.products[index] };
  },

  deleteProduct(id: string): { success: boolean; error?: string } {
    const state = getState();
    state.products = state.products.filter(p => p.id !== id);
    state.inventory = state.inventory.filter(i => i.product_id !== id);
    syncProductStockAndAlerts(state);
    saveState(state);
    return { success: true };
  },

  // --- WAREHOUSES & LOCATIONS ---
  getWarehouses(): Warehouse[] {
    return getState().warehouses;
  },

  getWarehouseById(id: string): Warehouse | undefined {
    return getState().warehouses.find(w => w.id === id);
  },

  getLocations(warehouseId?: string): Location[] {
    const state = getState();
    if (warehouseId && warehouseId !== 'all') {
      return state.locations.filter(l => l.warehouse_id === warehouseId);
    }
    return state.locations;
  },

  getCategories(): Category[] {
    return getState().categories;
  },

  getSuppliers(): Supplier[] {
    return getState().suppliers;
  },

  getProductLocations(productId: string): { warehouse: string; location: string; quantity: number }[] {
    const state = getState();
    const items = state.inventory.filter(i => i.product_id === productId);
    return items.map(item => {
      const wh = state.warehouses.find(w => w.id === item.warehouse_id);
      const loc = state.locations.find(l => l.id === item.location_id);
      return {
        warehouse: wh?.name || 'Warehouse',
        location: loc?.name || loc?.code || 'Location',
        quantity: item.quantity
      };
    });
  },

  // --- RECEIPTS (Vendor Inflow) ---
  getReceipts(filters?: { status?: string; warehouseId?: string }): Receipt[] {
    const state = getState();
    let list = state.receipts;
    if (filters?.status && filters.status !== 'all') {
      list = list.filter(r => r.status === filters.status);
    }
    if (filters?.warehouseId && filters.warehouseId !== 'all') {
      list = list.filter(r => r.warehouse_id === filters.warehouseId);
    }
    return list;
  },

  getReceiptById(id: string): Receipt | undefined {
    return getState().receipts.find(r => r.id === id || r.reference === id);
  },

  createReceipt(data: {
    supplier_id: string;
    warehouse_id: string;
    schedule_date: string;
    responsible_name?: string;
    items: { product_id: string; expected_quantity: number; received_quantity: number }[];
    status?: OperationStatus;
  }): { success: boolean; receipt?: Receipt; error?: string } {
    const state = getState();
    const count = state.receipts.length + 1;
    const ref = `WH/IN/${count.toString().padStart(4, '0')}`;
    const supplier = state.suppliers.find(s => s.id === data.supplier_id);
    const warehouse = state.warehouses.find(w => w.id === data.warehouse_id);

    const receiptId = `r-${Date.now()}`;
    const items = data.items.map((it, idx) => {
      const prod = state.products.find(p => p.id === it.product_id);
      return {
        id: `ri-${Date.now()}-${idx}`,
        receipt_id: receiptId,
        product_id: it.product_id,
        product_name: prod?.name || 'Product',
        sku: prod?.sku || 'SKU',
        unit: prod?.unit || 'pcs',
        expected_quantity: Number(it.expected_quantity),
        received_quantity: Number(it.received_quantity ?? it.expected_quantity)
      };
    });

    const receipt: Receipt = {
      id: receiptId,
      reference: ref,
      supplier_id: data.supplier_id,
      supplier_name: supplier?.name || 'Supplier',
      warehouse_id: data.warehouse_id,
      warehouse_name: warehouse?.name || 'Main Warehouse',
      schedule_date: data.schedule_date || new Date().toISOString().split('T')[0],
      responsible_id: 'a0000001-0000-0000-0000-000000000001',
      responsible_name: data.responsible_name || 'Alex Vance',
      status: data.status || 'draft',
      items,
      created_at: new Date().toISOString()
    };

    state.receipts.unshift(receipt);
    saveState(state);
    return { success: true, receipt };
  },

  updateReceiptStatus(id: string, status: OperationStatus): { success: boolean; error?: string } {
    const state = getState();
    const r = state.receipts.find(rec => rec.id === id);
    if (!r) return { success: false, error: 'Receipt not found' };
    r.status = status;
    saveState(state);
    return { success: true };
  },

  // CRITICAL REQUIREMENT 3 & 13: Receipt validation increases stock atomically and creates stock ledger entries
  validateReceipt(id: string): { success: boolean; receipt?: Receipt; error?: string } {
    const state = getState();
    const receipt = state.receipts.find(r => r.id === id);
    if (!receipt) return { success: false, error: 'Receipt not found' };
    if (receipt.status === 'done') return { success: false, error: 'Receipt has already been validated.' };

    const warehouse = state.warehouses.find(w => w.id === receipt.warehouse_id);
    const location = state.locations.find(l => l.warehouse_id === receipt.warehouse_id) || state.locations[0];

    // Transactionally update inventory and create ledger entry for each item
    receipt.items.forEach(item => {
      const product = state.products.find(p => p.id === item.product_id);
      const qtyToAdd = Number(item.received_quantity || item.expected_quantity);

      // Find or create inventory line
      let inv = state.inventory.find(i => i.product_id === item.product_id && i.warehouse_id === receipt.warehouse_id);
      const beforeQty = inv ? inv.quantity : 0;

      if (!inv) {
        inv = {
          id: `i-${Date.now()}-${item.product_id}`,
          product_id: item.product_id,
          warehouse_id: receipt.warehouse_id,
          location_id: location?.id || 'l-default',
          quantity: 0,
          reserved_quantity: 0,
          updated_at: new Date().toISOString()
        };
        state.inventory.push(inv);
      }

      inv.quantity += qtyToAdd;
      inv.updated_at = new Date().toISOString();

      // Create Stock Ledger record
      state.ledger.unshift({
        id: `g-${Date.now()}-${item.id}`,
        reference: receipt.reference,
        date: new Date().toISOString(),
        operation_type: 'RECEIPT',
        product_id: item.product_id,
        product_name: product?.name || item.product_name || 'Product',
        sku: product?.sku || item.sku || 'SKU',
        warehouse_id: receipt.warehouse_id,
        warehouse_name: warehouse?.name || 'Warehouse',
        location_id: inv.location_id,
        location_name: location?.name || 'Stock Area',
        quantity_before: beforeQty,
        quantity_change: qtyToAdd,
        quantity_after: inv.quantity,
        source: receipt.supplier_name,
        destination: `${warehouse?.name} (${location?.name || 'Main Bay'})`,
        user_name: receipt.responsible_name || 'Warehouse Staff',
        reason: `Vendor Receipt Intake from ${receipt.supplier_name}`,
        created_at: new Date().toISOString()
      });
    });

    receipt.status = 'done';
    receipt.validated_at = new Date().toISOString();

    syncProductStockAndAlerts(state);
    saveState(state);
    return { success: true, receipt };
  },

  // --- DELIVERIES (Customer Outflow) ---
  getDeliveries(filters?: { status?: string; warehouseId?: string }): Delivery[] {
    const state = getState();
    let list = state.deliveries;
    if (filters?.status && filters.status !== 'all') {
      list = list.filter(d => d.status === filters.status);
    }
    if (filters?.warehouseId && filters.warehouseId !== 'all') {
      list = list.filter(d => d.warehouse_id === filters.warehouseId);
    }
    return list;
  },

  getDeliveryById(id: string): Delivery | undefined {
    return getState().deliveries.find(d => d.id === id || d.reference === id);
  },

  createDelivery(data: {
    warehouse_id: string;
    contact: string;
    delivery_address: string;
    schedule_date: string;
    operation_type?: string;
    responsible_name?: string;
    items: { product_id: string; quantity: number }[];
    status?: OperationStatus;
  }): { success: boolean; delivery?: Delivery; error?: string } {
    const state = getState();
    const count = state.deliveries.length + 1;
    const ref = `WH/OUT/${count.toString().padStart(4, '0')}`;
    const warehouse = state.warehouses.find(w => w.id === data.warehouse_id);

    const deliveryId = `d-${Date.now()}`;
    const items = data.items.map((it, idx) => {
      const prod = state.products.find(p => p.id === it.product_id);
      return {
        id: `di-${Date.now()}-${idx}`,
        delivery_id: deliveryId,
        product_id: it.product_id,
        product_name: prod?.name || 'Product',
        sku: prod?.sku || 'SKU',
        unit: prod?.unit || 'pcs',
        quantity: Number(it.quantity),
        available_quantity: prod?.available_stock ?? prod?.total_stock ?? 0
      };
    });

    const delivery: Delivery = {
      id: deliveryId,
      reference: ref,
      warehouse_id: data.warehouse_id,
      warehouse_name: warehouse?.name || 'Main Warehouse',
      contact: data.contact,
      delivery_address: data.delivery_address,
      schedule_date: data.schedule_date || new Date().toISOString().split('T')[0],
      responsible_id: 'a0000001-0000-0000-0000-000000000001',
      responsible_name: data.responsible_name || 'Alex Vance',
      operation_type: data.operation_type || 'Customer Delivery',
      status: data.status || 'draft',
      items,
      created_at: new Date().toISOString()
    };

    state.deliveries.unshift(delivery);
    saveState(state);
    return { success: true, delivery };
  },

  updateDeliveryStatus(id: string, status: OperationStatus): { success: boolean; error?: string } {
    const state = getState();
    const d = state.deliveries.find(del => del.id === id);
    if (!d) return { success: false, error: 'Delivery order not found' };
    d.status = status;
    saveState(state);
    return { success: true };
  },

  // CRITICAL REQUIREMENT 4 & 13: Delivery validation decreases stock and rejects if insufficient
  validateDelivery(id: string): { success: boolean; delivery?: Delivery; error?: string } {
    const state = getState();
    const delivery = state.deliveries.find(d => d.id === id);
    if (!delivery) return { success: false, error: 'Delivery order not found' };
    if (delivery.status === 'done') return { success: false, error: 'Delivery has already been validated and shipped.' };

    const warehouse = state.warehouses.find(w => w.id === delivery.warehouse_id);

    // PRE-CHECK: Verify all lines have sufficient stock first!
    for (const item of delivery.items) {
      const inv = state.inventory.find(i => i.product_id === item.product_id && i.warehouse_id === delivery.warehouse_id);
      const currentStock = inv ? inv.quantity : 0;
      if (currentStock < item.quantity) {
        const prod = state.products.find(p => p.id === item.product_id);
        return {
          success: false,
          error: `Insufficient stock for ${prod?.name || 'Product'}. Available: ${currentStock}, requested: ${item.quantity}.`
        };
      }
    }

    // ATOMIC EXECUTION: All lines are guaranteed sufficient
    delivery.items.forEach(item => {
      const inv = state.inventory.find(i => i.product_id === item.product_id && i.warehouse_id === delivery.warehouse_id)!;
      const product = state.products.find(p => p.id === item.product_id);
      const location = state.locations.find(l => l.id === inv.location_id);
      const beforeQty = inv.quantity;
      const requested = Number(item.quantity);

      inv.quantity -= requested;
      inv.updated_at = new Date().toISOString();

      // Create Stock Ledger record
      state.ledger.unshift({
        id: `g-${Date.now()}-${item.id}`,
        reference: delivery.reference,
        date: new Date().toISOString(),
        operation_type: 'DELIVERY',
        product_id: item.product_id,
        product_name: product?.name || item.product_name || 'Product',
        sku: product?.sku || item.sku || 'SKU',
        warehouse_id: delivery.warehouse_id,
        warehouse_name: warehouse?.name || 'Warehouse',
        location_id: inv.location_id,
        location_name: location?.name || 'Dispatched Area',
        quantity_before: beforeQty,
        quantity_change: -requested,
        quantity_after: inv.quantity,
        source: `${warehouse?.name} (${location?.name || 'Storage Bay'})`,
        destination: delivery.contact ? `${delivery.contact} - ${delivery.delivery_address}` : delivery.delivery_address,
        user_name: delivery.responsible_name || 'Warehouse Staff',
        reason: `Customer Delivery Order to ${delivery.contact || 'Client'}`,
        created_at: new Date().toISOString()
      });
    });

    delivery.status = 'done';
    delivery.validated_at = new Date().toISOString();

    syncProductStockAndAlerts(state);
    saveState(state);
    return { success: true, delivery };
  },

  // --- INTERNAL TRANSFERS ---
  getTransfers(filters?: { status?: string }): InternalTransfer[] {
    const state = getState();
    let list = state.transfers;
    if (filters?.status && filters.status !== 'all') {
      list = list.filter(t => t.status === filters.status);
    }
    return list;
  },

  getTransferById(id: string): InternalTransfer | undefined {
    return getState().transfers.find(t => t.id === id || t.reference === id);
  },

  createTransfer(data: {
    source_warehouse_id: string;
    source_location_id: string;
    destination_warehouse_id: string;
    destination_location_id: string;
    schedule_date: string;
    responsible_name?: string;
    items: { product_id: string; quantity: number }[];
    status?: OperationStatus;
  }): { success: boolean; transfer?: InternalTransfer; error?: string } {
    const state = getState();
    const count = state.transfers.length + 1;
    const ref = `WH/INT/${count.toString().padStart(4, '0')}`;

    const srcWh = state.warehouses.find(w => w.id === data.source_warehouse_id);
    const srcLoc = state.locations.find(l => l.id === data.source_location_id);
    const destWh = state.warehouses.find(w => w.id === data.destination_warehouse_id);
    const destLoc = state.locations.find(l => l.id === data.destination_location_id);

    const transferId = `t-${Date.now()}`;
    const items = data.items.map((it, idx) => {
      const prod = state.products.find(p => p.id === it.product_id);
      const inv = state.inventory.find(i => i.product_id === it.product_id && i.warehouse_id === data.source_warehouse_id);
      return {
        id: `ti-${Date.now()}-${idx}`,
        transfer_id: transferId,
        product_id: it.product_id,
        product_name: prod?.name || 'Product',
        sku: prod?.sku || 'SKU',
        unit: prod?.unit || 'pcs',
        quantity: Number(it.quantity),
        available_quantity: inv ? inv.quantity : 0
      };
    });

    const transfer: InternalTransfer = {
      id: transferId,
      reference: ref,
      source_warehouse_id: data.source_warehouse_id,
      source_warehouse_name: srcWh?.name || 'Source Warehouse',
      source_location_id: data.source_location_id,
      source_location_name: srcLoc?.name || 'Source Location',
      destination_warehouse_id: data.destination_warehouse_id,
      destination_warehouse_name: destWh?.name || 'Destination Warehouse',
      destination_location_id: data.destination_location_id,
      destination_location_name: destLoc?.name || 'Destination Location',
      schedule_date: data.schedule_date || new Date().toISOString().split('T')[0],
      responsible_id: 'a0000001-0000-0000-0000-000000000001',
      responsible_name: data.responsible_name || 'Alex Vance',
      status: data.status || 'draft',
      items,
      created_at: new Date().toISOString()
    };

    state.transfers.unshift(transfer);
    saveState(state);
    return { success: true, transfer };
  },

  // CRITICAL REQUIREMENT 5 & 13: Internal transfer updates source and destination locations while total stock remains unchanged
  validateTransfer(id: string): { success: boolean; transfer?: InternalTransfer; error?: string } {
    const state = getState();
    const transfer = state.transfers.find(t => t.id === id);
    if (!transfer) return { success: false, error: 'Transfer not found' };
    if (transfer.status === 'done') return { success: false, error: 'Transfer has already been completed.' };

    // Check source quantities
    for (const item of transfer.items) {
      let srcInv = state.inventory.find(
        i => i.product_id === item.product_id && i.warehouse_id === transfer.source_warehouse_id && i.location_id === transfer.source_location_id
      );
      if (!srcInv) {
        // Fallback to warehouse level if location not exact
        srcInv = state.inventory.find(i => i.product_id === item.product_id && i.warehouse_id === transfer.source_warehouse_id);
      }
      const available = srcInv ? srcInv.quantity : 0;
      if (available < item.quantity) {
        const prod = state.products.find(p => p.id === item.product_id);
        return {
          success: false,
          error: `Insufficient quantity at source for ${prod?.name || 'Product'}. Available: ${available}, required: ${item.quantity}.`
        };
      }
    }

    // Execute atomic moves
    transfer.items.forEach(item => {
      const prod = state.products.find(p => p.id === item.product_id);
      let srcInv = state.inventory.find(
        i => i.product_id === item.product_id && i.warehouse_id === transfer.source_warehouse_id && i.location_id === transfer.source_location_id
      );
      if (!srcInv) {
        srcInv = state.inventory.find(i => i.product_id === item.product_id && i.warehouse_id === transfer.source_warehouse_id)!;
      }

      let destInv = state.inventory.find(
        i => i.product_id === item.product_id && i.warehouse_id === transfer.destination_warehouse_id && i.location_id === transfer.destination_location_id
      );
      if (!destInv) {
        destInv = {
          id: `i-${Date.now()}-${item.product_id}-dest`,
          product_id: item.product_id,
          warehouse_id: transfer.destination_warehouse_id,
          location_id: transfer.destination_location_id,
          quantity: 0,
          reserved_quantity: 0,
          updated_at: new Date().toISOString()
        };
        state.inventory.push(destInv);
      }

      const moveQty = Number(item.quantity);
      const srcBefore = srcInv.quantity;
      const destBefore = destInv.quantity;

      srcInv.quantity -= moveQty;
      destInv.quantity += moveQty;

      // Log Ledger
      state.ledger.unshift({
        id: `g-${Date.now()}-${item.id}-out`,
        reference: transfer.reference,
        date: new Date().toISOString(),
        operation_type: 'INTERNAL_TRANSFER',
        product_id: item.product_id,
        product_name: prod?.name || item.product_name || 'Product',
        sku: prod?.sku || item.sku || 'SKU',
        warehouse_id: transfer.source_warehouse_id,
        warehouse_name: transfer.source_warehouse_name || 'Source WH',
        location_id: transfer.source_location_id,
        location_name: transfer.source_location_name || 'Source Loc',
        quantity_before: srcBefore,
        quantity_change: -moveQty,
        quantity_after: srcInv.quantity,
        source: `${transfer.source_warehouse_name} (${transfer.source_location_name})`,
        destination: `${transfer.destination_warehouse_name} (${transfer.destination_location_name})`,
        user_name: transfer.responsible_name || 'Alex Vance',
        reason: 'Internal Warehouse Rebalancing',
        created_at: new Date().toISOString()
      });

      state.ledger.unshift({
        id: `g-${Date.now()}-${item.id}-in`,
        reference: transfer.reference,
        date: new Date().toISOString(),
        operation_type: 'INTERNAL_TRANSFER',
        product_id: item.product_id,
        product_name: prod?.name || item.product_name || 'Product',
        sku: prod?.sku || item.sku || 'SKU',
        warehouse_id: transfer.destination_warehouse_id,
        warehouse_name: transfer.destination_warehouse_name || 'Dest WH',
        location_id: transfer.destination_location_id,
        location_name: transfer.destination_location_name || 'Dest Loc',
        quantity_before: destBefore,
        quantity_change: moveQty,
        quantity_after: destInv.quantity,
        source: `${transfer.source_warehouse_name} (${transfer.source_location_name})`,
        destination: `${transfer.destination_warehouse_name} (${transfer.destination_location_name})`,
        user_name: transfer.responsible_name || 'Alex Vance',
        reason: 'Internal Warehouse Rebalancing Received',
        created_at: new Date().toISOString()
      });
    });

    transfer.status = 'done';
    transfer.validated_at = new Date().toISOString();

    syncProductStockAndAlerts(state);
    saveState(state);
    return { success: true, transfer };
  },

  // --- INVENTORY ADJUSTMENTS ---
  getAdjustments(filters?: { status?: string }): InventoryAdjustment[] {
    const state = getState();
    let list = state.adjustments;
    if (filters?.status && filters.status !== 'all') {
      list = list.filter(a => a.status === filters.status);
    }
    return list;
  },

  getAdjustmentById(id: string): InventoryAdjustment | undefined {
    return getState().adjustments.find(a => a.id === id || a.reference === id);
  },

  createAdjustment(data: {
    warehouse_id: string;
    location_id: string;
    product_id: string;
    counted_quantity: number;
    reason: any;
    notes?: string;
    responsible_name?: string;
    status?: OperationStatus;
  }): { success: boolean; adjustment?: InventoryAdjustment; error?: string } {
    const state = getState();
    const count = state.adjustments.length + 1;
    const ref = `WH/ADJ/${count.toString().padStart(4, '0')}`;

    const wh = state.warehouses.find(w => w.id === data.warehouse_id);
    const loc = state.locations.find(l => l.id === data.location_id);
    const prod = state.products.find(p => p.id === data.product_id);

    const inv = state.inventory.find(i => i.product_id === data.product_id && i.warehouse_id === data.warehouse_id);
    const sysQty = inv ? inv.quantity : 0;
    const countedQty = Number(data.counted_quantity);
    const difference = countedQty - sysQty;

    const adjustment: InventoryAdjustment = {
      id: `j-${Date.now()}`,
      reference: ref,
      warehouse_id: data.warehouse_id,
      warehouse_name: wh?.name || 'Warehouse',
      location_id: data.location_id,
      location_name: loc?.name || 'Location',
      product_id: data.product_id,
      product_name: prod?.name || 'Product',
      sku: prod?.sku || 'SKU',
      unit: prod?.unit || 'pcs',
      system_quantity: sysQty,
      counted_quantity: countedQty,
      difference,
      reason: data.reason || 'Damaged',
      notes: data.notes,
      responsible_id: 'a0000001-0000-0000-0000-000000000001',
      responsible_name: data.responsible_name || 'Alex Vance',
      status: data.status || 'draft',
      created_at: new Date().toISOString()
    };

    state.adjustments.unshift(adjustment);
    saveState(state);
    return { success: true, adjustment };
  },

  // CRITICAL REQUIREMENT 6 & 13: Adjustment validation updates stock and creates ledger record
  validateAdjustment(id: string): { success: boolean; adjustment?: InventoryAdjustment; error?: string } {
    const state = getState();
    const adj = state.adjustments.find(a => a.id === id);
    if (!adj) return { success: false, error: 'Adjustment record not found' };
    if (adj.status === 'done') return { success: false, error: 'Adjustment has already been validated.' };

    let inv = state.inventory.find(i => i.product_id === adj.product_id && i.warehouse_id === adj.warehouse_id);
    if (!inv) {
      inv = {
        id: `i-${Date.now()}-${adj.product_id}`,
        product_id: adj.product_id,
        warehouse_id: adj.warehouse_id,
        location_id: adj.location_id,
        quantity: 0,
        reserved_quantity: 0,
        updated_at: new Date().toISOString()
      };
      state.inventory.push(inv);
    }

    const beforeQty = inv.quantity;
    const diff = Number(adj.difference);
    inv.quantity += diff;
    if (inv.quantity < 0) inv.quantity = 0; // Guard against negative
    inv.updated_at = new Date().toISOString();

    state.ledger.unshift({
      id: `g-${Date.now()}`,
      reference: adj.reference,
      date: new Date().toISOString(),
      operation_type: 'ADJUSTMENT',
      product_id: adj.product_id,
      product_name: adj.product_name || 'Product',
      sku: adj.sku || 'SKU',
      warehouse_id: adj.warehouse_id,
      warehouse_name: adj.warehouse_name || 'Warehouse',
      location_id: adj.location_id,
      location_name: adj.location_name || 'Location',
      quantity_before: beforeQty,
      quantity_change: diff,
      quantity_after: inv.quantity,
      user_name: adj.responsible_name || 'Alex Vance',
      reason: `Physical Count Adjustment: ${adj.reason} ${adj.notes ? `(${adj.notes})` : ''}`,
      created_at: new Date().toISOString()
    });

    adj.status = 'done';
    adj.validated_at = new Date().toISOString();

    syncProductStockAndAlerts(state);
    saveState(state);
    return { success: true, adjustment: adj };
  },

  // --- MOVE HISTORY (Section 7) ---
  getMoveHistory(filters?: { search?: string; type?: string; status?: string }): StockMove[] {
    const state = getState();
    const moves: StockMove[] = [];

    // 1. From Receipts
    state.receipts.forEach(r => {
      r.items.forEach(it => {
        moves.push({
          id: `mv-${r.id}-${it.id}`,
          reference: r.reference,
          date: r.created_at,
          contact: r.supplier_name || 'Vendor',
          from: r.supplier_name || 'Vendor Inflow',
          to: r.warehouse_name || 'Warehouse',
          product_id: it.product_id,
          product_name: it.product_name || 'Product',
          sku: it.sku || 'SKU',
          quantity: it.received_quantity || it.expected_quantity,
          unit: it.unit || 'pcs',
          type: 'incoming',
          status: r.status
        });
      });
    });

    // 2. From Deliveries
    state.deliveries.forEach(d => {
      d.items.forEach(it => {
        moves.push({
          id: `mv-${d.id}-${it.id}`,
          reference: d.reference,
          date: d.created_at,
          contact: d.contact || 'Client',
          from: d.warehouse_name || 'Warehouse',
          to: d.delivery_address || d.contact || 'Customer Delivery',
          product_id: it.product_id,
          product_name: it.product_name || 'Product',
          sku: it.sku || 'SKU',
          quantity: it.quantity,
          unit: it.unit || 'pcs',
          type: 'outgoing',
          status: d.status
        });
      });
    });

    // 3. From Transfers
    state.transfers.forEach(t => {
      t.items.forEach(it => {
        moves.push({
          id: `mv-${t.id}-${it.id}`,
          reference: t.reference,
          date: t.created_at,
          contact: 'Internal Logistics',
          from: `${t.source_warehouse_name} (${t.source_location_name})`,
          to: `${t.destination_warehouse_name} (${t.destination_location_name})`,
          product_id: it.product_id,
          product_name: it.product_name || 'Product',
          sku: it.sku || 'SKU',
          quantity: it.quantity,
          unit: it.unit || 'pcs',
          type: 'internal',
          status: t.status
        });
      });
    });

    // 4. From Adjustments
    state.adjustments.forEach(a => {
      moves.push({
        id: `mv-${a.id}`,
        reference: a.reference,
        date: a.created_at,
        contact: a.reason,
        from: a.difference < 0 ? `${a.warehouse_name} (${a.location_name})` : 'Discrepancy Inflow',
        to: a.difference < 0 ? `Shrinkage (${a.reason})` : `${a.warehouse_name} (${a.location_name})`,
        product_id: a.product_id,
        product_name: a.product_name || 'Product',
        sku: a.sku || 'SKU',
        quantity: Math.abs(a.difference),
        unit: a.unit || 'pcs',
        type: 'adjustment',
        status: a.status
      });
    });

    let filtered = moves.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.reference.toLowerCase().includes(q) ||
          m.product_name.toLowerCase().includes(q) ||
          m.sku.toLowerCase().includes(q) ||
          m.contact.toLowerCase().includes(q)
      );
    }
    if (filters?.type && filters.type !== 'all') {
      filtered = filtered.filter(m => m.type === filters.type);
    }
    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(m => m.status === filters.status);
    }

    return filtered;
  },

  // --- STOCK LEDGER (Section 8) ---
  getStockLedger(filters?: { search?: string; operationType?: string }): StockLedgerEntry[] {
    const state = getState();
    let list = [...state.ledger].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        l =>
          l.reference.toLowerCase().includes(q) ||
          l.product_name.toLowerCase().includes(q) ||
          l.sku.toLowerCase().includes(q) ||
          (l.reason && l.reason.toLowerCase().includes(q))
      );
    }
    if (filters?.operationType && filters.operationType !== 'all') {
      list = list.filter(l => l.operation_type === filters.operationType);
    }

    return list;
  },

  // --- ALERTS (Section 10) ---
  getAlerts(): Alert[] {
    return getState().alerts;
  },

  markAlertRead(id: string): void {
    const state = getState();
    const alert = state.alerts.find(a => a.id === id);
    if (alert) {
      alert.read = true;
      saveState(state);
    }
  },

  // --- RECENT OPERATIONS (For Dashboard Section E) ---
  getRecentOperations() {
    const moves = this.getMoveHistory();
    return moves.slice(0, 7);
  }
};
