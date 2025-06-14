'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex flex-col gap-2 w-64 sticky top-0 h-screen bg-white border-r border-[#dde0e3] p-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="size-4">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h2 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em]">Seller Hub</h2>
      </div>

      <Link
        href="/sell"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
          isActive('/sell') ? 'bg-[#f1f2f4] text-[#121416]' : 'text-[#6a7581] hover:bg-[#f1f2f4]'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
          <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM48,56H208V200H48Z"></path>
          <path d="M88,96a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,96Zm8,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Zm0,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Z"></path>
        </svg>
        <span className="text-sm font-medium">Dashboard</span>
      </Link>

      <Link
        href="/sell/products"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
          isActive('/sell/products') ? 'bg-[#f1f2f4] text-[#121416]' : 'text-[#6a7581] hover:bg-[#f1f2f4]'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
          <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM48,56H208V200H48Z"></path>
          <path d="M88,96a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,96Zm8,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Zm0,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Z"></path>
        </svg>
        <span className="text-sm font-medium">Products</span>
      </Link>

      <Link
        href="/sell/orders"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
          isActive('/sell/orders') ? 'bg-[#f1f2f4] text-[#121416]' : 'text-[#6a7581] hover:bg-[#f1f2f4]'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
          <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM48,56H208V200H48Z"></path>
          <path d="M88,96a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,96Zm8,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Zm0,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Z"></path>
        </svg>
        <span className="text-sm font-medium">Orders</span>
      </Link>

      <Link
        href="/sell/analytics"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
          isActive('/sell/analytics') ? 'bg-[#f1f2f4] text-[#121416]' : 'text-[#6a7581] hover:bg-[#f1f2f4]'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
          <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM48,56H208V200H48Z"></path>
          <path d="M88,96a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,96Zm8,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Zm0,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Z"></path>
        </svg>
        <span className="text-sm font-medium">Analytics</span>
      </Link>

      <Link
        href="/sell/payouts"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
          isActive('/sell/payouts') ? 'bg-[#f1f2f4] text-[#121416]' : 'text-[#6a7581] hover:bg-[#f1f2f4]'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
          <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM48,56H208V200H48Z"></path>
          <path d="M88,96a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,96Zm8,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Zm0,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Z"></path>
        </svg>
        <span className="text-sm font-medium">Payouts</span>
      </Link>

      <Link
        href="/sell/settings"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
          isActive('/sell/settings') ? 'bg-[#f1f2f4] text-[#121416]' : 'text-[#6a7581] hover:bg-[#f1f2f4]'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
          <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM48,56H208V200H48Z"></path>
          <path d="M88,96a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,96Zm8,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Zm0,40h64a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16Z"></path>
        </svg>
        <span className="text-sm font-medium">Settings</span>
      </Link>
    </div>
  );
}