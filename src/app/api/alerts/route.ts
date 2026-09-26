import { NextResponse } from 'next/server';
import { inventoryService } from '@/lib/inventory/service';

export async function GET() {
  try {
    const alerts = inventoryService.getAlerts();
    return NextResponse.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching alerts';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
