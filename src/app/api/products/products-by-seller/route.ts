import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/products/products-by-seller`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
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

