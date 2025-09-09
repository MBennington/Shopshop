'use client';
import { useState, useEffect } from 'react';

interface CartApiResponse {
  msg: string;
  data: CartResponse;
}

interface CartItem {
  product_id: string;
  productName: string;
  basePrice: number;
  category: string;
  images: string[];
  quantity: number;
  size?: string;
  color: string;
  subtotal: number;
}

interface CartResponse {
  _id: string;
  user_id: string;
  total: number;
  products_list: CartItem[];
}

export default function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

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

        // Initialize quantities state
        const initialQuantities: { [key: string]: number } = {};
        json.data.products_list.forEach((item) => {
          initialQuantities[item.product_id] = item.quantity;
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

  if (loading) {
    return <div className="text-center py-20">Loading cart...</div>;
  }

  if (!cart || cart.products_list.length === 0) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {cart.products_list.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#e3eaf6] shadow-md p-4 flex flex-col items-start transition-all duration-300 ease-out transform hover:shadow-2xl hover:scale-[1.04] group cursor-pointer relative overflow-visible"
              style={{
                boxShadow: '0 2px 12px rgba(25, 118, 210, 0.08)',
              }}
            >
              <div className="w-full aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-gray-100 relative">
                <img
                  src={item.images?.[0] || '/placeholder.png'}
                  alt={item.productName}
                  className="object-cover w-full h-full rounded-xl transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="w-full mb-2">
                <p className="text-[#131416] text-xl font-bold leading-tight mb-1 text-left tracking-tight">
                  {item.productName}
                </p>
                <p className="text-[#1976d2] text-lg font-semibold leading-normal text-left">
                  LKR {item.basePrice.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-2 py-1 bg-gray-200 rounded"
                      onClick={() =>
                        setQuantities({
                          ...quantities,
                          [item.product_id]: Math.max(
                            (quantities[item.product_id] || item.quantity) - 1,
                            1
                          ),
                        })
                      }
                    >
                      –
                    </button>

                    <input
                      type="number"
                      min={1}
                      value={quantities[item.product_id] || item.quantity}
                      onChange={(e) =>
                        setQuantities({
                          ...quantities,
                          [item.product_id]: Number(e.target.value),
                        })
                      }
                      className="w-12 text-center border rounded"
                    />

                    <button
                      className="px-2 py-1 bg-gray-200 rounded"
                      onClick={() =>
                        setQuantities({
                          ...quantities,
                          [item.product_id]:
                            (quantities[item.product_id] || item.quantity) + 1,
                        })
                      }
                    >
                      +
                    </button>

                    <button
                      onClick={() =>
                        handleUpdate(
                          item,
                          quantities[item.product_id] || item.quantity
                        )
                      }
                      className="px-3 py-1 bg-blue-500 text-white rounded"
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

        <div className="text-right mb-6">
          <p className="text-xl font-bold">
            Total: LKR {cart.total.toFixed(2)}
          </p>
        </div>

        <button 
          onClick={() => {
            if (cart && cart.products_list.length > 0) {
              // Transform cart items to match checkout format
              const checkoutItems = cart.products_list.map(item => ({
                id: item.product_id,
                name: item.productName,
                price: item.basePrice,
                category: item.category,
                image: item.images[0] || '/placeholder-image.jpg',
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                subtotal: item.subtotal
              }));
              
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
