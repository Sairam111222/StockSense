import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/lib/inventory/service';

// GET /api/products — Fetch list of products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const products = inventoryService.getProducts({
      categoryId: category,
      search: search
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve products';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/products — Create a new product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.sku || !body.category_id || !body.warehouse_id) {
      return NextResponse.json(
        { success: false, error: 'Product name, SKU, category_id, and warehouse_id are required' },
        { status: 400 }
      );
    }

    const res = inventoryService.createProduct(body);

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || 'Failed to create product' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: res.product
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create product';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
