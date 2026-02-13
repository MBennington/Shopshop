'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface CustomerRow {
  _id: string;
  name: string;
  email: string;
  orderCount: number;
  lastOrderAt?: string;
}

export default function CustomersPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        const res = await fetch(
          `/api/suborder/seller/${user._id}/customers?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (cancelled) return;
        const data = await res.json();
        if (!res.ok) {
          setError(data.msg || data.error || 'Failed to load customers');
          setCustomers([]);
          return;
        }
        setCustomers(data.data || []);
      } catch {
        if (!cancelled) {
          setError('Failed to load customers');
          setCustomers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCustomers();
    return () => { cancelled = true; };
  }, [user?._id, searchQuery]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#121416] mb-1">Customers</h1>
              <p className="text-[#6a7581]">Buyers who have ordered from your shop</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121416] focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-[#6a7581]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-500 mb-4">{error}</div>
            )}

            {loading ? (
              <div className="py-12 text-center text-[#6a7581]">Loading customers...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#dde0e3]">
                      <th className="text-left py-3 px-4 text-[#6a7581] font-medium">Customer</th>
                      <th className="text-left py-3 px-4 text-[#6a7581] font-medium">Contact</th>
                      <th className="text-left py-3 px-4 text-[#6a7581] font-medium">Orders</th>
                      <th className="text-left py-3 px-4 text-[#6a7581] font-medium">Last Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 px-4 text-center text-[#6a7581]">
                          {searchQuery.trim()
                            ? 'No customers match your search.'
                            : 'No customers yet. Orders from your shop will appear here.'}
                        </td>
                      </tr>
                    ) : (
                      customers.map((customer) => (
                        <tr key={customer._id} className="border-b border-[#dde0e3] hover:bg-[#f7f8fa]">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-[#121416]">{customer.name}</div>
                              <div className="text-sm text-[#6a7581]">{customer._id}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-[#121416]">{customer.email}</div>
                          </td>
                          <td className="py-4 px-4 text-[#121416]">{customer.orderCount}</td>
                          <td className="py-4 px-4 text-[#121416]">{formatDate(customer.lastOrderAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
