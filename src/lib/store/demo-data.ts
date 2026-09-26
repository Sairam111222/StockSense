import {
  Profile,
  Category,
  Warehouse,
  Location,
  Product,
  InventoryItem,
  Supplier,
  Receipt,
  Delivery,
  InternalTransfer,
  InventoryAdjustment,
  StockLedgerEntry,
  Alert
} from '@/types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'a0000001-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Alex Vance',
    email: 'alex.manager@stocksense.io',
    role: 'manager',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'a0000001-0000-0000-0000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000002',
    full_name: 'Marcus Chen',
    email: 'marcus.staff@stocksense.io',
    role: 'staff',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString()
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'c0000001-0000-0000-0000-000000000001', name: 'Raw Materials', description: 'Primary production materials & metal stock', created_at: new Date().toISOString() },
  { id: 'c0000001-0000-0000-0000-000000000002', name: 'Office Equipment', description: 'Desks, ergonomic seating & furniture', created_at: new Date().toISOString() },
  { id: 'c0000001-0000-0000-0000-000000000003', name: 'Electronics', description: 'Computing gear, cables & electrical parts', created_at: new Date().toISOString() },
  { id: 'c0000001-0000-0000-0000-000000000004', name: 'Safety Equipment', description: 'PPE, hard hats and industrial protective gear', created_at: new Date().toISOString() },
  { id: 'c0000001-0000-0000-0000-000000000005', name: 'Finished Goods', description: 'Packaged goods ready for dispatch', created_at: new Date().toISOString() }
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'w0000001-0000-0000-0000-000000000001',
    name: 'Main Warehouse',
    code: 'WH-MAIN',
    address: '104 Logistics Blvd, Sector 4, Chicago, IL',
    manager_id: 'a0000001-0000-0000-0000-000000000001',
    manager_name: 'Alex Vance',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'w0000001-0000-0000-0000-000000000002',
    name: 'Production Warehouse',
    code: 'WH-PROD',
    address: '88 Assembly Way, Bay 3, Gary, IN',
    manager_id: 'a0000001-0000-0000-0000-000000000001',
    manager_name: 'Alex Vance',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'w0000001-0000-0000-0000-000000000003',
    name: 'Secondary Warehouse',
    code: 'WH-SEC',
    address: '12 Depot Road, Unit B, Milwaukee, WI',
    manager_id: 'a0000001-0000-0000-0000-000000000001',
    manager_name: 'Alex Vance',
    status: 'active',
    created_at: new Date().toISOString()
  }
];

