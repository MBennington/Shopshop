import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, paymentMethod, fromCart, product = null} = body;

    // Get token from request headers
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Prepare order data for backend
    const orderData = {
      address,
      paymentMethod,
      fromCart,
      // If not from cart, include product details
      ...(fromCart ? {} : {
        product_id: product?.id,
        qty: product?.quantity || 1,
        color: product?.color,
        ...(product?.size && { size: product.size })
      })
    };
//console.log("OrderData being sent to backend:", orderData);
    // Send order to backend
    const response = await fetch(`${BACKEND_URL}/api/order/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    //console.log("Response from backend:", result);

    if (!response.ok) {
      return NextResponse.json(
        { error: result.msg || 'Failed to create order' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 