import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { BACKEND_URL } from '@/lib/config';

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

    // Check if this is a gift card payment (order_id starts with "GC-")
    const isGiftCardPayment = order_id && order_id.startsWith('GC-');

    console.log('=== PayHere Webhook Received ===');
    console.log('Order ID:', order_id);
    console.log('Is Gift Card Payment?', isGiftCardPayment);
    console.log('Status Code:', status_code, '(type:', typeof status_code, ')');
    console.log('Payment ID:', payment_id);

    if (isGiftCardPayment) {
      // Handle gift card payment
      console.log('=== Processing Gift Card Payment ===');
      console.log('Gift card payment notification received:', order_id, 'Status:', status_code);
      
      // Update gift card payment status in backend (handles both success and failure)
      try {
        const updatePayload = {
          payment_id: order_id, // For gift cards, order_id from PayHere is our payment_id
          order_id: order_id, // Keep order_id for reference (same as payment_id)
          payhere_payment_id: payment_id, // PayHere's payment_id (from payment_id field)
          status_code,
          status_message,
          method,
          captured_amount: formData.get('captured_amount') as string,
          payhere_amount: payhere_amount,
        };

        console.log('=== Calling Backend ===');
        console.log('BACKEND_URL:', BACKEND_URL);
        console.log('Full URL:', `${BACKEND_URL}/api/gift-cards/payment/update-status`);
        console.log('Payload:', JSON.stringify(updatePayload, null, 2));

        const response = await fetch(`${BACKEND_URL}/api/gift-cards/payment/update-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
        });

        const responseData = await response.json();

        if (!response.ok) {
          console.error('Failed to update gift card payment status in backend:', {
            status: response.status,
            statusText: response.statusText,
            error: responseData,
          });
        } else {
          console.log('Gift card payment status updated successfully:', responseData);
        }
      } catch (error) {
        console.error('Error updating gift card payment status:', error);
      }
    } else {
      // Handle order payment (existing flow)
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
    }

    // Return success response to PayHere
    // PayHere expects a simple text response "success" or JSON
    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error) {
    console.error('PayHere notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


