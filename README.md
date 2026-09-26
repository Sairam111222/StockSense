# 📦 StockSense — Smart Inventory Management System

A complete, production-ready, full-stack Inventory Management System built with Next.js App Router, TypeScript, and Tailwind CSS. StockSense is engineered with clear separation between **Frontend UI**, **Backend REST APIs**, **Server Business Logic**, and **Database Layer**.

---

## 🏗️ Architecture: Frontend & Backend Separation

StockSense is structured as a modern full-stack application with distinct client and server boundaries:

```
StockSense/
├── 🔵 FRONTEND (Client Layer)
│   ├── src/app/                          # Interactive App Router pages (Dashboard, Operations, Products)
│   ├── src/components/                   # Reusable UI primitives, Modals, Toasts, Charts, Shells
│   ├── src/client/api.ts                 # Type-safe client SDK querying backend REST endpoints
│   └── src/lib/auth/context.tsx          # Client-side session & role context
│
├── 🟢 BACKEND (Server & API Layer)
│   ├── src/app/api/                      # Next.js Server Route Handlers (REST Endpoints)
│   │   ├── health/                       # System health & uptime monitor
│   │   ├── products/                     # Product catalog & CRUD operations
│   │   ├── warehouses/                   # Warehouse & storage location endpoints
│   │   ├── operations/                   # Receipts, Deliveries, Transfers, Adjustments
│   │   ├── alerts/                       # Real-time replenishment alerts
│   │   └── dashboard/stats/              # Aggregated KPI and analytical metrics
│   ├── src/server/                       # Server-side business logic & services
│   │   ├── services/inventory.service.ts # Core inventory domain engine
│   │   └── db/client.ts                  # Server database client & connection handlers
│   └── src/lib/inventory/service.ts      # Transaction engine & inventory state machine
│
├── 🗄️ DATABASE & PERSISTENCE
│   ├── supabase/migrations/              # PostgreSQL schemas, tables & Row Level Security
│   ├── supabase/seed.sql                 # Production & demo seed dataset
│   └── src/lib/store/demo-data.ts        # Built-in zero-config demo store
│
└── ⚙️ CI / CD & DEPLOYMENT
    └── .github/workflows/ci.yml          # GitHub Actions Automated Build & Verification
```

---

## 🔌 Backend REST API Reference

All backend endpoints are available under `/api/*` and return standard JSON responses:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | System health check, version, and service status |
| `GET` | `/api/products` | Retrieve all products (supports `?category=` & `?search=`) |
| `POST` | `/api/products` | Create a new SKU / product |
| `GET` | `/api/products/:id` | Fetch product details and warehouse stock locations |
| `PUT` | `/api/products/:id` | Update product attributes and reorder safety levels |
| `DELETE` | `/api/products/:id` | Soft-delete / remove product |
| `GET` | `/api/warehouses` | Fetch warehouse facilities & capacity metrics |
| `GET` | `/api/operations/receipts` | Incoming vendor shipments & check-in records |
| `POST` | `/api/operations/receipts` | Record and process new stock arrival |
| `GET` | `/api/operations/deliveries` | Outgoing customer orders & dispatch slips |
| `POST` | `/api/operations/deliveries` | Create delivery order & reserve inventory |
| `GET` | `/api/operations/transfers` | Warehouse-to-warehouse stock relocations |
| `POST` | `/api/operations/transfers` | Execute inter-facility transfer |
| `GET` | `/api/operations/adjustments` | Cycle count reconciliations & variance records |
| `POST` | `/api/operations/adjustments` | Post inventory adjustment with reason |
| `GET` | `/api/alerts` | Active low-stock and out-of-stock warning triggers |
| `GET` | `/api/dashboard/stats` | Live KPI calculations (Stock value, moves, pending) |

---

## 🔑 Demo Credentials

The application provides 3 pre-configured demo operator accounts ready on the login screen:

| Role | Email | Password | Access Scope |
|------|-------|----------|--------------|
| 🔴 **Manager** | `alex.manager@stocksense.io` | `Manager@123` | Full operational control, approvals & reorder rules |
| 🔵 **Staff** | `marcus.staff@stocksense.io` | `Staff@123` | Inventory check-in, picking, packing & moves |
| 🟡 **Admin** | `sarah.admin@stocksense.io` | `Admin@123` | System configuration, audit ledger & user roles |

*Each account features 1-click auto-fill, instant quick login, and copy-to-clipboard on [`/login`](/login).*

---

## 🚀 Getting Started

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

### Production Build Verification
```bash
npm run build
npm run start
```

---

## 🛠️ GitHub & Vercel Deployment Notes

### Resolving the GitHub Commit Status (Red ❌)
If you see a red cross ❌ on GitHub beside a commit:
1. **Cause**: In your Vercel team account, multiple projects were linked to the same repository.
   - `stock-sense` -> **Success ✅**
   - `stock-sense-xcvb` -> **Success ✅**
   - `stock` (old project) -> **Failed ❌** (due to old configuration or mismatched root directory)
2. **Fix**: In your [Vercel Dashboard](https://vercel.com/dashboard):
   - Open the old **`stock`** project.
   - Go to **Settings > General** -> Delete or disconnect the project.
   - Your primary deployment is **`stock-sense`**, which builds with 100% success!
3. **Automated CI**: The repository now includes `.github/workflows/ci.yml`, running automated type checks and builds on every commit to ensure guaranteed stability.
