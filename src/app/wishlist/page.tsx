'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ShoppingCart, X } from 'lucide-react';

interface WishlistProduct {
  product_id: string;
  color_id: string;
  color_name: string;
  color_code: string;
  product_name: string;
  product_image: string | null;
  price: number;
  category: string;
  description: string;
  hasSizes: boolean;
  isActive: boolean;
  availability: 'in stock' | 'out of stock';
  availableStock: number;
  added_at: string;
}

interface ShopInfo {
  _id: string;
  name: string;
  businessName: string;
  profilePicture: string | null;
}

interface ShopGroup {
  shop_info: ShopInfo;
  products: WishlistProduct[];
}

interface WishlistResponse {
  _id: string | null;
  user_id: string;
  shops: { [shopId: string]: ShopGroup };
  created_at: string | null;
  updated_at: string | null;
}

interface WishlistApiResponse {
  msg: string;
  data: WishlistResponse;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movingToCart, setMovingToCart] = useState<{ [key: string]: boolean }>({});
  const [removing, setRemoving] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth');
          return;
        }

        setLoading(true);
        setError(null);

        const response = await fetch('/api/wishlist', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json: WishlistApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(json.msg || 'Failed to fetch wishlist');
        }

        setWishlist(json.data);
      } catch (err: any) {
        console.error('Failed to fetch wishlist:', err);
        setError(err.message || 'Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [router]);

  const handleMoveToCart = async (product: WishlistProduct) => {
    const itemKey = `${product.product_id}-${product.color_id}`;
    
    try {
      setMovingToCart(prev => ({ ...prev, [itemKey]: true }));

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      // Get product details to determine size (if needed)
      // For now, we'll add with quantity 1 and the color
      const payload: any = {
        product_id: product.product_id,
        qty: 1,
        color: product.color_code,
      };

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || 'Failed to add to cart');
      }

      alert('✅ Item added to cart successfully!');
      router.push('/cart');
    } catch (err: any) {
      console.error('Failed to add to cart:', err);
      alert(`❌ ${err.message || 'Failed to add to cart'}`);
    } finally {
      setMovingToCart(prev => ({ ...prev, [itemKey]: false }));
    }
  };

  const handleRemoveFromWishlist = async (product: WishlistProduct) => {
    const itemKey = `${product.product_id}-${product.color_id}`;
    
    if (!confirm('Are you sure you want to remove this item from your wishlist?')) {
      return;
    }

    try {
      setRemoving(prev => ({ ...prev, [itemKey]: true }));

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      const response = await fetch(
        `/api/wishlist?product_id=${product.product_id}&color_id=${product.color_id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || 'Failed to remove from wishlist');
      }

      // Remove the item from local state
      if (wishlist) {
        const updatedShops = { ...wishlist.shops };
        Object.keys(updatedShops).forEach(shopId => {
          updatedShops[shopId] = {
            ...updatedShops[shopId],
            products: updatedShops[shopId].products.filter(
              p => !(p.product_id === product.product_id && p.color_id === product.color_id)
            ),
          };
        });

        // Remove shops with no products
        Object.keys(updatedShops).forEach(shopId => {
          if (updatedShops[shopId].products.length === 0) {
            delete updatedShops[shopId];
          }
        });

        setWishlist({
          ...wishlist,
          shops: updatedShops,
        });
      }

      alert('✅ Item removed from wishlist successfully!');
    } catch (err: any) {
      console.error('Failed to remove from wishlist:', err);
      alert(`❌ ${err.message || 'Failed to remove from wishlist'}`);
    } finally {
      setRemoving(prev => ({ ...prev, [itemKey]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-[#131416]">My Wishlist</h1>
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-[#131416]">My Wishlist</h1>
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shops = wishlist?.shops ? Object.values(wishlist.shops) : [];
  const totalItems = shops.reduce((sum, shop) => sum + shop.products.length, 0);

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-[#131416]">My Wishlist</h1>
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#6c757f] text-lg mb-4">Your wishlist is empty</p>
            <p className="text-[#6c757f] mb-8">Start exploring and add products you love!</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#131416]">My Wishlist</h1>
          <p className="text-[#6c757f]">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
        </div>

        <div className="space-y-8">
          {shops.map((shop) => (
            <div key={shop.shop_info._id} className="border border-[#e3eaf6] rounded-2xl p-6 shadow-sm">
              {/* Shop Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e3eaf6]">
                {shop.shop_info.profilePicture ? (
                  <img
                    src={shop.shop_info.profilePicture}
                    alt={shop.shop_info.businessName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#e3eaf6] flex items-center justify-center">
                    <span className="text-[#1976d2] font-bold text-lg">
                      {shop.shop_info.businessName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-[#131416]">{shop.shop_info.businessName}</h2>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {shop.products.map((product) => {
                  const itemKey = `${product.product_id}-${product.color_id}`;
                  const isMoving = movingToCart[itemKey];
                  const isRemoving = removing[itemKey];
                  const isAvailable = product.availability === 'in stock';

                  return (
                    <div
                      key={itemKey}
                      className="bg-white rounded-xl border border-[#e3eaf6] shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow relative"
                    >
                      {/* Remove Button - Top Right */}
                      <button
                        onClick={() => handleRemoveFromWishlist(product)}
                        disabled={isMoving || isRemoving}
                        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        title="Remove from wishlist"
                      >
                        {isRemoving ? (
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-red-600"></div>
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Product Image */}
                      <Link
                        href={`/products/${product.category}/${product.product_id}`}
                        className="w-full aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-lg bg-gray-100 relative group"
                      >
                        {product.product_image ? (
                          <img
                            src={product.product_image}
                            alt={product.product_name}
                            className="object-cover w-full h-full rounded-lg transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span>No Image</span>
                          </div>
                        )}
                        {!isAvailable && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <span className="text-white font-semibold text-sm">Out of Stock</span>
                          </div>
                        )}
                      </Link>

                        {/* Product Info */}
                      <div className="flex-1 flex flex-col">
                        <Link
                          href={`/products/${product.category}/${product.product_id}`}
                          className="mb-2"
                        >
                          <h3 className="text-[#131416] font-semibold text-base leading-tight mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
                            {product.product_name}
                          </h3>
                        </Link>
                        <p className="text-[#1976d2] text-lg font-bold mb-3">LKR {product.price.toLocaleString()}</p>

                        {/* Availability Badge */}
                        <div className="mb-3">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              isAvailable
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {isAvailable ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-auto">
                          <button
                            onClick={() => handleMoveToCart(product)}
                            disabled={!isAvailable || isMoving || isRemoving}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                              isAvailable && !isMoving && !isRemoving
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isMoving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Adding...</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                <span>Move to Cart</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
