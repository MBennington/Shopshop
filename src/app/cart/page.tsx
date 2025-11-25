'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, X, Check } from 'lucide-react';

interface CartApiResponse {
  msg: string;
  data: CartResponse;
}

interface CartItem {
  product_id: string;
  seller_id: string;
  business_name: string;
  seller_info?: {
    _id: string;
    name: string;
    businessName: string;
  };
  productName: string;
  basePrice: number;
  category: string;
  images: string[];
  quantity: number;
  size?: string;
  color: string;
  subtotal: number;
}

interface SellerGroup {
  seller_info: {
    _id: string;
    name: string;
    businessName: string;
    profilePicture?: string;
  };
  products: CartItem[];
  subtotal: number;
  shipping_fee: number;
}

interface CartResponse {
  _id: string;
  user_id: string;
  total: number;
  sellers: { [sellerId: string]: SellerGroup };
}

interface AppliedGiftCard {
  code: string;
  pin: string;
  amount: number;
  remainingBalance: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [giftCardCode, setGiftCardCode] = useState<string>('');
  const [giftCardPin, setGiftCardPin] = useState<string>('');
  const [appliedGiftCards, setAppliedGiftCards] = useState<AppliedGiftCard[]>([]);
  const [giftCardError, setGiftCardError] = useState<string | null>(null);
  const [isValidatingGiftCard, setIsValidatingGiftCard] = useState(false);

  // Helper function to create unique key for cart items
  const getItemKey = (item: CartItem) => {
    return `${item.product_id}-${item.color}-${item.size || 'no-size'}`;
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token'); // get token

        const res = await fetch(`http://localhost:5000/api/cart/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // send token
          },
        });

        const json: CartApiResponse = await res.json();

        if (!res.ok) throw new Error(json.msg || 'Failed to fetch cart');

        setCart(json.data); // ✅ use json.data

        // Initialize quantities state with unique keys
        const initialQuantities: { [key: string]: number } = {};
        Object.values(json.data.sellers).forEach(sellerGroup => {
          sellerGroup.products.forEach((item) => {
            const key = getItemKey(item);
            initialQuantities[key] = item.quantity;
          });
        });
        setQuantities(initialQuantities);
      } catch (error) {
        console.error('Failed to fetch cart', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleUpdate = async (item: CartItem, updatedQty: number) => {
    // Open a modal or redirect to product page with item pre-selected
    console.log('Edit item:', item);
    const token = localStorage.getItem('token');
    const payload: any = {
      product_id: item.product_id,
      qty: updatedQty,
      color: item.color,
    };
    if (item.size) {
      payload.size = item.size;
    }

    const res = await fetch('/api/cart', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const json: CartApiResponse = await res.json();

    if (!res.ok) throw new Error(json.msg || 'Failed to update quantity');

    setCart(json.data);
    alert('✅ Quantity updated successfully!');
  };

  const handleRemove = async (item: CartItem) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        product_id: item.product_id,
        color: item.color,
      });
      if (item.size) params.append('size', item.size);
      const res = await fetch(
        `http://localhost:5000/api/cart?${params.toString()}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json: CartApiResponse = await res.json();

      if (!res.ok) throw new Error(json.msg || 'Failed to remove item');

      setCart(json.data); // ✅ use updated cart
      alert('✅ Item removed from cart successfully!');
    } catch (err) {
      console.error('Remove failed:', err);
    }
  };

