import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();

    // Forward the form data to the backend
    const response = await fetch(`${BACKEND_URL}/api/payout/upload-receipts`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Upload receipts error:', error);
    return NextResponse.json(
      { error: 'Failed to upload receipts' },
      { status: 500 }
    );
  }
}

