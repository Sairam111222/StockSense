import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/lib/inventory/service';

export async function GET() {
  try {
    const receipts = inventoryService.getReceipts();
    return NextResponse.json({
      success: true,
      count: receipts.length,
      data: receipts
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching receipts';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = inventoryService.createReceipt(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error creating receipt';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
