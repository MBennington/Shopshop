'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface SubOrder {
  _id: string;
  main_order_id: string | {
    _id: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
  };
  seller_id: string;
  buyer_id: string | {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  buyer_info?: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  main_order_info?: {
    _id: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
  };
  payment_info?: {
    paymentMethod: string;
    paymentStatus: string;
    amount: number;
    payhere_payment_id?: string;
    method?: string;
    status_message?: string;
    created_at: string;
    updated_at: string;
  };
  products_list: Array<{
    product_id: string | {
      _id: string;
      name: string;
      price: number;
      images: string[];
    };
    product_name?: string;
    product_price?: number;
    product_images?: string[];
    qty: number;
    color: string;
    size?: string;
    subtotal: number;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    province: string;
    country: string;
    phone: string;
  };
  shipping_fee: number;
  tracking_number?: string;
  subtotal: number;
  finalTotal: number;
  orderStatus: 'pending' | 'processing' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';
  seller_payment_status: 'pending' | 'held' | 'released' | 'refunded';
  delivery_status: 'pending' | 'confirmed' | 'disputed';
  delivery_confirmed: boolean;
  delivery_confirmed_at?: string;
  seller_marked_as_delivered?: boolean;
  seller_marked_as_delivered_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [subOrders, setSubOrders] = useState<SubOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    if (user?._id) {
      fetchSubOrders();
    }
  }, [user]);

  const fetchSubOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/suborder?sellerId=${user?._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubOrders(data.data || []);
      }
    } catch (error) {
      // console.error('Failed to fetch sub-orders:', error);
    } finally {
      setLoading(false);
    }
  };



  const filteredOrders = subOrders.filter(order => {
    const buyerName = typeof order.buyer_id === 'object' 
      ? order.buyer_id?.name || order.buyer_info?.name || ''
      : '';
    const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (typeof order.main_order_id === 'string' 
                           ? order.main_order_id.toLowerCase().includes(searchQuery.toLowerCase())
                           : order.main_order_id?._id?.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
                         buyerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    let statusMatch = true;
    if (activeFilter !== 'All') {
      const statusMap: { [key: string]: string } = {
        'Pending': 'pending',
        'Processing': 'processing',
        'Packed': 'packed',
        'Dispatched': 'dispatched',
        'Delivered': 'delivered'
      };
      statusMatch = order.orderStatus === statusMap[activeFilter];
    }
    
    return matchesSearch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'packed': return 'bg-indigo-100 text-indigo-800';
      case 'dispatched': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'held': return 'bg-orange-100 text-orange-800';
      case 'released': return 'bg-green-100 text-green-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBuyerName = (order: SubOrder) => {
    if (typeof order.buyer_id === 'object' && order.buyer_id?.name) {
      return order.buyer_id.name;
    }
    if (order.buyer_info?.name) {
      return order.buyer_info.name;
    }
    return 'Unknown Customer';
  };

  const getBuyerEmail = (order: SubOrder) => {
    if (typeof order.buyer_id === 'object' && order.buyer_id?.email) {
      return order.buyer_id.email;
    }
    if (order.buyer_info?.email) {
      return order.buyer_info.email;
    }
    return 'N/A';
  };

  const getBuyerPhone = (order: SubOrder) => {
    return order.shippingAddress?.phone || 'N/A';
  };

  const getPaymentStatus = (order: SubOrder) => {
    // Get payment method
    const paymentMethod = order.payment_info?.paymentMethod || order.main_order_info?.paymentMethod;
    
    // For COD orders, payment status depends on suborder delivery status
    if (paymentMethod === 'cod' || paymentMethod === 'COD') {
      // If suborder is delivered, payment is considered paid for COD
      if (order.orderStatus === 'delivered') {
        return 'Paid';
      }
      // Otherwise, payment is still pending
      return 'Pending';
    }
    
    // For non-COD orders, use the actual payment status
    if (order.payment_info?.paymentStatus) {
      return order.payment_info.paymentStatus;
    }
    if (order.main_order_info?.paymentStatus) {
      return order.main_order_info.paymentStatus;
    }
    return 'Pending';
  };

  const getPaymentMethod = (order: SubOrder) => {
    if (order.payment_info?.paymentMethod) {
      return order.payment_info.paymentMethod;
    }
    if (order.main_order_info?.paymentMethod) {
      return order.main_order_info.paymentMethod;
    }
    return 'N/A';
  };

  // Order Timeline
  const getOrderTimeline = (order: SubOrder) => {
    const timeline = [];
    
    timeline.push({
      status: 'Order Placed',
      date: order.created_at,
      completed: true,
    });

    if (order.orderStatus !== 'pending') {
      timeline.push({
        status: 'Processing',
        date: order.orderStatus === 'processing' ? order.updated_at : null,
        completed: ['processing', 'packed', 'dispatched', 'delivered'].includes(order.orderStatus),
      });
    }

    if (['packed', 'dispatched', 'delivered'].includes(order.orderStatus)) {
      timeline.push({
        status: 'Packed',
        date: order.orderStatus === 'packed' ? order.updated_at : null,
        completed: ['packed', 'dispatched', 'delivered'].includes(order.orderStatus),
      });
    }

    if (['dispatched', 'delivered'].includes(order.orderStatus)) {
      timeline.push({
        status: 'Dispatched',
        date: order.orderStatus === 'dispatched' ? order.updated_at : null,
        completed: order.orderStatus === 'delivered',
      });
    }

    if (order.orderStatus === 'delivered') {
      timeline.push({
        status: 'Delivered',
        date: order.delivery_confirmed_at || order.updated_at,
        completed: true,
      });
    }

    if (order.orderStatus === 'cancelled') {
      timeline.push({
        status: 'Cancelled',
        date: order.updated_at,
        completed: true,
      });
    }

    return timeline;
  };

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            <Sidebar />
            <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 overflow-y-auto">
              <div className="animate-pulse p-4">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
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
            {/* Header */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">Orders Dashboard</p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">Manage and track your orders</p>
              </div>
            </div>

            {/* Search */}
            <div className="px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                  <div className="text-[#6a7581] flex border-none bg-[#f1f2f4] items-center justify-center pl-4 rounded-l-xl border-r-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                    </svg>
                  </div>
                  <input
                    placeholder="Search orders by ID, customer name..."
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border-none bg-[#f1f2f4] focus:border-none h-full placeholder:text-[#6a7581] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </label>
            </div>

            {/* Filters */}
            <div className="pb-3">
              <div className="flex border-b border-[#dde0e3] px-4 gap-8">
                {['All', 'Pending', 'Processing', 'Packed', 'Dispatched', 'Delivered'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex flex-col items-center justify-center border-b-[3px] ${
                      activeFilter === filter ? 'border-b-[#121416] text-[#121416]' : 'border-b-transparent text-[#6a7581]'
                    } pb-[13px] pt-4`}
                  >
                    <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                      activeFilter === filter ? 'text-[#121416]' : 'text-[#6a7581]'
                    }`}>{filter}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[#6a7581] text-sm font-normal">No orders found</p>
              </div>
            ) : (
              <div className="px-4 py-3">
                <div className="flex overflow-hidden rounded-xl border border-[#dde0e3] bg-white">
                  <table className="flex-1">
                    <thead>
                      <tr className="bg-white">
                        <th className="px-4 py-3 text-left text-[#121416] text-sm font-medium leading-normal">Order ID</th>
                        <th className="px-4 py-3 text-left text-[#121416] text-sm font-medium leading-normal">Customer Name</th>
                        <th className="px-4 py-3 text-left text-[#121416] text-sm font-medium leading-normal">Order Date / Time</th>
                        <th className="px-4 py-3 text-left text-[#121416] text-sm font-medium leading-normal">Status</th>
                        <th className="px-4 py-3 text-left text-[#121416] text-sm font-medium leading-normal">Payment</th>
                        <th className="px-4 py-3 text-left text-[#121416] text-sm font-medium leading-normal">Total Amount</th>
                        <th className="px-4 py-3 text-left text-[#121416] text-sm font-medium leading-normal">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr 
                          key={order._id} 
                          className="border-t border-t-[#dde0e3] hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            router.push(`/sell/orders/${order._id}`);
                          }}
                        >
                          <td className="px-4 py-3 text-[#121416] text-sm font-normal leading-normal">
                            <div className="flex flex-col">
                              <span className="font-medium">{order._id.slice(-8)}</span>
                              <span className="text-xs text-[#6a7581]">
                                Main: {typeof order.main_order_id === 'string' 
                                  ? order.main_order_id.slice(-8)
                                  : order.main_order_id?._id?.toString().slice(-8) || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#6a7581] text-sm font-normal leading-normal">
                            {getBuyerName(order)}
                          </td>
                          <td className="px-4 py-3 text-[#6a7581] text-sm font-normal leading-normal">
                            {formatDateTime(order.created_at)}
                          </td>
                          <td className="px-4 py-3 text-sm font-normal leading-normal">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                              </span>
                              {order.seller_marked_as_delivered && order.orderStatus !== 'delivered' && (
                                <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Awaiting buyer confirmation
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-normal leading-normal">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusColor(getPaymentStatus(order))}`}>
                              {getPaymentStatus(order).charAt(0).toUpperCase() + getPaymentStatus(order).slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#121416] text-sm font-semibold leading-normal">
                            LKR {order.finalTotal.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm font-normal leading-normal" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                router.push(`/sell/orders/${order._id}`);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
