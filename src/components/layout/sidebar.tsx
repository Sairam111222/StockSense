'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Truck,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Building2,
  BookOpen,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Layers,
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { inventoryService } from '@/lib/inventory/service';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, switchRole, logout } = useAuth();
  const { info, success } = useToast();
  const [opsOpen, setOpsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    setMounted(true);
    try {
      const alerts = inventoryService.getAlerts();
      setUnreadAlerts(alerts.filter(a => !a.read).length);
    } catch {
      // fallback
    }
  }, []);

  const handleResetDemo = () => {
    if (confirm('Reset application to original demo state? This will reinitialize stock, receipts, and ledger records.')) {
      inventoryService.resetToDemo();
      success('Database Reset', 'Demo datasets and initial inventory reloaded.');
      window.location.reload();
    }
  };

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Operations',
      icon: Layers,
      isSubmenu: true,
      isOpen: opsOpen,
      toggle: () => setOpsOpen(!opsOpen),
      subItems: [
        { title: 'Receipts', href: '/operations/receipts', icon: Truck },
        { title: 'Delivery Orders', href: '/operations/deliveries', icon: Boxes },
        { title: 'Internal Transfers', href: '/operations/transfers', icon: ArrowLeftRight },
        { title: 'Adjustments', href: '/operations/adjustments', icon: SlidersHorizontal },
        { title: 'Move History', href: '/operations/moves', icon: History }
      ]
    },
    {
      title: 'Products',
      href: '/products',
      icon: Boxes
    },
    {
      title: 'Warehouses',
      href: '/warehouses',
      icon: Building2
    },
    {
      title: 'Stock Ledger',
      href: '/ledger',
      icon: BookOpen
    },
    {
      title: 'Alerts',
      href: '/alerts',
      icon: Bell,
      badge: unreadAlerts > 0 ? unreadAlerts : undefined
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ];

  return (
    <aside className="w-64 h-screen bg-[#0A0D16] border-r border-slate-800/80 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-[#0A0D16]/50 backdrop-blur-md">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-rose-900/40 group-hover:scale-105 transition-transform border border-rose-400/30">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-wide text-white">StockSense</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Command Center</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(item => {
          if (item.isSubmenu) {
            const isSubActive = item.subItems?.some(s => pathname.startsWith(s.href));
            return (
              <div key={item.title} className="space-y-1">
                <button
                  onClick={item.toggle}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all",
                    isSubActive ? "text-rose-400 bg-rose-500/10 border border-rose-500/20" : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-slate-400" />
                    <span>{item.title}</span>
                  </div>
                  {item.isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                </button>

                {item.isOpen && (
                  <div className="pl-6 space-y-0.5 border-l border-slate-800/80 ml-4 py-1">
                    {item.subItems?.map(sub => {
                      const isActive = pathname === sub.href || (sub.href !== '/operations' && pathname.startsWith(sub.href));
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={onCloseMobile}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                            isActive
                              ? "bg-rose-500/15 text-rose-300 font-semibold border-l-2 border-rose-500 pl-2.5"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <sub.icon className="w-3.5 h-3.5" />
                            <span>{sub.title}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (!item.href) return null;

          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all",
                isActive
                  ? "bg-rose-600 text-white shadow-md shadow-rose-900/30 font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Demo Fast Reset Button */}
        <div className="pt-4 border-t border-slate-800/60">
          <button
            onClick={handleResetDemo}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-rose-300 hover:bg-rose-950/20 border border-slate-800/60 transition-colors"
            title="Reset database to demo seed state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* User & Role Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0D121F]">
        {/* Role toggle helper for demo test */}
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-rose-400" /> Role
          </span>
          <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
            <button
              onClick={() => {
                switchRole('manager');
                info('Switched to Inventory Manager', 'Full authorization unlocked');
              }}
              className={cn(
                "px-2 py-0.5 rounded transition-colors",
                role === 'manager' ? "bg-rose-600 text-white font-bold" : "text-slate-400 hover:text-white"
              )}
            >
              Manager
            </button>
            <button
              onClick={() => {
                switchRole('staff');
                info('Switched to Warehouse Staff', 'Staff operational mode active');
              }}
              className={cn(
                "px-2 py-0.5 rounded transition-colors",
                role === 'staff' ? "bg-rose-600 text-white font-bold" : "text-slate-400 hover:text-white"
              )}
            >
              Staff
            </button>
            <button
              onClick={() => {
                switchRole('admin');
                info('Switched to System Admin', 'Full system configuration access');
              }}
              className={cn(
                "px-2 py-0.5 rounded transition-colors",
                role === 'admin' ? "bg-amber-600 text-white font-bold" : "text-slate-400 hover:text-white"
              )}
            >
              Admin
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <Link href="/profile" className="flex items-center gap-2.5 min-w-0 hover:opacity-90">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
              {user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Alex Vance'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'manager@stocksense.io'}</p>
            </div>
          </Link>
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
