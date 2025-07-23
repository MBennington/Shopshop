'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
    colorCode: string;
    colorName: string;
    images: string[];
    sizes?: Array<{
      size: string;
      quantity: number;
    }>;
    quantity?: number;
  }>;
  totalInventory: number;
}

interface Seller {
  _id: string;
  name: string;
  businessName: string;
}

interface Review {
  _id: string;
  rating: number;
  title?: string;
  content: string;
  helpfulCount: number;
  unhelpfulCount: number;
  createdAt: string;
  userData: {
    name: string;
    avatar?: string;
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

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:5000/api/products/details/${id}`
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
          currentAvailableQuantity = sizeData ? sizeData.quantity : 0;
        }
      } else {
        const selectedColorData = product.colors[selectedColor];
        currentAvailableQuantity = selectedColorData
          ? selectedColorData.quantity || 0
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
      return sizeData ? sizeData.quantity : 0;
    } else {
      const selectedColorData = product.colors[selectedColor];
      return selectedColorData ? selectedColorData.quantity : 0;
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
      const checkoutData = {
        id,
        category,
        name: product.name,
        price: product.price,
        image: productImages.length > 0 ? productImages[selectedImage] : null,
        color: product.colors[selectedColor]?.colorName,
        size: selectedSize,
        quantity: quantity,
      };
      window.location.href = `/checkout?product=${encodeURIComponent(
        JSON.stringify(checkoutData)
      )}`;
    } else {
      // Add to cart logic here
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
              <h1 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">
                {product.name}
              </h1>
              <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1">
                {product.description}
              </p>
              <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">
                Price
              </h3>
              <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1">
                ${product.price}
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
                    {availableSizes.map((sizeData: any) => (
                      <label
                        key={sizeData.size}
                        className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-4 h-11 text-[#121416] relative ${
                          selectedSize === sizeData.size
                            ? 'border-[3px] px-3.5 border-[#528bc5]'
                            : 'border-[#dde0e3]'
                        } ${
                          sizeData.quantity === 0
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
                          disabled={sizeData.quantity === 0}
                        />
                      </label>
                    ))}
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
                    Stock
                  </p>
                  <p className="text-[#121416] text-sm font-normal leading-normal">
                    {product.totalInventory} units
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
            Customer Reviews
          </h3>
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

          {/* Individual Reviews */}
          {reviews.previewReviews.length > 0 ? (
            <div className="flex flex-col gap-8 overflow-x-hidden bg-white p-4">
              {reviews.previewReviews.map((review) => (
                <div key={review._id} className="flex flex-col gap-3 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gray-200 flex items-center justify-center">
                      {review.userData.avatar ? (
                        <img
                          src={review.userData.avatar}
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
                      <p className="text-[#121416] text-base font-medium leading-normal">
                        {review.userData.name}
                      </p>
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
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={
                          i < review.rating
                            ? 'text-[#121416]'
                            : 'text-[#bec4cb]'
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20px"
                          height="20px"
                          fill="currentColor"
                          viewBox="0 0 256 256"
                        >
                          <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z" />
                        </svg>
                      </div>
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
                  <div className="flex gap-9 text-[#6a7581]">
                    <button className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20px"
                        height="20px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M234,80.12A24,24,0,0,0,216,72H160V56a40,40,0,0,0-40-40,8,8,0,0,0-7.16,4.42L75.06,96H32a16,16,0,0,0-16,16v88a16,16,0,0,0,16,16H204a24,24,0,0,0,23.82-21l12-96A24,24,0,0,0,234,80.12ZM32,112H72v88H32ZM223.94,97l-12,96a8,8,0,0,1-7.94,7H88V105.89l36.71-73.43A24,24,0,0,1,144,56V80a8,8,0,0,0,8,8h64a8,8,0,0,1,7.94,9Z" />
                      </svg>
                      <p className="text-inherit">{review.helpfulCount}</p>
                    </button>
                    <button className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20px"
                        height="20px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M239.82,157l-12-96A24,24,0,0,0,204,40H32A16,16,0,0,0,16,56v88a16,16,0,0,0,16,16H75.06l37.78,75.58A8,8,0,0,0,120,240a40,40,0,0,0,40-40V184h56a24,24,0,0,0,23.82-27ZM72,144H32V56H72Zm150,21.29a7.88,7.88,0,0,1-6,2.71H152a8,8,0,0,0-8,8v24a24,24,0,0,1-19.29,23.54L88,150.11V56H204a8,8,0,0,1,7.94,7l12,96A7.87,7.87,0,0,1,222,165.29Z" />
                      </svg>
                      <p className="text-inherit">{review.unhelpfulCount}</p>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
