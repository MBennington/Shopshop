'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Package,
  Calendar,
  DollarSign,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Search,
  User,
} from 'lucide-react';

interface Order {
  _id: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  totalPrice: number;
  finalTotal: number;
  created_at: string;
  sub_orders_count: number;
  user_info: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  sub_orders_summary: Array<{
    _id: string;
    orderStatus: string;
    seller_name: string;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchUserId, setSearchUserId] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchOrders();
    }
  }, [user, activeFilter, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please log in to view orders');
        setLoading(false);
        return;
      }

      const status = activeFilter !== 'All' ? activeFilter : '';
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(status && { status }),
        ...(searchUserId && { userId: searchUserId }),
      });

      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data?.orders || []);
        setPagination(data.data?.pagination || null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('An error occurred while loading orders');
    } finally {
      setLoading(false);
    }
  };

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
      case 'processing':
      case 'packed':
      case 'dispatched':
        return 'text-blue-600 bg-blue-50';
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
      case 'processing':
      case 'packed':
      case 'dispatched':
        return <Truck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
    router.push(`/admin/orders/${orderId}`);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 overflow-y-auto">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">
                  Orders Management
                </p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">
                  View and manage all platform orders
                </p>
              </div>
            </div>

            <div className="px-4 py-3">
              {/* Search by User ID */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Search by User ID..."
                        value={searchUserId}
                        onChange={(e) => setSearchUserId(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch();
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                    <Button onClick={handleSearch} className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Search
                    </Button>
                    {searchUserId && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchUserId('');
                          setCurrentPage(1);
                          fetchOrders();
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Filter Buttons */}
              <div className="mb-6 flex flex-wrap gap-2">
                {['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'].map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setActiveFilter(filter);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeFilter === filter
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading orders...</p>
                  </div>
                </div>
              )}

              {/* Orders List */}
              {!loading && orders.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      No orders found
                    </h2>
                    <p className="text-gray-600 mb-6">
                      {activeFilter !== 'All'
                        ? `No ${activeFilter.toLowerCase()} orders found.`
                        : searchUserId
                        ? 'No orders found for this user.'
                        : 'No orders have been placed yet.'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {!loading && orders.length > 0 && (
                <>
                  <div className="space-y-4 mb-6">
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

                              {/* User Info */}
                              <div className="flex items-center gap-2 mb-3">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  Customer:{' '}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {order.user_info?.name || 'Unknown User'}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({order.user_info?.email || 'N/A'})
                                </span>
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
                                            className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700"
                                          >
                                            {subOrder.seller_name}
                                          </span>
                                        ))}
                                      {order.sub_orders_summary.length > 3 && (
                                        <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700">
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

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages} (
                        {pagination.total} total)
                      </span>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(pagination.totalPages, p + 1)
                          )
                        }
                        disabled={currentPage === pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
