import { NextResponse } from 'next/server';
import { inventoryService } from '@/lib/inventory/service';

export async function GET() {
  try {
    const stats = inventoryService.getDashboardStats();
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching dashboard stats';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
