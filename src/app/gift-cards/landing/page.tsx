'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Gift,
  Check,
  Info,
  ArrowRight,
  Mail,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';

export default function GiftCardLandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#FF0808] via-[#FF4040] to-[#FF6060] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <Gift className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Give the Perfect Gift
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Share joy in seconds. Send digital gift cards that can be used
            anywhere on ShopShop and never get lost.
          </p>
          <Button
            onClick={() => router.push('/gift-cards/purchase')}
            size="lg"
            className="bg-white text-[#FF0808] hover:bg-gray-100 text-lg px-8 py-6 h-auto"
          >
            Buy a Gift Card
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle>1. Purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Choose an amount between LKR 500 and LKR 50,000 and enter the
                email of your loved one.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle>2. Send</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We’ll send a beautifully designed gift card straight to their
                inbox immediately after payment.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle>3. Redeem</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                They can enter the gift card code at checkout to apply the
                balance to their order — it’s that simple.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our Gift Cards?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  No Expiry Pressure
                </h3>
                <p className="text-gray-600">
                  Gift cards are valid for 1 year from the purchase date, giving
                  plenty of time to shop.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Easy to Use</h3>
                <p className="text-gray-600">
                  Enter the gift card code at checkout — no PINs, no extra
                  steps.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Instant Delivery</h3>
                <p className="text-gray-600">
                  The gift card arrives instantly in their email — perfect for
                  last-minute gifts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Partial Redemption
                </h3>
                <p className="text-gray-600">
                  Use part of the balance now and save the rest for another
                  purchase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Rules */}
      <div className="max-w-4xl mx-auto py-16 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Info className="w-6 h-6 text-blue-600" />
              <CardTitle>Gift Card Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Amount Limits</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Minimum amount: LKR 500</li>
                <li>Maximum amount: LKR 50,000</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Validity</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Gift cards are valid for 1 year from the purchase date</li>
                <li>Expired gift cards cannot be used</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Usage</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>
                  Enter the gift card code at checkout to apply the balance
                </li>
                <li>Can be used for partial payments</li>
                <li>Multiple gift cards can be applied to a single order</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Important Notes</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Gift cards cannot be refunded or exchanged for cash</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#FF0808] to-[#FF4040] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Send a Gift Card?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Spread joy with a digital gift card that's perfect for any occasion
          </p>
          <Button
            onClick={() => router.push('/gift-cards/purchase')}
            size="lg"
            className="bg-white text-[#FF0808] hover:bg-gray-100 text-lg px-8 py-6 h-auto"
          >
            Buy Gift Card Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
