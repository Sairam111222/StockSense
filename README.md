# 📦 StockSense — Smart Inventory Management System

A complete, production-ready, full-stack Inventory Management System built for hackathon showcasing. All actions are functional — every button updates the data store and immediately reflects across the UI.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

## 🔑 Demo Credentials

The app ships with 3 built-in demo accounts. Use these on the login page:

| Role | Email | Password |
|------|-------|----------|
| 🔴 **Manager** | `alex.manager@stocksense.io` | `Manager@123` |
| 🔵 **Staff** | `marcus.staff@stocksense.io` | `Staff@123` |
| 🟡 **Admin** | `sarah.admin@stocksense.io` | `Admin@123` |

> All credentials are displayed on the login page with 1-click copy and auto-fill.

---

## 🏗️ Tech Stack

| Technology | Usage |
|------------|-------|
| **Next.js 16** | App Router, Server/Client Components |
| **TypeScript** | Full type safety |
| **Tailwind CSS** | Dark theme, responsive design |
| **Recharts** | Stock movement & category charts |
| **Lucide React** | Icon system |
| **Supabase** | Auth + PostgreSQL (optional) |
| **localStorage** | Client-side persistence (default) |

---

## 📁 Project Structure

```
StockSense/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── login/                    # Authentication - Login
│   │   ├── signup/                   # Authentication - Registration
│   │   ├── forgot-password/          # Authentication - Password Recovery
│   │   ├── dashboard/                # Main dashboard with live stats
│   │   ├── products/                 # Product CRUD (list, create, view, edit)
│   │   │   ├── new/                  # Create new product
│   │   │   └── [id]/                 # Product detail & edit
│   │   ├── warehouses/               # Warehouse management
│   │   │   └── [id]/                 # Warehouse detail with locations
│   │   ├── operations/               # All inventory operations
│   │   │   ├── receipts/             # Incoming stock (create, validate)
│   │   │   ├── deliveries/           # Outgoing stock (create, print slip)
│   │   │   ├── transfers/            # Warehouse-to-warehouse moves
│   │   │   ├── adjustments/          # Stock count reconciliation
│   │   │   └── moves/               # Full movement history
│   │   ├── alerts/                   # Low/out-of-stock alerts
│   │   ├── ledger/                   # Immutable stock ledger
│   │   ├── profile/                  # User profile
│   │   ├── settings/                 # App settings
│   │   ├── globals.css               # Design system & custom styles
│   │   ├── layout.tsx                # Root layout with providers
│   │   └── page.tsx                  # Root redirect → /login
│   │
│   ├── components/
│   │   ├── dashboard/                # Dashboard-specific charts
│   │   │   ├── stock-chart.tsx       # Stock movement line chart
│   │   │   └── category-chart.tsx    # Category distribution chart
│   │   ├── layout/                   # App layout components
│   │   │   ├── app-shell.tsx         # Main shell (sidebar + topbar + content)
│   │   │   ├── sidebar.tsx           # Navigation sidebar with role switcher
│   │   │   └── topbar.tsx            # Top bar with search & warehouse filter
│   │   ├── ui/                       # Reusable UI primitives
│   │   │   ├── command-palette.tsx   # Global search (Ctrl+K)
│   │   │   ├── empty-state.tsx       # Empty state placeholder
│   │   │   ├── modal.tsx             # Modal dialog
│   │   │   ├── status-badge.tsx      # Operation status badges
│   │   │   └── toast.tsx             # Toast notification system
│   │   └── providers.tsx             # Auth + Toast context providers
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   └── context.tsx           # Auth context with demo accounts
│   │   ├── inventory/
│   │   │   └── service.ts            # Core inventory business logic (1200+ lines)
│   │   ├── store/
│   │   │   └── demo-data.ts          # Seed data for demo mode
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser Supabase client
│   │   │   └── server.ts             # Server Supabase client
│   │   └── utils.ts                  # Utility helpers (cn, formatNumber, formatDate)
│   │
│   └── types/
│       └── index.ts                  # TypeScript domain interfaces
│
├── supabase/
│   ├── migrations/
│   │   └── 20240101000000_init.sql   # Database schema with RLS
│   └── seed.sql                      # Demo seed data for Supabase
│
├── .env.example                      # Environment variables template
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
└── README.md                         # This file
```

---

## ✨ Features

### 🔐 Authentication
- Email + Password login with validation
- 3 demo accounts with visible credentials
- Sign up with role selection
- Password recovery flow
- Role-based access (Manager / Staff / Admin)
- Instant role switching for demo

### 📊 Dashboard
- Live KPI cards (products, stock, alerts, operations)
- Stock movement trend chart (7/30/90 days)
- Category distribution chart
- Smart AI-powered insights
- Low stock alerts panel
- Recent operations feed

### 📦 Products
- Full CRUD with search, filter, sort, pagination
- Category & warehouse filtering
- Stock status indicators (OK / Low / Out)
- Product detail page with stock breakdown

### 🏭 Operations
- **Receipts**: Create → Validate → Stock increases
- **Deliveries**: Create → Validate → Stock decreases (with availability check)
- **Transfers**: Source → Destination atomic stock moves
- **Adjustments**: Physical count vs. system quantity reconciliation
- **Move History**: Complete timeline of all stock movements

### 📒 Stock Ledger
- Immutable, timestamped record of every stock change
- Before/after quantities for audit trail

### 🔔 Alerts
- Auto-generated low stock and out-of-stock alerts
- Based on configurable reorder thresholds

---

## ☁️ Supabase Setup (Optional)

The app works immediately with built-in demo data. To connect Supabase:

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/20240101000000_init.sql` in SQL Editor
3. Optionally run `supabase/seed.sql` for demo data
4. Copy `.env.example` to `.env.local` and fill in your credentials

---

## 📄 License

MIT — Built for hackathon demonstration.
