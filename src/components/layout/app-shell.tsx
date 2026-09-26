'use client';

import React, { useState, createContext, useContext } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { CommandPalette } from '@/components/ui/command-palette';
import { X } from 'lucide-react';

interface WarehouseFilterContextType {
  selectedWarehouse: string;
  setSelectedWarehouse: (id: string) => void;
}

export const WarehouseFilterContext = createContext<WarehouseFilterContextType>({
  selectedWarehouse: 'all',
  setSelectedWarehouse: () => {}
});

export function useWarehouseFilter() {
  return useContext(WarehouseFilterContext);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  return (
    <WarehouseFilterContext.Provider value={{ selectedWarehouse, setSelectedWarehouse }}>
      <div className="flex h-screen bg-[#090D16] text-slate-100 overflow-hidden font-sans">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex flex-col w-64 max-w-xs bg-[#0A0D16] z-10 animate-in slide-in-from-left duration-200 shadow-2xl border-r border-slate-800">
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            selectedWarehouse={selectedWarehouse}
            onSelectWarehouse={setSelectedWarehouse}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#090D16]/90">
            {children}
          </main>
        </div>

        {/* Global Search Command Palette */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      </div>
    </WarehouseFilterContext.Provider>
  );
}
