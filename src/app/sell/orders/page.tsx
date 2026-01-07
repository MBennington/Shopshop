'use client';

import { useState, useEffect } from 'react';
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
  const [subOrders, setSubOrders] = useState<SubOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<SubOrder | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

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
      console.error('Failed to fetch sub-orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (subOrderId: string, newStatus: string) => {
    setUpdatingOrderId(subOrderId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/suborder?subOrderId=${subOrderId}&action=status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (response.ok) {
        await fetchSubOrders();
        if (showDetailModal) {
          const updated = await response.json();
          setSelectedOrder(updated.data || selectedOrder);
        }
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const cancelOrder = async (subOrderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await updateOrderStatus(subOrderId, 'cancelled');
      setShowDetailModal(false);
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  const updateTrackingNumber = async (subOrderId: string) => {
    if (!trackingNumber.trim()) return;

    setIsUpdatingTracking(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/suborder?subOrderId=${subOrderId}&action=tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tracking_number: trackingNumber }),
      });

      if (response.ok) {
        const result = await response.json();
        await fetchSubOrders();
        setTrackingNumber('');
        // Update selectedOrder if modal is open
        if (showDetailModal && selectedOrder && selectedOrder._id === subOrderId) {
          setSelectedOrder({
            ...selectedOrder,
            tracking_number: trackingNumber.trim(),
          });
        }
        if (!showDetailModal) {
          setSelectedOrder(null);
        }
      }
    } catch (error) {
      console.error('Failed to update tracking number:', error);
    } finally {
      setIsUpdatingTracking(false);
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
                            setSelectedOrder(order);
                            setShowDetailModal(true);
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
                                setSelectedOrder(order);
                                setShowDetailModal(true);
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

            {/* Tracking Number Modal */}
            {showTrackingModal && selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-bold text-[#121416] mb-4">Update Tracking Number</h3>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="w-full px-4 py-2 border border-[#dde0e3] rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#121416]"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        if (trackingNumber.trim()) {
                          await updateTrackingNumber(selectedOrder._id);
                          setShowTrackingModal(false);
                          setTrackingNumber('');
                        }
                      }}
                      disabled={isUpdatingTracking || !trackingNumber.trim()}
                      className="flex-1 bg-[#121416] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#2a2c2e] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdatingTracking ? 'Updating...' : 'Update'}
                    </button>
                    <button
                      onClick={() => {
                        setShowTrackingModal(false);
                        setTrackingNumber('');
                      }}
                      className="flex-1 bg-[#f1f2f4] text-[#121416] px-4 py-2 rounded-xl font-medium hover:bg-[#e1e2e4]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Order View Modal */}
            {showDetailModal && selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-[#dde0e3] px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#121416]">Order Details</h2>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedOrder(null);
                      }}
                      className="text-[#6a7581] hover:text-[#121416]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path>
                      </svg>
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Order Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#121416] mb-4">Order Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[#6a7581] text-sm mb-1">Order ID</p>
                          <p className="text-[#121416] font-medium">{selectedOrder._id}</p>
                        </div>
                        <div>
                          <p className="text-[#6a7581] text-sm mb-1">Main Order ID</p>
                          <p className="text-[#121416] font-medium">
                            {typeof selectedOrder.main_order_id === 'string' 
                              ? selectedOrder.main_order_id
                              : selectedOrder.main_order_id?._id?.toString() || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#6a7581] text-sm mb-1">Order Date</p>
                          <p className="text-[#121416] font-medium">{formatDateTime(selectedOrder.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-[#6a7581] text-sm mb-1">Status</p>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(selectedOrder.orderStatus)}`}>
                            {selectedOrder.orderStatus.charAt(0).toUpperCase() + selectedOrder.orderStatus.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#121416] mb-4">Customer Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[#6a7581] text-sm mb-1">Name</p>
                          <p className="text-[#121416] font-medium">{getBuyerName(selectedOrder)}</p>
                        </div>
                        <div>
                          <p className="text-[#6a7581] text-sm mb-1">Email</p>
                          <p className="text-[#121416] font-medium">{getBuyerEmail(selectedOrder)}</p>
                        </div>
                        <div>
                          <p className="text-[#6a7581] text-sm mb-1">Phone</p>
                          <p className="text-[#121416] font-medium">{getBuyerPhone(selectedOrder)}</p>
                        </div>
                        <div>
                          <p className="text-[#6a7581] text-sm mb-1">Contact</p>
                          <a 
                            href={`mailto:${getBuyerEmail(selectedOrder)}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Send Email
                          </a>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-[#6a7581] text-sm mb-1">Shipping Address</p>
                        <p className="text-[#121416]">
                          {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}<br />
                          {selectedOrder.shippingAddress.address}<br />
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province} {selectedOrder.shippingAddress.postalCode}<br />
                          {selectedOrder.shippingAddress.country}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#121416] mb-4">Order Items</h3>
                      <div className="border border-[#dde0e3] rounded-xl overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-[#f1f2f4]">
                            <tr>
                              <th className="px-4 py-3 text-left text-[#121416] text-sm font-medium">Product</th>
                              <th className="px-4 py-3 text-left text-[#121416] text-sm font-medium">Color & Size</th>
                              <th className="px-4 py-3 text-left text-[#121416] text-sm font-medium">Quantity</th>
                              <th className="px-4 py-3 text-left text-[#121416] text-sm font-medium">Unit Price</th>
                              <th className="px-4 py-3 text-left text-[#121416] text-sm font-medium">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.products_list.map((item, index) => {
                              // Extract product data
                              const product = typeof item.product_id === 'object' ? item.product_id : null;
                              
                              // Find the color object that matches the colorCode stored in item.color
                              const colorData = product?.colors?.find(
                                (c: any) => c.colorCode === item.color || c.colorName === item.color
                              );
                              
                              // Extract color name (prefer colorName from colorData, fallback to item.color)
                              const colorName = colorData?.colorName || item.color || 'N/A';
                              
                              // Extract product image - prefer color-specific images, then product images
                              let productImage = null;
                              if (colorData?.images && colorData.images.length > 0) {
                                productImage = colorData.images[0];
                              } else if (item.product_images && item.product_images.length > 0) {
                                productImage = item.product_images[0];
                              } else if (product?.images && product.images.length > 0) {
                                productImage = product.images[0];
                              }
                              
                              // Extract product name
                              const productName = item.product_name 
                                || product?.name
                                || 'Product';
                              
                              // Extract product price
                              const productPrice = item.product_price 
                                || product?.price
                                || 0;
                              
                              // Extract product ID for SKU
                              const productId = typeof item.product_id === 'string' 
                                ? item.product_id 
                                : product?._id?.toString() || 'N/A';

                              return (
                                <tr key={index} className="border-t border-[#dde0e3] hover:bg-gray-50">
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-4">
                                      {productImage ? (
                                        <img 
                                          src={productImage} 
                                          alt={productName}
                                          className="w-20 h-20 object-cover rounded-lg border border-[#dde0e3]"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                          }}
                                        />
                                      ) : (
                                        <div className="w-20 h-20 bg-[#f1f2f4] rounded-lg border border-[#dde0e3] flex items-center justify-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#6a7581" viewBox="0 0 256 256">
                                            <path d="M208,56H180.28L166.65,35.56A4,4,0,0,0,163.32,34H92.68a4,4,0,0,0-3.33,1.56L75.71,56H48A16,16,0,0,0,32,72V184a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V72A16,16,0,0,0,208,56Zm0,128H48V72H208V184Z"></path>
                                          </svg>
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <p className="text-[#121416] font-semibold text-sm mb-1">{productName}</p>
                                        <p className="text-[#6a7581] text-xs">SKU: {productId.slice(-8)}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[#6a7581] text-xs">Color:</span>
                                        {colorData?.colorCode ? (
                                          <span 
                                            className="w-5 h-5 rounded-full border border-[#dde0e3] inline-block"
                                            style={{ backgroundColor: colorData.colorCode }}
                                            title={colorName}
                                          />
                                        ) : (
                                          <span className="text-[#121416] text-sm font-medium">N/A</span>
                                        )}
                                      </div>
                                      {item.size && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-[#6a7581] text-xs">Size:</span>
                                          <span className="text-[#121416] text-sm font-medium">{item.size}</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-[#121416] text-sm font-medium">{item.qty}</td>
                                  <td className="px-4 py-4 text-[#121416] text-sm">LKR {productPrice.toFixed(2)}</td>
                                  <td className="px-4 py-4 text-[#121416] font-semibold text-sm">LKR {item.subtotal.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <div className="w-64 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#6a7581]">Subtotal:</span>
                            <span className="text-[#121416]">LKR {selectedOrder.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#6a7581]">Shipping:</span>
                            <span className="text-[#121416]">LKR {selectedOrder.shipping_fee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold border-t border-[#dde0e3] pt-2">
                            <span className="text-[#121416]">Total:</span>
                            <span className="text-[#121416]">LKR {selectedOrder.finalTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#121416] mb-4">Payment Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[#6a7581] text-sm mb-1">Payment Method</p>
                          <p className="text-[#121416] font-medium capitalize">{getPaymentMethod(selectedOrder)}</p>
                        </div>
                        <div>
                          <p className="text-[#6a7581] text-sm mb-1">Payment Status</p>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusColor(getPaymentStatus(selectedOrder))}`}>
                            {getPaymentStatus(selectedOrder).charAt(0).toUpperCase() + getPaymentStatus(selectedOrder).slice(1)}
                          </span>
                        </div>
                        {selectedOrder.payment_info?.payhere_payment_id && (
                          <div>
                            <p className="text-[#6a7581] text-sm mb-1">Payment ID</p>
                            <p className="text-[#121416] font-medium">{selectedOrder.payment_info.payhere_payment_id}</p>
                          </div>
                        )}
                        {selectedOrder.payment_info?.created_at && (
                          <div>
                            <p className="text-[#6a7581] text-sm mb-1">Transaction Date</p>
                            <p className="text-[#121416] font-medium">{formatDateTime(selectedOrder.payment_info.created_at)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#121416] mb-4">Order Timeline</h3>
                      <div className="space-y-4">
                        {getOrderTimeline(selectedOrder).map((event, index) => (
                          <div key={index} className="flex gap-4">
                            <div className={`w-2 h-2 rounded-full mt-2 ${event.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${event.completed ? 'text-[#121416]' : 'text-[#6a7581]'}`}>
                                {event.status}
                              </p>
                              {event.date && (
                                <p className="text-xs text-[#6a7581] mt-1">{formatDateTime(event.date)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#121416] mb-4">Actions</h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedOrder.orderStatus === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(selectedOrder._id, 'processing')}
                            disabled={updatingOrderId === selectedOrder._id}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Mark as Processing
                          </button>
                        )}
                        {selectedOrder.orderStatus === 'processing' && (
                          <button
                            onClick={() => updateOrderStatus(selectedOrder._id, 'packed')}
                            disabled={updatingOrderId === selectedOrder._id}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Mark as Packed
                          </button>
                        )}
                        {selectedOrder.orderStatus === 'packed' && (
                          <>
                            <button
                              onClick={() => {
                                setShowDetailModal(false);
                                setTrackingNumber(selectedOrder.tracking_number || '');
                                setShowTrackingModal(true);
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                            >
                              {selectedOrder.tracking_number ? 'Update Tracking' : 'Add Tracking'}
                            </button>
                            <button
                              onClick={() => {
                                if (!selectedOrder.tracking_number || selectedOrder.tracking_number.trim() === '') {
                                  alert('Please add a tracking number before marking the order as dispatched.');
                                  setShowDetailModal(false);
                                  setTrackingNumber('');
                                  setShowTrackingModal(true);
                                  return;
                                }
                                updateOrderStatus(selectedOrder._id, 'dispatched');
                              }}
                              disabled={updatingOrderId === selectedOrder._id || !selectedOrder.tracking_number || selectedOrder.tracking_number.trim() === ''}
                              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                                !selectedOrder.tracking_number || selectedOrder.tracking_number.trim() === '' || updatingOrderId === selectedOrder._id
                                  ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                              title={!selectedOrder.tracking_number || selectedOrder.tracking_number.trim() === '' 
                                ? 'Please add a tracking number first' 
                                : 'Mark as Dispatched'}
                            >
                              Mark as Dispatched
                            </button>
                            {(!selectedOrder.tracking_number || selectedOrder.tracking_number.trim() === '') && (
                              <p className="text-sm text-red-600 mt-2">
                                ⚠️ Tracking number is required before dispatching
                              </p>
                            )}
                          </>
                        )}
                        {selectedOrder.orderStatus === 'dispatched' && !selectedOrder.seller_marked_as_delivered && (
                          <button
                            onClick={() => updateOrderStatus(selectedOrder._id, 'delivered')}
                            disabled={updatingOrderId === selectedOrder._id}
                            className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Mark as Delivered
                          </button>
                        )}
                        {selectedOrder.seller_marked_as_delivered && selectedOrder.orderStatus !== 'delivered' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                                  Delivery Marked - Awaiting Buyer Confirmation
                                </h4>
                                <p className="text-sm text-blue-700 mb-2">
                                  You have marked this order as delivered. The system will automatically update the order status to "Delivered" once the buyer confirms receipt.
                                </p>
                                {selectedOrder.seller_marked_as_delivered_at && (
                                  <p className="text-xs text-blue-600">
                                    Marked on: {formatDateTime(selectedOrder.seller_marked_as_delivered_at)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        {!['cancelled', 'delivered'].includes(selectedOrder.orderStatus) && (
                          <button
                            onClick={() => cancelOrder(selectedOrder._id)}
                            disabled={updatingOrderId === selectedOrder._id}
                            className="bg-red-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#121416] mb-4">Additional Notes</h3>
                      <div className="bg-[#f1f2f4] rounded-xl p-4 space-y-2">
                        {selectedOrder.tracking_number && (
                          <p className="text-[#6a7581] text-sm">
                            Tracking Number: <span className="font-medium text-[#121416]">{selectedOrder.tracking_number}</span>
                          </p>
                        )}
                        {selectedOrder.notes && (
                          <p className="text-[#6a7581] text-sm">
                            System Note: <span className="font-medium text-[#121416]">{selectedOrder.notes}</span>
                          </p>
                        )}
                        {!selectedOrder.tracking_number && !selectedOrder.notes && (
                          <p className="text-[#6a7581] text-sm">
                            No additional notes or special instructions.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
