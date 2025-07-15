'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';

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
  status: string;
  created_at: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    show: boolean;
    productId: string;
    productName: string;
    currentStatus: string;
  }>({
    show: false,
    productId: '',
    productName: '',
    currentStatus: '',
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:5000/api/products/products-by-seller',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.data || []);
    } catch (err: any) {
      setError(err.message);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteClick = (productId: string, productName: string, currentStatus: string) => {
    setDeleteDialog({
      show: true,
      productId,
      productName,
      currentStatus,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/products/${deleteDialog.productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || 'Failed to deactivate product');
      }

      // Update the product status in the local state
      setProducts((prev) =>
        prev.map((product) =>
          product._id === deleteDialog.productId
            ? { ...product, status: deleteDialog.currentStatus === 'Active' ? 'Inactive' : 'Active' }
            : product
        )
      );

      setDeleteDialog({ show: false, productId: '', productName: '', currentStatus: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ show: false, productId: '', productName: '', currentStatus: '' });
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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#121416] mb-1">
                        {product.name}
                      </h3>
                      <p className="text-[#6a7581] text-sm mb-2">
                        {product.category}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        product.status
                      )}`}
                    >
                      {product.status}
                    </span>
                  </div>

                  <p className="text-[#121416] mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-[#6a7581] text-sm">Price:</span>
                      <span className="font-semibold text-[#121416]">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6a7581] text-sm">Inventory:</span>
                      <span className="font-semibold text-[#121416]">
                        {product.totalInventory} units
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#6a7581] text-sm">Colors:</span>
                      <div className="flex space-x-1">
                        {product.colors?.slice(0, 5).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: color.colorCode }}
                            title={color.colorName}
                          />
                        ))}
                        {product.colors && product.colors.length > 5 && (
                          <span className="text-xs text-[#6a7581] ml-1">
                            +{product.colors.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6a7581] text-sm">Added:</span>
                      <span className="font-semibold text-[#121416]">
                        {formatDate(product.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/sell/edit-product/${product._id}`}
                      className="flex-1 px-4 py-2 border border-[#dde0e3] rounded-lg text-[#6a7581] hover:bg-[#f7f8fa] transition-colors text-sm text-center"
                    >
                      Edit
                    </Link>
                                        <button 
                      onClick={() =>
                        handleDeleteClick(product._id, product.name, product.status)
                      }
                      className={`flex-1 px-4 py-2 border rounded-lg transition-colors text-sm ${
                        product.status === 'Active'
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {product.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {deleteDialog.show && (
            <>
              {/* Background Overlay */}
              <div className="fixed inset-0 bg-black bg-opacity-30 z-[9998]" />

              {/* Modal */}
              <div className="fixed inset-0 flex items-center justify-center z-[9999]">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200">
                                  <h3 className="text-lg font-semibold text-[#121416] mb-4">
                  {deleteDialog.currentStatus === 'Active' ? 'Deactivate' : 'Activate'} Product
                </h3>
                <p className="text-[#6a7581] mb-6">
                  {deleteDialog.currentStatus === 'Active' 
                    ? 'This will change the product status to inactive. Users will no longer see your product in listings.'
                    : 'This will change the product status to active. Users will be able to see your product in listings.'
                  }
                </p>
                  <p className="text-sm font-medium text-[#121416] mb-6">
                    Product:{' '}
                    <span className="font-normal">
                      {deleteDialog.productName}
                    </span>
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteCancel}
                      disabled={deleting}
                      className="flex-1 px-4 py-2 border border-[#dde0e3] text-[#6a7581] rounded-lg hover:bg-[#f7f8fa] transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      disabled={deleting}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleting ? 'Deactivating...' : 'Continue'}
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
