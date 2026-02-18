import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

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
    if (searchParams.get('search')) queryParams.append('search', searchParams.get('search')!);
    
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

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response from backend:', text.substring(0, 200));
      return NextResponse.json(
        { error: 'Invalid response from server. Please check backend logs.' },
        { status: 500 }
      );
    }

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.msg || result.error || 'Failed to fetch sub-order details' },
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
        { error: 'Action is required (status, tracking, confirm-delivery, buyer-confirm-delivery)' },
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
      case 'buyer-confirm-delivery':
        url += 'buyer-confirm-delivery';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: status, tracking, confirm-delivery, or buyer-confirm-delivery' },
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
