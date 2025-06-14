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
  {
    title: 'Available Balance',
    value: '$12,345.67',
    change: '+12.5%',
    trend: 'up',
  },
  {
    title: 'Pending Payouts',
    value: '$2,345.67',
    change: '+5.2%',
    trend: 'up',
  },
  {
    title: 'Last Payout',
    value: '$8,234.56',
    change: '-2.1%',
    trend: 'down',
  },
  {
    title: 'Next Payout',
    value: 'In 3 days',
    change: 'Scheduled',
    trend: 'up',
  },
];

export default function PayoutsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 overflow-y-auto">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">Payouts</p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">Track your earnings and manage payouts</p>
              </div>
              <div className="flex items-center gap-2">
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
                <button className="ml-2 h-8 px-5 rounded-full bg-[#121416] text-white text-sm font-bold hover:bg-[#23272b] transition-colors">
                  Withdraw Now
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
              {metrics.map((metric, index) => (
                <div key={index} className="flex flex-col gap-2 p-4 rounded-xl border border-[#dde0e3] bg-white">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#dde0e3] bg-white p-4">
                  <h2 className="text-[#121416] text-lg font-bold leading-tight mb-4">Payout History</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-lg">
                      <div>
                        <p className="font-medium text-[#121416]">Payout #1234</p>
                        <p className="text-sm text-[#6a7581]">Completed on Mar 15, 2024</p>
                      </div>
                      <span className="text-lg font-bold text-[#121416]">$8,234.56</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-lg">
                      <div>
                        <p className="font-medium text-[#121416]">Payout #1233</p>
                        <p className="text-sm text-[#6a7581]">Completed on Mar 8, 2024</p>
                      </div>
                      <span className="text-lg font-bold text-[#121416]">$7,891.23</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-lg">
                      <div>
                        <p className="font-medium text-[#121416]">Payout #1232</p>
                        <p className="text-sm text-[#6a7581]">Completed on Mar 1, 2024</p>
                      </div>
                      <span className="text-lg font-bold text-[#121416]">$8,567.89</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#dde0e3] bg-white p-4">
                  <h2 className="text-[#121416] text-lg font-bold leading-tight mb-4">Payout Schedule</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-lg">
                      <div>
                        <p className="font-medium text-[#121416]">Next Payout</p>
                        <p className="text-sm text-[#6a7581]">Scheduled for Mar 22, 2024</p>
                      </div>
                      <span className="text-lg font-bold text-[#121416]">$12,345.67</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-lg">
                      <div>
                        <p className="font-medium text-[#121416]">Payout Method</p>
                        <p className="text-sm text-[#6a7581]">Bank Account (****1234)</p>
                      </div>
                      <button className="text-[#121416] hover:text-[#6a7581]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM48,56H208V200H48Z"></path>
                          <path d="M88,96a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,96Zm8,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Zm0,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Z"></path>
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-lg">
                      <div>
                        <p className="font-medium text-[#121416]">Payout Frequency</p>
                        <p className="text-sm text-[#6a7581]">Weekly (Every Friday)</p>
                      </div>
                      <button className="text-[#121416] hover:text-[#6a7581]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM48,56H208V200H48Z"></path>
                          <path d="M88,96a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,96Zm8,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Zm0,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Z"></path>
                        </svg>
                      </button>
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