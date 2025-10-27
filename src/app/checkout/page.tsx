'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
  size?: string;
  color: string;
  subtotal: number;
  seller_id?: string;
  business_name?: string;
  seller_profile_picture?: string;
  seller_info?: {
    _id: string;
    name: string;
    businessName: string;
  };
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

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const productParam = searchParams.get('product');
  const cartParam = searchParams.get('cart');
  const { user, loading } = useAuth();

  let product = null;
  let cartItems = null;
  let fromCart = false;

  try {
    if (productParam) {
      product = JSON.parse(decodeURIComponent(productParam));
      fromCart = false;
    } else if (cartParam) {
      cartItems = JSON.parse(decodeURIComponent(cartParam));
      fromCart = true;
      // For cart checkout, we'll use the first item as reference for now
      product = cartItems[0];
    }
  } catch (error) {
    console.error('Error parsing data:', error);
  }

  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [shippingFee, setShippingFee] = useState(5.99);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [payHereReady, setPayHereReady] = useState(false);
  const [platformCharges, setPlatformCharges] = useState<any>(null);
  const [sellerGroups, setSellerGroups] = useState<{ [sellerId: string]: SellerGroup }>({});

  // Transform user's saved addresses to match our interface
  const savedAddresses: Address[] =
    user?.savedAddresses?.map((addr: UserAddress, index: number) => ({
      id: `addr-${index}`,
      label: addr.label,
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ').slice(1).join(' ') || '',
      address: addr.address,
      city: addr.city,
      province: '', // Add if available in your DB
      postalCode: addr.postalCode,
      country: addr.country,
      phone: '', // Add if available in your DB
      isDefault: index === 0, // First address as default
    })) || [];

  const [newAddress, setNewAddress] = useState<
    Omit<Address, 'id' | 'isDefault'>
  >({
    label: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.payhere.lk/lib/payhere.js';
    script.async = true;
    script.onload = () => {
      setPayHereReady(true);
      console.log('PayHere script loaded');
    };
    script.onerror = () => {
      console.error('Failed to load PayHere script');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // ✅ cleanup
    };
  }, []);

  // Group cart items by seller
  useEffect(() => {
    if (fromCart && cartItems) {
      const grouped: { [sellerId: string]: SellerGroup } = {};
      
      cartItems.forEach((item: CartItem) => {
        const sellerId = item.seller_id || 'unknown';
        
        if (!grouped[sellerId]) {
          grouped[sellerId] = {
            seller_info: {
              _id: sellerId,
              name: 'Seller', // Default name since we removed seller_name
              businessName: item.business_name || 'Unknown Business',
              profilePicture: item.seller_profile_picture || null
            },
            products: [],
            subtotal: 0,
            shipping_fee: 100 // Default shipping fee
          };
        }
        
        grouped[sellerId].products.push(item);
        grouped[sellerId].subtotal += item.subtotal;
      });
      
      setSellerGroups(grouped);
    }
  }, [fromCart, cartItems]);

  useEffect(() => {
    // Set default selections
    const defaultAddress = savedAddresses.find((addr) => addr.isDefault);

    if (defaultAddress) setSelectedAddress(defaultAddress.id);

    // Debug: Log product data to see its structure
    if (product) {
      console.log('Product data:', product);
      console.log(
        'Product price:',
        product.price,
        'Type:',
        typeof product.price
      );
    }
  }, [product, savedAddresses]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">
              Authentication Required
            </h1>
            <p className="text-gray-600 mb-6">
              Please login to continue with checkout.
            </p>
            <Button onClick={() => (window.location.href = '/auth')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">
              No Product Selected
            </h1>
            <p className="text-gray-600 mb-6">
              Please select a product to checkout.
            </p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle different price formats safely
  const getPriceValue = (price: any): number => {
    if (typeof price === 'string') {
      // Remove currency symbols and convert to number
      const cleanPrice = price.replace(/[$,]/g, '');
      return parseFloat(cleanPrice) || 0;
    } else if (typeof price === 'number') {
      return price;
    }
    return 0;
  };

  const subtotal =
    fromCart && cartItems
      ? cartItems.reduce(
          (sum: number, item: any) =>
            sum + getPriceValue(item.price) * (item.quantity || 1),
          0
        )
      : getPriceValue(product.price);
  const total = subtotal + shippingFee;

  // Address validation function
  const isAddressComplete = (): boolean => {
    // If a saved address is selected, it's complete
    if (selectedAddress && selectedAddress !== '') {
      return true;
    }

    // If no saved addresses exist, check if new address form is complete
    if (savedAddresses.length === 0) {
      return (
        newAddress.firstName.trim() !== '' &&
        newAddress.lastName.trim() !== '' &&
        newAddress.address.trim() !== '' &&
        newAddress.city.trim() !== '' &&
        newAddress.postalCode.trim() !== '' &&
        newAddress.country.trim() !== '' &&
        newAddress.phone.trim() !== ''
      );
    }

    return false;
  };

  const initiatePayHerePayment = (data: any) => {
    // Ensure PayHere library is loaded
    const payhere = (window as any).payhere;
    if (!payHereReady || typeof payhere === 'undefined') {
      alert('Payment system is loading. Please try again in a moment.');
      return;
    }

    const payHereData = {
      sandbox: true, // set false in production
      merchant_id: data.merchantId,
      return_url: window.location.origin + '/order-success', // temporary success page
      cancel_url: window.location.origin + '/cart', // temporary cancel page
      notify_url: window.location.origin + '/api/payhere-notify', // placeholder, replace later
      order_id: data.orderId,
      items: 'Order Payment',
      amount: Number(data.amount).toFixed(2),
      currency: data.currency,
      hash: data.hash,
      first_name: newAddress.firstName || user?.name?.split(' ')[0] || '',
      last_name:
        newAddress.lastName || user?.name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || 'nuwanthikasadaruwani98@gmail.com',
      phone: newAddress.phone || '0771234567',
      address: newAddress.address || '',
      city: newAddress.city || '',
      country: newAddress.country || 'Sri Lanka',
    };

    // Optional: register event handlers
    payhere.onCompleted = function onCompleted(orderId: string) {
      console.log('Payment completed. OrderID:' + orderId);
    };
    payhere.onDismissed = function onDismissed() {
      console.log('Payment dismissed');
    };
    payhere.onError = function onError(error: string) {
      console.log('Error:' + error);
    };

    // Start PayHere payment
    payhere.startPayment(payHereData);
  };

  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true);

      // Get token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Please login to place an order');
        return;
      }

      // Prepare order data
      const orderData = {
        address: newAddress,
        paymentMethod: selectedPayment,
        fromCart,
        // If not from cart, include product details
        ...(fromCart
          ? {}
          : {
              product: {
                product_id: product?.id,
                quantity: product?.quantity,
                color: product?.color,
                ...(product?.size ? { size: product.size } : {}),
              },
            }),
      };

      // Send order to backend
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      console.log('result: ', response);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to place order');
      }

      // Order successful
      alert('✅ Order placed successfully!');
      //payhere setup
      console.log('Order result:', result);

      const orderDataFromServer = result.data;

      if (
        orderDataFromServer.payment_method === 'card' &&
        orderDataFromServer.hash
      ) {
        // Trigger PayHere payment
        initiatePayHerePayment(orderDataFromServer);
      } else {
        // Payment is not card (e.g., COD)
        console.log('Cash on Delivery selected.');
        // You can redirect to order confirmation page if needed
        window.location.href = `/order-success?orderId=${orderDataFromServer.orderId}`;
      }

      // TODO: Redirect to order confirmation page or clear cart
    } catch (error) {
      console.error('Failed to place order:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`❌ Failed to place order: ${errorMessage}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Address Form Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={newAddress.firstName}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={newAddress.lastName}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            lastName: e.target.value,
                          })
                        }
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newAddress.address}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          address: e.target.value,
                        })
                      }
                      placeholder="Enter street address"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">Province</Label>
                      <Input
                        id="province"
                        value={newAddress.province}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            province: e.target.value,
                          })
                        }
                        placeholder="Enter province"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={newAddress.postalCode}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            postalCode: e.target.value,
                          })
                        }
                        placeholder="Enter postal code"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={newAddress.country}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            country: e.target.value,
                          })
                        }
                        placeholder="Enter country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            phone: e.target.value,
                          })
                        }
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Saved Addresses Section */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Select a saved address to auto-fill
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {savedAddresses.map((address) => (
                          <button
                            key={address.id}
                            onClick={() => {
                              // Auto-fill the form fields with selected address
                              setNewAddress({
                                firstName: address.firstName,
                                lastName: address.lastName,
                                address: address.address,
                                city: address.city,
                                province: address.province,
                                postalCode: address.postalCode,
                                country: address.country,
                                phone: address.phone,
                                label: address.label,
                              });
                              setSelectedAddress(address.id);
                            }}
                            className={`p-3 border rounded-lg text-left transition-colors ${
                              selectedAddress === address.id
                                ? 'border-blue-500 bg-blue-50 text-blue-900'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {address.label}
                              </span>
                              {address.isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Options */}
                <div className="space-y-3">
                  {/* COD Option */}
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPayment === 'cod'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPayment('cod')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm font-bold">
                          $
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Cash on Delivery
                        </p>
                        <p className="text-sm text-gray-600">
                          Pay when you receive your order
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Payment Option */}
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPayment === 'card'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedPayment('card');
                      // Redirect to card payment page - implement later
                      console.log('Redirecting to card payment page...');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs">💳</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Credit/Debit Card
                        </p>
                        <p className="text-sm text-gray-600">
                          Secure online payment
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Details */}
                {fromCart && cartItems ? (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      Order Summary ({cartItems.length} items)
                    </h4>
                    
                    {/* Seller Groups */}
                    {Object.keys(sellerGroups).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(sellerGroups).map(([sellerId, sellerGroup]) => (
                          <div key={sellerId} className="bg-gray-50 rounded-lg p-4">
                            {/* Seller Header */}
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                  {sellerGroup.seller_info.profilePicture ? (
                                    <img
                                      src={sellerGroup.seller_info.profilePicture}
                                      alt={sellerGroup.seller_info.businessName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-blue-600 font-semibold text-xs">
                                      {sellerGroup.seller_info.businessName.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-900 text-sm">
                                    {sellerGroup.seller_info.businessName}
                                  </h5>
                                  <p className="text-xs text-gray-600">
                                    {sellerGroup.seller_info.name}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-600">Subtotal</p>
                                <p className="font-semibold text-sm">
                                  LKR {sellerGroup.subtotal.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            {/* Products */}
                            <div className="space-y-2">
                              {sellerGroup.products.map((item, index) => (
                                <div
                                  key={`${sellerId}-${index}`}
                                  className="flex items-center gap-3 p-2 bg-white rounded-lg"
                                >
                                  <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h6 className="font-medium text-gray-900 text-xs">
                                      {item.name}
                                    </h6>
                                    <p className="text-xs text-gray-600">
                                      Qty: {item.quantity} × LKR {getPriceValue(item.price).toFixed(2)}
                                    </p>
                                  </div>
                                  <p className="text-xs font-semibold text-blue-600">
                                    LKR {item.subtotal.toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Seller Summary */}
                            <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center">
                              <div className="text-xs text-gray-600">
                                <p>Items: {sellerGroup.products.length}</p>
                                <p>Shipping: LKR {sellerGroup.shipping_fee.toFixed(2)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-600">Seller Total</p>
                                <p className="font-bold text-sm text-blue-600">
                                  LKR {(sellerGroup.subtotal + sellerGroup.shipping_fee).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Fallback to old display */
                      <div className="space-y-3">
                        {cartItems.map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-white">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {item.name}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {item.category}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-sm text-gray-600">
                                  Qty: {item.quantity || 1} × LKR{' '}
                                  {getPriceValue(item.price).toFixed(2)}
                                </p>
                                <p className="text-sm font-semibold text-blue-600">
                                  LKR{' '}
                                  {(
                                    getPriceValue(item.price) * (item.quantity || 1)
                                  ).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-white">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {product.category}
                      </p>
                      <p className="text-sm font-semibold text-blue-600">
                        {`LKR ${product.price}` || 'Price not available'}
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      LKR {subtotal.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Seller-specific shipping */}
                  {Object.keys(sellerGroups).length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Shipping by Seller:</div>
                      {Object.entries(sellerGroups).map(([sellerId, sellerGroup]) => (
                        <div key={sellerId} className="flex justify-between text-xs ml-4">
                          <span className="text-gray-500">
                            {sellerGroup.seller_info.businessName}
                          </span>
                          <span className="font-medium">
                            LKR {sellerGroup.shipping_fee.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        LKR {shippingFee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transaction Fee</span>
                    <span className="font-medium">
                      LKR {platformCharges ? (subtotal * (platformCharges.transaction_fee.buyer / 100)).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">
                    LKR {(() => {
                      const totalShipping = Object.keys(sellerGroups).length > 0 
                        ? Object.values(sellerGroups).reduce((sum, group) => sum + group.shipping_fee, 0)
                        : shippingFee;
                      const transactionFee = platformCharges ? (subtotal * (platformCharges.transaction_fee.buyer / 100)) : 0;
                      return (subtotal + totalShipping + transactionFee).toFixed(2);
                    })()}
                  </span>
                </div>

                {/* Place Order Button */}
                <Button
                  onClick={handlePlaceOrder}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  disabled={
                    !isAddressComplete() || !selectedPayment || isPlacingOrder
                  }
                >
                  {isPlacingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>

                {/* Security Notice */}
                <div className="text-xs text-gray-500 text-center">
                  🔒 Your payment information is secure and encrypted
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
