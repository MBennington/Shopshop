'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CartApiResponse {
  msg?: string;
  error?: string;
  data?: CartResponse;
}

interface CartItem {
  product_id: string;
  seller_id: string;
  business_name: string;
  seller_profile_picture?: string;
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
  availableStock?: number;
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

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  // Helper function to create unique key for cart items
  const getItemKey = (item: CartItem) => {
    return `${item.product_id}-${item.color}-${item.size || 'no-size'}`;
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token'); // get token

        const res = await fetch('/api/cart', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // send token
          },
        });

        const json: CartApiResponse = await res.json();

        if (!res.ok) throw new Error(json.msg || json.error || 'Failed to fetch cart');

        setCart(json.data!); // success path: API returns data

        // Initialize quantities state with unique keys
        const initialQuantities: { [key: string]: number } = {};
        Object.values(json.data!.sellers).forEach(sellerGroup => {
          sellerGroup.products.forEach((item) => {
            const key = getItemKey(item);
            initialQuantities[key] = item.quantity;
          });
        });
        setQuantities(initialQuantities);
      } catch (error) {
        // console.error('Failed to fetch cart', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleUpdate = async (item: CartItem, updatedQty: number) => {
    try {
      // Validate required fields
      if (!item.product_id) {
        toast.error('Product ID is missing. Please refresh the page and try again.');
        // console.error('Missing product_id in item:', item);
        return;
      }

      if (!item.color) {
        toast.error('Color information is missing. Please refresh the page and try again.');
        // console.error('Missing color in item:', item);
        return;
      }

      // Open a modal or redirect to product page with item pre-selected
      // console.log('Edit item:', item);
      const token = localStorage.getItem('token');
      const payload: any = {
        product_id: String(item.product_id),
        qty: updatedQty,
        color: String(item.color),
      };
      if (item.size) {
        payload.size = String(item.size);
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

      if (!res.ok) {
        const errorMessage = json.msg || json.error || 'Failed to update quantity';
        toast.error(errorMessage);
        return;
      }

      setCart(json.data!);

      // Update quantities state with new values from cart
      const updatedQuantities: { [key: string]: number } = {};
      Object.values(json.data!.sellers).forEach(sellerGroup => {
        sellerGroup.products.forEach((item) => {
          const key = getItemKey(item);
          updatedQuantities[key] = item.quantity;
        });
      });
      setQuantities(updatedQuantities);
      
      toast.success('Quantity updated successfully!');
    } catch (err: any) {
      // console.error('Update failed:', err);
      toast.error(err.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (item: CartItem) => {
    try {
      // Debug: Log the item to see its structure
      // console.log('handleRemove called with item:', item);
      // console.log('item.product_id:', item.product_id, 'type:', typeof item.product_id);
      
      // Validate required fields - check for undefined, null, empty string, or whitespace
      // Handle both string and ObjectId-like types (API may return either)
      let productId: string | null = null;
      if (item.product_id != null && item.product_id !== '') {
        productId = typeof item.product_id === 'string'
          ? item.product_id.trim()
          : String(item.product_id).trim();
      }
      
      let color: string | null = null;
      if (item.color) {
        color = String(item.color).trim();
      }
      
      if (!productId || productId === '' || productId === 'null' || productId === 'undefined') {
        toast.error('Product ID is missing. Please refresh the page and try again.');
        // console.error('Missing or invalid product_id:', {
        //   original: item.product_id,
        //   processed: productId,
        //   fullItem: item
        // });
        return;
      }

      if (!color || color === '' || color === 'null' || color === 'undefined') {
        toast.error('Color information is missing. Please refresh the page and try again.');
        // console.error('Missing or invalid color:', {
        //   original: item.color,
        //   processed: color,
        //   fullItem: item
        // });
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      // Ensure we have valid non-empty strings
      const params = new URLSearchParams();
      params.append('product_id', productId);
      params.append('color', color);
      
      if (item.size && String(item.size).trim()) {
        params.append('size', String(item.size).trim());
      }
      
      // console.log('Sending DELETE request with params:', params.toString());
      
      const res = await fetch(
        `/api/cart?${params.toString()}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json: CartApiResponse = await res.json();

      if (!res.ok) {
        const errorMsg = json.msg || json.error || 'Failed to remove item';
        throw new Error(errorMsg);
      }

      setCart(json.data!);
      toast.success('Item removed from cart successfully!');
    } catch (err: any) {
      // console.error('Remove failed:', err);
      toast.error(err.message || 'Failed to remove item from cart');
    }
  };

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
                        <div className="text-sm text-gray-600">
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
                              max={item.availableStock || undefined}
                              value={quantities[getItemKey(item)] || item.quantity}
                              onChange={(e) => {
                                const key = getItemKey(item);
                                const newValue = Number(e.target.value);
                                const maxStock = item.availableStock || Infinity;
                                if (newValue >= 1 && newValue <= maxStock) {
                                  setQuantities({
                                    ...quantities,
                                    [key]: newValue,
                                  });
                                }
                              }}
                              className="w-12 text-center border rounded"
                            />

                            <button
                              className={`px-2 py-1 rounded ${
                                (quantities[getItemKey(item)] || item.quantity) >= (item.availableStock || 0)
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                              disabled={(quantities[getItemKey(item)] || item.quantity) >= (item.availableStock || 0)}
                              onClick={() => {
                                const key = getItemKey(item);
                                const currentQty = quantities[key] || item.quantity;
                                const maxStock = item.availableStock || 0;
                                if (currentQty < maxStock) {
                                  setQuantities({
                                    ...quantities,
                                    [key]: currentQty + 1,
                                  });
                                }
                              }}
                              title={
                                (quantities[getItemKey(item)] || item.quantity) >= (item.availableStock || 0)
                                  ? 'Maximum stock reached'
                                  : 'Increase quantity'
                              }
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
                        </div>
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
          </div>
          <p className="text-xl font-bold">
            Grand Total: LKR{' '}
            {(
              cart.total +
              Object.values(cart.sellers).reduce(
                (sum, seller) => sum + seller.shipping_fee,
                0
              )
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
              
              // Navigate to checkout with cart data
              const cartData = encodeURIComponent(JSON.stringify(checkoutItems));
              window.location.href = `/checkout?cart=${cartData}`;
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
