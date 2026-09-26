import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/lib/inventory/service';

export async function GET() {
  try {
    const transfers = inventoryService.getTransfers();
    return NextResponse.json({
      success: true,
      count: transfers.length,
      data: transfers
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching transfers';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = inventoryService.createTransfer(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error creating transfer';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