export const INITIAL_LOCATIONS: Location[] = [
  { id: 'l0000001-0000-0000-0000-000000000001', warehouse_id: 'w0000001-0000-0000-0000-000000000001', warehouse_name: 'Main Warehouse', name: 'WH/Stock-1', code: 'LOC-S1', capacity: 5000, current_quantity: 220, created_at: new Date().toISOString() },
  { id: 'l0000001-0000-0000-0000-000000000002', warehouse_id: 'w0000001-0000-0000-0000-000000000001', warehouse_name: 'Main Warehouse', name: 'WH/Stock-2', code: 'LOC-S2', capacity: 3000, current_quantity: 8, created_at: new Date().toISOString() },
  { id: 'l0000001-0000-0000-0000-000000000003', warehouse_id: 'w0000001-0000-0000-0000-000000000001', warehouse_name: 'Main Warehouse', name: 'Rack A', code: 'LOC-RA', capacity: 1500, current_quantity: 18, created_at: new Date().toISOString() },
  { id: 'l0000001-0000-0000-0000-000000000004', warehouse_id: 'w0000001-0000-0000-0000-000000000002', warehouse_name: 'Production Warehouse', name: 'Rack B', code: 'LOC-RB', capacity: 1500, current_quantity: 45, created_at: new Date().toISOString() },
  { id: 'l0000001-0000-0000-0000-000000000005', warehouse_id: 'w0000001-0000-0000-0000-000000000002', warehouse_name: 'Production Warehouse', name: 'Production Floor', code: 'LOC-PF', capacity: 4000, current_quantity: 350, created_at: new Date().toISOString() }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 's0000001-0000-0000-0000-000000000001', name: 'Steel Industries Ltd', email: 'procurement@steelind.com', phone: '+1 (555) 234-5678', address: '900 Industrial Parkway, Gary, IN', created_at: new Date().toISOString() },
  { id: 's0000001-0000-0000-0000-000000000002', name: 'Azure Interior', email: 'orders@azureinterior.com', phone: '+1 (555) 876-5432', address: '45 Design Center Way, Suite 10, Chicago, IL', created_at: new Date().toISOString() },
  { id: 's0000001-0000-0000-0000-000000000003', name: 'Global Supplies Corp', email: 'support@globalsupplies.com', phone: '+1 (555) 998-1122', address: '310 World Trade Ave, New York, NY', created_at: new Date().toISOString() }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p0000001-0000-0000-0000-000000000001',
    name: 'Steel Rods',
    sku: 'RAW-STL-001',
    category_id: 'c0000001-0000-0000-0000-000000000001',
    category_name: 'Raw Materials',
    unit: 'kg',
    reorder_level: 50,
    description: 'High-grade galvanized structural steel rods, 12mm diameter',
    active: true,
    total_stock: 100,
    available_stock: 100,
    reserved_stock: 0,
    warehouse_id: 'w0000001-0000-0000-0000-000000000001',
    warehouse_name: 'Main Warehouse',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p0000001-0000-0000-0000-000000000002',
    name: 'Office Chair',
    sku: 'FUR-CHR-002',
    category_id: 'c0000001-0000-0000-0000-000000000002',
    category_name: 'Office Equipment',
    unit: 'pcs',
    reorder_level: 10,
    description: 'Ergonomic mesh swivel office chair with lumbar support',
    active: true,
    total_stock: 14,
    available_stock: 12,
    reserved_stock: 2,
    warehouse_id: 'w0000001-0000-0000-0000-000000000001',
    warehouse_name: 'Main Warehouse',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p0000001-0000-0000-0000-000000000003',
    name: 'Laptop',
    sku: 'ELE-LAP-003',
    category_id: 'c0000001-0000-0000-0000-000000000003',
    category_name: 'Electronics',
    unit: 'pcs',
    reorder_level: 15,
    description: 'Enterprise 14-inch workstation laptops with Core i7 and 32GB RAM',
    active: true,
    total_stock: 8,
    available_stock: 8,
    reserved_stock: 0,
    warehouse_id: 'w0000001-0000-0000-0000-000000000001',
    warehouse_name: 'Main Warehouse',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p0000001-0000-0000-0000-000000000004',
    name: 'Safety Helmet',
    sku: 'SAF-HLM-004',
    category_id: 'c0000001-0000-0000-0000-000000000004',
    category_name: 'Safety Equipment',
    unit: 'pcs',
    reorder_level: 25,
    description: 'ANSI Z89.1 certified high-visibility yellow hard hat with chin strap',
    active: true,
    total_stock: 45,
    available_stock: 45,
    reserved_stock: 0,
    warehouse_id: 'w0000001-0000-0000-0000-000000000002',
    warehouse_name: 'Production Warehouse',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p0000001-0000-0000-0000-000000000005',
    name: 'Cement Bags',
    sku: 'RAW-CEM-005',
    category_id: 'c0000001-0000-0000-0000-000000000001',
    category_name: 'Raw Materials',
    unit: 'bags',
    reorder_level: 40,
    description: 'Portland Type I/II general construction cement, 50kg bag',
    active: true,
    total_stock: 120,
    available_stock: 110,
    reserved_stock: 10,
    warehouse_id: 'w0000001-0000-0000-0000-000000000001',
    warehouse_name: 'Main Warehouse',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p0000001-0000-0000-0000-000000000006',
    name: 'Copper Wire',
    sku: 'ELE-COP-006',
    category_id: 'c0000001-0000-0000-0000-000000000003',
    category_name: 'Electronics',
    unit: 'meters',
    reorder_level: 100,
    description: 'Heavy-duty insulated copper electrical wiring spool',
    active: true,
    total_stock: 350,
    available_stock: 350,
    reserved_stock: 0,
    warehouse_id: 'w0000001-0000-0000-0000-000000000002',
    warehouse_name: 'Production Warehouse',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p0000001-0000-0000-0000-000000000007',
    name: 'Desk',
    sku: 'FUR-DSK-007',
    category_id: 'c0000001-0000-0000-0000-000000000002',
    category_name: 'Office Equipment',
    unit: 'pcs',
    reorder_level: 8,
    description: 'Electric motorized dual-motor height adjustable sit-stand desk',
    active: true,
    total_stock: 4,
    available_stock: 4,
    reserved_stock: 0,
    warehouse_id: 'w0000001-0000-0000-0000-000000000001',
    warehouse_name: 'Main Warehouse',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p0000001-0000-0000-0000-000000000008',
    name: 'Industrial Gloves',
    sku: 'SAF-GLV-008',
    category_id: 'c0000001-0000-0000-0000-000000000004',
    category_name: 'Safety Equipment',
    unit: 'pairs',
    reorder_level: 30,
    description: 'Cut-resistant level 5 polyurethane dipped work gloves',
    active: true,
    total_stock: 0,
    available_stock: 0,
    reserved_stock: 0,
    warehouse_id: 'w0000001-0000-0000-0000-000000000002',
    warehouse_name: 'Production Warehouse',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'i0000001-0000-0000-0000-000000000001', product_id: 'p0000001-0000-0000-0000-000000000001', warehouse_id: 'w0000001-0000-0000-0000-000000000001', location_id: 'l0000001-0000-0000-0000-000000000001', quantity: 100, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { id: 'i0000001-0000-0000-0000-000000000002', product_id: 'p0000001-0000-0000-0000-000000000002', warehouse_id: 'w0000001-0000-0000-0000-000000000001', location_id: 'l0000001-0000-0000-0000-000000000003', quantity: 14, reserved_quantity: 2, updated_at: new Date().toISOString() },
  { id: 'i0000001-0000-0000-0000-000000000003', product_id: 'p0000001-0000-0000-0000-000000000003', warehouse_id: 'w0000001-0000-0000-0000-000000000001', location_id: 'l0000001-0000-0000-0000-000000000002', quantity: 8, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { id: 'i0000001-0000-0000-0000-000000000004', product_id: 'p0000001-0000-0000-0000-000000000004', warehouse_id: 'w0000001-0000-0000-0000-000000000002', location_id: 'l0000001-0000-0000-0000-000000000004', quantity: 45, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { id: 'i0000001-0000-0000-0000-000000000005', product_id: 'p0000001-0000-0000-0000-000000000005', warehouse_id: 'w0000001-0000-0000-0000-000000000001', location_id: 'l0000001-0000-0000-0000-000000000001', quantity: 120, reserved_quantity: 10, updated_at: new Date().toISOString() },
  { id: 'i0000001-0000-0000-0000-000000000006', product_id: 'p0000001-0000-0000-0000-000000000006', warehouse_id: 'w0000001-0000-0000-0000-000000000002', location_id: 'l0000001-0000-0000-0000-000000000005', quantity: 350, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { id: 'i0000001-0000-0000-0000-000000000007', product_id: 'p0000001-0000-0000-0000-000000000007', warehouse_id: 'w0000001-0000-0000-0000-000000000001', location_id: 'l0000001-0000-0000-0000-000000000003', quantity: 4, reserved_quantity: 0, updated_at: new Date().toISOString() },
  { id: 'i0000001-0000-0000-0000-000000000008', product_id: 'p0000001-0000-0000-0000-000000000008', warehouse_id: 'w0000001-0000-0000-0000-000000000002', location_id: 'l0000001-0000-0000-0000-000000000004', quantity: 0, reserved_quantity: 0, updated_at: new Date().toISOString() }
];

export const INITIAL_LEDGER: StockLedgerEntry[] = [
  {
    id: 'g0000001-0000-0000-0000-000000000001',
    reference: 'INIT/001',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    operation_type: 'INITIAL_STOCK',
    product_id: 'p0000001-0000-0000-0000-000000000001',
    product_name: 'Steel Rods',
    sku: 'RAW-STL-001',
    warehouse_id: 'w0000001-0000-0000-0000-000000000001',
    warehouse_name: 'Main Warehouse',
    location_id: 'l0000001-0000-0000-0000-000000000001',
    location_name: 'WH/Stock-1',
    quantity_before: 0,
    quantity_change: 100,
    quantity_after: 100,
    user_name: 'Alex Vance',
    reason: 'Initial baseline warehouse inventory',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'g0000001-0000-0000-0000-000000000002',
    reference: 'INIT/002',
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    operation_type: 'INITIAL_STOCK',
    product_id: 'p0000001-0000-0000-0000-000000000002',
    product_name: 'Office Chair',
    sku: 'FUR-CHR-002',
    warehouse_id: 'w0000001-0000-0000-0000-000000000001',
    warehouse_name: 'Main Warehouse',
    location_id: 'l0000001-0000-0000-0000-000000000003',
    location_name: 'Rack A',
    quantity_before: 0,
    quantity_change: 16,
    quantity_after: 16,
    user_name: 'Alex Vance',
    reason: 'Initial baseline warehouse inventory',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'g0000001-0000-0000-0000-000000000003',
    reference: 'WH/OUT/0000',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    operation_type: 'DELIVERY',
    product_id: 'p0000001-0000-0000-0000-000000000002',
    product_name: 'Office Chair',
    sku: 'FUR-CHR-002',
    warehouse_id: 'w0000001-0000-0000-0000-000000000001',
    warehouse_name: 'Main Warehouse',
    location_id: 'l0000001-0000-0000-0000-000000000003',
    location_name: 'Rack A',
    quantity_before: 16,
    quantity_change: -2,
    quantity_after: 14,
    source: 'Rack A',
    destination: 'Azure Interior (Chicago Suite 10)',
    user_name: 'Marcus Chen',
    reason: 'Customer Delivery fulfillment',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

export const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'r0000001-0000-0000-0000-000000000001',
    reference: 'WH/IN/0001',
    supplier_id: 's0000001-0000-0000-0000-000000000001',
    supplier_name: 'Steel Industries Ltd',
    warehouse_id: 'w0000001-0000-0000-0000-000000000001',
    warehouse_name: 'Main Warehouse',
    schedule_date: new Date().toISOString().split('T')[0],
    responsible_id: 'a0000001-0000-0000-0000-000000000001',
    responsible_name: 'Alex Vance',
    status: 'ready',
    items: [
      {
        id: 'ri000001-0000-0000-0000-000000000001',
        receipt_id: 'r0000001-0000-0000-0000-000000000001',
        product_id: 'p0000001-0000-0000-0000-000000000001',
        product_name: 'Steel Rods',
        sku: 'RAW-STL-001',
        unit: 'kg',
        expected_quantity: 50,
        received_quantity: 50
      }
    ],
    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 'r0000001-0000-0000-0000-000000000002',
    reference: 'WH/IN/0002',
    supplier_id: 's0000001-0000-0000-0000-000000000003',
    supplier_name: 'Global Supplies Corp',
    warehouse_id: 'w0000001-0000-0000-0000-000000000002',
    warehouse_name: 'Production Warehouse',
    schedule_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    responsible_id: 'a0000001-0000-0000-0000-000000000002',
    responsible_name: 'Marcus Chen',
    status: 'waiting',
    items: [
      {
        id: 'ri000001-0000-0000-0000-000000000002',
        receipt_id: 'r0000001-0000-0000-0000-000000000002',
        product_id: 'p0000001-0000-0000-0000-000000000008',
        product_name: 'Industrial Gloves',
        sku: 'SAF-GLV-008',
        unit: 'pairs',
        expected_quantity: 50,
        received_quantity: 0
      }
    ],
    created_at: new Date().toISOString()
  }
];

export const INITIAL_DELIVERIES: Delivery[] = [
  {
    id: 'd0000001-0000-0000-0000-000000000001',
    reference: 'WH/OUT/0001',
    warehouse_id: 'w0000001-0000-0000-0000-000000000001',
    warehouse_name: 'Main Warehouse',
    contact: 'Azure Interior',
    delivery_address: '45 Design Center Way, Suite 10, Chicago, IL',
    schedule_date: new Date().toISOString().split('T')[0],
    responsible_id: 'a0000001-0000-0000-0000-000000000001',
    responsible_name: 'Alex Vance',
    operation_type: 'Customer Delivery',
    status: 'ready',
    items: [
      {
        id: 'di000001-0000-0000-0000-000000000001',
        delivery_id: 'd0000001-0000-0000-0000-000000000001',
        product_id: 'p0000001-0000-0000-0000-000000000002',
        product_name: 'Office Chair',
        sku: 'FUR-CHR-002',
        unit: 'pcs',
        quantity: 4,
        available_quantity: 12
      }
    ],
    created_at: new Date(Date.now() - 36 * 3600000).toISOString()
  },
  {
    id: 'd0000001-0000-0000-0000-000000000002',
    reference: 'WH/OUT/0002',
    warehouse_id: 'w0000001-0000-0000-0000-000000000001',
    warehouse_name: 'Main Warehouse',
    contact: 'Northwest Builders',
    delivery_address: '720 Michigan Ave, Chicago, IL',
    schedule_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    responsible_id: 'a0000001-0000-0000-0000-000000000002',
    responsible_name: 'Marcus Chen',
    operation_type: 'Customer Delivery',
    status: 'waiting',
    items: [
      {
        id: 'di000001-0000-0000-0000-000000000002',
        delivery_id: 'd0000001-0000-0000-0000-000000000002',
        product_id: 'p0000001-0000-0000-0000-000000000005',
        product_name: 'Cement Bags',
        sku: 'RAW-CEM-005',
        unit: 'bags',
        quantity: 20,
        available_quantity: 110
      }
    ],
    created_at: new Date().toISOString()
  }
];

export const INITIAL_TRANSFERS: InternalTransfer[] = [
  {
    id: 't0000001-0000-0000-0000-000000000001',
    reference: 'WH/INT/0001',
    source_warehouse_id: 'w0000001-0000-0000-0000-000000000001',
    source_warehouse_name: 'Main Warehouse',
    source_location_id: 'l0000001-0000-0000-0000-000000000001',
    source_location_name: 'WH/Stock-1',
    destination_warehouse_id: 'w0000001-0000-0000-0000-000000000002',
    destination_warehouse_name: 'Production Warehouse',
    destination_location_id: 'l0000001-0000-0000-0000-000000000005',
    destination_location_name: 'Production Floor',
    schedule_date: new Date().toISOString().split('T')[0],
    responsible_id: 'a0000001-0000-0000-0000-000000000001',
    responsible_name: 'Alex Vance',
    status: 'ready',
    items: [
      {
        id: 'ti000001-0000-0000-0000-000000000001',
        transfer_id: 't0000001-0000-0000-0000-000000000001',
        product_id: 'p0000001-0000-0000-0000-000000000001',
        product_name: 'Steel Rods',
        sku: 'RAW-STL-001',
        unit: 'kg',
        quantity: 20,
        available_quantity: 100
      }
    ],
    created_at: new Date().toISOString()
  }
];

export const INITIAL_ADJUSTMENTS: InventoryAdjustment[] = [
  {
    id: 'j0000001-0000-0000-0000-000000000001',
    reference: 'WH/ADJ/0001',
    warehouse_id: 'w0000001-0000-0000-0000-000000000001',
    warehouse_name: 'Main Warehouse',
    location_id: 'l0000001-0000-0000-0000-000000000003',
    location_name: 'Rack A',
    product_id: 'p0000001-0000-0000-0000-000000000007',
    product_name: 'Desk',
    sku: 'FUR-DSK-007',
    unit: 'pcs',
    system_quantity: 7,
    counted_quantity: 4,
    difference: -3,
    reason: 'Damaged',
    notes: 'Three desks sustained water dripping during heavy rain inspection',
    responsible_id: 'a0000001-0000-0000-0000-000000000001',
    responsible_name: 'Alex Vance',
    status: 'ready',
    created_at: new Date(Date.now() - 12 * 3600000).toISOString()
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'al000001-0000-0000-0000-000000000001',
    type: 'OUT_OF_STOCK',
    product_id: 'p0000001-0000-0000-0000-000000000008',
    product_name: 'Industrial Gloves',
    sku: 'SAF-GLV-008',
    warehouse_id: 'w0000001-0000-0000-0000-000000000002',
    warehouse_name: 'Production Warehouse',
    current_stock: 0,
    reorder_level: 30,
    message: 'Industrial Gloves stock has reached 0 pairs in Production Warehouse. Urgent reorder required.',
    severity: 'critical',
    read: false,
    created_at: new Date(Date.now() - 18 * 3600000).toISOString()
  },
  {
    id: 'al000001-0000-0000-0000-000000000002',
    type: 'LOW_STOCK',
    product_id: 'p0000001-0000-0000-0000-000000000003',
    product_name: 'Laptop',
    sku: 'ELE-LAP-003',
    warehouse_id: 'w0000001-0000-0000-0000-000000000001',
    warehouse_name: 'Main Warehouse',
    current_stock: 8,
    reorder_level: 15,
    message: 'Laptops are below reorder level (8 remaining, threshold is 15).',
    severity: 'warning',
    read: false,
    created_at: new Date(Date.now() - 10 * 3600000).toISOString()
  },
  {
    id: 'al000001-0000-0000-0000-000000000003',
    type: 'LOW_STOCK',
    product_id: 'p0000001-0000-0000-0000-000000000007',
    product_name: 'Desk',
    sku: 'FUR-DSK-007',
    warehouse_id: 'w0000001-0000-0000-0000-000000000001',
    warehouse_name: 'Main Warehouse',
    current_stock: 4,
    reorder_level: 8,
    message: 'Motorized Desks are below reorder level (4 remaining, threshold is 8).',
    severity: 'warning',
    read: false,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString()
  }
];
