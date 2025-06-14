'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

const metrics: MetricCard[] = [
  { title: 'Total Sales', value: '$12,345', change: '+12.5%', trend: 'up' },
  { title: 'Total Orders', value: '1,234', change: '+8.2%', trend: 'up' },
  { title: 'Average Order Value', value: '$45.67', change: '-2.1%', trend: 'down' },
  { title: 'Conversion Rate', value: '3.2%', change: '+0.5%', trend: 'up' },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 overflow-y-auto">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">Analytics</p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">Track your store performance</p>
              </div>
              <div className="flex gap-2">
                {['7d', '30d', '90d', '1y'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 text-sm font-medium leading-normal ${
                      timeRange === range ? 'bg-[#121416] text-white' : 'bg-[#f1f2f4] text-[#121416]'
                    }`}
                  >
                    <span className="truncate">{range}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
              {metrics.map((metric) => (
                <div key={metric.title} className="flex flex-col gap-2 p-4 rounded-xl border border-[#dde0e3] bg-white">
                  <p className="text-[#6a7581] text-sm font-normal leading-normal">{metric.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-[#121416] text-2xl font-bold leading-tight">{metric.value}</p>
                    <p className={`text-sm font-medium leading-normal ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4">
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-[#dde0e3] bg-white p-4">
                  <h3 className="text-[#121416] text-lg font-bold leading-tight mb-4">Sales Overview</h3>
                  <div className="h-[300px] flex items-center justify-center text-[#6a7581]">
                    Sales Chart Placeholder
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#dde0e3] bg-white p-4">
                    <h3 className="text-[#121416] text-lg font-bold leading-tight mb-4">Top Products</h3>
                    <div className="space-y-4">
                      {['Eco-Friendly Bamboo Toothbrushes', 'Organic Cotton Bags', 'Beeswax Food Wraps'].map((product) => (
                        <div key={product} className="flex items-center justify-between">
                          <p className="text-[#121416] text-sm font-normal leading-normal">{product}</p>
                          <p className="text-[#6a7581] text-sm font-normal leading-normal">$1,234</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#dde0e3] bg-white p-4">
                    <h3 className="text-[#121416] text-lg font-bold leading-tight mb-4">Customer Demographics</h3>
                    <div className="h-[200px] flex items-center justify-center text-[#6a7581]">
                      Demographics Chart Placeholder
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}