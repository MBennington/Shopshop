"use client";

import React, { useState } from 'react';

const newArrivals = [
  {
    id: 'n1',
    name: 'Summer Floral Dress',
    price: '$39.99',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'n2',
    name: 'Minimalist Backpack',
    price: '$59.99',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'n3',
    name: 'Wireless Speaker',
    price: '$24.99',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  },
];

export default function NewArrivalsPage() {
  const [search, setSearch] = useState('');
  const filteredArrivals = newArrivals.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="min-h-screen bg-[#f7f8fa] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#121416] mb-6">New Arrivals</h1>
        <div className="mb-6 flex justify-end">
          <input
            type="text"
            placeholder="Search new arrivals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent bg-white text-[#121416] placeholder:text-[#6a7581]"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredArrivals.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-[#dde0e3] flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="h-40 w-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
                <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                <span className="absolute top-3 left-3 bg-[#22c55e] text-white text-xs font-bold px-3 py-1 rounded-full">New</span>
              </div>
              <div className="p-6 flex flex-col gap-2 flex-1">
                <h2 className="text-lg font-bold text-[#121416] truncate">{item.name}</h2>
                <span className="text-[#397fc5] text-lg font-bold">{item.price}</span>
              </div>
            </div>
          ))}
          {filteredArrivals.length === 0 && <div className="col-span-full text-center text-[#6a7581]">No new arrivals found.</div>}
        </div>
      </div>
    </div>
  );
} 