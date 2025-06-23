'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const productParam = searchParams.get('product');
  const product = productParam ? JSON.parse(decodeURIComponent(productParam)) : null;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-lg w-full p-8 bg-gray-50 rounded-xl shadow">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">No Product Selected</h1>
          <p className="text-gray-700 mb-6">Please select a product to checkout.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        {/* Product Summary */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 relative rounded-lg overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              <p className="text-gray-600">{product.category}</p>
              <p className="text-[#397fc5] font-medium mt-1">{product.price}</p>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <form className="space-y-6">
          {/* Shipping Information */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#528bc5] focus:ring-[#528bc5]"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#528bc5] focus:ring-[#528bc5]"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#528bc5] focus:ring-[#528bc5]"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#528bc5] focus:ring-[#528bc5]"
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">ZIP Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#528bc5] focus:ring-[#528bc5]"
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#528bc5] focus:ring-[#528bc5]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    placeholder="MM/YY"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#528bc5] focus:ring-[#528bc5]"
                  />
                </div>
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    placeholder="123"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#528bc5] focus:ring-[#528bc5]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
              <p>Subtotal</p>
              <p>{product.price}</p>
            </div>
            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
              <p>Shipping</p>
              <p>Free</p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <p>Total</p>
                <p>{product.price}</p>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-[#528bc5] hover:bg-[#397fc5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#528bc5]"
          >
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
}