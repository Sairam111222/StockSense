import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    system: 'StockSense Cloud API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'Supabase PostgreSQL / In-Memory Active',
    services: {
      auth: 'active',
      inventory: 'active',
      ledger: 'active',
      analytics: 'active'
    }
  });
}
