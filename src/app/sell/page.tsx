'use client';

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface SubOrder {
  orderStatus: 'pending' | 'processing' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const [subOrders, setSubOrders] = useState<SubOrder[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Dashboard Summary
  const orderSummary = {
    total: subOrders.length,
    pending: subOrders.filter(o => o.orderStatus === 'pending').length,
    processing: subOrders.filter(o => o.orderStatus === 'processing').length,
    packed: subOrders.filter(o => o.orderStatus === 'packed').length,
    dispatched: subOrders.filter(o => o.orderStatus === 'dispatched').length,
    delivered: subOrders.filter(o => o.orderStatus === 'delivered').length,
    cancelled: subOrders.filter(o => o.orderStatus === 'cancelled').length,
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 overflow-y-auto">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">Dashboard</p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">Welcome to your seller dashboard</p>
              </div>
            </div>

            {/* Dashboard Summary */}
            {loading ? (
              <div className="px-4 py-3">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="bg-white border border-[#dde0e3] rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 py-3">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                  <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                    <p className="text-[#6a7581] text-xs font-medium mb-1">Total Orders</p>
                    <p className="text-[#121416] text-2xl font-bold">{orderSummary.total}</p>
                  </div>
                  <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                    <p className="text-[#6a7581] text-xs font-medium mb-1">Pending</p>
                    <p className="text-yellow-600 text-2xl font-bold">{orderSummary.pending}</p>
                  </div>
                  <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                    <p className="text-[#6a7581] text-xs font-medium mb-1">Processing</p>
                    <p className="text-blue-600 text-2xl font-bold">{orderSummary.processing}</p>
                  </div>
                  <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                    <p className="text-[#6a7581] text-xs font-medium mb-1">Packed</p>
                    <p className="text-indigo-600 text-2xl font-bold">{orderSummary.packed}</p>
                  </div>
                  <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                    <p className="text-[#6a7581] text-xs font-medium mb-1">Dispatched</p>
                    <p className="text-purple-600 text-2xl font-bold">{orderSummary.dispatched}</p>
                  </div>
                  <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                    <p className="text-[#6a7581] text-xs font-medium mb-1">Delivered</p>
                    <p className="text-green-600 text-2xl font-bold">{orderSummary.delivered}</p>
                  </div>
                  <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                    <p className="text-[#6a7581] text-xs font-medium mb-1">Cancelled</p>
                    <p className="text-red-600 text-2xl font-bold">{orderSummary.cancelled}</p>
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