'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Truck, CreditCard, XCircle, AlertCircle, RefreshCw, Gift } from 'lucide-react';

export default function OrderDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [subOrders, setSubOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      setLoading(false);
      setError('No order ID provided');
    }
  }, [orderId]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      if (!orderId || orderId === 'undefined') {
        console.error('Invalid order ID:', orderId);
        setLoading(false);
        setError('Invalid order ID');
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        setError('Please log in to view order details');
        return;
      }

      const orderResponse = await fetch(`/api/order?order_id=${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (orderResponse.ok) {
        const orderData = await orderResponse.json();
        console.log('Order data received:', orderData);
        console.log('Sub-orders data:', orderData.data.sub_orders_details);
        setOrderDetails(orderData.data);
        setSubOrders(orderData.data.sub_orders_details || []);
        setError(null);
      } else {
        console.error(
          'Failed to fetch order details:',
          orderResponse.status,
          orderResponse.statusText
        );
        const errorData = await orderResponse.json();
        console.error('Error data:', errorData);
        setError('Failed to load order details. Please try again later.');
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      setError('An error occurred while loading order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatus = () => {
    if (!orderDetails) return null;

    const paymentStatus = orderDetails.paymentStatus;
    const orderStatus = orderDetails.orderStatus;
    const paymentMethod = orderDetails.paymentMethod;

    if (paymentMethod === 'cod') {
      if (orderStatus === 'cancelled') {
        return 'cancelled';
      }
      return 'success';
    }

    if (paymentStatus === 'Failed' || orderStatus === 'cancelled') {
      return 'failed';
    }

    if (paymentStatus === 'Paid') {
      return 'success';
    }

    if (paymentStatus === 'Pending') {
      return 'pending';
    }

    if (paymentStatus === 'Refunded') {
      return 'refunded';
    }

    return 'success';
  };

  const orderStatus = getOrderStatus();

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

  if (!orderId || orderId === 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">
              Invalid Order
            </h1>
            <p className="text-gray-600 mb-6">
              No valid order ID provided. Please check your order confirmation
              email or try again.
            </p>
            <Button onClick={() => router.push('/my-orders')}>
              View My Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900">
              Error Loading Order
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/my-orders')}
              >
                View My Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Status Header */}
        {orderStatus === 'failed' && orderDetails && (
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Your payment could not be processed. Your order has been cancelled.
            </p>
          </div>
        )}

        {orderStatus === 'cancelled' && orderDetails && (
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Cancelled
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              This order has been cancelled.
            </p>
          </div>
        )}

        {orderStatus === 'pending' && orderDetails && (
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Pending
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Your order is waiting for payment confirmation. We'll notify you
              once the payment is processed.
            </p>
          </div>
        )}

        {orderStatus === 'refunded' && orderDetails && (
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <RefreshCw className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Refunded
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Your payment has been refunded for this order.
            </p>
          </div>
        )}

        {orderStatus === 'success' && orderDetails && (
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Details
            </h1>
            <p className="text-lg text-gray-600">
              View your order information below.
            </p>
          </div>
        )}

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
                    {orderDetails?.created_at
                      ? new Date(orderDetails.created_at).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )
                      : 'N/A'}
                  </p>
                </div>
                {orderDetails && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="font-semibold">
                        LKR {orderDetails.totalPrice?.toFixed(2)}
                      </p>
                    </div>
                    {subOrders.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Shipping</p>
                        <p className="font-semibold">
                          LKR{' '}
                          {subOrders
                            .reduce(
                              (sum, subOrder) =>
                                sum + (subOrder.shipping_fee || 0),
                              0
                            )
                            .toFixed(2)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Platform Fee</p>
                      <p className="font-semibold">
                        {(() => {
                          // Calculate total fees
                          let total = 0;
                          if (orderDetails.platformChargesObject) {
                            total = Object.values(
                              orderDetails.platformChargesObject
                            ).reduce(
                              (sum: number, fee: any) => sum + (fee || 0),
                              0
                            );
                          } else if (orderDetails.platformCharges) {
                            total =
                              (orderDetails.platformCharges.transactionFee ||
                                0) +
                              (orderDetails.platformCharges.platformFee || 0);
                          }
                          
                          // Show appropriate message based on payment method and coverage
                          if (orderDetails.finalTotal === 0 && orderDetails.giftCardDiscount > 0) {
                            return <span className="text-gray-500">No fees</span>;
                          }
                          if (orderDetails.paymentMethod === 'cod' && total === 0) {
                            return <span className="text-gray-500">No fees for COD</span>;
                          }
                          return `LKR ${total.toFixed(2)}`;
                        })()}
                      </p>
                    </div>
                    {/* Gift Card Discount - always show label and value */}
                    <div>
                      <p className="text-sm text-gray-600">Gift Card Discount</p>
                      <p className="font-semibold text-green-600">
                        {orderDetails.giftCardDiscount && orderDetails.giftCardDiscount > 0
                          ? `-LKR ${orderDetails.giftCardDiscount.toFixed(2)}`
                          : 'LKR 0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-semibold text-lg text-green-600">
                        LKR {orderDetails.finalTotal?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-semibold capitalize flex items-center gap-2">
                        {orderDetails.paymentMethod === 'card' ? (
                          <>
                            <CreditCard className="h-4 w-4" />
                            Credit/Debit Card
                          </>
                        ) : (
                          <>
                            <Truck className="h-4 w-4" />
                            Cash on Delivery
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <p
                        className={`font-semibold capitalize flex items-center gap-2 ${
                          orderDetails.paymentStatus === 'Paid'
                            ? 'text-green-600'
                            : orderDetails.paymentStatus === 'Failed'
                            ? 'text-red-600'
                            : orderDetails.paymentStatus === 'Pending'
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {orderDetails.paymentStatus || 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Status</p>
                      <p
                        className={`font-semibold capitalize ${
                          orderDetails.orderStatus === 'delivered'
                            ? 'text-green-600'
                            : orderDetails.orderStatus === 'cancelled'
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {orderDetails.orderStatus || 'pending'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Package Information */}
        {orderStatus !== 'failed' && (
          <>
            {subOrders.length > 0 ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Package Information
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    You will receive {subOrders.length} package
                    {subOrders.length > 1 ? 's' : ''} from different sellers
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subOrders.map((subOrder, index) => (
                      <div
                        key={subOrder._id}
                        className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              {subOrder.seller_info?.profilePicture ? (
                                <img
                                  src={subOrder.seller_info.profilePicture}
                                  alt="Seller"
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-blue-600 font-semibold text-sm">
                                  {index + 1}
                                </span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                Package #{index + 1}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Seller:{' '}
                                {subOrder.seller_info?.businessName ||
                                  subOrder.seller_info?.name ||
                                  'Unknown Seller'}
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

                        <div className="space-y-2 mb-3">
                          {subOrder.products_list?.map(
                            (product: any, productIndex: number) => (
                              <div
                                key={productIndex}
                                className="flex items-center gap-3 p-2 bg-white rounded-lg"
                              >
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  {product.product_images?.[0] ? (
                                    <img
                                      src={product.product_images[0]}
                                      alt={product.product_name}
                                      className="w-12 h-12 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <Package className="h-6 w-6 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {product.product_name ||
                                      'Product Name Not Available'}
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
                            )
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            <p>Items: {subOrder.products_list?.length || 0}</p>
                            <p>
                              Shipping: LKR{' '}
                              {subOrder.shipping_fee?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Package Total</p>
                            <p className="font-bold text-lg text-blue-600">
                              LKR {subOrder.finalTotal?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>

                        {subOrder.tracking_number ? (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                              Tracking Number:
                            </p>
                            <p className="font-semibold text-blue-600">
                              {subOrder.tracking_number}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                              Tracking Number:
                            </p>
                            <p className="text-sm text-gray-500 italic">
                              Will be provided when package is shipped
                            </p>
                          </div>
                        )}

                        {orderDetails?.paymentMethod === 'cod' && (
                          <div className="mt-3 pt-3 border-t border-gray-200 bg-yellow-50 p-3 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Truck className="h-5 w-5 text-yellow-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-yellow-800">
                                  Cash on Delivery Payment
                                </p>
                                <p className="text-xs text-yellow-700 mt-1">
                                  You will need to pay LKR{' '}
                                  {subOrder.finalTotal?.toFixed(2)} when this
                                  package arrives.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Package Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Loading package details...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/my-orders')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            Back to My Orders
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="px-8 py-3"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

