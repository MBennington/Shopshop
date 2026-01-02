'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsData {
  period: string;
  revenueTrends: Array<{ _id: string; revenue: number; count: number }>;
  orderTrends: Array<{ _id: string; count: number }>;
  userGrowthTrends: Array<{ _id: string; buyers: number; sellers: number; total: number }>;
  categoryPerformance: Array<{ _id: string; revenue: number; orders: number; quantity: number }>;
  topProducts: Array<{ _id: string; name: string; category: string; revenue: number; quantity: number; orders: number }>;
  topSellers: Array<{ _id: string; sellerName: string; businessName?: string; revenue: number; orders: number; productsSold: number }>;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    newUsers: number;
    newBuyers: number;
    newSellers: number;
  };
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAnalytics();
    }
  }, [user, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-LK').format(num);
  };

  // Simple bar chart component
  const SimpleBarChart = ({ data, labelKey, valueKey, color = 'bg-blue-500' }: {
    data: any[];
    labelKey: string;
    valueKey: string;
    color?: string;
  }) => {
    if (!data || data.length === 0) return <div className="text-center text-[#6a7581] py-8">No data available</div>;
    
    const maxValue = Math.max(...data.map((d) => d[valueKey] || 0));
    
    return (
      <div className="space-y-2">
        {data.map((item, idx) => {
          const value = item[valueKey] || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const date = new Date(item[labelKey]);
          const label = period === '7d' 
            ? date.toLocaleDateString('en-US', { weekday: 'short' })
            : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-20 text-xs text-[#6a7581] text-right">{label}</div>
              <div className="flex-1 relative">
                <div className={`${color} h-8 rounded flex items-center justify-end pr-2`} style={{ width: `${percentage}%` }}>
                  {percentage > 10 && (
                    <span className="text-xs text-white font-medium">
                      {valueKey === 'revenue' ? formatCurrency(value) : formatNumber(value)}
                    </span>
                  )}
                </div>
              </div>
              {percentage <= 10 && (
                <div className="w-24 text-xs text-[#6a7581] text-left">
                  {valueKey === 'revenue' ? formatCurrency(value) : formatNumber(value)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
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
                  Analytics
                </p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">
                  Platform analytics and insights
                </p>
              </div>
              <div className="flex gap-2">
                {['7d', '30d', '90d', '1y'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setPeriod(range)}
                    className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 text-sm font-medium leading-normal ${
                      period === range
                        ? 'bg-[#121416] text-white'
                        : 'bg-[#f1f2f4] text-[#121416] hover:bg-[#e1e2e4]'
                    }`}
                  >
                    <span className="truncate">{range}</span>
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="px-4 py-3">
                <div className="text-center py-8">
                  <p className="text-[#6a7581]">Loading analytics...</p>
                </div>
              </div>
            ) : analytics ? (
              <>
                {/* Summary Cards */}
                <div className="px-4 py-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-[#6a7581]">
                          Total Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-[#121416]">
                          {formatCurrency(analytics.summary.totalRevenue)}
                        </p>
                        <p className="text-xs text-[#6a7581] mt-1">
                          {analytics.summary.totalOrders} orders
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-[#6a7581]">
                          Total Orders
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-[#121416]">
                          {formatNumber(analytics.summary.totalOrders)}
                        </p>
                        <p className="text-xs text-[#6a7581] mt-1">
                          Average: {formatCurrency(analytics.summary.averageOrderValue)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-[#6a7581]">
                          New Users
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-[#121416]">
                          {formatNumber(analytics.summary.newUsers)}
                        </p>
                        <p className="text-xs text-[#6a7581] mt-1">
                          {analytics.summary.newBuyers} buyers • {analytics.summary.newSellers} sellers
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-[#6a7581]">
                          Average Order Value
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-[#121416]">
                          {formatCurrency(analytics.summary.averageOrderValue)}
                        </p>
                        <p className="text-xs text-[#6a7581] mt-1">
                          Per order
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Revenue Trends */}
                <div className="px-4 py-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] overflow-y-auto">
                        <SimpleBarChart
                          data={analytics.revenueTrends}
                          labelKey="_id"
                          valueKey="revenue"
                          color="bg-green-500"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Trends and User Growth */}
                <div className="px-4 py-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Order Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px] overflow-y-auto">
                          <SimpleBarChart
                            data={analytics.orderTrends}
                            labelKey="_id"
                            valueKey="count"
                            color="bg-blue-500"
                          />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px] overflow-y-auto">
                          {analytics.userGrowthTrends.length > 0 ? (
                            <div className="space-y-2">
                              {analytics.userGrowthTrends.map((item, idx) => {
                                const date = new Date(item._id);
                                const label = period === '7d'
                                  ? date.toLocaleDateString('en-US', { weekday: 'short' })
                                  : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                const maxTotal = Math.max(...analytics.userGrowthTrends.map((u) => u.total));
                                const totalPercentage = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
                                
                                return (
                                  <div key={idx} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-[#6a7581]">{label}</span>
                                      <span className="font-medium text-[#121416]">{item.total} total</span>
                                    </div>
                                    <div className="flex gap-1 h-4">
                                      <div
                                        className="bg-blue-500 rounded-l"
                                        style={{ width: `${(item.buyers / maxTotal) * 100}%` }}
                                        title={`Buyers: ${item.buyers}`}
                                      ></div>
                                      <div
                                        className="bg-purple-500 rounded-r"
                                        style={{ width: `${(item.sellers / maxTotal) * 100}%` }}
                                        title={`Sellers: ${item.sellers}`}
                                      ></div>
                                    </div>
                                    <div className="flex gap-4 text-xs text-[#6a7581]">
                                      <span>Buyers: {item.buyers}</span>
                                      <span>Sellers: {item.sellers}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center text-[#6a7581] py-8">No data available</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Category Performance */}
                <div className="px-4 py-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Category Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.categoryPerformance.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-3 text-sm font-medium text-[#6a7581]">Category</th>
                                <th className="text-right p-3 text-sm font-medium text-[#6a7581]">Revenue</th>
                                <th className="text-right p-3 text-sm font-medium text-[#6a7581]">Orders</th>
                                <th className="text-right p-3 text-sm font-medium text-[#6a7581]">Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analytics.categoryPerformance.map((cat, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                  <td className="p-3 font-medium text-[#121416]">{cat._id}</td>
                                  <td className="p-3 text-right text-[#121416]">{formatCurrency(cat.revenue)}</td>
                                  <td className="p-3 text-right text-[#6a7581]">{formatNumber(cat.orders)}</td>
                                  <td className="p-3 text-right text-[#6a7581]">{formatNumber(cat.quantity)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-[#6a7581] py-8">No category data available</div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Top Products and Top Sellers */}
                <div className="px-4 py-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analytics.topProducts.length > 0 ? (
                          <div className="space-y-3">
                            {analytics.topProducts.map((product, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium text-[#121416]">{product.name}</p>
                                  <p className="text-xs text-[#6a7581]">{product.category}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-[#121416]">{formatCurrency(product.revenue)}</p>
                                  <p className="text-xs text-[#6a7581]">{formatNumber(product.quantity)} sold</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-[#6a7581] py-8">No product data available</div>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Sellers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analytics.topSellers.length > 0 ? (
                          <div className="space-y-3">
                            {analytics.topSellers.map((seller, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium text-[#121416]">
                                    {seller.businessName || seller.sellerName}
                                  </p>
                                  <p className="text-xs text-[#6a7581]">{formatNumber(seller.orders)} orders</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-[#121416]">{formatCurrency(seller.revenue)}</p>
                                  <p className="text-xs text-[#6a7581]">{formatNumber(seller.productsSold)} items</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-[#6a7581] py-8">No seller data available</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-4 py-3">
                <div className="text-center py-8">
                  <p className="text-[#6a7581]">Failed to load analytics data</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
