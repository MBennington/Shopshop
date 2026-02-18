'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Seller {
  _id: string;
  name: string;
  profilePicture?: string;
  sellerInfo?: {
    businessName?: string;
  };
}


export default function ShopsPage() {
  const [search, setSearch] = useState('');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        if (isInitialLoad.current) {
          setLoading(true);
        }
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        const response = await fetch(`/api/get-all-sellers?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch sellers');
        }

        const data = await response.json();
        setSellers(data.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching sellers:', err);
      } finally {
        setLoading(false);
        isInitialLoad.current = false;
      }
    };

    fetchSellers();
  }, [search]);

  const filteredShops = sellers;

  if (loading && isInitialLoad.current) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-[#121416] mb-6">Shops</h1>
          <div className="flex justify-center items-center h-64">
            <div className="text-[#6a7581]">Loading shops...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && sellers.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-[#121416] mb-6">Shops</h1>
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#121416] mb-6">Shops</h1>
        <div className="mb-6 flex justify-end">
          <input
            type="text"
            placeholder="Search shops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent bg-white text-[#121416] placeholder:text-[#6a7581]"
          />
        </div>
        {error && sellers.length > 0 && (
          <div className="mb-4 text-amber-600 text-sm">{error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredShops.map((seller) => {
            const businessName = seller.sellerInfo?.businessName || seller.name;
            const shopImage =
              seller.profilePicture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                businessName
              )}&background=397fc5&color=fff&size=400`;

            return (
              <Link
                key={seller._id}
                href={`/shops/${seller._id}/${encodeURIComponent(
                  seller.sellerInfo?.businessName || seller.name
                )}`}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-[#dde0e3] flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-200 cursor-pointer group-hover:scale-[1.02]">
                  <div className="h-40 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={shopImage}
                      alt={businessName}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-6 flex flex-col gap-2 flex-1">
                    <h2 className="text-lg font-bold text-[#121416] truncate">
                      {businessName}
                    </h2>
                    <p className="text-[#6a7581] text-sm mb-2 line-clamp-2">
                      Shop by {seller.name}
                    </p>
                    <div className="mt-auto flex items-center gap-2 pt-2">
                      <div className="w-8 h-8 rounded-full bg-[#397fc5] flex items-center justify-center text-white font-bold text-xs">
                        {seller.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                      <span className="text-xs text-[#397fc5] font-medium">
                        {seller.name}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
          {filteredShops.length === 0 && (
            <div className="col-span-full text-center text-[#6a7581]">
              No shops found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