  const handleApplyGiftCard = async () => {
    if (!giftCardCode.trim()) {
      setGiftCardError('Please enter a gift card code');
      return;
    }

    if (!giftCardPin.trim() || giftCardPin.length !== 4) {
      setGiftCardError('Please enter a valid 4-digit PIN');
      return;
    }

    setIsValidatingGiftCard(true);
    setGiftCardError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      const response = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'validate',
          code: giftCardCode.trim().toUpperCase(),
          pin: giftCardPin.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || 'Invalid gift card code or PIN');
      }

      // Check if already applied
      if (appliedGiftCards.some((gc) => gc.code === data.data.code)) {
        setGiftCardError('This gift card is already applied');
        return;
      }

      // Add to applied gift cards
      setAppliedGiftCards([
        ...appliedGiftCards,
        {
          code: data.data.code,
          pin: giftCardPin.trim(), // Store PIN for checkout
          amount: data.data.amount,
          remainingBalance: data.data.remainingBalance,
        },
      ]);

      // Store in localStorage for checkout
      localStorage.setItem(
        'appliedGiftCards',
        JSON.stringify([
          ...appliedGiftCards,
          {
            code: data.data.code,
            pin: giftCardPin.trim(),
            amount: data.data.amount,
            remainingBalance: data.data.remainingBalance,
          },
        ])
      );

      setGiftCardCode('');
      setGiftCardPin('');
    } catch (err: any) {
      setGiftCardError(err.message || 'Failed to validate gift card');
    } finally {
      setIsValidatingGiftCard(false);
    }
  };

  const handleRemoveGiftCard = (code: string) => {
    const updated = appliedGiftCards.filter((gc) => gc.code !== code);
    setAppliedGiftCards(updated);
    localStorage.setItem('appliedGiftCards', JSON.stringify(updated));
  };

  // Load applied gift cards from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('appliedGiftCards');
    if (stored) {
      try {
        setAppliedGiftCards(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading gift cards:', e);
      }
    }
  }, []);

  const calculateGiftCardDiscount = () => {
    if (!cart) return 0;
    const subtotal = cart.total;
    const shipping = Object.values(cart.sellers).reduce(
      (sum, seller) => sum + seller.shipping_fee,
      0
    );
    const total = subtotal + shipping;

    let discount = 0;
    let remainingTotal = total;

    for (const giftCard of appliedGiftCards) {
      const applied = Math.min(giftCard.remainingBalance, remainingTotal);
      discount += applied;
      remainingTotal -= applied;
      if (remainingTotal <= 0) break;
    }

    return discount;
  };

  const giftCardDiscount = calculateGiftCardDiscount();

  if (loading) {
    return <div className="text-center py-20">Loading cart...</div>;
  }

  if (!cart || !cart.sellers || Object.keys(cart.sellers).length === 0) {
    return (
      <div className="min-h-screen bg-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-[#131416]">My Cart</h1>
          <div className="text-center text-[#6c757f] text-lg py-20">
            Your cart is empty. Start shopping and add products to your cart!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-[#131416]">My Cart</h1>
        
        {/* Seller Groups */}
        <div className="space-y-8 mb-8">
          {Object.entries(cart.sellers).map(([sellerId, sellerGroup]) => (
              <div key={sellerId} className="bg-gray-50 rounded-lg p-6">
                {/* Seller Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {sellerGroup.seller_info.profilePicture ? (
                        <img
                          src={sellerGroup.seller_info.profilePicture}
                          alt={sellerGroup.seller_info.businessName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold text-sm">
                          {sellerGroup.seller_info.businessName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {sellerGroup.seller_info.businessName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {sellerGroup.seller_info.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="font-semibold text-lg">
                      LKR {sellerGroup.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sellerGroup.products.map((item, idx) => (
                    <div
                      key={`${sellerId}-${idx}`}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col items-start transition-all duration-300 ease-out transform hover:shadow-lg hover:scale-[1.02] group cursor-pointer relative overflow-visible"
                    >
                      <div className="w-full aspect-square mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-gray-100 relative">
                        <img
                          src={item.images?.[0] || '/placeholder.png'}
                          alt={item.productName}
                          className="object-cover w-full h-full rounded-lg transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="w-full mb-2">
                        <p className="text-gray-900 text-lg font-bold leading-tight mb-1 text-left">
                          {item.productName}
                        </p>
                        <p className="text-blue-600 text-base font-semibold leading-normal text-left">
                          LKR {item.basePrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <button
                              className="px-2 py-1 bg-gray-200 rounded"
                              onClick={() => {
                                const key = getItemKey(item);
                                setQuantities({
                                  ...quantities,
                                  [key]: Math.max(
                                    (quantities[key] || item.quantity) - 1,
                                    1
                                  ),
                                });
                              }}
                            >
                              –
                            </button>

                            <input
                              type="number"
                              min={1}
                              value={quantities[getItemKey(item)] || item.quantity}
                              onChange={(e) => {
                                const key = getItemKey(item);
                                setQuantities({
                                  ...quantities,
                                  [key]: Number(e.target.value),
                                });
                              }}
                              className="w-12 text-center border rounded"
                            />

                            <button
                              className="px-2 py-1 bg-gray-200 rounded"
                              onClick={() => {
                                const key = getItemKey(item);
                                setQuantities({
                                  ...quantities,
                                  [key]: (quantities[key] || item.quantity) + 1,
                                });
                              }}
                            >
                              +
                            </button>

                            <button
                              onClick={() =>
                                handleUpdate(
                                  item,
                                  quantities[getItemKey(item)] || item.quantity
                                )
                              }
                              className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
                            >
                              Update
                            </button>
                          </div>
                          {item.size ? ` Size: ${item.size}` : ''}{' '}
                          {item.color ? (
                            <span
                              className="ml-2 inline-block w-4 h-4 rounded-full border"
                              style={{ backgroundColor: item.color }}
                            />
                          ) : null}
                        </p>
                        <p className="text-sm text-gray-800 font-medium mt-1">
                          Subtotal: LKR {item.subtotal.toFixed(2)}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 flex space-x-3">
                        <button
                          onClick={() => handleRemove(item)}
                          className="px-4 py-2 text-sm rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Seller Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>Items: {sellerGroup.products.length}</p>
                    <p>Shipping: LKR {sellerGroup.shipping_fee.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Seller Total</p>
                    <p className="font-bold text-lg text-blue-600">
                      LKR {(sellerGroup.subtotal + sellerGroup.shipping_fee).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        {/* Gift Card Section */}
        <div className="mb-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Gift Card</h3>
            </div>
            <button
              onClick={() => router.push('/gift-cards/purchase')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Buy Gift Card
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <input
                type="text"
                value={giftCardCode}
                onChange={(e) => {
                  setGiftCardCode(e.target.value.toUpperCase());
                  setGiftCardError(null);
                }}
                placeholder="Enter Gift Card Code (e.g., GC-XXXX-XXXX-XXXX)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    document.getElementById('gift-card-pin')?.focus();
                  }
                }}
              />
              <div className="flex gap-2">
                <input
                  id="gift-card-pin"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={giftCardPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setGiftCardPin(value);
                    setGiftCardError(null);
                  }}
                  placeholder="Enter 4-digit PIN"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-lg tracking-widest"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyGiftCard();
                    }
                  }}
                />
                <button
                  onClick={handleApplyGiftCard}
                  disabled={isValidatingGiftCard || !giftCardCode.trim() || giftCardPin.length !== 4}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isValidatingGiftCard ? 'Validating...' : 'Apply'}
                </button>
              </div>
            </div>

            {giftCardError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {giftCardError}
              </div>
            )}

            {appliedGiftCards.length > 0 && (
              <div className="space-y-2">
                {appliedGiftCards.map((gc) => (
                  <div
                    key={gc.code}
                    className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded"
                  >
                    <div>
                      <p className="font-medium text-green-800">{gc.code}</p>
                      <p className="text-sm text-green-600">
                        Balance: LKR {gc.remainingBalance.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveGiftCard(gc.code)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-right mb-6 space-y-2">
          <div className="text-sm text-gray-600">
            <p>Subtotal: LKR {cart.total.toFixed(2)}</p>
            <p>
              Shipping: LKR{' '}
              {Object.values(cart.sellers).reduce(
                (sum, seller) => sum + seller.shipping_fee,
                0
              ).toFixed(2)}
            </p>
            {giftCardDiscount > 0 && (
              <p className="text-green-600 font-semibold">
                Gift Card Discount: -LKR {giftCardDiscount.toFixed(2)}
              </p>
            )}
          </div>
          <p className="text-xl font-bold">
            Grand Total: LKR{' '}
            {Math.max(
              0,
              cart.total +
                Object.values(cart.sellers).reduce(
                  (sum, seller) => sum + seller.shipping_fee,
                  0
                ) -
                giftCardDiscount
            ).toFixed(2)}
          </p>
        </div>

        <button 
          onClick={() => {
            if (cart && cart.sellers && Object.keys(cart.sellers).length > 0) {
              // Transform cart items to match checkout format
              const checkoutItems: any[] = [];
              Object.values(cart.sellers).forEach(sellerGroup => {
                sellerGroup.products.forEach(item => {
                  checkoutItems.push({
                    id: item.product_id,
                    name: item.productName,
                    price: item.basePrice,
                    category: item.category,
                    image: item.images[0] || '/placeholder-image.jpg',
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    subtotal: item.subtotal,
                    seller_id: item.seller_id,
                    business_name: item.business_name,
                    seller_profile_picture: item.seller_profile_picture
                  });
                });
              });
              
              // Navigate to checkout with cart data and gift cards
              const cartData = encodeURIComponent(JSON.stringify(checkoutItems));
              const giftCardsData = appliedGiftCards.map((gc) => ({ code: gc.code, pin: gc.pin }));
              const url = `/checkout?cart=${cartData}${giftCardsData.length > 0 ? `&giftCards=${encodeURIComponent(JSON.stringify(giftCardsData))}` : ''}`;
              window.location.href = url;
            }
          }}
          className="w-full py-4 rounded-full bg-[#1976d2] text-white font-bold text-lg shadow hover:bg-[#1565c0] transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
