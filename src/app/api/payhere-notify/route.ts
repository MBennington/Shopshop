import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    // Parse form data (PayHere sends data as application/x-www-form-urlencoded)
    const formData = await request.formData();
    
    const merchant_id = formData.get('merchant_id') as string;
    const order_id = formData.get('order_id') as string;
    const payment_id = formData.get('payment_id') as string;
    const payhere_amount = formData.get('payhere_amount') as string;
    const payhere_currency = formData.get('payhere_currency') as string;
    const status_code = formData.get('status_code') as string;
    const md5sig = formData.get('md5sig') as string;
    const custom_1 = formData.get('custom_1') as string;
    const custom_2 = formData.get('custom_2') as string;
    const method = formData.get('method') as string;
    const status_message = formData.get('status_message') as string;

    console.log('PayHere Notification Received:', {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      method,
      status_message
    });

    // Verify the payment notification using md5sig
    const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;
    if (!MERCHANT_SECRET) {
      console.error('PAYHERE_MERCHANT_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Generate local md5sig for verification
    const hashedSecret = crypto.createHash('md5').update(MERCHANT_SECRET).digest('hex').toUpperCase();
    const local_md5sig = crypto
      .createHash('md5')
      .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
      .digest('hex')
      .toUpperCase();

    // Verify the signature
    if (local_md5sig !== md5sig) {
      console.error('PayHere signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Check if payment is successful (status_code = 2)
    if (status_code === '2') {
      console.log('Payment successful for order:', order_id);
      
      // Update payment status in backend
      try {
        const response = await fetch(`${BACKEND_URL}/api/payment/update-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id,
            payment_id,
            status: 'success',
            amount: payhere_amount,
            currency: payhere_currency,
            method,
            status_message
          }),
        });

        if (!response.ok) {
          console.error('Failed to update payment status in backend');
        }
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
    } else {
      console.log('Payment failed for order:', order_id, 'Status:', status_code);
      
      // Update payment status as failed
      try {
        const response = await fetch(`${BACKEND_URL}/api/payment/update-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id,
            payment_id,
            status: 'failed',
            amount: payhere_amount,
            currency: payhere_currency,
            method,
            status_message
          }),
        });

        if (!response.ok) {
          console.error('Failed to update payment status in backend');
        }
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
    }

    // Return success response to PayHere
    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('PayHere notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

