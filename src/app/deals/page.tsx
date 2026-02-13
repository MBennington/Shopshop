"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProductRecord {
  _id: string;
  name: string;
  price: number;
  category: string;
  colors?: Array<{
    images: string[];
  }>;
  onSale?: boolean;
  discountPercentage?: number;
  salePrice?: number;
}

interface ProductsResponse {
  status?: boolean;
  data?: {
    records: ProductRecord[];
    recordsTotal: number;
  };
}

export default function DealsPage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchDeals = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('filterType', 'sale');
        params.set('page', '1');
        params.set('limit', '24');
        if (search.trim()) params.set('search', search.trim());
        const res = await fetch(`/api/products?${params}`);
        if (cancelled) return;
        const data: ProductsResponse = await res.json();
        if (!res.ok) {
          setProducts([]);
          return;
        }
        setProducts(data.data?.records ?? []);
      } catch {
        if (!cancelled) setProducts([]);
        setError('Failed to load deals');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDeals();
    return () => { cancelled = true; };
  }, [search]);

  const getImage = (p: ProductRecord) =>
    p.colors?.[0]?.images?.[0] || '/placeholder-product.png';

  const formatPrice = (n: number) => `$${Number(n).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[#f7f8fa] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#121416] mb-6">Deals</h1>
        <div className="mb-6 flex justify-end">
          <input
            type="text"
            placeholder="Search deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent bg-white text-[#121416] placeholder:text-[#6a7581]"
          />
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-[#dde0e3] h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map((product) => {
              const displayPrice = product.salePrice ?? product.price;
              const discount = product.discountPercentage
                ? `${Math.round(product.discountPercentage)}% OFF`
                : product.price > displayPrice
                  ? `${Math.round((1 - displayPrice / product.price) * 100)}% OFF`
                  : 'On sale';
              return (
                <Link
                  key={product._id}
                  href={`/products/${product.category.toLowerCase().replace(/\s+/g, '-')}/${product._id}`}
                  className="bg-white rounded-2xl shadow-lg border border-[#dde0e3] flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="h-40 w-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
                    <img
                      src={getImage(product)}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                    <span className="absolute top-3 left-3 bg-[#397fc5] text-white text-xs font-bold px-3 py-1 rounded-full">
                      {discount}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col gap-2 flex-1">
                    <h2 className="text-lg font-bold text-[#121416] truncate">{product.name}</h2>
                    <div className="flex items-center gap-2">
                      {product.salePrice != null && product.salePrice < product.price && (
                        <span className="text-[#6a7581] text-sm line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                      <span className="text-[#397fc5] text-lg font-bold">
                        {formatPrice(displayPrice)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
            {products.length === 0 && (
              <div className="col-span-full text-center text-[#6a7581] py-12">
                No deals found. Try a different search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
