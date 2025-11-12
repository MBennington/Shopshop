import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

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

