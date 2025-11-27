'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Copy, Check, Mail } from 'lucide-react';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000, 50000];

interface GiftCardSuccess {
  code: string;
  pin: string;
  amount: number;
  expiryDate: string;
}

export default function PurchaseGiftCardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<GiftCardSuccess | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [payHereReady, setPayHereReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setError(null);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
    setError(null);
  };

  // Load PayHere script
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
      document.body.removeChild(script);
    };
  }, []);

  // Load user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user data if needed
      // For now, we'll get it from localStorage or fetch from API
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  // Check if redirected from payment success or failure
  useEffect(() => {
    const paymentId = searchParams.get('paymentId');
    const status = searchParams.get('status');
    
    if (paymentId) {
      // Fetch gift card details from payment
      fetchGiftCardFromPayment(paymentId, status);
    }
  }, [searchParams]);

  const fetchGiftCardFromPayment = async (paymentId: string, status?: string | null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      const response = await fetch(`/api/gift-cards?paymentId=${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        const payment = data.data?.payment;
        const giftCard = data.data?.giftCard;

        // Check if payment failed
        if (payment && payment.paymentStatus === 'Failed') {
          setError('Payment failed. Please try again.');
          // Clear paymentId from URL
          router.replace('/gift-cards/purchase');
          return;
        }

        // Check if payment is still pending
        if (payment && payment.paymentStatus === 'Pending') {
          setError('Payment is still being processed. Please wait a moment and refresh the page.');
          return;
        }

        // Payment successful - show gift card
        if (giftCard) {
          setSuccess({
            code: giftCard.code,
            pin: giftCard.pin || 'N/A', // PIN might not be available if already retrieved
            amount: giftCard.amount,
            expiryDate: giftCard.expiryDate,
          });
        } else {
          setError('Gift card not found. Please contact support if payment was successful.');
        }
      } else {
        setError(data.msg || 'Failed to fetch payment status. Please try again.');
      }
    } catch (err: any) {
      console.error('Error fetching gift card:', err);
      setError('An error occurred. Please try again.');
    }
  };

  const getFinalAmount = (): number | null => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) {
      const amount = parseFloat(customAmount);
      if (amount >= 500 && amount <= 50000) return amount;
    }
    return null;
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
      return_url:
        window.location.origin +
        `/gift-cards/purchase?paymentId=${data.paymentId}`,
      cancel_url: window.location.origin + '/gift-cards/purchase',
      notify_url: `https://isothiocyano-edmund-isentropic.ngrok-free.dev/api/gift-cards/payment/update-status`,
      order_id: data.paymentId,
      items: 'Gift Card Purchase',
      amount: Number(data.amount).toFixed(2),
      currency: data.currency,
      hash: data.hash,
      first_name: user?.name?.split(' ')[0] || '',
      last_name: user?.name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.phone || '0771234567',
      address: '',
      city: '',
      country: 'Sri Lanka',
    };

    // Optional: register event handlers
    payhere.onCompleted = function onCompleted(orderId: string) {
      console.log('Payment completed. PaymentID:' + orderId);
      // Redirect to success page with payment ID
      window.location.href = `/gift-cards/purchase?paymentId=${orderId}`;
    };
    payhere.onDismissed = function onDismissed() {
      console.log('Payment dismissed');
      setIsProcessing(false);
    };
    payhere.onError = function onError(error: string) {
      console.log('Error:' + error);
      setError('Payment failed. Please try again.');
      setIsProcessing(false);
    };

    payhere.onDismissed = function onDismissed() {
      console.log('Payment dismissed by user');
      setError('Payment was cancelled. Please try again if you want to complete the purchase.');
      setIsProcessing(false);
    };

    // Start PayHere payment
    payhere.startPayment(payHereData);
  };

  const handlePurchase = async () => {
    const amount = getFinalAmount();
    if (!amount) {
      setError('Please select or enter a valid amount (500 - 50,000 LKR)');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      // Initiate payment instead of creating gift card directly
      const response = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'initiate-purchase',
          amount,
          recipientEmail: recipientEmail || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || 'Failed to initiate payment');
      }

      // Initiate PayHere payment
      initiatePayHerePayment(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  const handleCopyCode = () => {
    if (success) {
      navigator.clipboard.writeText(success.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyPin = () => {
    if (success) {
      navigator.clipboard.writeText(success.pin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const handleSendEmail = async () => {
    if (!success) return;

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
          action: 'send-email',
          code: success.code,
          recipientEmail: recipientEmail || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || 'Failed to send email');
      }

      alert('Gift card email sent successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to send email');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-green-500">
            <CardHeader className="text-center bg-green-50">
              <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-green-700">
                Gift Card Purchased Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div>
                  <Label className="text-sm text-gray-600">
                    Gift Card Code
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value={success.code}
                      readOnly
                      className="font-mono text-lg font-bold"
                    />
                    <Button
                      onClick={handleCopyCode}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Security PIN</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value={success.pin}
                      readOnly
                      className="font-mono text-lg font-bold text-center tracking-widest"
                    />
                    <Button
                      onClick={handleCopyPin}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {copiedPin ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-red-600 mt-2 font-medium">
                    ⚠️ Save this PIN securely! You'll need both code and PIN to
                    redeem.
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Amount</Label>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    LKR {success.amount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Expiry Date</Label>
                  <p className="text-lg font-medium mt-2">
                    {new Date(success.expiryDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {recipientEmail && (
                <div className="space-y-2">
                  <Label>Send to Email</Label>
                  <div className="flex gap-2">
                    <Input value={recipientEmail} readOnly className="flex-1" />
                    <Button
                      onClick={handleSendEmail}
                      className="flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Send
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Please save both the Gift Card
                  Code and PIN securely. You'll need both to redeem this gift
                  card. The PIN will not be shown again.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setSuccess(null);
                    setSelectedAmount(null);
                    setCustomAmount('');
                    setRecipientEmail('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Purchase Another
                </Button>
                <Button onClick={() => router.push('/')} className="flex-1">
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-blue-600" />
              <CardTitle className="text-2xl">Purchase Gift Card</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Select Amount
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {PRESET_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={selectedAmount === amount ? 'default' : 'outline'}
                    onClick={() => handleAmountSelect(amount)}
                    className="h-12"
                  >
                    LKR {amount.toLocaleString()}
                  </Button>
                ))}
              </div>
              <div className="mt-4">
                <Label
                  htmlFor="custom-amount"
                  className="text-sm text-gray-600"
                >
                  Or Enter Custom Amount (500 - 50,000 LKR)
                </Label>
                <Input
                  id="custom-amount"
                  type="number"
                  min="500"
                  max="50000"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  placeholder="Enter amount"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="recipient-email"
                className="text-base font-semibold"
              >
                Recipient Email (Optional)
              </Label>
              <Input
                id="recipient-email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="email@example.com"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty if purchasing for yourself
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
              <p className="text-sm text-blue-800">
                <strong>Total:</strong>{' '}
                {getFinalAmount() ? (
                  <span className="text-lg font-bold">
                    LKR {getFinalAmount()!.toLocaleString()}
                  </span>
                ) : (
                  <span>Select or enter an amount</span>
                )}
              </p>
            </div>

            <Button
              onClick={handlePurchase}
              disabled={!getFinalAmount() || isProcessing}
              className="w-full h-12 text-lg"
            >
              {isProcessing ? 'Processing...' : 'Purchase Gift Card'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
