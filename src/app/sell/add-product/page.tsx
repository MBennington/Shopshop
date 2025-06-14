'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';

export default function AddProductPage() {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const handleSizeChange = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#121416] mb-1">Add New Product</h1>
              <p className="text-[#6a7581]">Create a new product listing</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#121417] text-sm font-medium mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121416] focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-[#121417] text-sm font-medium mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121416] focus:border-transparent"
                    placeholder="Enter price"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#121417] text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121416] focus:border-transparent"
                  rows={4}
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label className="block text-[#121417] text-sm font-medium mb-2">
                  Category
                </label>
                <select className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121416] focus:border-transparent">
                  <option value="">Select a category</option>
                  <option value="clothing">Clothing</option>
                  <option value="accessories">Accessories</option>
                  <option value="shoes">Shoes</option>
                </select>
              </div>

              <div>
                <label className="block text-[#121417] text-sm font-medium mb-2">
                  Sizes
                </label>
                <div className="flex flex-wrap gap-3">
                  {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                    <label
                      key={size}
                      className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-4 h-11 cursor-pointer transition-colors ${
                        selectedSizes.includes(size)
                          ? 'bg-[#121416] text-white border-[#121416]'
                          : 'border-[#dde0e4] text-[#121417] hover:bg-[#f7f8fa]'
                      }`}
                    >
                      {size}
                      <input
                        type="checkbox"
                        className="invisible absolute"
                        checked={selectedSizes.includes(size)}
                        onChange={() => handleSizeChange(size)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#121417] text-sm font-medium mb-2">
                  Images
                </label>
                <div className="border-2 border-dashed border-[#dde0e3] rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center">
                    <svg
                      className="h-12 w-12 text-[#6a7581] mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-[#6a7581] mb-2">Drag and drop your images here</p>
                    <p className="text-sm text-[#6a7581]">or</p>
                    <button
                      type="button"
                      className="mt-2 px-4 py-2 bg-[#121416] text-white rounded-lg hover:bg-[#2a2d30] transition-colors"
                    >
                      Browse Files
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="px-6 py-2 border border-[#dde0e3] rounded-lg text-[#6a7581] hover:bg-[#f7f8fa]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#121416] text-white rounded-lg hover:bg-[#2a2d30] transition-colors"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 