import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Forward query parameters to backend
    const queryParams = new URLSearchParams();
    
    // Add pagination
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '12';
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    // Add optional filters
    if (searchParams.get('category')) {
      queryParams.append('category', searchParams.get('category')!);
    }
    if (searchParams.get('search')) {
      queryParams.append('search', searchParams.get('search')!);
    }
    if (searchParams.get('seller')) {
      queryParams.append('seller', searchParams.get('seller')!);
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
    if (searchParams.get('minStock')) {
      queryParams.append('minStock', searchParams.get('minStock')!);
    }
    if (searchParams.get('maxStock')) {
      queryParams.append('maxStock', searchParams.get('maxStock')!);
    }
    if (searchParams.get('isActive')) {
      queryParams.append('isActive', searchParams.get('isActive')!);
    }
    if (searchParams.get('includeInactive')) {
      queryParams.append('includeInactive', searchParams.get('includeInactive')!);
    }
    if (searchParams.get('onSale')) {
      queryParams.append('onSale', searchParams.get('onSale')!);
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

    const response = await fetch(`${BACKEND_URL}/api/products/?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const response = await fetch(`${BACKEND_URL}/api/products`, {
      method: 'POST',
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

