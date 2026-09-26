import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/lib/inventory/service';

export async function GET() {
  try {
    const adjustments = inventoryService.getAdjustments();
    return NextResponse.json({
      success: true,
      count: adjustments.length,
      data: adjustments
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching adjustments';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = inventoryService.createAdjustment(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error creating adjustment';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
