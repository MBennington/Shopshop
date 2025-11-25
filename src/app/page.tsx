'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
}

interface ProductsResponse {
  status: boolean;
  data: {
    records: Product[];
    recordsTotal: number;
  };
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?limit=8&page=1&order=desc');

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data: ProductsResponse = await response.json();
        if (data.status && data.data.records) {
          setFeaturedProducts(data.data.records);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-white overflow-x-hidden"
      style={{ fontFamily: "Manrope, 'Noto Sans', sans-serif" }}
    >
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-[#FF0808] via-[#FF4040] to-[#FF6060] text-white overflow-hidden">
        {/* Shipship Image - Right Side, Full Height */}
        <div className="absolute top-0 right-0 bottom-0 z-10 flex items-center justify-end  pointer-events-none">
          <img
            src="/shipship.png"
            alt="ShipShip"
            className="h-full w-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
          />
        </div>

        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Discover amazing products from our handpicked sellers
            </h1>
            <p className="text-base md:text-lg mb-6 opacity-90 max-w-2xl">
              Find everything you need in one place. From fashion to
              electronics, we've got you covered with quality products and
              unbeatable prices.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl">
              <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden">
                <div className="text-[#FF0808] flex items-center justify-center pl-6 pr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search for products, brands, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 py-4 px-4 text-[#0d141c] placeholder:text-[#49739c] focus:outline-none text-base"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-[#FF0808] text-white font-semibold hover:bg-[#E00000] transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Featured Products */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-[#0d141c]">
                Featured Products
              </h2>
              <Link
                href="/new-arrivals"
                className="text-[#FF0808] hover:text-[#FF4040] font-medium transition-colors"
              >
                See More →
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {featuredProducts.map((product) => {
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
                        {/* Subtle Category Tag */}
                        <div className="absolute top-2 left-2">
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
                <p className="text-gray-500 text-lg">
                  No products available at the moment.
                </p>
                <Link
                  href="/categories"
                  className="mt-4 inline-block text-[#FF0808] hover:text-[#FF4040] font-medium transition-colors"
                >
                  Browse Categories →
                </Link>
              </div>
            )}
          </section>

          {/* Deals Section */}
          <section className="mb-16 bg-gradient-to-r from-[#FF0808] to-[#FF4040] rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
            {/* Shipship Deals Image - Right Corner, Full Height */}
            <div className="absolute top-0 right-0 bottom-0 flex items-center justify-end pointer-events-none opacity-80">
              <img
                src="/shipship deals.png"
                alt="ShipShip Deals"
                className="h-full w-auto object-contain"
              />
            </div>

            <div className="relative max-w-4xl z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Special Deals This Week
              </h2>
              <p className="text-lg opacity-90 mb-6">
                Don't miss out on our exclusive offers. Limited time only!
              </p>
              <Link
                href="/deals"
                className="inline-block px-8 py-3 bg-white text-[#FF0808] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Shop Deals Now
              </Link>
            </div>
          </section>

          {/* Top Categories Grid */}
          <section>
            <h2 className="text-3xl font-bold text-[#0d141c] mb-8">
              Top Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                {
                  name: 'Electronics',
                  href: '/products/electronics',
                  image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuC10JIZ4Lq6592OOVhgEVVwX5G_n_xDsVT9mCmvagXYGDJmJxzY_IISHghtnMKsrzjm1mXYNgZXPf9C4SZnHq--S8_BHwVL-P-twAwkIXtCJt2dFXbCeU33PTEMC3VMYPA-Q8G3AJ3s496nccWuQHHxxCv5ZjlkV0g05teufUs_J_45BxwgYWT3jrNLCrOpDNJeHIIIfWlGyqZKxF0rVTyIATf2K4Xw3udVgXsakVkfUt1f2XwieUNEfW4ll2JzfjY0MwMkCgqdIZ4',
                },
                {
                  name: 'Fashion',
                  href: '/products/fashion',
                  image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBCbXXl0RyGeZ18lveDjSFVxYjtkdbuH_wktEWd7L6EbznWe7pPAVfmqjqRP2ZFXdTvL9vH3Yfc6jEOaBcoiNs-7IpmuZN_JN4ZKWLetpNqo7gjUhN7REb05opFadPckY8yA1qguH4v5hx2OvPJJ8FZpBcC35KPG9g9tiNbUz0gJxtWcp2-Z4bg5yY8l7JeWQvqwsBDcZc5waHazI4rb4sKyqgYTy_jXIbWuqW0Tgb_RdvyGN_mgH7IYHioecqy9U2qUJJCLwux7AQ',
                },
                {
                  name: 'Home & Kitchen',
                  href: '/products/home_and_living',
                  image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCsIcNyI_DmMvaGSuM298RT3mS-VvQuQ2w6FP3da0bQpAlevotafsda1Orb60Cr7YmwXg594hdIHFwYT_C9Kj9F72VhTn0zplmeML1hDOs-JwSJb7Jmd2a_gmQBgJbtjKRkUzqMxjeq9RfmF6HzZ3Z2bj6_cAG_n5r0CoZ3mF9iPvx-4MVXV4rQB6zmT3doc-0gz6yF0jeSMtixaTu-zjiGPU4AkmXR8TmzbDvBXSdiuOpasVrLgFdQA5LV9ot7beoUnvL6eEvuZ9g',
                },
                {
                  name: 'Books',
                  href: '/products/books',
                  image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuC10JIZ4Lq6592OOVhgEVVwX5G_n_xDsVT9mCmvagXYGDJmJxzY_IISHghtnMKsrzjm1mXYNgZXPf9C4SZnHq--S8_BHwVL-P-twAwkIXtCJt2dFXbCeU33PTEMC3VMYPA-Q8G3AJ3s496nccWuQHHxxCv5ZjlkV0g05teufUs_J_45BxwgYWT3jrNLCrOpDNJeHIIIfWlGyqZKxF0rVTyIATf2K4Xw3udVgXsakVkfUt1f2XwieUNEfW4ll2JzfjY0MwMkCgqdIZ4',
                },
                {
                  name: 'Sports',
                  href: '/products/sports_and_outdoors',
                  image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBCbXXl0RyGeZ18lveDjSFVxYjtkdbuH_wktEWd7L6EbznWe7pPAVfmqjqRP2ZFXdTvL9vH3Yfc6jEOaBcoiNs-7IpmuZN_JN4ZKWLetpNqo7gjUhN7REb05opFadPckY8yA1qguH4v5hx2OvPJJ8FZpBcC35KPG9g9tiNbUz0gJxtWcp2-Z4bg5yY8l7JeWQvqwsBDcZc5waHazI4rb4sKyqgYTy_jXIbWuqW0Tgb_RdvyGN_mgH7IYHioecqy9U2qUJJCLwux7AQ',
                },
                {
                  name: 'Beauty',
                  href: '/products/beauty_and_personal_care',
                  image:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCsIcNyI_DmMvaGSuM298RT3mS-VvQuQ2w6FP3da0bQpAlevotafsda1Orb60Cr7YmwXg594hdIHFwYT_C9Kj9F72VhTn0zplmeML1hDOs-JwSJb7Jmd2a_gmQBgJbtjKRkUzqMxjeq9RfmF6HzZ3Z2bj6_cAG_n5r0CoZ3mF9iPvx-4MVXV4rQB6zmT3doc-0gz6yF0jeSMtixaTu-zjiGPU4AkmXR8TmzbDvBXSdiuOpasVrLgFdQA5LV9ot7beoUnvL6eEvuZ9g',
                },
              ].map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div
                    className="w-20 h-20 rounded-full bg-cover bg-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ backgroundImage: `url("${category.image}")` }}
                  ></div>
                  <span className="text-sm font-medium text-[#0d141c] group-hover:text-[#FF0808] transition-colors text-center">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#FF0808] border-t border-[#FF0808] mt-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg text-white mb-4">ShopShip</h3>
              <p className="text-sm text-white/90">
                Your one-stop destination for quality products and amazing
                deals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">
                Customer Service
              </h4>
              <ul className="space-y-2 text-sm text-white/90">
                <li>
                  <Link
                    href="/customer-service"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    className="hover:text-white transition-colors"
                  >
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="hover:text-white transition-colors"
                  >
                    Returns
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">About</h4>
              <ul className="space-y-2 text-sm text-white/90">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/press"
                    className="hover:text-white transition-colors"
                  >
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/90">
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/accessibility"
                    className="hover:text-white transition-colors"
                  >
                    Accessibility
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-sm text-white/90">
              © 2024 ShopShip. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
