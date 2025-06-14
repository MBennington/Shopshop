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
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Payouts</h1>
            <p className="text-gray-500">Track your earnings and manage payouts</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === '7d' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              7d
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === '30d' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              30d
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === '90d' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              90d
            </button>
            <button
              onClick={() => setTimeRange('1y')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === '1y' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              1y
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-gray-500 text-sm font-medium mb-2">{metric.title}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                <span
                  className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {metric.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payout History</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Payout #1234</p>
                  <p className="text-sm text-gray-500">Completed on Mar 15, 2024</p>
                </div>
                <span className="text-lg font-bold text-gray-900">$8,234.56</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Payout #1233</p>
                  <p className="text-sm text-gray-500">Completed on Mar 8, 2024</p>
                </div>
                <span className="text-lg font-bold text-gray-900">$7,891.23</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Payout #1232</p>
                  <p className="text-sm text-gray-500">Completed on Mar 1, 2024</p>
                </div>
                <span className="text-lg font-bold text-gray-900">$8,567.89</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payout Schedule</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Next Payout</p>
                  <p className="text-sm text-gray-500">Scheduled for Mar 22, 2024</p>
                </div>
                <span className="text-lg font-bold text-gray-900">$12,345.67</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Payout Method</p>
                  <p className="text-sm text-gray-500">Bank Account (****1234)</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM48,56H208V200H48Z"></path>
                    <path d="M88,96a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,96Zm8,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Zm0,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Z"></path>
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Payout Frequency</p>
                  <p className="text-sm text-gray-500">Weekly (Every Friday)</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
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
  );
} 