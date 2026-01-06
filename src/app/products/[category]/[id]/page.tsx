'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Edit2, Trash2, X, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductDetailsProps {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  hasSizes: boolean;
  colors: Array<{
    _id?: string;
    colorCode: string;
    colorName: string;
    images: string[];
    sizes?: Array<{
      size: string;
      quantity: number;
      availableQuantity?: number;
    }>;
    quantity?: number;
    availableQuantity?: number;
  }>;
  totalInventory: number;
}

interface Seller {
  _id: string;
  name: string;
  businessName: string;
  baseShippingFee?: number;
}

interface Review {
  _id: string;
  rating: number;
  title?: string;
  content: string;
  isVerified?: boolean;
  createdAt: string;
  userData: {
    _id?: string;
    name: string;
    profilePicture?: string;
  };
}

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
  previewReviews: Review[];
}

interface ProductDetailsResponse {
  product: Product;
  seller: Seller;
  reviews: ReviewSummary;
}

interface CheckoutData {
  id: string;
  category: string;
  name: string;
  price: number;
  image?: string | null;
  color: string;
  quantity: number;
  size?: string;
}

export default function ProductDetails({ params }: ProductDetailsProps) {
  const { category, id } = use(params);
  const [productData, setProductData] = useState<ProductDetailsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [stockError, setStockError] = useState<string | null>(null);
  const [wishlistColorIds, setWishlistColorIds] = useState<Set<string>>(new Set());
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const router = useRouter();

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    title: '',
    content: '',
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [reviewEligibility, setReviewEligibility] = useState<{
    eligible: boolean;
    hasSubOrders: boolean;
    allDelivered?: boolean;
    nonDeliveredSubOrderIds?: string[];
    message?: string;
  } | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Get current user ID
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT to get user ID (simple base64 decode)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id || payload.userId || null);
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }, []);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/products/details/${id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }

        const data = await response.json();
        setProductData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // Fetch all reviews with pagination
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;

      try {
        const response = await fetch(
          `/api/reviews?product=${id}&page=${currentPage}&limit=10&sort=${sortBy}`
        );

        if (response.ok) {
          const data = await response.json();
          setAllReviews(data.data?.reviews || []);
          setTotalPages(data.data?.pagination?.pages || 1);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error fetching reviews:', response.status, errorData);
          setAllReviews([]);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setAllReviews([]);
      }
    };

    fetchReviews();
  }, [id, currentPage, sortBy]);

  // Fetch wishlist to check which colors are already in wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!productData?.product || !id) return;

      const token = localStorage.getItem('token');
      if (!token) {
        setWishlistColorIds(new Set());
        return;
      }

      try {
        const response = await fetch('/api/wishlist', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const wishlistData = data.data;
          
          // Find products for this product_id and collect color_ids
          const colorIds = new Set<string>();
          if (wishlistData?.shops) {
            Object.values(wishlistData.shops).forEach((shop: any) => {
              if (shop.products) {
                shop.products.forEach((product: any) => {
                  if (product.product_id === id && product.color_id) {
                    colorIds.add(product.color_id);
                  }
                });
              }
            });
          }
          setWishlistColorIds(colorIds);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlistColorIds(new Set());
      }
    };

    fetchWishlist();
  }, [productData, id]);

  // Reset quantity if it exceeds available stock
  useEffect(() => {
    if (productData?.product) {
      const product = productData.product;
      let currentAvailableQuantity = 0;

      if (product.hasSizes) {
        if (selectedSize !== null) {
          const availableSizes = product.colors[selectedColor]?.sizes || [];
          const sizeData = availableSizes.find(
            (size: any) => size.size === selectedSize
          );
          // Use availableQuantity if provided by backend, otherwise fallback to quantity
          currentAvailableQuantity = sizeData
            ? sizeData.availableQuantity !== undefined
              ? sizeData.availableQuantity
              : sizeData.quantity
            : 0;
        }
      } else {
        const selectedColorData = product.colors[selectedColor];
        // Use availableQuantity if provided by backend, otherwise fallback to quantity
        currentAvailableQuantity = selectedColorData
          ? selectedColorData.availableQuantity !== undefined
            ? selectedColorData.availableQuantity
            : selectedColorData.quantity || 0
          : 0;
      }

      if (quantity > currentAvailableQuantity && currentAvailableQuantity > 0) {
        setQuantity(currentAvailableQuantity);
      }
    }
  }, [productData, selectedSize, selectedColor, quantity]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error || !productData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link
            href={`/products/${category}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const { product, seller, reviews } = productData;

  // Get available images and sizes from selected color
  const availableImages = product.colors[selectedColor]?.images || [];
  const productImages = availableImages.length > 0 ? availableImages : [];
  const availableSizes = product.colors[selectedColor]?.sizes || [];

  // Get available quantity for selected color and size
  const getAvailableQuantity = () => {
    if (product.hasSizes) {
      if (selectedSize === null) return 0;
      const sizeData = availableSizes.find(
        (size: any) => size.size === selectedSize
      );
      // Use availableQuantity if provided by backend, otherwise fallback to quantity
      return sizeData
        ? sizeData.availableQuantity !== undefined
          ? sizeData.availableQuantity
          : sizeData.quantity
        : 0;
    } else {
      const selectedColorData = product.colors[selectedColor];
      // Use availableQuantity if provided by backend, otherwise fallback to quantity
      return selectedColorData
        ? selectedColorData.availableQuantity !== undefined
          ? selectedColorData.availableQuantity
          : selectedColorData.quantity
        : 0;
    }
  };

  const availableQuantity = getAvailableQuantity() || 0;

  // Calculate rating distribution percentages
  const getRatingPercentage = (rating: number) => {
    if (reviews.totalReviews === 0) return 0;
    return Math.round(
      (reviews.ratingDistribution[rating] / reviews.totalReviews) * 100
    );
  };

  // Check review eligibility
  const checkReviewEligibility = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    setCheckingEligibility(true);
    try {
      const response = await fetch(
        `/api/suborder/check-review-eligibility/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Eligibility check failed:', response.status, errorData);
        throw new Error(
          errorData.msg || errorData.message || 'Failed to check eligibility'
        );
      }

      const data = await response.json();
      setReviewEligibility(data.data);
      return data.data;
    } catch (error: any) {
      console.error('Error checking eligibility:', error);
      setReviewEligibility({
        eligible: false,
        hasSubOrders: false,
        message:
          error.message ||
          `It looks like you haven't purchased this item yet. Reviews are available after purchase.`,
      });
      return null;
    } finally {
      setCheckingEligibility(false);
    }
  };

  // Handle review form submission
  const handleSubmitReview = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    if (!reviewFormData.content.trim()) {
      alert('Please enter your review content');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const url = editingReview
        ? `/api/reviews/${editingReview._id}`
        : `/api/reviews`;

      const method = editingReview ? 'PUT' : 'POST';
      const body = editingReview
        ? {
            rating: reviewFormData.rating,
            title: reviewFormData.title,
            content: reviewFormData.content,
          }
        : {
            product: id,
            rating: reviewFormData.rating,
            title: reviewFormData.title,
            content: reviewFormData.content,
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.msg || error.message || 'Failed to submit review'
        );
      }

      const result = await response.json();
      const hasUpdatedOrders = result.data?.updatedSubOrders || false;
      const updatedCount = result.data?.updatedSubOrderCount || 0;

      // Show success message with order update info if applicable
      if (hasUpdatedOrders) {
        const action = editingReview ? 'updated' : 'submitted';
        alert(
          `Review ${action} successfully! ${updatedCount} order(s) have been marked as delivered.`
        );
      } else {
        const action = editingReview ? 'updated' : 'submitted';
        alert(`Review ${action} successfully!`);
      }

      // Reset form and refresh
      setShowReviewForm(false);
      setEditingReview(null);
      setReviewFormData({ rating: 5, title: '', content: '' });
      setReviewEligibility(null);

      // Refresh product details and reviews
      const productResponse = await fetch(
        `/api/products/details/${id}`
      );
      if (productResponse.ok) {
        const productData = await productResponse.json();
        setProductData(productData.data);
      }

      // Refresh reviews list
      const reviewsResponse = await fetch(
        `/api/reviews?product=${id}&page=${currentPage}&limit=10&sort=${sortBy}`
      );
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setAllReviews(reviewsData.data.reviews || []);
        setTotalPages(reviewsData.data.pagination?.pages || 1);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      const response = await fetch(
        `/api/reviews/${reviewId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      // Refresh product details and reviews
      const productResponse = await fetch(
        `/api/products/details/${id}`
      );
      if (productResponse.ok) {
        const productData = await productResponse.json();
        setProductData(productData.data);
      }

      // Refresh reviews list
      const reviewsResponse = await fetch(
        `/api/reviews?product=${id}&page=${currentPage}&limit=10&sort=${sortBy}`
      );
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setAllReviews(reviewsData.data.reviews || []);
        setTotalPages(reviewsData.data.pagination?.pages || 1);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete review');
    }
  };

  // Open edit review form
  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setReviewFormData({
      rating: review.rating,
      title: review.title || '',
      content: review.content,
    });
    setShowReviewForm(true);
  };

  const handleAddToCart = async () => {
    try {
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      // Build payload
      const payload: any = {
        product_id: id,
        qty: quantity,
        color: product.colors[selectedColor].colorCode,
      };

      if (product.hasSizes && selectedSize) {
        payload.size = selectedSize;
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload), // must be string
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || 'Failed to update cart');
      }

      console.log('✅ Cart updated:', data);
      alert('✅ Item added to cart successfully!');
      router.push('/cart');
    } catch (error: any) {
      console.error('Error updating cart:', error);
      setError(error.message || 'Failed to add to cart');
    }
  };

  // Check if currently selected color is in wishlist
  const isSelectedColorInWishlist = () => {
    if (!productData?.product.colors[selectedColor]?._id) return false;
    const colorId = productData.product.colors[selectedColor]._id;
    return wishlistColorIds.has(colorId);
  };

  const handleAddToWishlist = async () => {
    try {
      setAddingToWishlist(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      // Get the selected color's _id
      const selectedColorData = productData?.product.colors[selectedColor];
      if (!selectedColorData) {
        throw new Error('Please select a color first');
      }

      // Get the color's _id (MongoDB ObjectId)
      const colorId = selectedColorData._id;
      if (!colorId) {
        throw new Error('Color ID not found. Please refresh the page.');
      }

      // Check if already in wishlist
      if (wishlistColorIds.has(colorId)) {
        alert('ℹ️ This product color is already in your wishlist!');
        return;
      }

      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          product_id: id,
          color_id: colorId 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || 'Failed to add to wishlist');
      }

      console.log('✅ Added to wishlist:', data);
      // Add color ID to wishlist set
      setWishlistColorIds(new Set([...wishlistColorIds, colorId]));
      alert('✅ Item added to wishlist!');
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      // Don't show error if product is already in wishlist
      if (error.message && !error.message.includes('already')) {
        setError(error.message || 'Failed to add to wishlist');
      } else if (error.message && error.message.includes('already')) {
        alert('ℹ️ This product color is already in your wishlist!');
        // Update wishlist state in case it was added
        const selectedColorData = productData?.product.colors[selectedColor];
        if (selectedColorData?._id) {
          setWishlistColorIds(new Set([...wishlistColorIds, selectedColorData._id]));
        }
      }
    } finally {
      setAddingToWishlist(false);
    }
  };

  // Handle purchase action
  const handlePurchase = (action: 'buy' | 'cart') => {
    if (product.hasSizes && selectedSize === null) {
      setStockError('Please select a size first');
      return;
    }
    if (quantity > availableQuantity) {
      setStockError(`Only ${availableQuantity} items available in stock`);
      return;
    }

    if (action === 'buy') {
      const checkoutData: CheckoutData = {
        id,
        category,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: productImages.length > 0 ? productImages[selectedImage] : null,
        color: product.colors[selectedColor]?.colorName,
      };

      // Add size only if product has sizes and selectedSize is a non-empty string
      if (product.hasSizes && selectedSize?.trim()) {
        checkoutData.size = selectedSize.trim();
      }
      window.location.href = `/checkout?product=${encodeURIComponent(
        JSON.stringify(checkoutData)
      )}`;
    } else {
      // Add to cart logic here
      handleAddToCart();
      setStockError(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Back Button */}
      <div className="px-4 py-3 border-b border-gray-200">
        <Link
          href={`/products/${category}`}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to {category}</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="gap-1 px-6 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[920px] flex-1">
          {/* Breadcrumb Navigation */}
          <div className="flex flex-wrap gap-2 p-4">
            <Link
              className="text-[#6a7581] text-base font-medium leading-normal"
              href="/"
            >
              Home
            </Link>
            <span className="text-[#6a7581] text-base font-medium leading-normal">
              /
            </span>
            <Link
              className="text-[#6a7581] text-base font-medium leading-normal"
              href={`/products/${category}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Link>
            <span className="text-[#6a7581] text-base font-medium leading-normal">
              /
            </span>
            <span className="text-[#121416] text-base font-medium leading-normal">
              {product.name}
            </span>
          </div>

          {/* Main Section: Gallery + Info */}
          <div className="flex w-full grow bg-white @container p-4 gap-8">
            {/* Image Gallery */}
            <div className="flex flex-col gap-3 min-w-[320px] max-w-[360px]">
              {productImages.length > 0 ? (
                <>
                  <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-white flex items-center justify-center">
                    <img
                      src={productImages[selectedImage]}
                      alt="Product main"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  {/* Show thumbnails for all images, even single ones */}
                  <div className="flex gap-1 justify-center">
                    {productImages.map((img, idx) => (
                      <button
                        key={`${img}-${idx}`}
                        className={`w-16 h-16 rounded-sm border-2 ${
                          selectedImage === idx
                            ? 'border-[#528bc5]'
                            : 'border-[#dde0e3]'
                        } overflow-hidden focus:outline-none`}
                        onClick={() => setSelectedImage(idx)}
                        aria-label={`Show image ${idx + 1}`}
                      >
                        <img
                          src={img}
                          alt={`Product thumbnail ${idx + 1}`}
                          className="object-contain w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm">No images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Info Panel */}
            <div className="flex-1 flex flex-col w-[360px]">
              <div className="flex items-start justify-between gap-3 pt-5 pb-3">
                <h1 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] flex-1">
                  {product.name}
                </h1>
                <button
                  onClick={handleAddToWishlist}
                  disabled={addingToWishlist || isSelectedColorInWishlist()}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${
                    isSelectedColorInWishlist()
                      ? 'bg-red-50 border-red-300 text-red-600'
                      : 'bg-white border-[#dde0e3] text-[#121416] hover:bg-gray-50'
                  } ${addingToWishlist ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  title={isSelectedColorInWishlist() ? 'Already in wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    className={`w-5 h-5 ${isSelectedColorInWishlist() ? 'fill-current' : ''}`}
                  />
                </button>
              </div>
              <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1">
                {product.description}
              </p>
              <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">
                Price
              </h3>
              <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1">
                LKR {product.price}
              </p>

              {/* Color Selection */}
              <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">
                Color
              </h3>
              <div className="flex flex-wrap gap-5 pb-2">
                {product.colors.map((color, index) => (
                  <label
                    key={color.colorCode}
                    className={`size-10 rounded-full border ring-[color-mix(in_srgb,#121416_50%,_transparent)] cursor-pointer ${
                      selectedColor === index
                        ? 'border-[3px] border-white ring'
                        : 'border-[#dde0e3]'
                    }`}
                    style={{ backgroundColor: color.colorCode }}
                  >
                    <input
                      type="radio"
                      className="invisible"
                      name="color"
                      checked={selectedColor === index}
                      onChange={() => {
                        setSelectedColor(index);
                        setSelectedImage(0);
                        setSelectedSize(null);
                      }}
                    />
                  </label>
                ))}
              </div>

              {/* Size Selection - Only for products with sizes */}
              {product.hasSizes && availableSizes.length > 0 && (
                <>
                  <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">
                    Size
                  </h3>
                  <div className="flex flex-wrap gap-3 pb-2">
                    {availableSizes.map((sizeData: any) => {
                      const sizeAvailableQty =
                        sizeData.availableQuantity !== undefined
                          ? sizeData.availableQuantity
                          : sizeData.quantity;
                      return (
                        <label
                          key={sizeData.size}
                          className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-4 h-11 text-[#121416] relative ${
                            selectedSize === sizeData.size
                              ? 'border-[3px] px-3.5 border-[#528bc5]'
                              : 'border-[#dde0e3]'
                          } ${
                            sizeAvailableQty === 0
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                          }`}
                        >
                          {sizeData.size}
                          <input
                            type="radio"
                            className="invisible absolute"
                            name="size"
                            value={sizeData.size}
                            checked={selectedSize === sizeData.size}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            disabled={sizeAvailableQty === 0}
                          />
                        </label>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Quantity Selection */}
              <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">
                Quantity
              </h3>
              <div className="flex items-center gap-3 pb-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={
                    (product.hasSizes && selectedSize === null) || quantity <= 1
                  }
                  className={`w-10 h-10 rounded-lg border border-[#dde0e3] flex items-center justify-center ${
                    (product.hasSizes && selectedSize === null) || quantity <= 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-[#121416] hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={availableQuantity}
                  value={quantity}
                  onChange={(e) => {
                    const newQuantity = Math.max(
                      1,
                      parseInt(e.target.value) || 1
                    );
                    const maxQuantity = Math.min(
                      newQuantity,
                      availableQuantity
                    );
                    setQuantity(maxQuantity);
                    setStockError(null);
                  }}
                  disabled={product.hasSizes && selectedSize === null}
                  className={`w-16 h-10 text-center border border-[#dde0e3] rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    product.hasSizes && selectedSize === null
                      ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                      : 'text-[#121416]'
                  }`}
                />
                <button
                  onClick={() => {
                    const newQuantity = Math.min(
                      quantity + 1,
                      availableQuantity
                    );
                    setQuantity(newQuantity);
                    setStockError(null);
                  }}
                  disabled={
                    (product.hasSizes && selectedSize === null) ||
                    quantity >= availableQuantity
                  }
                  className={`w-10 h-10 rounded-lg border border-[#dde0e3] flex items-center justify-center ${
                    (product.hasSizes && selectedSize === null) ||
                    quantity >= availableQuantity
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-[#121416] hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  +
                </button>
              </div>
              {(selectedSize || !product.hasSizes) && (
                <p className="text-sm text-gray-600 mt-1">
                  {availableQuantity} available in stock
                </p>
              )}
              {stockError && (
                <p className="text-sm text-red-600 mt-1">{stockError}</p>
              )}

              {/* Action Buttons */}
              <div className="flex justify-stretch">
                <div className="flex flex-1 gap-3 flex-wrap py-3 justify-start">
                  <button
                    onClick={() => handlePurchase('buy')}
                    disabled={
                      (product.hasSizes && selectedSize === null) ||
                      quantity > availableQuantity
                    }
                    className={`flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-full h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${
                      (product.hasSizes && selectedSize === null) ||
                      quantity > availableQuantity
                        ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                        : 'cursor-pointer bg-[#528bc5] text-white hover:bg-[#4a7bb3]'
                    }`}
                  >
                    <span className="truncate">Buy Now</span>
                  </button>
                  <button
                    onClick={() => handlePurchase('cart')}
                    disabled={
                      (product.hasSizes && selectedSize === null) ||
                      quantity > availableQuantity
                    }
                    className={`flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-full h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${
                      (product.hasSizes && selectedSize === null) ||
                      quantity > availableQuantity
                        ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                        : 'cursor-pointer bg-[#f1f2f4] text-[#121416] hover:bg-[#e5e7eb]'
                    }`}
                  >
                    <span className="truncate">Add to Cart</span>
                  </button>
                </div>
              </div>

              {/* Specifications */}
              <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">
                Specifications
              </h3>
              <div className="grid grid-cols-[20%_1fr] gap-x-6">
                <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dde0e3] py-5">
                  <p className="text-[#6a7581] text-sm font-normal leading-normal">
                    Category
                  </p>
                  <p className="text-[#121416] text-sm font-normal leading-normal">
                    {product.category}
                  </p>
                </div>
                <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dde0e3] py-5">
                  <p className="text-[#6a7581] text-sm font-normal leading-normal">
                    Business
                  </p>
                  <p className="text-[#121416] text-sm font-normal leading-normal">
                    {seller.businessName || seller.name}
                  </p>
                </div>
                <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dde0e3] py-5">
                  <p className="text-[#6a7581] text-sm font-normal leading-normal">
                    Shipping Fee
                  </p>
                  <p className="text-[#121416] text-sm font-normal leading-normal">
                    LKR {seller.baseShippingFee?.toFixed(2) || '100.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="px-4 pb-2 pt-4 flex items-center justify-between">
            <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em]">
              Customer Reviews
            </h3>
            <button
              onClick={async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                  router.push('/auth');
                  return;
                }
                setEditingReview(null);
                setReviewFormData({ rating: 5, title: '', content: '' });

                // Check eligibility before showing form
                const eligibility = await checkReviewEligibility();
                if (eligibility && eligibility.eligible) {
                  setShowReviewForm(true);
                } else {
                  // Don't show form if not eligible, but eligibility state is set for display
                  setShowReviewForm(true); // Still show form to display the message
                }
              }}
              className="px-4 py-2 bg-[#528bc5] text-white rounded-lg hover:bg-[#4a7bb3] text-sm font-medium"
            >
              Write a Review
            </button>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
            <div className="flex flex-col gap-2">
              <p className="text-[#121416] text-4xl font-black leading-tight tracking-[-0.033em]">
                {reviews.averageRating.toFixed(1)}
              </p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={
                      i < Math.floor(reviews.averageRating)
                        ? 'text-[#121416]'
                        : 'text-[#bec4cb]'
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18px"
                      height="18px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z" />
                    </svg>
                  </div>
                ))}
              </div>
              <p className="text-[#121416] text-base font-normal leading-normal">
                {reviews.totalReviews} review
                {reviews.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="contents">
                  <p className="text-[#121416] text-sm font-normal leading-normal">
                    {rating}
                  </p>
                  <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#dde0e3]">
                    <div
                      className="rounded-full bg-[#121416]"
                      style={{ width: `${getRatingPercentage(rating)}%` }}
                    />
                  </div>
                  <p className="text-[#6a7581] text-sm font-normal leading-normal text-right">
                    {getRatingPercentage(rating)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sort and Filter */}
          {reviews.totalReviews > 0 && (
            <div className="px-4 pb-4 flex items-center gap-4">
              <label className="text-sm text-[#6a7581]">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 border border-[#dde0e3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#528bc5]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating_high">Highest Rating</option>
                <option value="rating_low">Lowest Rating</option>
              </select>
            </div>
          )}

          {/* Individual Reviews */}
          {allReviews.length > 0 ? (
            <div className="flex flex-col gap-8 overflow-x-hidden bg-white p-4">
              {allReviews.map((review) => {
                const isOwnReview =
                  currentUserId && review.userData._id === currentUserId;
                return (
                  <div
                    key={review._id}
                    className="flex flex-col gap-3 bg-white border-b border-[#dde0e3] pb-6 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gray-200 flex items-center justify-center">
                          {review.userData.profilePicture ? (
                            <img
                              src={review.userData.profilePicture}
                              alt={review.userData.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-500 text-sm font-medium">
                              {review.userData.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[#121416] text-base font-medium leading-normal">
                              {review.userData.name}
                            </p>
                            {review.isVerified && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <p className="text-[#6a7581] text-sm font-normal leading-normal">
                            {new Date(review.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      {isOwnReview && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="p-2 text-[#6a7581] hover:text-[#528bc5] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit review"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-2 text-[#6a7581] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating
                              ? 'text-[#121416] fill-[#121416]'
                              : 'text-[#bec4cb]'
                          }`}
                        />
                      ))}
                    </div>
                    {review.title && (
                      <h4 className="text-[#121416] text-base font-medium leading-normal">
                        {review.title}
                      </h4>
                    )}
                    <p className="text-[#121416] text-base font-normal leading-normal">
                      {review.content}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : reviews.totalReviews === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-gray-500 mb-4">
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          ) : (
            <div className="text-center py-8 px-4">
              <p className="text-gray-500">Loading reviews...</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === 1
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-[#dde0e3] text-[#121416] hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-[#6a7581]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === totalPages
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-[#dde0e3] text-[#121416] hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          )}

          {/* Review Form Modal */}
          {showReviewForm && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-30 z-[9998]"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setReviewFormData({ rating: 5, title: '', content: '' });
                  setReviewEligibility(null);
                }}
              />
              <div className="fixed inset-0 flex items-center justify-center z-[9999]">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#121416]">
                      {editingReview ? 'Edit Review' : 'Write a Review'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowReviewForm(false);
                        setEditingReview(null);
                        setReviewFormData({
                          rating: 5,
                          title: '',
                          content: '',
                        });
                        setReviewEligibility(null);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Eligibility Messages */}
                    {reviewEligibility && !reviewEligibility.eligible && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm mb-3">
                          {reviewEligibility.message ||
                            'You must have purchased this product to leave a review.'}
                        </p>
                        <Link
                          href={`/report-issue?productId=${id}`}
                          className="inline-block px-4 py-2 bg-[#528bc5] text-white rounded-lg hover:bg-[#4a7bb3] text-sm font-medium"
                        >
                          Report an Issue
                        </Link>
                      </div>
                    )}

                    {reviewEligibility &&
                      reviewEligibility.eligible &&
                      !reviewEligibility.allDelivered && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-blue-800 text-sm mb-2">
                            Note: Your order(s) will be marked as delivered
                            after you submit this review.
                          </p>
                          <Link
                            href={`/report-issue?productId=${id}`}
                            className="text-blue-600 hover:underline text-sm font-medium"
                          >
                            Report an issue instead
                          </Link>
                        </div>
                      )}

                    {reviewEligibility &&
                      reviewEligibility.eligible &&
                      reviewEligibility.allDelivered && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 text-sm">
                            ✓ You have purchased this product. Your review will
                            be marked as verified.
                          </p>
                        </div>
                      )}

                    {checkingEligibility && (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                        <div className="w-5 h-5 border-2 border-[#528bc5] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">
                          Checking eligibility...
                        </p>
                      </div>
                    )}

                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium text-[#121416] mb-2">
                        Rating *
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() =>
                              setReviewFormData({ ...reviewFormData, rating })
                            }
                            className="focus:outline-none"
                            disabled={
                              reviewEligibility ? !reviewEligibility.eligible : false
                            }
                          >
                            <Star
                              className={`w-8 h-8 ${
                                rating <= reviewFormData.rating
                                  ? 'text-[#121416] fill-[#121416]'
                                  : 'text-[#bec4cb]'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-[#121416] mb-2">
                        Review Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={reviewFormData.title}
                        onChange={(e) =>
                          setReviewFormData({
                            ...reviewFormData,
                            title: e.target.value,
                          })
                        }
                        maxLength={100}
                        placeholder="Summarize your review"
                        className="w-full px-3 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#528bc5]"
                      />
                      <p className="text-xs text-[#6a7581] mt-1">
                        {reviewFormData.title.length}/100 characters
                      </p>
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-sm font-medium text-[#121416] mb-2">
                        Review Content *
                      </label>
                      <textarea
                        value={reviewFormData.content}
                        onChange={(e) =>
                          setReviewFormData({
                            ...reviewFormData,
                            content: e.target.value,
                          })
                        }
                        maxLength={1000}
                        rows={6}
                        placeholder="Share your experience with this product..."
                        className="w-full px-3 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#528bc5] resize-none"
                      />
                      <p className="text-xs text-[#6a7581] mt-1">
                        {reviewFormData.content.length}/1000 characters
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 justify-end pt-4">
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setEditingReview(null);
                          setReviewFormData({
                            rating: 5,
                            title: '',
                            content: '',
                          });
                        }}
                        className="px-4 py-2 border border-[#dde0e3] rounded-lg text-[#121416] hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitReview}
                        disabled={
                          isSubmittingReview ||
                          !reviewFormData.content.trim() ||
                          (reviewEligibility && !reviewEligibility.eligible) ||
                          checkingEligibility
                        }
                        className={`px-6 py-2 rounded-lg font-medium ${
                          isSubmittingReview ||
                          !reviewFormData.content.trim() ||
                          (reviewEligibility && !reviewEligibility.eligible) ||
                          checkingEligibility
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#528bc5] text-white hover:bg-[#4a7bb3]'
                        }`}
                      >
                        {isSubmittingReview
                          ? 'Submitting...'
                          : editingReview
                          ? 'Update Review'
                          : 'Submit Review'}
                      </button>
                    </div>
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
