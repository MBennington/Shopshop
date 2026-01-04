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
    
    if (searchParams.get('period')) {
      queryParams.append('period', searchParams.get('period')!);
    }
    if (searchParams.get('startDate')) {
      queryParams.append('startDate', searchParams.get('startDate')!);
    }
    if (searchParams.get('endDate')) {
      queryParams.append('endDate', searchParams.get('endDate')!);
    }

    const response = await fetch(
      `${BACKEND_URL}/api/seller/analytics?${queryParams.toString()}`,
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
    console.error('Seller analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seller analytics' },
      { status: 500 }
    );
  }
}



