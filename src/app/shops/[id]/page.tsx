'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  hasSizes: boolean;
  colors: Array<{
    _id: string;
    colorCode: string;
    colorName: string;
    images: string[];
    sizes: string[];
    quantity: number;
  }>;
  seller: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
  __v: number;
  totalInventory: number;
}

interface Seller {
  _id: string;
  name: string;
  profilePicture?: string;
  sellerInfo?: {
    businessName?: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ShopDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const searchParams = useSearchParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showTitle, setShowTitle] = useState(false);
  const fetchingRef = useRef(false);

  // For animated title - moved before early returns
  useEffect(() => {
    setTimeout(() => setShowTitle(true), 100);
  }, []);

  useEffect(() => {
    const fetchShopData = async () => {
      // Prevent duplicate calls
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      try {
        setLoading(true);

        // Get seller info from URL parameters (much more efficient!)
        const name = searchParams.get('name');
        const businessName = searchParams.get('businessName');
        const profilePicture = searchParams.get('profilePicture');

        if (name) {
          setSeller({
            _id: id,
            name: decodeURIComponent(name),
            profilePicture: profilePicture
              ? decodeURIComponent(profilePicture)
              : undefined,
            sellerInfo: businessName
              ? { businessName: decodeURIComponent(businessName) }
              : undefined,
          });
        }

        // Only fetch products (no need to fetch all sellers!)
        const productsResponse = await fetch(
          `${API_BASE_URL}/api/products/products-by-seller-id/${id}`
        );

        if (!productsResponse.ok) {
          const errorText = await productsResponse.text();
          throw new Error(
            `Failed to fetch products: ${productsResponse.status} ${errorText}`
          );
        }

        const productsData = await productsResponse.json();
        setProducts(productsData.data || []);

        // If no seller info from URL, show error
        if (!name) {
          throw new Error('Shop information not available');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchShopData();
  }, [id]); // Remove searchParams dependency to prevent re-renders

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#6a7581]">Loading shop...</div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-500">Error: {error || 'Shop not found'}</div>
      </div>
    );
  }

  // Shop data from API
  const businessName = seller.sellerInfo?.businessName || seller.name;
  const shopLogo =
    seller.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      businessName
    )}&background=1976d2&color=fff&size=128`;
  const shopImage =
    seller.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      businessName
    )}&background=397fc5&color=fff&size=800`;
  const shopRating = 4.7; // Mock data - could be fetched from reviews API
  const shopReviewCount = 128; // Mock data
  const shopLocation = 'New York, NY'; // Mock data
  const shopWebsite = 'https://shopwebsite.com'; // Mock data
  const shopAbout = `Welcome to ${businessName}! We offer a curated selection of premium products, handpicked for quality and style. Our mission is to provide you with the best shopping experience.`;

  // Product categories and price extraction
  const categories = [
    'All',
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];
  const getProductPrice = (product: Product) => product.price;
  const prices = products.map(getProductPrice);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  // UI categories for pills
  const uiCategories = ['All', 'New Arrivals', 'Best Sellers', 'Sale'];

  // Filtered products
  const filteredProducts = products.filter(
    (p) =>
      (activeCategory === 'All' ||
        activeCategory === 'New Arrivals' ||
        activeCategory === 'Best Sellers' ||
        activeCategory === 'Sale') &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="relative flex min-h-screen flex-col bg-white overflow-x-hidden"
      style={{ fontFamily: 'Work Sans, Noto Sans, sans-serif' }}
    >
      {/* Hero Cover Image */}
      <div className="relative w-full aspect-[16/5] min-h-[220px] max-h-[340px] flex items-center justify-center overflow-hidden">
        <img
          src={shopImage}
          alt={businessName}
          className="w-full h-full object-cover object-center"
        />
        {/* Gradient and blur overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1976d2]/70 via-black/30 to-transparent" />
        {/* Blurred overlay behind title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl flex flex-col items-center z-10">
          <div className="backdrop-blur-md bg-black/30 rounded-2xl px-6 py-4 flex flex-col items-center">
            {/* Shop avatar/logo */}
            <img
              src={shopLogo}
              alt="Shop Logo"
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-3 bg-white object-cover"
            />
            {/* Animated title */}
            <h1
              className={`text-white text-3xl md:text-5xl font-extrabold drop-shadow-lg text-center px-4 transition-all duration-700 ${
                showTitle
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              {businessName}
            </h1>
            {/* Tagline */}
            <p className="text-white/90 text-lg font-medium mt-2 mb-4 text-center">
              Curated by {seller.name}
            </p>
            {/* Modern button */}
            <a
              href={`mailto:contact@${businessName
                .replace(/\s+/g, '')
                .toLowerCase()}.com`}
              className="inline-block px-6 py-2 rounded-full bg-white/90 text-[#1976d2] font-semibold shadow hover:bg-white transition-colors"
            >
              Contact Seller
            </a>
          </div>
        </div>
      </div>
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Description */}
            <p className="text-[#131416] text-base font-normal leading-normal pb-3 pt-6 px-4 text-center">
              {shopAbout}
            </p>
            <h3 className="text-[#131416] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Products
            </h3>
            <div className="flex gap-3 p-3 flex-wrap pr-4">
              {uiCategories.map((cat) => (
                <button
                  key={cat}
                  className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 shadow-sm transition-all duration-200 font-medium text-base
                    ${
                      activeCategory === cat
                        ? 'bg-black text-white rounded-full'
                        : 'bg-[#f1f2f3] text-[#131416] hover:bg-[#e3eaf6] hover:text-black'
                    }
                  `}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-full h-full shadow-sm bg-[#f1f2f3]">
                  <div className="text-[#6c757f] flex border-none bg-transparent items-center justify-center pl-4 rounded-l-full border-r-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                    </svg>
                  </div>
                  <input
                    placeholder="Search products"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-full text-[#131416] focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-[#6c757f] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 p-6">
              {filteredProducts.map((product) => {
                // Get the first available image from colors array
                const firstImage =
                  product.colors?.[0]?.images?.[0] ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    product.name
                  )}&background=e0e0e0&color=666&size=400`;

                return (
                  <Link
                    key={product._id}
                    href={`/products/${
                      product.category?.toLowerCase() || 'general'
                    }/${product._id}`}
                    className="block"
                  >
                    <div
                      className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-start transition-all duration-300 ease-out transform hover:shadow-2xl hover:scale-[1.035] group cursor-pointer"
                      style={{ boxShadow: '0 1px 4px rgba(60,60,60,0.08)' }}
                    >
                      <div className="w-full aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-gray-100 relative">
                        <img
                          src={firstImage}
                          alt={product.name}
                          className="object-cover w-full h-full rounded-xl transition-transform duration-300 group-hover:scale-105"
                        />
                        <div
                          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#1976d2] text-white rounded-full px-4 py-2 shadow-lg text-xs font-semibold tracking-wide"
                          style={{
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
                          }}
                        >
                          View Details
                        </div>
                      </div>
                      <div className="w-full">
                        <p className="text-[#131416] text-lg font-semibold leading-normal mb-1 text-left tracking-tight">
                          {product.name}
                        </p>
                        <p className="text-[#6c757f] text-base font-medium leading-normal text-left">
                          ${product.price.toFixed(2)}
                        </p>
                        {product.totalInventory > 0 && (
                          <p className="text-[#6c757f] text-sm font-normal leading-normal text-left mt-1">
                            {product.totalInventory} in stock
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center text-[#6c757f] py-8">
                  No products found in this shop.
                </div>
              )}
            </div>
          </div>
        </div>
        <footer className="flex justify-center">
          <div className="flex max-w-[960px] flex-1 flex-col">
            <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
              <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
                <a
                  className="text-[#6c757f] text-base font-normal leading-normal min-w-40"
                  href="#"
                >
                  About
                </a>
                <a
                  className="text-[#6c757f] text-base font-normal leading-normal min-w-40"
                  href="#"
                >
                  Contact
                </a>
                <a
                  className="text-[#6c757f] text-base font-normal leading-normal min-w-40"
                  href="#"
                >
                  FAQ
                </a>
                <a
                  className="text-[#6c757f] text-base font-normal leading-normal min-w-40"
                  href="#"
                >
                  Shipping & Returns
                </a>
                <a
                  className="text-[#6c757f] text-base font-normal leading-normal min-w-40"
                  href="#"
                >
                  Privacy Policy
                </a>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#">
                  <div className="text-[#6c757f]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z"></path>
                    </svg>
                  </div>
                </a>
                <a href="#">
                  <div className="text-[#6c757f]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path>
                    </svg>
                  </div>
                </a>
                <a href="#">
                  <div className="text-[#6c757f]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z"></path>
                    </svg>
                  </div>
                </a>
              </div>
              <p className="text-[#6c757f] text-base font-normal leading-normal">
                @2024 {businessName}. All rights reserved.
              </p>
            </footer>
          </div>
        </footer>
      </div>
    </div>
  );
}
