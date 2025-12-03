import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { msg: 'Authentication required', error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { action, ...data } = body;

    let endpoint = '';
    if (action === 'initiate-purchase') {
      endpoint = '/api/gift-cards/payment/initiate';
    } else if (action === 'validate') {
      endpoint = '/api/gift-cards/validate';
    } else {
      return NextResponse.json(
        { msg: 'Invalid action', error: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { msg: result.msg || result.error || 'Request failed', error: result.error },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Gift card API error:', error);
    return NextResponse.json(
      { msg: error.message || 'Internal server error', error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { msg: 'Authentication required', error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Check if requesting payment by ID
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (paymentId) {
      // Fetch payment by ID
      const response = await fetch(`${BACKEND_URL}/api/gift-cards/payment/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { msg: result.msg || result.error || 'Request failed', error: result.error },
          { status: response.status }
        );
      }

      return NextResponse.json(result);
    }

    // Default: fetch user's gift cards
    const response = await fetch(`${BACKEND_URL}/api/gift-cards/user-cards`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { msg: result.msg || result.error || 'Request failed', error: result.error },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Gift card API error:', error);
    return NextResponse.json(
      { msg: error.message || 'Internal server error', error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

