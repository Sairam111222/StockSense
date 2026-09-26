'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { inventoryService } from '@/lib/inventory/service';

const COLORS = ['#F43F5E', '#FB7185', '#38BDF8', '#818CF8', '#34D399', '#FBBF24'];

export function CategoryStockChart() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<{ name: string; quantity: number; count: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    setData(inventoryService.getCategoryBreakdown());

    const handleUpdate = () => {
      setData(inventoryService.getCategoryBreakdown());
    };
    window.addEventListener('stocksense_state_updated', handleUpdate);
    return () => window.removeEventListener('stocksense_state_updated', handleUpdate);
  }, []);

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-500">Loading categories...</div>;
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
          <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              borderColor: 'rgba(244, 63, 94, 0.3)',
              borderRadius: '0.75rem',
              color: '#F8FAFC',
              fontSize: '12px'
            }}
            formatter={(value: any) => [`${value} units`, 'Stock Quantity']}
          />
          <Bar dataKey="quantity" radius={[0, 6, 6, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
