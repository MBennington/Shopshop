'use client';

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  totalAdmins: number;
  totalOrders: number;
  totalRevenue: number;
  pendingPayouts: number;
  pendingPayoutAmount: number;
  activeProducts: number;
  platformRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  weekOrders: number;
  weekRevenue: number;
  monthOrders: number;
  monthRevenue: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    if (user?.role === 'admin') {
      fetchDashboardStats();
    }
  }, [user, router]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">Admin Dashboard</p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">Platform overview and management</p>
              </div>
            </div>

            {loading ? (
              <div className="px-4 py-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white border border-[#dde0e3] rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : stats ? (
              <>
                {/* Key Metrics */}
                <div className="px-4 py-3">
                  <h3 className="text-lg font-semibold text-[#121416] mb-4">Key Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                      <p className="text-[#6a7581] text-xs font-medium mb-1">Total Users</p>
                      <p className="text-[#121416] text-2xl font-bold">{stats.totalUsers}</p>
                      <div className="mt-2 text-xs text-[#6a7581]">
                        <span>Buyers: {stats.totalBuyers}</span> • <span>Sellers: {stats.totalSellers}</span> • <span>Admins: {stats.totalAdmins}</span>
                      </div>
                    </div>
                    <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                      <p className="text-[#6a7581] text-xs font-medium mb-1">Total Orders</p>
                      <p className="text-[#121416] text-2xl font-bold">{stats.totalOrders}</p>
                      <div className="mt-2 text-xs text-[#6a7581]">
                        Today: {stats.todayOrders} • This Week: {stats.weekOrders} • This Month: {stats.monthOrders}
                      </div>
                    </div>
                    <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                      <p className="text-[#6a7581] text-xs font-medium mb-1">Total Revenue</p>
                      <p className="text-[#121416] text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                      <div className="mt-2 text-xs text-[#6a7581]">
                        Today: {formatCurrency(stats.todayRevenue)} • Week: {formatCurrency(stats.weekRevenue)} • Month: {formatCurrency(stats.monthRevenue)}
                      </div>
                    </div>
                    <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                      <p className="text-[#6a7581] text-xs font-medium mb-1">Pending Payouts</p>
                      <p className="text-yellow-600 text-2xl font-bold">{stats.pendingPayouts}</p>
                      <p className="mt-2 text-xs text-[#6a7581]">Amount: {formatCurrency(stats.pendingPayoutAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="px-4 py-3">
                  <h3 className="text-lg font-semibold text-[#121416] mb-4">Platform Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                      <p className="text-[#6a7581] text-xs font-medium mb-1">Active Products</p>
                      <p className="text-[#121416] text-2xl font-bold">{stats.activeProducts}</p>
                    </div>
                    <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                      <p className="text-[#6a7581] text-xs font-medium mb-1">Platform Revenue</p>
                      <p className="text-green-600 text-2xl font-bold">{formatCurrency(stats.platformRevenue)}</p>
                    </div>
                    <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                      <p className="text-[#6a7581] text-xs font-medium mb-1">Today's Orders</p>
                      <p className="text-blue-600 text-2xl font-bold">{stats.todayOrders}</p>
                    </div>
                    <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                      <p className="text-[#6a7581] text-xs font-medium mb-1">Today's Revenue</p>
                      <p className="text-purple-600 text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-3">
                  <h3 className="text-lg font-semibold text-[#121416] mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => router.push('/admin/payouts?status=PENDING')}
                      className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left hover:bg-yellow-100 transition-colors"
                    >
                      <p className="text-yellow-800 font-semibold mb-1">Review Pending Payouts</p>
                      <p className="text-yellow-600 text-sm">{stats.pendingPayouts} payout{stats.pendingPayouts !== 1 ? 's' : ''} awaiting approval</p>
                    </button>
                    <button
                      onClick={() => router.push('/admin/orders')}
                      className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition-colors"
                    >
                      <p className="text-blue-800 font-semibold mb-1">View All Orders</p>
                      <p className="text-blue-600 text-sm">Manage and track all platform orders</p>
                    </button>
                    <button
                      onClick={() => router.push('/admin/users')}
                      className="bg-green-50 border border-green-200 rounded-xl p-4 text-left hover:bg-green-100 transition-colors"
                    >
                      <p className="text-green-800 font-semibold mb-1">Manage Users</p>
                      <p className="text-green-600 text-sm">{stats.totalUsers} total users on platform</p>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-4 py-3">
                <p className="text-[#6a7581]">Failed to load dashboard statistics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



