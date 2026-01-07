'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  isActive: boolean;
  totalInventory: number;
  seller: {
    _id: string;
    name: string;
    sellerInfo?: {
      businessName?: string;
    };
  };
  colors: Array<{
    colorCode: string;
    colorName: string;
    quantity?: number;
    availableQuantity?: number;
    sizes?: Array<{
      size: string;
      quantity: number;
      availableQuantity?: number;
    }>;
  }>;
  hasSizes: boolean;
  created_at: string;
}

interface Seller {
  _id: string;
  name: string;
  sellerInfo?: {
    businessName?: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface StockData {
  product: {
    _id: string;
    name: string;
    category: string;
    seller: {
      _id: string;
      name: string;
      sellerInfo?: {
        businessName?: string;
      };
    };
  };
  stockBreakdown: {
    totalInventory: number;
    colors: Array<{
      colorCode: string;
      colorName: string;
      totalQuantity: number;
      availableQuantity: number;
      reservedQuantity: number;
      soldQuantity: number;
      sizes?: Array<{
        size: string;
        totalQuantity: number;
        availableQuantity: number;
        reservedQuantity: number;
        soldQuantity: number;
      }>;
    }>;
  };
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'Fashion', label: 'Fashion' },
  { value: 'Home & Living', label: 'Home & Living' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Books', label: 'Books' },
  { value: 'Sports & Outdoors', label: 'Sports & Outdoors' },
  { value: 'Beauty & Personal Care', label: 'Beauty & Personal Care' },
  { value: 'Toys & Games', label: 'Toys & Games' },
  { value: 'Food & Grocery', label: 'Food & Grocery' },
];

export default function AdminProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProducts();
      fetchSellers();
    }
  }, [user, currentPage, categoryFilter, sellerFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(search && { search }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(sellerFilter && { sellerId: sellerFilter }),
      });

      const response = await fetch(`/api/admin/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.data.products || []);
        setPagination(data.data.pagination || null);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await fetch('/api/get-all-sellers');
      if (response.ok) {
        const data = await response.json();
        setSellers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch sellers:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const handleSellerFilter = (sellerId: string) => {
    setSellerFilter(sellerId);
    setCurrentPage(1);
  };

  const handleViewStock = async (product: Product) => {
    try {
      setActionLoading(product._id);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/products/${product._id}/stock`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStockData(data.data);
        setSelectedProduct(product);
        setShowStockModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
      toast.error('Failed to fetch stock data');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (product: Product) => {
    setSelectedProduct(product);
    setShowDeactivateModal(true);
  };

  const handleActivate = async (product: Product) => {
    setSelectedProduct(product);
    setShowActivateModal(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedProduct) return;

    try {
      setActionLoading(selectedProduct._id);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/admin/products/${selectedProduct._id}/deactivate`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setShowDeactivateModal(false);
        setSelectedProduct(null);
        fetchProducts(); // Refresh list
        toast.success('Product deactivated successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to deactivate product');
      }
    } catch (error) {
      console.error('Failed to deactivate product:', error);
      toast.error('Failed to deactivate product');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmActivate = async () => {
    if (!selectedProduct) return;

    try {
      setActionLoading(selectedProduct._id);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/admin/products/${selectedProduct._id}/activate`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setShowActivateModal(false);
        setSelectedProduct(null);
        fetchProducts(); // Refresh list
        toast.success('Product activated successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to activate product');
      }
    } catch (error) {
      console.error('Failed to activate product:', error);
      toast.error('Failed to activate product');
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 overflow-y-auto">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">
                  Products Management
                </p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">
                  View and manage all platform products
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 py-3">
              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[#6a7581] mb-2 block">
                        Search
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search products..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch}>Search</Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#6a7581] mb-2 block">
                        Category
                      </label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={categoryFilter}
                        onChange={(e) => handleCategoryFilter(e.target.value)}
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#6a7581] mb-2 block">
                        Shop/Seller
                      </label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={sellerFilter}
                        onChange={(e) => handleSellerFilter(e.target.value)}
                      >
                        <option value="">All Shops</option>
                        {sellers.map((seller) => (
                          <option key={seller._id} value={seller._id}>
                            {seller.sellerInfo?.businessName || seller.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearch('');
                          setCategoryFilter('');
                          setSellerFilter('');
                          setCurrentPage(1);
                          fetchProducts();
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products Table */}
            <div className="px-4 py-3">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-[#6a7581]">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-[#6a7581]">No products found</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Products ({pagination?.total || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 text-sm font-medium text-[#6a7581]">
                              Product
                            </th>
                            <th className="text-left p-3 text-sm font-medium text-[#6a7581]">
                              Category
                            </th>
                            <th className="text-left p-3 text-sm font-medium text-[#6a7581]">
                              Shop
                            </th>
                            <th className="text-left p-3 text-sm font-medium text-[#6a7581]">
                              Price
                            </th>
                            <th className="text-left p-3 text-sm font-medium text-[#6a7581]">
                              Stock
                            </th>
                            <th className="text-left p-3 text-sm font-medium text-[#6a7581]">
                              Status
                            </th>
                            <th className="text-left p-3 text-sm font-medium text-[#6a7581]">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr
                              key={product._id}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="p-3">
                                <div>
                                  <p className="font-medium text-[#121416]">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-[#6a7581] mt-1">
                                    {formatDate(product.created_at)}
                                  </p>
                                </div>
                              </td>
                              <td className="p-3 text-sm text-[#6a7581]">
                                {product.category}
                              </td>
                              <td className="p-3 text-sm text-[#6a7581]">
                                {product.seller?.sellerInfo?.businessName ||
                                  product.seller?.name ||
                                  'N/A'}
                              </td>
                              <td className="p-3 text-sm font-medium text-[#121416]">
                                {formatPrice(product.price)}
                              </td>
                              <td className="p-3 text-sm text-[#6a7581]">
                                {product.totalInventory || 0}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    product.isActive
                                  )}`}
                                >
                                  {product.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewStock(product)}
                                    disabled={
                                      actionLoading === product._id
                                    }
                                  >
                                    {actionLoading === product._id
                                      ? 'Loading...'
                                      : 'Stock'}
                                  </Button>
                                  {product.isActive ? (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeactivate(product)}
                                      disabled={
                                        actionLoading === product._id
                                      }
                                    >
                                      Deactivate
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleActivate(product)}
                                      disabled={
                                        actionLoading === product._id
                                      }
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      {actionLoading === product._id
                                        ? 'Loading...'
                                        : 'Activate'}
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <p className="text-sm text-[#6a7581]">
                          Page {pagination.page} of {pagination.pages} (
                          {pagination.total} total)
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((p) =>
                                Math.min(pagination.pages, p + 1)
                              )
                            }
                            disabled={currentPage === pagination.pages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stock Data Modal */}
      {showStockModal && stockData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Stock Data - {stockData.product.name}</CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowStockModal(false);
                    setStockData(null);
                  }}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-[#6a7581] mb-1">
                    Product Info
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p>
                      <span className="font-medium">Category:</span>{' '}
                      {stockData.product.category}
                    </p>
                    <p>
                      <span className="font-medium">Shop:</span>{' '}
                      {stockData.product.seller.sellerInfo?.businessName ||
                        stockData.product.seller.name}
                    </p>
                    <p>
                      <span className="font-medium">Total Inventory:</span>{' '}
                      {stockData.stockBreakdown.totalInventory}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#6a7581] mb-2">
                    Stock Breakdown by Color
                  </p>
                  <div className="space-y-3">
                    {stockData.stockBreakdown.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="border rounded-md p-4 bg-gray-50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: color.colorCode }}
                          ></div>
                          <p className="font-medium">{color.colorName}</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div>
                            <p className="text-[#6a7581]">Total</p>
                            <p className="font-medium">{color.totalQuantity}</p>
                          </div>
                          <div>
                            <p className="text-[#6a7581]">Available</p>
                            <p className="font-medium text-green-600">
                              {color.availableQuantity}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#6a7581]">Reserved</p>
                            <p className="font-medium text-yellow-600">
                              {color.reservedQuantity}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#6a7581]">Sold</p>
                            <p className="font-medium text-blue-600">
                              {color.soldQuantity}
                            </p>
                          </div>
                        </div>
                        {color.sizes && color.sizes.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium text-[#6a7581] mb-2">
                              Sizes:
                            </p>
                            <div className="space-y-2">
                              {color.sizes.map((size, sizeIdx) => (
                                <div
                                  key={sizeIdx}
                                  className="bg-white p-2 rounded border"
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <p className="font-medium text-sm">
                                      Size {size.size}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2 text-xs">
                                    <div>
                                      <p className="text-[#6a7581]">Total</p>
                                      <p>{size.totalQuantity}</p>
                                    </div>
                                    <div>
                                      <p className="text-[#6a7581]">Available</p>
                                      <p className="text-green-600">
                                        {size.availableQuantity}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[#6a7581]">Reserved</p>
                                      <p className="text-yellow-600">
                                        {size.reservedQuantity}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[#6a7581]">Sold</p>
                                      <p className="text-blue-600">
                                        {size.soldQuantity}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Deactivate Product</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Are you sure you want to deactivate{' '}
                <span className="font-medium">{selectedProduct.name}</span>?
                This will make the product unavailable for purchase.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeactivateModal(false);
                    setSelectedProduct(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeactivate}
                  disabled={actionLoading === selectedProduct._id}
                >
                  {actionLoading === selectedProduct._id
                    ? 'Deactivating...'
                    : 'Deactivate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activate Confirmation Modal */}
      {showActivateModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Activate Product</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Are you sure you want to activate{' '}
                <span className="font-medium">{selectedProduct.name}</span>?
                This will make the product available for purchase.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowActivateModal(false);
                    setSelectedProduct(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={confirmActivate}
                  disabled={actionLoading === selectedProduct._id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {actionLoading === selectedProduct._id
                    ? 'Activating...'
                    : 'Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
