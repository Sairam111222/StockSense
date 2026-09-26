export type UserRole = 'manager' | 'staff' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  manager_id?: string;
  manager_name?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Location {
  id: string;
  warehouse_id: string;
  warehouse_name?: string;
  name: string;
  code: string;
  capacity: number;
  current_quantity?: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category_id: string;
  category_name?: string;
  unit: string; // e.g. "kg", "pcs", "boxes", "meters", "liters"
  reorder_level: number;
  description?: string;
  active: boolean;
  total_stock: number;
  available_stock: number;
  reserved_stock: number;
  warehouse_id?: string;
  warehouse_name?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  warehouse_id: string;
  location_id: string;
  quantity: number;
  reserved_quantity: number;
  product?: Product;
  warehouse?: Warehouse;
  location?: Location;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

export type OperationStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';

export interface ReceiptItem {
  id: string;
  receipt_id: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  unit?: string;
  expected_quantity: number;
  received_quantity: number;
}

export interface Receipt {
  id: string;
  reference: string; // e.g. WH/IN/0001
  supplier_id: string;
  supplier_name?: string;
  warehouse_id: string;
  warehouse_name?: string;
  schedule_date: string;
  responsible_id: string;
  responsible_name?: string;
  status: OperationStatus;
  items: ReceiptItem[];
  created_at: string;
  validated_at?: string;
}

export interface DeliveryItem {
  id: string;
  delivery_id: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  unit?: string;
  quantity: number;
  available_quantity?: number;
}

export interface Delivery {
  id: string;
  reference: string; // e.g. WH/OUT/0001
  warehouse_id: string;
  warehouse_name?: string;
  contact?: string; // customer/recipient
  delivery_address: string;
  schedule_date: string;
  responsible_id: string;
  responsible_name?: string;
  operation_type: string; // e.g. "Customer Delivery", "Internal Transfer Out"
  status: OperationStatus;
  items: DeliveryItem[];
  created_at: string;
  validated_at?: string;
}

export interface InternalTransferItem {
  id: string;
  transfer_id: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  unit?: string;
  quantity: number;
  available_quantity?: number;
}

export interface InternalTransfer {
  id: string;
  reference: string; // e.g. WH/INT/0001
  source_warehouse_id: string;
  source_warehouse_name?: string;
  source_location_id: string;
  source_location_name?: string;
  destination_warehouse_id: string;
  destination_warehouse_name?: string;
  destination_location_id: string;
  destination_location_name?: string;
  schedule_date: string;
  responsible_id: string;
  responsible_name?: string;
  status: OperationStatus;
  items: InternalTransferItem[];
  created_at: string;
  validated_at?: string;
}

export type AdjustmentReason = 'Damaged' | 'Lost' | 'Found' | 'Counting Error' | 'Quality Issue' | 'Other';

export interface InventoryAdjustment {
  id: string;
  reference: string; // e.g. WH/ADJ/0001
  warehouse_id: string;
  warehouse_name?: string;
  location_id: string;
  location_name?: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  unit?: string;
  system_quantity: number;
  counted_quantity: number;
  difference: number;
  reason: AdjustmentReason;
  notes?: string;
  responsible_id: string;
  responsible_name?: string;
  status: OperationStatus;
  created_at: string;
  validated_at?: string;
}

export interface StockLedgerEntry {
  id: string;
  reference: string;
  date: string;
  operation_type: 'RECEIPT' | 'DELIVERY' | 'INTERNAL_TRANSFER' | 'ADJUSTMENT' | 'INITIAL_STOCK';
  product_id: string;
  product_name: string;
  sku: string;
  warehouse_id: string;
  warehouse_name: string;
  location_id: string;
  location_name: string;
  quantity_before: number;
  quantity_change: number;
  quantity_after: number;
  source?: string;
  destination?: string;
  user_name: string;
  reason?: string;
  created_at: string;
}

export interface StockMove {
  id: string;
  reference: string;
  date: string;
  contact: string;
  from: string;
  to: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit: string;
  type: 'incoming' | 'outgoing' | 'internal' | 'adjustment';
  status: OperationStatus;
}

export type AlertType = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'PENDING_RECEIPT' | 'PENDING_DELIVERY';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  product_id?: string;
  product_name?: string;
  sku?: string;
  warehouse_id?: string;
  warehouse_name?: string;
  current_stock?: number;
  reorder_level?: number;
  message: string;
  severity: AlertSeverity;
  read: boolean;
  created_at: string;
}

export interface SmartInsight {
  id: string;
  title: string;
  description: string;
  type: 'replenishment' | 'velocity' | 'distribution' | 'operations';
  priority: 'high' | 'medium' | 'low';
  metric?: string;
  actionText?: string;
  actionLink?: string;
}

export interface DashboardStats {
  totalProductsInStock: number;
  totalQuantity: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  internalTransfersCount: number;
  totalWarehouses: number;
}
