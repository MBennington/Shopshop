'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SubOrder {
  _id: string;
  main_order_id: string | {
    _id: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
  };
  products_list: Array<{
    product_id: string | {
      _id: string;
      name: string;
      price: number;
      images: string[];
    };
    product_name?: string;
    product_price?: number;
    product_images?: string[];
    qty: number;
    color: string;
    size?: string;
    subtotal: number;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    province: string;
    country: string;
    phone: string;
  };
  tracking_number?: string;
  subtotal: number;
  finalTotal: number;
  orderStatus: string;
  seller_marked_as_delivered?: boolean;
  seller_marked_as_delivered_at?: string;
}

export default function ConfirmDeliveryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [subOrder, setSubOrder] = useState<SubOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedStatus, setConfirmedStatus] = useState<boolean | null>(null);

  const subOrderId = searchParams.get('subOrderId');
  const confirmedParam = searchParams.get('confirmed');

  useEffect(() => {
    // Only handle confirmed=true, ignore confirmed=false
    if (confirmedParam === 'true') {
      setConfirmedStatus(true);
    }
  }, [confirmedParam]);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      // User is not logged in, redirect to login with return URL
      const currentUrl = window.location.href;
      router.push(`/auth?returnUrl=${encodeURIComponent(currentUrl)}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (subOrderId && user && !authLoading) {
      fetchSubOrder();
    } else if (subOrderId && !user && !authLoading) {
      // Wait for redirect to happen
      return;
    } else if (!subOrderId) {
      setError('Order ID is required');
      setLoading(false);
    }
  }, [subOrderId, user, authLoading]);

  const fetchSubOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // No token, redirect to login
        const currentUrl = window.location.href;
        router.push(`/auth?returnUrl=${encodeURIComponent(currentUrl)}`);
        return;
      }

      const response = await fetch(`/api/suborder?subOrderId=${subOrderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubOrder(data.data || data);
      } else {
        const result = await response.json();
        
        // If unauthorized, redirect to login
        if (response.status === 401 || response.status === 403) {
          const currentUrl = window.location.href;
          router.push(`/auth?returnUrl=${encodeURIComponent(currentUrl)}`);
          return;
        }
        
        const errorMsg = result.error || result.msg || 'Failed to load order details';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Failed to fetch sub-order:', err);
      const errorMsg = 'Failed to load order details';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (confirmed: boolean) => {
    if (!subOrderId) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/suborder?subOrderId=${subOrderId}&action=buyer-confirm-delivery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ confirmed }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Delivery confirmed successfully!');
        setConfirmedStatus(confirmed);
        // Refresh order data
        await fetchSubOrder();
      } else {
        const errorMsg = result.error || result.msg || 'Failed to update delivery status';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Failed to confirm delivery:', err);
      const errorMsg = 'Failed to update delivery status';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading || (loading && !user)) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#121416] mx-auto mb-4"></div>
          <p className="text-[#6a7581]">
            {authLoading ? 'Checking authentication...' : 'Loading order details...'}
          </p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show message (redirect should happen, but just in case)
  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
          <div className="text-yellow-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#121416] mb-2">Login Required</h1>
          <p className="text-[#6a7581] mb-6">
            Please log in to confirm your order delivery.
          </p>
          <button
            onClick={() => {
              const currentUrl = window.location.href;
              router.push(`/auth?returnUrl=${encodeURIComponent(currentUrl)}`);
            }}
            className="bg-[#121416] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#2a2d30] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error && !subOrder) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#121416] mb-2">Error</h1>
          <p className="text-[#6a7581] mb-6">{error}</p>
          <button
            onClick={() => router.push('/my-orders')}
            className="bg-[#121416] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#2a2d30] transition-colors"
          >
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

  if (!subOrder) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#121416] mb-2">
              Confirm Order Delivery
            </h1>
            <p className="text-[#6a7581]">
              Please confirm if you have received your order
            </p>
          </div>


          {/* Order Details */}
          <div className="mb-6 space-y-4">
            <div className="bg-[#f1f2f4] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#121416] mb-3">Order Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6a7581]">Order ID:</span>
                  <span className="font-medium text-[#121416]">{subOrder._id.slice(-8)}</span>
                </div>
                {subOrder.tracking_number && (
                  <div className="flex justify-between">
                    <span className="text-[#6a7581]">Tracking Number:</span>
                    <span className="font-medium text-[#121416]">{subOrder.tracking_number}</span>
                  </div>
                )}
                {subOrder.seller_marked_as_delivered_at && (
                  <div className="flex justify-between">
                    <span className="text-[#6a7581]">Marked as Delivered:</span>
                    <span className="font-medium text-[#121416]">{formatDate(subOrder.seller_marked_as_delivered_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="bg-[#f1f2f4] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#121416] mb-3">Products</h3>
              <div className="space-y-3">
                {subOrder.products_list.map((product, index) => (
                  <div key={index} className="flex gap-3">
                    {product.product_images && product.product_images.length > 0 && (
                      <img
                        src={product.product_images[0]}
                        alt={product.product_name || 'Product'}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-[#121416] text-sm">
                        {product.product_name || 'Product'}
                      </p>
                      <p className="text-xs text-[#6a7581]">
                        Quantity: {product.qty} | Color: {product.color}
                        {product.size && ` | Size: ${product.size}`}
                      </p>
                      <p className="text-sm font-semibold text-[#121416] mt-1">
                        LKR {product.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-[#f1f2f4] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#121416] mb-3">Shipping Address</h3>
              <p className="text-sm text-[#6a7581]">
                {subOrder.shippingAddress.firstName} {subOrder.shippingAddress.lastName}
                <br />
                {subOrder.shippingAddress.address}
                <br />
                {subOrder.shippingAddress.city}, {subOrder.shippingAddress.province} {subOrder.shippingAddress.postalCode}
                <br />
                {subOrder.shippingAddress.country}
                <br />
                Phone: {subOrder.shippingAddress.phone}
              </p>
            </div>

            <div className="bg-[#f1f2f4] rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#121416]">Total Amount:</span>
                <span className="text-lg font-bold text-[#121416]">LKR {subOrder.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Confirmation Buttons */}
          {confirmedStatus !== true && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#121416] mb-4 text-center">
                Have you received this order?
              </p>
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => handleConfirm(true)}
                  disabled={submitting}
                  className="bg-green-600 text-white px-6 py-4 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full md:w-auto min-w-[200px]"
                >
                  {submitting && confirmedStatus === true ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Yes, I Received It</span>
                    </>
                  )}
                </button>
                <div className="text-center">
                  <p className="text-sm text-[#6a7581] mb-2">
                    Having issues with your order?
                  </p>
                  <a
                    href="/report-issue"
                    className="text-[#121416] hover:underline text-sm font-medium"
                  >
                    Report an Issue
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Back Button */}
          {confirmedStatus === true && (
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/my-orders')}
                className="bg-[#121416] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#2a2d30] transition-colors"
              >
                Go to My Orders
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

