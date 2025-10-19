import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('sellerId');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }

    // Fetch seller data from backend
    const response = await fetch(`${BACKEND_URL}/api/users/get-seller-data-for-shop/${id}`, {
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
    console.error('Seller data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seller data' },
      { status: 500 }
    );
  }
}
