import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (searchParams.get('category')) {
      queryParams.append('category', searchParams.get('category')!);
    }
    if (searchParams.get('sellerId')) {
      queryParams.append('sellerId', searchParams.get('sellerId')!);
    }
    if (searchParams.get('page')) {
      queryParams.append('page', searchParams.get('page')!);
    }
    if (searchParams.get('limit')) {
      queryParams.append('limit', searchParams.get('limit')!);
    }
    if (searchParams.get('search')) {
      queryParams.append('search', searchParams.get('search')!);
    }

    const response = await fetch(
      `${BACKEND_URL}/api/admin/products?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

