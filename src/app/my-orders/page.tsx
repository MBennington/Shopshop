'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  Calendar,
  DollarSign,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  RefreshCw,
  PackageCheck,
  RotateCcw,
} from 'lucide-react';

// Order statuses from config (backend/src/config/order.config.js)
const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PACKED: 'packed',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const;

// Filter options with display labels
const FILTER_OPTIONS = [
  { label: 'All', value: 'All' },
  { label: 'Pending', value: ORDER_STATUSES.PENDING },
  { label: 'Processing', value: ORDER_STATUSES.PROCESSING },
  { label: 'Packed', value: ORDER_STATUSES.PACKED },
  { label: 'Dispatched', value: ORDER_STATUSES.DISPATCHED },
  { label: 'Delivered', value: ORDER_STATUSES.DELIVERED },
  { label: 'Cancelled', value: ORDER_STATUSES.CANCELLED },
  { label: 'Returned', value: ORDER_STATUSES.RETURNED },
];

interface Order {
  _id: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  totalPrice: number;
  finalTotal: number;
  created_at: string;
  sub_orders_count: number;
  sub_orders_summary: Array<{
    _id: string;
    orderStatus: string;
    seller_name: string;
  }>;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    } else if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please log in to view your orders');
        setLoading(false);
        return;
      }

      // Convert filter to lowercase status value (API expects lowercase)
      const status = activeFilter !== 'All' ? activeFilter.toLowerCase() : '';
      const response = await fetch(
        `/api/order?userOrders=true&page=1&limit=50${
          status ? `&status=${status}` : ''
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data?.orders || []);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch orders');
      }
    } catch (error) {
      // console.error('Failed to fetch orders:', error);
      setError('An error occurred while loading your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchOrders();
    }
  }, [activeFilter]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'returned':
        return 'text-orange-600 bg-orange-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'packed':
        return 'text-indigo-600 bg-indigo-50';
      case 'dispatched':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'returned':
        return <RotateCcw className="h-4 w-4" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4" />;
      case 'packed':
        return <PackageCheck className="h-4 w-4" />;
      case 'dispatched':
        return <Truck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getSubOrderStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-3.5 w-3.5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-3.5 w-3.5 text-red-600" />;
      case 'dispatched':
        return <Truck className="h-3.5 w-3.5 text-blue-600" />;
      case 'packed':
        return <PackageCheck className="h-3.5 w-3.5 text-indigo-600" />;
      case 'processing':
        return <RefreshCw className="h-3.5 w-3.5 text-yellow-600" />;
      case 'pending':
      default:
        return <Clock className="h-3.5 w-3.5 text-gray-600" />;
    }
  };

  const getSubOrderStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-50 border-green-200';
      case 'cancelled':
        return 'bg-red-50 border-red-200';
      case 'dispatched':
        return 'bg-blue-50 border-blue-200';
      case 'packed':
        return 'bg-indigo-50 border-indigo-200';
      case 'processing':
        return 'bg-yellow-50 border-yellow-200';
      case 'pending':
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleOrderClick = (orderId: string) => {
    router.push(`/order-details?orderId=${orderId}`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchOrders}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">View and manage all your orders</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No orders found
              </h2>
              <p className="text-gray-600 mb-6">
                {activeFilter !== 'All'
                  ? `You don't have any ${FILTER_OPTIONS.find(f => f.value === activeFilter)?.label.toLowerCase() || activeFilter} orders.`
                  : "You haven't placed any orders yet."}
              </p>
              <Button onClick={() => router.push('/')}>Start Shopping</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order._id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleOrderClick(order._id)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Package className="h-5 w-5 text-gray-400" />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                              order.orderStatus
                            )}`}
                          >
                            {getStatusIcon(order.orderStatus)}
                            {order.orderStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            Payment:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            Packages:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {order.sub_orders_count}
                          </span>
                        </div>
                      </div>

                      {order.sub_orders_summary &&
                        order.sub_orders_summary.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-2">
                              Sellers:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {order.sub_orders_summary
                                .slice(0, 3)
                                .map((subOrder, idx) => (
                                  <span
                                    key={subOrder._id}
                                    className={`text-xs px-2 py-1 rounded border flex items-center gap-1.5 ${getSubOrderStatusColor(
                                      subOrder.orderStatus
                                    )}`}
                                  >
                                    {getSubOrderStatusIcon(subOrder.orderStatus)}
                                    <span className="text-gray-700 font-medium">
                                      {subOrder.seller_name}
                                    </span>
                                  </span>
                                ))}
                              {order.sub_orders_summary.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 border border-gray-200">
                                  +{order.sub_orders_summary.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">
                          Total Amount
                        </p>
                        <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
                          LKR {order.finalTotal?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order._id);
                        }}
                      >
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
