'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '../components/Sidebar';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  hasSizes?: boolean;
  colors?: Array<{
    colorCode: string;
    colorName: string;
    images: string[];
    sizes: Array<{
      size: string;
      quantity: number;
    }>;
    quantity: number;
  }>;
  inventory?: number; // For old schema products
  totalInventory: number;
  isActive: boolean;
  created_at: string;
}

/** First product image URL for thumbnail (first color, first image) */
function getProductThumbnail(product: Product): string | null {
  const first = product.colors?.[0]?.images?.[0];
  return first || null;
}

/** Short description with ellipsis (e.g. ~80 chars) */
function truncateDescription(text: string, maxLen = 80): string {
  if (!text) return '';
  const t = text.trim();
  return t.length <= maxLen ? t : t.slice(0, maxLen).trim() + '...';
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusDialog, setStatusDialog] = useState<{
    show: boolean;
    productId: string;
    productName: string;
    isActive: boolean;
  }>({
    show: false,
    productId: '',
    productName: '',
    isActive: true,
  });
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/products-by-seller`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      // Handle new unified response format: { records, recordsTotal, recordsFiltered }
      setProducts(data.data?.records || data.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleToggleStatusClick = (
    productId: string,
    productName: string,
    isActive: boolean,
  ) => {
    setStatusDialog({
      show: true,
      productId,
      productName,
      isActive,
    });
  };

  const handleToggleStatusConfirm = async () => {
    try {
      setTogglingStatus(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${statusDialog.productId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update product status');
      }

      // Update the product status in the local state
      setProducts((prev) =>
        prev.map((product) =>
          product._id === statusDialog.productId
            ? { ...product, isActive: !statusDialog.isActive }
            : product,
        ),
      );

      setStatusDialog({
        show: false,
        productId: '',
        productName: '',
        isActive: true,
      });
      toast.success(
        data.msg ||
          `Product ${statusDialog.isActive ? 'deactivated' : 'activated'} successfully!`,
      );
    } catch (err: any) {
      toast.error(
        err.message ||
          `Failed to ${statusDialog.isActive ? 'deactivate' : 'activate'} product`,
      );
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleToggleStatusCancel = () => {
    setStatusDialog({
      show: false,
      productId: '',
      productName: '',
      isActive: true,
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f7f8fa]">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600">Loading products...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#121416] mb-1">
                My Products
              </h1>
              <p className="text-[#6a7581]">Manage your product listings</p>
            </div>
            <Link
              href="/sell/add-product"
              className="px-6 py-2 bg-[#121416] text-white rounded-lg hover:bg-[#2a2d30] transition-colors"
            >
              + Add Product
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start selling by adding your first product
              </p>
              <Link
                href="/sell/add-product"
                className="px-6 py-2 bg-[#121416] text-white rounded-lg hover:bg-[#2a2d30] transition-colors"
              >
                Add Your First Product
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => {
                const thumbnail = getProductThumbnail(product);
                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-[#e8eaed]"
                  >
                    <div className="flex gap-5 flex-wrap">
                      {/* Product thumbnail */}
                      <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-[#f0f1f3] overflow-hidden flex items-center justify-center">
                        {thumbnail ? (
                          <Image
                            src={thumbnail}
                            alt={product.name}
                            width={112}
                            height={112}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            className="w-10 h-10 text-[#9ca3af]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-bold text-[#121416] leading-tight">
                            {product.name}
                          </h3>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e8f0fe] text-[#1967d2] text-xs font-medium uppercase">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                            </svg>
                            {product.category}
                          </span>
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                              product.isActive
                                ? 'bg-[#dcfce7] text-[#166534]'
                                : 'bg-[#fee2e2] text-[#991b1b]'
                            }`}
                          >
                            {product.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </div>

                        <p className="text-sm text-[#6a7581] mb-2 line-clamp-2">
                          {truncateDescription(product.description)}
                        </p>

                        <p className="text-lg font-bold text-[#1967d2] mb-3">
                          {formatPrice(product.price)}
                        </p>

                        {/* Inventory */}
                        <div className="flex flex-col gap-3 text-sm">
                          <span className="inline-flex items-center gap-1.5 text-[#6a7581]">
                            <svg
                              className="w-4 h-4 text-[#9ca3af]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                            <span>
                              Total Stock:{' '}
                              <strong className="text-[#121416]">
                                {product.totalInventory} units
                              </strong>
                            </span>
                          </span>
                          {product.colors?.length ? (
                            <div className="flex flex-wrap gap-3">
                              {product.colors.map((c, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2.5"
                                  title={c.colorName || undefined}
                                >
                                  <span
                                    className="w-6 h-6 rounded-full flex-shrink-0 border border-[#d1d5db]"
                                    style={{
                                      backgroundColor: c.colorCode || '#e5e7eb',
                                    }}
                                    aria-hidden
                                  />
                                  <span className="flex flex-wrap gap-1.5">
                                    {product.hasSizes && c.sizes?.length ? (
                                      c.sizes.map((s, i) => (
                                        <span
                                          key={i}
                                          className="inline-flex items-baseline gap-1 rounded-md bg-[#f0f1f3] px-2 py-1 text-[#121416]"
                                        >
                                          <span className="font-semibold">
                                            {s.size}
                                          </span>
                                          <span className="font-medium tabular-nums">
                                            {s.quantity}
                                          </span>
                                        </span>
                                      ))
                                    ) : (
                                      <span className="rounded-md bg-[#f0f1f3] px-2 py-1 font-medium text-[#121416] tabular-nums">
                                        {c.quantity ?? 0}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        {/* Date added + actions row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-[#e8eaed]">
                          <span className="inline-flex items-center gap-1 text-xs text-[#6a7581]">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            Added:{' '}
                            <strong className="text-[#121416]">
                              {formatDate(product.created_at)}
                            </strong>
                          </span>
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/sell/edit-product/${product._id}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e8f0fe] text-[#1967d2] hover:bg-[#d2e3fc] transition-colors text-sm font-medium"
                            >
                              Edit
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </Link>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#121416]">
                                {product.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={product.isActive}
                                onClick={() =>
                                  handleToggleStatusClick(
                                    product._id,
                                    product.name,
                                    product.isActive,
                                  )
                                }
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#1967d2] focus:ring-offset-2 ${
                                  product.isActive
                                    ? 'bg-[#22c55e]'
                                    : 'bg-[#d1d5db]'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                                    product.isActive
                                      ? 'translate-x-5'
                                      : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Toggle status confirmation dialog */}
          {statusDialog.show && (
            <>
              {/* Background Overlay */}
              <div className="fixed inset-0 bg-white/20 backdrop-blur-sm z-[9998]" />

              {/* Modal */}
              <div className="fixed inset-0 flex items-center justify-center z-[9999]">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-[#121416] mb-4">
                    {statusDialog.isActive ? 'Deactivate' : 'Activate'} Product
                  </h3>
                  <p className="text-[#6a7581] mb-6">
                    {statusDialog.isActive
                      ? 'This will change the product status to inactive. Users will no longer see your product in listings.'
                      : 'This will change the product status to active. Users will be able to see your product in listings.'}
                  </p>
                  <p className="text-sm font-medium text-[#121416] mb-6">
                    Product:{' '}
                    <span className="font-normal">
                      {statusDialog.productName}
                    </span>
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleToggleStatusCancel}
                      disabled={togglingStatus}
                      className="flex-1 px-4 py-2 border border-[#dde0e3] text-[#6a7581] rounded-lg hover:bg-[#f7f8fa] transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleToggleStatusConfirm}
                      disabled={togglingStatus}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {togglingStatus ? 'Updating...' : 'Continue'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
