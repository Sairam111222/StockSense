-- ==============================================================================
-- StockSense Realistic Hackathon Demo Seed Data
-- ==============================================================================

-- 1. Profiles
INSERT INTO profiles (id, user_id, full_name, email, role, avatar_url)
VALUES
  ('a0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Alex Vance', 'alex.manager@stocksense.io', 'manager', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
  ('a0000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Marcus Chen', 'marcus.staff@stocksense.io', 'staff', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- 2. Categories
INSERT INTO categories (id, name, description)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Raw Materials', 'Primary production components and unprocessed materials'),
  ('c0000001-0000-0000-0000-000000000002', 'Office Equipment', 'Furniture, desks, chairs, and ergonomic supplies'),
  ('c0000001-0000-0000-0000-000000000003', 'Electronics', 'Computing equipment, wiring, and sensitive electronic assemblies'),
  ('c0000001-0000-0000-0000-000000000004', 'Safety Equipment', 'Personal protective equipment (PPE) and facility safety gear'),
  ('c0000001-0000-0000-0000-000000000005', 'Finished Goods', 'Completed products ready for client delivery')
ON CONFLICT (id) DO NOTHING;

-- 3. Warehouses
INSERT INTO warehouses (id, name, code, address, manager_id, status)
VALUES
  ('w0000001-0000-0000-0000-000000000001', 'Main Warehouse', 'WH-MAIN', '104 Logistics Blvd, Sector 4, Chicago, IL', 'a0000001-0000-0000-0000-000000000001', 'active'),
  ('w0000001-0000-0000-0000-000000000002', 'Production Warehouse', 'WH-PROD', '88 Assembly Way, Bay 3, Gary, IN', 'a0000001-0000-0000-0000-000000000001', 'active'),
  ('w0000001-0000-0000-0000-000000000003', 'Secondary Warehouse', 'WH-SEC', '12 Depot Road, Unit B, Milwaukee, WI', 'a0000001-0000-0000-0000-000000000001', 'active')
ON CONFLICT (id) DO NOTHING;

-- 4. Locations
INSERT INTO locations (id, warehouse_id, name, code, capacity)
VALUES
  ('l0000001-0000-0000-0000-000000000001', 'w0000001-0000-0000-0000-000000000001', 'WH/Stock-1', 'LOC-S1', 5000),
  ('l0000001-0000-0000-0000-000000000002', 'w0000001-0000-0000-0000-000000000001', 'WH/Stock-2', 'LOC-S2', 3000),
  ('l0000001-0000-0000-0000-000000000003', 'w0000001-0000-0000-0000-000000000001', 'Rack A', 'LOC-RA', 1500),
  ('l0000001-0000-0000-0000-000000000004', 'w0000001-0000-0000-0000-000000000002', 'Rack B', 'LOC-RB', 1500),
  ('l0000001-0000-0000-0000-000000000005', 'w0000001-0000-0000-0000-000000000002', 'Production Floor', 'LOC-PF', 4000)
ON CONFLICT (id) DO NOTHING;

-- 5. Suppliers
INSERT INTO suppliers (id, name, email, phone, address)
VALUES
  ('s0000001-0000-0000-0000-000000000001', 'Steel Industries Ltd', 'procurement@steelind.com', '+1 (555) 234-5678', '900 Industrial Parkway, Gary, IN'),
  ('s0000001-0000-0000-0000-000000000002', 'Azure Interior', 'orders@azureinterior.com', '+1 (555) 876-5432', '45 Design Center Way, Suite 10, Chicago, IL'),
  ('s0000001-0000-0000-0000-000000000003', 'Global Supplies Corp', 'support@globalsupplies.com', '+1 (555) 998-1122', '310 World Trade Ave, New York, NY')
ON CONFLICT (id) DO NOTHING;

-- 6. Products
INSERT INTO products (id, name, sku, category_id, unit, reorder_level, description, active)
VALUES
  ('p0000001-0000-0000-0000-000000000001', 'Steel Rods', 'RAW-STL-001', 'c0000001-0000-0000-0000-000000000001', 'kg', 50, 'High-grade galvanized structural steel rods, 12mm diameter', true),
  ('p0000001-0000-0000-0000-000000000002', 'Office Chair', 'FUR-CHR-002', 'c0000001-0000-0000-0000-000000000002', 'pcs', 10, 'Ergonomic mesh swivel office chair with lumbar support', true),
  ('p0000001-0000-0000-0000-000000000003', 'Laptop', 'ELE-LAP-003', 'c0000001-0000-0000-0000-000000000003', 'pcs', 15, 'Enterprise 14-inch workstation laptops with Core i7 and 32GB RAM', true),
  ('p0000001-0000-0000-0000-000000000004', 'Safety Helmet', 'SAF-HLM-004', 'c0000001-0000-0000-0000-000000000004', 'pcs', 25, 'ANSI Z89.1 certified high-visibility yellow hard hat with chin strap', true),
  ('p0000001-0000-0000-0000-000000000005', 'Cement Bags', 'RAW-CEM-005', 'c0000001-0000-0000-0000-000000000001', 'bags', 40, 'Portland Type I/II general construction cement, 50kg bag', true),
  ('p0000001-0000-0000-0000-000000000006', 'Copper Wire', 'ELE-COP-006', 'c0000001-0000-0000-0000-000000000003', 'meters', 100, 'Heavy-duty insulated copper electrical wiring spool', true),
  ('p0000001-0000-0000-0000-000000000007', 'Desk', 'FUR-DSK-007', 'c0000001-0000-0000-0000-000000000002', 'pcs', 8, 'Electric motorized dual-motor height adjustable sit-stand desk', true),
  ('p0000001-0000-0000-0000-000000000008', 'Industrial Gloves', 'SAF-GLV-008', 'c0000001-0000-0000-0000-000000000004', 'pairs', 30, 'Cut-resistant level 5 polyurethane dipped work gloves', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Inventory Holdings
INSERT INTO inventory (id, product_id, warehouse_id, location_id, quantity, reserved_quantity)
VALUES
  ('i0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 'w0000001-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000001', 100, 0),
  ('i0000001-0000-0000-0000-000000000002', 'p0000001-0000-0000-0000-000000000002', 'w0000001-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000003', 14, 2),
  ('i0000001-0000-0000-0000-000000000003', 'p0000001-0000-0000-0000-000000000003', 'w0000001-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000002', 8, 0),
  ('i0000001-0000-0000-0000-000000000004', 'p0000001-0000-0000-0000-000000000004', 'w0000001-0000-0000-0000-000000000002', 'l0000001-0000-0000-0000-000000000004', 45, 0),
  ('i0000001-0000-0000-0000-000000000005', 'p0000001-0000-0000-0000-000000000005', 'w0000001-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000001', 120, 10),
  ('i0000001-0000-0000-0000-000000000006', 'p0000001-0000-0000-0000-000000000006', 'w0000001-0000-0000-0000-000000000002', 'l0000001-0000-0000-0000-000000000005', 350, 0),
  ('i0000001-0000-0000-0000-000000000007', 'p0000001-0000-0000-0000-000000000007', 'w0000001-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000003', 4, 0),
  ('i0000001-0000-0000-0000-000000000008', 'p0000001-0000-0000-0000-000000000008', 'w0000001-0000-0000-0000-000000000002', 'l0000001-0000-0000-0000-000000000004', 0, 0)
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Stock Ledger History
INSERT INTO stock_ledger (id, reference, product_id, warehouse_id, location_id, operation_type, quantity_before, quantity_change, quantity_after, user_id, reason, created_at)
VALUES
  ('g0000001-0000-0000-0000-000000000001', 'INIT/001', 'p0000001-0000-0000-0000-000000000001', 'w0000001-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000001', 'INITIAL_STOCK', 0, 100, 100, 'a0000001-0000-0000-0000-000000000001', 'Initial baseline warehouse inventory', NOW() - INTERVAL '5 days'),
  ('g0000001-0000-0000-0000-000000000002', 'INIT/002', 'p0000001-0000-0000-0000-000000000002', 'w0000001-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000003', 'INITIAL_STOCK', 0, 16, 16, 'a0000001-0000-0000-0000-000000000001', 'Initial baseline warehouse inventory', NOW() - INTERVAL '4 days'),
  ('g0000001-0000-0000-0000-000000000003', 'WH/OUT/0000', 'p0000001-0000-0000-0000-000000000002', 'w0000001-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000003', 'DELIVERY', 16, -2, 14, 'a0000001-0000-0000-0000-000000000002', 'Customer Delivery fulfillment', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- 9. Sample Receipts
INSERT INTO receipts (id, reference, supplier_id, warehouse_id, schedule_date, responsible_id, status)
VALUES
  ('r0000001-0000-0000-0000-000000000001', 'WH/IN/0001', 's0000001-0000-0000-0000-000000000001', 'w0000001-0000-0000-0000-000000000001', CURRENT_DATE, 'a0000001-0000-0000-0000-000000000001', 'ready'),
  ('r0000001-0000-0000-0000-000000000002', 'WH/IN/0002', 's0000001-0000-0000-0000-000000000003', 'w0000001-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '2 days', 'a0000001-0000-0000-0000-000000000002', 'waiting')
ON CONFLICT (id) DO NOTHING;

INSERT INTO receipt_items (id, receipt_id, product_id, expected_quantity, received_quantity)
VALUES
  ('ri000001-0000-0000-0000-000000000001', 'r0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 50, 50),
  ('ri000001-0000-0000-0000-000000000002', 'r0000001-0000-0000-0000-000000000002', 'p0000001-0000-0000-0000-000000000008', 50, 0)
ON CONFLICT (id) DO NOTHING;

-- 10. Sample Deliveries
INSERT INTO deliveries (id, reference, warehouse_id, contact, delivery_address, schedule_date, responsible_id, operation_type, status)
VALUES
  ('d0000001-0000-0000-0000-000000000001', 'WH/OUT/0001', 'w0000001-0000-0000-0000-000000000001', 'Azure Interior', '45 Design Center Way, Suite 10, Chicago, IL', CURRENT_DATE, 'a0000001-0000-0000-0000-000000000001', 'Customer Delivery', 'ready'),
  ('d0000001-0000-0000-0000-000000000002', 'WH/OUT/0002', 'w0000001-0000-0000-0000-000000000001', 'Northwest Builders', '720 Michigan Ave, Chicago, IL', CURRENT_DATE + INTERVAL '1 day', 'a0000001-0000-0000-0000-000000000002', 'Customer Delivery', 'waiting')
ON CONFLICT (id) DO NOTHING;

INSERT INTO delivery_items (id, delivery_id, product_id, quantity)
VALUES
  ('di000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000002', 4),
  ('di000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002', 'p0000001-0000-0000-0000-000000000005', 20)
ON CONFLICT (id) DO NOTHING;

-- 11. Sample Internal Transfers
INSERT INTO internal_transfers (id, reference, source_warehouse_id, source_location_id, destination_warehouse_id, destination_location_id, schedule_date, responsible_id, status)
VALUES
  ('t0000001-0000-0000-0000-000000000001', 'WH/INT/0001', 'w0000001-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000001', 'w0000001-0000-0000-0000-000000000002', 'l0000001-0000-0000-0000-000000000005', CURRENT_DATE, 'a0000001-0000-0000-0000-000000000001', 'ready')
ON CONFLICT (id) DO NOTHING;

INSERT INTO internal_transfer_items (id, transfer_id, product_id, quantity)
VALUES
  ('ti000001-0000-0000-0000-000000000001', 't0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 20)
ON CONFLICT (id) DO NOTHING;

-- 12. Sample Inventory Adjustment
INSERT INTO inventory_adjustments (id, reference, warehouse_id, location_id, product_id, system_quantity, counted_quantity, difference, reason, notes, responsible_id, status)
VALUES
  ('j0000001-0000-0000-0000-000000000001', 'WH/ADJ/0001', 'w0000001-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000003', 'p0000001-0000-0000-0000-000000000007', 7, 4, -3, 'Damaged', 'Three desks incurred water damage during roofing inspection', 'a0000001-0000-0000-0000-000000000001', 'ready')
ON CONFLICT (id) DO NOTHING;

-- 13. Sample Alerts
INSERT INTO alerts (id, type, product_id, warehouse_id, message, severity, read)
VALUES
  ('al000001-0000-0000-0000-000000000001', 'OUT_OF_STOCK', 'p0000001-0000-0000-0000-000000000008', 'w0000001-0000-0000-0000-000000000002', 'Industrial Gloves stock has reached 0 pairs in Production Warehouse. Urgent reorder required.', 'critical', false),
  ('al000001-0000-0000-0000-000000000002', 'LOW_STOCK', 'p0000001-0000-0000-0000-000000000003', 'w0000001-0000-0000-0000-000000000001', 'Laptops are below reorder level (8 remaining, threshold is 15).', 'warning', false),
  ('al000001-0000-0000-0000-000000000003', 'LOW_STOCK', 'p0000001-0000-0000-0000-000000000007', 'w0000001-0000-0000-0000-000000000001', 'Motorized Desks are below reorder level (4 remaining, threshold is 8).', 'warning', false)
ON CONFLICT (id) DO NOTHING;
