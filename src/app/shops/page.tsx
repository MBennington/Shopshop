"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const shops = [
  {
    id: '1',
    name: 'Urban Styles',
    description: 'Trendy urban fashion and accessories for all ages.',
    owner: 'Alice Johnson',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '2',
    name: 'Eco Home',
    description: 'Eco-friendly home goods and sustainable living products.',
    owner: 'Bob Smith',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '3',
    name: 'Gadget Galaxy',
    description: 'Latest gadgets, electronics, and tech accessories.',
    owner: 'Charlie Lee',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  },
];

export default function ShopsPage() {
  const [search, setSearch] = useState('');
  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(search.toLowerCase()) ||
    shop.owner.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-[#f7f8fa] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#121416] mb-6">Shops</h1>
        <div className="mb-6 flex justify-end">
          <input
            type="text"
            placeholder="Search shops..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent bg-white text-[#121416] placeholder:text-[#6a7581]"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredShops.map((shop) => (
            <Link key={shop.id} href={`/shops/${shop.id}`} className="group">
              <div className="bg-white rounded-2xl shadow-lg border border-[#dde0e3] flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-200 cursor-pointer group-hover:scale-[1.02]">
                <div className="h-40 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img src={shop.image} alt={shop.name} className="object-cover w-full h-full" />
                </div>
                <div className="p-6 flex flex-col gap-2 flex-1">
                  <h2 className="text-lg font-bold text-[#121416] truncate">{shop.name}</h2>
                  <p className="text-[#6a7581] text-sm mb-2 line-clamp-2">{shop.description}</p>
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <div className="w-8 h-8 rounded-full bg-[#397fc5] flex items-center justify-center text-white font-bold text-xs">{shop.owner.split(' ').map(n => n[0]).join('')}</div>
                    <span className="text-xs text-[#397fc5] font-medium">{shop.owner}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filteredShops.length === 0 && <div className="col-span-full text-center text-[#6a7581]">No shops found.</div>}
        </div>
      </div>
    </div>
  );
} 