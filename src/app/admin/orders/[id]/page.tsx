'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  XCircle,
  AlertCircle,
  RefreshCw,
  Gift,
  User,
  ArrowLeft,
} from 'lucide-react';

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = params?.id as string;
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [subOrders, setSubOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    if (orderId && user?.role === 'admin') {
      fetchOrderDetails(orderId);
    }
  }, [orderId, user, router]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      if (!orderId || orderId === 'undefined') {
        console.error('Invalid order ID:', orderId);
        setLoading(false);
        toast.error('Invalid order ID');
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        toast.error('Please log in to view order details');
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
      } else {
        console.error(
          'Failed to fetch order details:',
          orderResponse.status,
          orderResponse.statusText
        );
        const errorData = await orderResponse.json();
        console.error('Error data:', errorData);
        toast.error('Failed to load order details. Please try again later.');
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      toast.error('An error occurred while loading order details. Please try again.');
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

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            <Sidebar />
            <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 overflow-y-auto">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading order details...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderId || orderId === 'undefined') {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            <Sidebar />
            <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 overflow-y-auto">
              <Card className="max-w-lg w-full mx-auto mt-8">
                <CardContent className="p-8 text-center">
                  <h1 className="text-2xl font-bold mb-4 text-gray-900">
                    Invalid Order
                  </h1>
                  <p className="text-gray-600 mb-6">
                    No valid order ID provided. Please check the order ID and try again.
                  </p>
                  <Button onClick={() => router.push('/admin/orders')}>
                    Back to Orders
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 overflow-y-auto">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin/orders')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">
                  Order Details
                </p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">
                  View complete order information
                </p>
              </div>
            </div>

            <div className="px-4 py-3">
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
                    The payment could not be processed. The order has been cancelled.
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
                    The order is waiting for payment confirmation.
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
                    The payment has been refunded for this order.
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
                    View complete order information below.
                  </p>
                </div>
              )}

              {/* Customer Information */}
              {orderDetails?.user_info && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Customer Name</p>
                        <p className="font-semibold">
                          {orderDetails.user_info.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold">
                          {orderDetails.user_info.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Customer ID</p>
                        <p className="font-semibold text-sm">
                          {orderDetails.user_info._id || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                                if (
                                  orderDetails.finalTotal === 0 &&
                                  orderDetails.giftCardDiscount > 0
                                ) {
                                  return (
                                    <span className="text-gray-500">No fees</span>
                                  );
                                }
                                if (
                                  orderDetails.paymentMethod === 'cod' &&
                                  total === 0
                                ) {
                                  return (
                                    <span className="text-gray-500">
                                      No fees for COD
                                    </span>
                                  );
                                }
                                return `LKR ${total.toFixed(2)}`;
                              })()}
                            </p>
                          </div>
                          {/* Gift Card Discount - always show label and value */}
                          <div>
                            <p className="text-sm text-gray-600">
                              Gift Card Discount
                            </p>
                            <p className="font-semibold text-green-600">
                              {orderDetails.giftCardDiscount &&
                              orderDetails.giftCardDiscount > 0
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

              {/* Shipping Address */}
              {orderDetails?.shippingAddress && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-semibold">
                        {orderDetails.shippingAddress.firstName}{' '}
                        {orderDetails.shippingAddress.lastName}
                      </p>
                      <p className="text-gray-600">
                        {orderDetails.shippingAddress.address}
                      </p>
                      <p className="text-gray-600">
                        {orderDetails.shippingAddress.city},{' '}
                        {orderDetails.shippingAddress.province}{' '}
                        {orderDetails.shippingAddress.postalCode}
                      </p>
                      <p className="text-gray-600">
                        {orderDetails.shippingAddress.country}
                      </p>
                      <p className="text-gray-600">
                        Phone: {orderDetails.shippingAddress.phone}
                      </p>
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
                          {subOrders.length} package
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
                                  {/* Payment Status Indicator */}
                                  {orderDetails?.paymentMethod === 'cod' ? (
                                    subOrder.orderStatus === 'delivered' ? (
                                      <div className="flex items-center gap-1 mt-1">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <p className="text-xs text-green-600 font-medium">
                                          Paid
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-yellow-600 mt-1">
                                        Payment Pending
                                      </p>
                                    )
                                  ) : orderDetails?.paymentStatus === 'Paid' ? (
                                    <div className="flex items-center gap-1 mt-1">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <p className="text-xs text-green-600 font-medium">
                                        Paid
                                      </p>
                                    </div>
                                  ) : null}
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
                                  {/* Payment Status Badge */}
                                  {orderDetails?.paymentMethod === 'cod' ? (
                                    subOrder.orderStatus === 'delivered' ? (
                                      <div className="flex items-center gap-1 mt-1">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <p className="text-xs text-green-600 font-medium">
                                          Payment Received
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-yellow-600 mt-1">
                                        Payment Pending
                                      </p>
                                    )
                                  ) : orderDetails?.paymentStatus === 'Paid' ? (
                                    <div className="flex items-center gap-1 mt-1">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <p className="text-xs text-green-600 font-medium">
                                        Payment Received
                                      </p>
                                    </div>
                                  ) : null}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">
                                    Package Total
                                  </p>
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

                              {orderDetails?.paymentMethod === 'cod' &&
                                subOrder.orderStatus !== 'delivered' && (
                                  <div className="mt-3 pt-3 border-t border-gray-200 bg-yellow-50 p-3 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <Truck className="h-5 w-5 text-yellow-600 mt-0.5" />
                                      <div>
                                        <p className="text-sm font-semibold text-yellow-800">
                                          Cash on Delivery Payment
                                        </p>
                                        <p className="text-xs text-yellow-700 mt-1">
                                          Customer will pay LKR{' '}
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
                          <p className="text-gray-600 mb-4">
                            Loading package details...
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push('/admin/orders')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  Back to Orders
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

