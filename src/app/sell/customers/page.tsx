'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  status: 'active' | 'inactive';
}

const customers: Customer[] = [
  {
    id: 'CUS001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234-567-8901',
    totalOrders: 12,
    totalSpent: 1250.00,
    lastOrder: '2024-02-15',
    status: 'active'
  },
  {
    id: 'CUS002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 234-567-8902',
    totalOrders: 8,
    totalSpent: 850.00,
    lastOrder: '2024-02-10',
    status: 'active'
  },
  {
    id: 'CUS003',
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    phone: '+1 234-567-8903',
    totalOrders: 3,
    totalSpent: 450.00,
    lastOrder: '2024-01-28',
    status: 'inactive'
  },
  {
    id: 'CUS004',
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    phone: '+1 234-567-8904',
    totalOrders: 15,
    totalSpent: 2100.00,
    lastOrder: '2024-02-18',
    status: 'active'
  },
  {
    id: 'CUS005',
    name: 'Michael Wilson',
    email: 'michael.w@example.com',
    phone: '+1 234-567-8905',
    totalOrders: 5,
    totalSpent: 750.00,
    lastOrder: '2024-02-05',
    status: 'active'
  }
];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#121416] mb-1">Customers</h1>
              <p className="text-[#6a7581]">Manage your customer relationships</p>
            </div>
            <button className="bg-[#121416] text-white px-4 py-2 rounded-lg hover:bg-[#2a2d30] transition-colors">
              Add Customer
            </button>
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
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-[#dde0e3] rounded-lg text-[#6a7581] hover:bg-[#f7f8fa]">
                    Export
                  </button>
                  <button className="px-4 py-2 border border-[#dde0e3] rounded-lg text-[#6a7581] hover:bg-[#f7f8fa]">
                    Filter
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    statusFilter === 'all'
                      ? 'bg-[#121416] text-white'
                      : 'bg-[#f7f8fa] text-[#6a7581] hover:bg-[#f1f2f4]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    statusFilter === 'active'
                      ? 'bg-[#121416] text-white'
                      : 'bg-[#f7f8fa] text-[#6a7581] hover:bg-[#f1f2f4]'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    statusFilter === 'inactive'
                      ? 'bg-[#121416] text-white'
                      : 'bg-[#f7f8fa] text-[#6a7581] hover:bg-[#f1f2f4]'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#dde0e3]">
                    <th className="text-left py-3 px-4 text-[#6a7581] font-medium">Customer</th>
                    <th className="text-left py-3 px-4 text-[#6a7581] font-medium">Contact</th>
                    <th className="text-left py-3 px-4 text-[#6a7581] font-medium">Orders</th>
                    <th className="text-left py-3 px-4 text-[#6a7581] font-medium">Total Spent</th>
                    <th className="text-left py-3 px-4 text-[#6a7581] font-medium">Last Order</th>
                    <th className="text-left py-3 px-4 text-[#6a7581] font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[#6a7581] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-[#dde0e3] hover:bg-[#f7f8fa]">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-[#121416]">{customer.name}</div>
                          <div className="text-sm text-[#6a7581]">{customer.id}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-[#121416]">{customer.email}</div>
                          <div className="text-sm text-[#6a7581]">{customer.phone}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#121416]">{customer.totalOrders}</td>
                      <td className="py-4 px-4 text-[#121416]">${customer.totalSpent.toFixed(2)}</td>
                      <td className="py-4 px-4 text-[#121416]">{customer.lastOrder}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button className="text-[#6a7581] hover:text-[#121416]">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}