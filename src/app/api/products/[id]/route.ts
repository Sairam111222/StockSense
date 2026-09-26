import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/lib/inventory/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/products/[id]
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const product = inventoryService.getProductById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const locations = inventoryService.getProductLocations(id);

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        locations
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching product';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id]
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();

    const res = inventoryService.updateProduct(id, body);

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: res.product
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating product';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const res = inventoryService.deleteProduct(id);

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error deleting product';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
