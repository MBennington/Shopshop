'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Truck, CreditCard } from 'lucide-react';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [subOrders, setSubOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      // Fetch order details from backend
      fetchOrderDetails(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch main order details
      const orderResponse = await fetch(`/api/order?orderId=${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (orderResponse.ok) {
        const orderData = await orderResponse.json();
        setOrderDetails(orderData.data);
        
        // Fetch sub-orders
        const subOrdersResponse = await fetch(`/api/suborder/main-order/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (subOrdersResponse.ok) {
          const subOrdersData = await subOrdersResponse.json();
          setSubOrders(subOrdersData.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. We'll send you a confirmation email shortly.
          </p>
        </div>

        {/* Order Details */}
        {orderId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {orderDetails && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-semibold">LKR {orderDetails.totalPrice?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-semibold capitalize">
                        {orderDetails.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sub-Orders */}
        {subOrders.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Breakdown by Seller
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subOrders.map((subOrder, index) => (
                  <div key={subOrder._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Seller Order #{index + 1}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Order ID: {subOrder._id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-semibold capitalize">
                          {subOrder.orderStatus}
                        </p>
                      </div>
                    </div>

                    {/* Products in this sub-order */}
                    <div className="space-y-2 mb-3">
                      {subOrder.products_list?.map((product: any, productIndex: number) => (
                        <div key={productIndex} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              Product ID: {product.product_id}
                            </p>
                            <p className="text-xs text-gray-600">
                              Qty: {product.qty} | Color: {product.color}
                              {product.size && ` | Size: ${product.size}`}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-blue-600">
                            LKR {product.subtotal?.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Sub-order summary */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <p>Items: {subOrder.products_list?.length || 0}</p>
                        <p>Shipping: LKR {subOrder.shipping_fee?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Sub-order Total</p>
                        <p className="font-bold text-lg text-blue-600">
                          LKR {subOrder.finalTotal?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>

                    {/* Tracking info if available */}
                    {subOrder.tracking_number && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">Tracking Number:</p>
                        <p className="font-semibold text-blue-600">
                          {subOrder.tracking_number}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Order Confirmation</h4>
                  <p className="text-gray-600 text-sm">
                    You'll receive an email confirmation with your order details.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Processing</h4>
                  <p className="text-gray-600 text-sm">
                    We'll prepare your order and notify you when it's ready to ship.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Shipping</h4>
                  <p className="text-gray-600 text-sm">
                    Your order will be shipped and you'll receive tracking information.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.location.href = '/profile'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            View My Orders
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="px-8 py-3"
          >
            Continue Shopping
          </Button>
        </div>

        {/* Support Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@shopshop.com" className="text-blue-600 hover:underline">
              support@shopshop.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
