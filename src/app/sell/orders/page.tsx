'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface SubOrder {
  _id: string;
  main_order_id: string;
  seller_id: string;
  buyer_id: string;
  products_list: Array<{
    product_id: string;
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
  platformCharges?: {
    transactionFee?: number;
    platformFee?: number;
  };
  platformChargesObject?: { [key: string]: number };
  platformChargesBreakdown?: Array<{
    name: string;
    amount: number;
    description: string;
    type: string;
    value: any;
  }>;
  finalTotal: number;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  seller_payment_status: 'pending' | 'held' | 'released' | 'refunded';
  delivery_status: 'pending' | 'confirmed' | 'disputed';
  delivery_confirmed: boolean;
  delivery_confirmed_at?: string;
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
        await fetchSubOrders(); // Refresh the list
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
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
        await fetchSubOrders(); // Refresh the list
        setTrackingNumber('');
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Failed to update tracking number:', error);
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  const filteredOrders = subOrders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.main_order_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || order.orderStatus === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'held': return 'bg-orange-100 text-orange-800';
      case 'released': return 'bg-green-100 text-green-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || order.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 overflow-y-auto">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">Orders</p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">Manage and track your orders</p>
              </div>
            </div>

            <div className="px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                  <div className="text-[#6a7581] flex border-none bg-[#f1f2f4] items-center justify-center pl-4 rounded-l-xl border-r-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                    </svg>
                  </div>
                  <input
                    placeholder="Search orders"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border-none bg-[#f1f2f4] focus:border-none h-full placeholder:text-[#6a7581] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </label>
            </div>

            <div className="pb-3">
              <div className="flex border-b border-[#dde0e3] px-4 gap-8">
                {['All', 'Pending', 'Processing', 'Shipped', 'Completed'].map((filter) => (
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

            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-xl border border-[#dde0e3] bg-white">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-white">
                      <th className="px-4 py-3 text-left text-[#121416] w-[400px] text-sm font-medium leading-normal">Order ID</th>
                      <th className="px-4 py-3 text-left text-[#121416] w-[400px] text-sm font-medium leading-normal">Customer Name</th>
                      <th className="px-4 py-3 text-left text-[#121416] w-[400px] text-sm font-medium leading-normal">Order Date</th>
                      <th className="px-4 py-3 text-left text-[#121416] w-60 text-sm font-medium leading-normal">Status</th>
                      <th className="px-4 py-3 text-left text-[#121416] w-[400px] text-sm font-medium leading-normal">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-t border-t-[#dde0e3]">
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#121416] text-sm font-normal leading-normal">{order.id}</td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#6a7581] text-sm font-normal leading-normal">{order.customerName}</td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#6a7581] text-sm font-normal leading-normal">{order.date}</td>
                        <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#f1f2f4] text-[#121416] text-sm font-medium leading-normal w-full">
                            <span className="truncate">{order.status}</span>
                          </button>
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#6a7581] text-sm font-normal leading-normal">${order.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}