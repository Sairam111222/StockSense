'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  Building2,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Shield
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { inventoryService } from '@/lib/inventory/service';
import { Warehouse, Alert } from '@/types';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
  selectedWarehouse: string;
  onSelectWarehouse: (id: string) => void;
}

export function Topbar({
  onOpenMobileMenu,
  onOpenCommandPalette,
  selectedWarehouse,
  onSelectWarehouse
}: TopbarProps) {
  const { user, role, logout } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setWarehouses(inventoryService.getWarehouses());
    setAlerts(inventoryService.getAlerts());

    const handleUpdate = () => {
      setAlerts(inventoryService.getAlerts());
    };
    window.addEventListener('stocksense_state_updated', handleUpdate);
    return () => window.removeEventListener('stocksense_state_updated', handleUpdate);
  }, []);

  const unreadAlerts = alerts.filter(a => !a.read);

  return (
    <header className="h-16 bg-[#0A0D16]/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:border-rose-500/40 hover:text-slate-200 transition-all text-xs w-48 sm:w-72"
        >
          <Search className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="truncate">Search products, references...</span>
          <kbd className="hidden sm:inline-flex items-center ml-auto px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
            Ctrl K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Warehouse Selector */}
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Building2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <select
              value={selectedWarehouse}
              onChange={e => onSelectWarehouse(e.target.value)}
              className="bg-transparent text-slate-200 font-medium outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-[#0F172A] text-white">All Warehouses</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id} className="bg-[#0F172A] text-white">
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setAlertsOpen(!alertsOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 relative transition-colors"
            title="Stock Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0A0D16] animate-pulse" />
            )}
          </button>

          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0F172A] border border-rose-500/30 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live Inventory Alerts</h4>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {unreadAlerts.length} Active
                  </span>
                </div>
                <Link
                  href="/alerts"
                  onClick={() => setAlertsOpen(false)}
                  className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                >
                  View All <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto my-2">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No active alerts at this time.</p>
                ) : (
                  alerts.slice(0, 5).map(al => (
                    <div key={al.id} className="py-2.5 flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {al.severity === 'critical' ? (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white truncate">{al.product_name || 'Item'}</span>
                          <span className="text-[10px] font-mono text-slate-400">{al.warehouse_name}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">{al.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar / Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 font-bold text-xs">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <span className="hidden md:inline-block text-xs font-semibold text-slate-200">
              {user?.full_name || 'Alex Vance'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 border-b border-slate-800 mb-1">
                <p className="text-xs font-semibold text-white">{user?.full_name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-rose-300 uppercase tracking-wider w-fit">
                  <Shield className="w-3 h-3" /> {role}
                </div>
              </div>
              <Link
                href="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile Settings
              </Link>
              <Link
                href="/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                System Settings
              </Link>
              <div className="border-t border-slate-800 my-1" />
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
