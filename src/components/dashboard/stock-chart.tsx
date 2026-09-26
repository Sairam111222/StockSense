'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { inventoryService } from '@/lib/inventory/service';

interface StockChartProps {
  days: 7 | 30 | 90;
}

export function StockMovementChart({ days }: StockChartProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<{ date: string; incoming: number; outgoing: number; adjustments: number; transfers: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    setData(inventoryService.getStockMovementChart(days));

    const handleUpdate = () => {
      setData(inventoryService.getStockMovementChart(days));
    };
    window.addEventListener('stocksense_state_updated', handleUpdate);
    return () => window.removeEventListener('stocksense_state_updated', handleUpdate);
  }, [days]);

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-500">Loading metrics...</div>;
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorTransfers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              borderColor: 'rgba(244, 63, 94, 0.3)',
              borderRadius: '0.75rem',
              color: '#F8FAFC',
              fontSize: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
          />
          <Area
            type="monotone"
            dataKey="incoming"
            name="Incoming (Vendor Intake)"
            stroke="#10B981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorIncoming)"
          />
          <Area
            type="monotone"
            dataKey="outgoing"
            name="Outgoing (Deliveries)"
            stroke="#F43F5E"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorOutgoing)"
          />
          <Area
            type="monotone"
            dataKey="transfers"
            name="Internal Transfers"
            stroke="#38BDF8"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#colorTransfers)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
