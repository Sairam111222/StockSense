import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/lib/inventory/service';

export async function GET() {
  try {
    const deliveries = inventoryService.getDeliveries();
    return NextResponse.json({
      success: true,
      count: deliveries.length,
      data: deliveries
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching deliveries';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = inventoryService.createDelivery(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error creating delivery';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
