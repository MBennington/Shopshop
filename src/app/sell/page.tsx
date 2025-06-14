'use client';

import Sidebar from './components/Sidebar';

export default function SellerDashboard() {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 overflow-y-auto">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">Dashboard</p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">Welcome to your seller dashboard</p>
              </div>
            </div>
            {/* Rest of your dashboard content */}
          </div>
        </div>
      </div>
    </div>
  );
}