"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OutOfStockBadge } from '@/components/OutOfStockBadge';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  colors?: Array<{
    colorCode: string;
    colorName: string;
    images: string[];
  }>;
  totalInventory?: number;
}

interface ProductsResponse {
  status: boolean;
  data: {
    records: Product[];
    recordsTotal: number;
  };
}

export default function NewArrivalsPage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const queryParams = new URLSearchParams({
          filterType: 'new_arrivals',
          sortBy: 'newest',
          limit: '24',
          page: '1',
        });

        if (search.trim()) {
          queryParams.append('search', search.trim());
        }

        const response = await fetch(`/api/products?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch new arrivals');
        }

        const data: ProductsResponse = await response.json();
        if (data.status && data.data.records) {
          setProducts(data.data.records);
        }
      } catch (err) {
        console.error('Error fetching new arrivals:', err);
        setError(err instanceof Error ? err.message : 'Failed to load new arrivals');
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, [search]);

  const getProductImage = (product: Product) => {
    if (
      product.colors &&
      product.colors.length > 0 &&
      product.colors[0].images &&
      product.colors[0].images.length > 0
    ) {
      return product.colors[0].images[0];
    }
    return null;
  };

  const getProductUrl = (product: Product) => {
    // Map category names to URL slugs
    const categoryMap: { [key: string]: string } = {
      Fashion: 'fashion',
      'Home & Living': 'home_and_living',
      Electronics: 'electronics',
      Books: 'books',
      'Sports & Outdoors': 'sports_and_outdoors',
      'Beauty & Personal Care': 'beauty_and_personal_care',
      'Toys & Games': 'toys_and_games',
      'Food & Grocery': 'food_and_grocery',
    };

    const categorySlug =
      categoryMap[product.category] ||
      product.category.toLowerCase().replace(/\s+/g, '_');
    return `/products/${categorySlug}/${product._id}`;
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa] py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#121416]">New Arrivals</h1>
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search new arrivals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-80 px-4 py-2.5 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0808] focus:border-transparent bg-white text-[#121416] placeholder:text-[#6a7581] transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-100/50 animate-pulse"
              >
                <div className="aspect-square bg-gray-50"></div>
                <div className="p-3">
                  <div className="h-3.5 bg-gray-200 rounded mb-2 w-full"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-7 w-7 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#FF0808] text-white rounded-lg hover:bg-[#FF4040] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => {
              const productImage = getProductImage(product);
              const productUrl = getProductUrl(product);

              return (
                <Link
                  key={product._id}
                  href={productUrl}
                  className="group bg-white rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(255,8,8,0.12)] transition-all duration-500 border border-gray-100/50 hover:border-[#FF0808]/30"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    {productImage ? (
                      <Image
                        src={productImage}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <span className="text-gray-300 text-xs font-medium">
                          No image
                        </span>
                      </div>
                    )}
                    <OutOfStockBadge show={(product.totalInventory ?? 0) === 0} badgePosition="right" />
                    {/* New Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-[#22c55e] text-white text-[10px] font-bold uppercase tracking-wide rounded-full">
                        New
                      </span>
                    </div>
                    {/* Category Tag */}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-medium text-white uppercase tracking-wide">
                        {product.category}
                      </span>
                    </div>
                    {/* Premium Hover Indicator */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-[13px] font-medium text-gray-800 mb-2 group-hover:text-[#FF0808] transition-colors line-clamp-1 leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-600">
                        LKR {product.price.toFixed(2)}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-[#FF0808] flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#6a7581] text-lg mb-4">
              {search
                ? 'No new arrivals found matching your search.'
                : 'No new arrivals available at the moment.'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="px-6 py-2 bg-[#FF0808] text-white rounded-lg hover:bg-[#FF4040] transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 