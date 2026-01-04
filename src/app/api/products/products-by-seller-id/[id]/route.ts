import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Add pagination
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    // Forward all filter parameters
    if (searchParams.get('search')) {
      queryParams.append('search', searchParams.get('search')!);
    }
    if (searchParams.get('category')) {
      queryParams.append('category', searchParams.get('category')!);
    }
    if (searchParams.get('filterType')) {
      queryParams.append('filterType', searchParams.get('filterType')!);
    }
    if (searchParams.get('priceMin')) {
      queryParams.append('priceMin', searchParams.get('priceMin')!);
    }
    if (searchParams.get('priceMax')) {
      queryParams.append('priceMax', searchParams.get('priceMax')!);
    }
    if (searchParams.get('stockStatus')) {
      queryParams.append('stockStatus', searchParams.get('stockStatus')!);
    }
    if (searchParams.get('sortBy')) {
      queryParams.append('sortBy', searchParams.get('sortBy')!);
    }
    if (searchParams.get('order')) {
      queryParams.append('order', searchParams.get('order')!);
    }
    if (searchParams.get('column')) {
      queryParams.append('column', searchParams.get('column')!);
    }

    const response = await fetch(
      `${BACKEND_URL}/api/products/products-by-seller-id/${id}?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Products by seller fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

