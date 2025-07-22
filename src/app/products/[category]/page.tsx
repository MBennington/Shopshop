'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { use } from 'react';
import { ChevronDown, Search } from 'lucide-react';

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
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ProductsResponse {
  status: boolean;
  data: {
    records: Product[];
    recordsTotal: number;
    recordsFiltered: number;
  };
}

export default function ProductCatalogue({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const unwrappedParams = use(params);
  const category = unwrappedParams.category;

  // State for products and loading
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // State for filters
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        category: categoryName,
      });

      // Only add search parameter if there's a search query
      if (searchQuery.trim()) {
        queryParams.append('search', searchQuery.trim());
      }

      // Add sorting if not default
      if (sortBy !== 'featured') {
        queryParams.append('order', sortBy === 'price_asc' ? 'asc' : 'desc');
        if (sortBy === 'price_asc' || sortBy === 'price_desc') {
          queryParams.append('column', '1'); // price column
        }
      }

      const response = await fetch(`http://localhost:5000/api/products/?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const responseData: ProductsResponse = await response.json();
      console.log('Frontend received data:', responseData);
      setProducts(responseData.data.records);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: responseData.data.recordsTotal,
        pages: Math.ceil(responseData.data.recordsTotal / pagination.limit),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [category, sortBy, searchQuery, pagination.page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [sortBy, searchQuery]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {categoryName}
          </h1>
          <p className="text-gray-600">
            Discover amazing products in {categoryName.toLowerCase()}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>


        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? `No products found for "${searchQuery}" in ${categoryName}`
                      : `No products available in ${categoryName} at the moment`
                    }
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear search and show all products
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {products.map((product) => (
                    <Link
                      key={product._id}
                      href={`/products/${category}/${product._id}`}
                      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        {product.colors &&
                        product.colors[0]?.images &&
                        product.colors[0].images[0] ? (
                          <Image
                            src={product.colors[0].images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}

                        {/* Color indicators */}
                        {product.colors && product.colors.length > 0 && (
                          <div className="absolute bottom-2 left-2 flex gap-1">
                            {product.colors.slice(0, 3).map((color, index) => (
                              <div
                                key={index}
                                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: color.colorCode }}
                                title={color.colorName}
                              />
                            ))}
                            {product.colors.length > 3 && (
                              <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm bg-gray-300 flex items-center justify-center">
                                <span className="text-xs text-gray-600">
                                  +{product.colors.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-900">
                            ${product.price}
                          </span>
                          <span className="text-sm text-gray-500">
                            {product.totalInventory
                              ? `${product.totalInventory} in stock`
                              : 'Available'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>

                    {Array.from(
                      { length: Math.min(5, pagination.pages) },
                      (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-lg ${
                              page === pagination.page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

            <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
