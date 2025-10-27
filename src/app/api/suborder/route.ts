import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mainOrderId = searchParams.get('mainOrderId');
    const sellerId = searchParams.get('sellerId');
    const subOrderId = searchParams.get('subOrderId');

    // Get token from request headers
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    let url = `${BACKEND_URL}/api/suborder/`;
    
    if (mainOrderId) {
      url += `main-order/${mainOrderId}`;
    } else if (sellerId) {
      url += `seller/${sellerId}`;
    } else if (subOrderId) {
      url += subOrderId;
    } else {
      return NextResponse.json(
        { error: 'Either mainOrderId, sellerId, or subOrderId is required' },
        { status: 400 }
      );
    }

    // Add query parameters
    const queryParams = new URLSearchParams();
    if (searchParams.get('page')) queryParams.append('page', searchParams.get('page')!);
    if (searchParams.get('limit')) queryParams.append('limit', searchParams.get('limit')!);
    if (searchParams.get('status')) queryParams.append('status', searchParams.get('status')!);
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    // Fetch sub-order details from backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.msg || 'Failed to fetch sub-order details' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Sub-order fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subOrderId = searchParams.get('subOrderId');
    const action = searchParams.get('action'); // 'status', 'tracking', 'confirm-delivery'

    if (!subOrderId) {
      return NextResponse.json(
        { error: 'Sub-order ID is required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required (status, tracking, confirm-delivery)' },
        { status: 400 }
      );
    }

    // Get token from request headers
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    let url = `${BACKEND_URL}/api/suborder/${subOrderId}/`;

    // Determine the correct endpoint based on action
    switch (action) {
      case 'status':
        url += 'status';
        break;
      case 'tracking':
        url += 'tracking';
        break;
      case 'confirm-delivery':
        url += 'confirm-delivery';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: status, tracking, or confirm-delivery' },
          { status: 400 }
        );
    }

    // Update sub-order in backend
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.msg || 'Failed to update sub-order' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Sub-order update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
