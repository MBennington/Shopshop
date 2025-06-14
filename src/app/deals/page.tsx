"use client";

import React, { useState } from 'react';

const deals = [
  {
    id: 'd1',
    name: 'Wireless Earbuds',
    oldPrice: '$49.99',
    newPrice: '$29.99',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    discount: '40% OFF',
  },
  {
    id: 'd2',
    name: 'Eco Bamboo Toothbrush',
    oldPrice: '$5.99',
    newPrice: '$3.99',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    discount: '33% OFF',
  },
  {
    id: 'd3',
    name: 'Denim Jacket',
    oldPrice: '$69.99',
    newPrice: '$49.99',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    discount: '29% OFF',
  },
];

export default function DealsPage() {
  const [search, setSearch] = useState('');
  const filteredDeals = deals.filter(deal => deal.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="min-h-screen bg-[#f7f8fa] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#121416] mb-6">Deals</h1>
        <div className="mb-6 flex justify-end">
          <input
            type="text"
            placeholder="Search deals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent bg-white text-[#121416] placeholder:text-[#6a7581]"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredDeals.map((deal) => (
            <div key={deal.id} className="bg-white rounded-2xl shadow-lg border border-[#dde0e3] flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="h-40 w-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
                <img src={deal.image} alt={deal.name} className="object-cover w-full h-full" />
                <span className="absolute top-3 left-3 bg-[#397fc5] text-white text-xs font-bold px-3 py-1 rounded-full">{deal.discount}</span>
              </div>
              <div className="p-6 flex flex-col gap-2 flex-1">
                <h2 className="text-lg font-bold text-[#121416] truncate">{deal.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[#6a7581] text-sm line-through">{deal.oldPrice}</span>
                  <span className="text-[#397fc5] text-lg font-bold">{deal.newPrice}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredDeals.length === 0 && <div className="col-span-full text-center text-[#6a7581]">No deals found.</div>}
        </div>
      </div>
    </div>
  );
} 