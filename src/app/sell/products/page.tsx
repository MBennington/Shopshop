'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';

interface Product {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  inventory: number;
  price: number;
}

const products: Product[] = [
  { id: '1', name: 'Eco-Friendly Bamboo Toothbrushes', status: 'Active', inventory: 150, price: 4.99 },
  { id: '2', name: 'Organic Cotton Reusable Shopping Bags', status: 'Active', inventory: 200, price: 9.99 },
  { id: '3', name: 'Natural Beeswax Food Wraps', status: 'Active', inventory: 100, price: 12.99 },
  { id: '4', name: 'Recycled Paper Notebooks', status: 'Inactive', inventory: 50, price: 7.99 },
  { id: '5', name: 'Sustainable Cork Yoga Mats', status: 'Active', inventory: 75, price: 29.99 },
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 overflow-y-auto">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">Products</p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">Manage your product catalog</p>
              </div>
              <Link
                href="/sell/add-product"
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#f1f2f4] text-[#121416] text-sm font-medium leading-normal"
              >
                <span className="truncate">Add product</span>
              </Link>
            </div>

            <div className="px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                  <div className="text-[#6a7581] flex border-none bg-[#f1f2f4] items-center justify-center pl-4 rounded-l-xl border-r-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                    </svg>
                  </div>
                  <input
                    placeholder="Search products"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border-none bg-[#f1f2f4] focus:border-none h-full placeholder:text-[#6a7581] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </label>
            </div>

            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-xl border border-[#dde0e3] bg-white">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-white">
                      <th className="px-4 py-3 text-left text-[#121416] w-[400px] text-sm font-medium leading-normal">Product</th>
                      <th className="px-4 py-3 text-left text-[#121416] w-60 text-sm font-medium leading-normal">Status</th>
                      <th className="px-4 py-3 text-left text-[#121416] w-[400px] text-sm font-medium leading-normal">Inventory</th>
                      <th className="px-4 py-3 text-left text-[#121416] w-[400px] text-sm font-medium leading-normal">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-t border-t-[#dde0e3]">
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#121416] text-sm font-normal leading-normal">
                          {product.name}
                        </td>
                        <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                          <button
                            className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 text-sm font-medium leading-normal w-full ${
                              product.status === 'Active' ? 'bg-[#f1f2f4] text-[#121416]' : 'bg-red-100 text-red-600'
                            }`}
                          >
                            <span className="truncate">{product.status}</span>
                          </button>
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#6a7581] text-sm font-normal leading-normal">
                          {product.inventory} in stock
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#6a7581] text-sm font-normal leading-normal">
                          ${product.price.toFixed(2)}
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
    </div>
  );
}