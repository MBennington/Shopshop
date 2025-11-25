'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Plus, Copy, Check, Calendar, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GiftCard {
  _id: string;
  code: string;
  amount: number;
  remainingBalance: number;
  expiryDate: string;
  status: string;
  isExpired?: boolean;
}

export default function GiftCardsPage() {
  const router = useRouter();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchGiftCards = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth');
          return;
        }

        const response = await fetch('/api/gift-cards', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.msg || data.error || 'Failed to fetch gift cards');
        }

        setGiftCards(data.data || []);
      } catch (error) {
        console.error('Error fetching gift cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGiftCards();
  }, [router]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusColor = (status: string, isExpired?: boolean) => {
    if (isExpired) return 'bg-gray-100 text-gray-600';
    if (status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'fully_redeemed') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  };

  const getStatusLabel = (status: string, isExpired?: boolean) => {
    if (isExpired) return 'Expired';
    if (status === 'active') return 'Active';
    if (status === 'fully_redeemed') return 'Fully Redeemed';
    return status;
  };

  const activeCards = giftCards.filter(
    (card) => card.status === 'active' && !card.isExpired
  );
  const expiredCards = giftCards.filter(
    (card) => card.status === 'expired' || card.isExpired
  );
  const redeemedCards = giftCards.filter(
    (card) => card.status === 'fully_redeemed'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading gift cards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Gift Cards</h1>
            <p className="text-gray-600 mt-2">Manage and view your gift cards</p>
          </div>
          <Button
            onClick={() => router.push('/gift-cards/purchase')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Purchase Gift Card
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Cards</p>
                  <p className="text-2xl font-bold text-green-600">
                    {activeCards.length}
                  </p>
                </div>
                <Gift className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Balance</p>
                  <p className="text-2xl font-bold text-blue-600">
                    LKR{' '}
                    {activeCards
                      .reduce((sum, card) => sum + card.remainingBalance, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Expired/Redeemed</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {expiredCards.length + redeemedCards.length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Gift Cards */}
        {activeCards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Gift Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCards.map((card) => (
                <Card key={card._id} className="border-2 border-green-200">
                  <CardHeader className="bg-green-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-mono">{card.code}</CardTitle>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          card.status,
                          card.isExpired
                        )}`}
                      >
                        {getStatusLabel(card.status, card.isExpired)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Original Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        LKR {card.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Remaining Balance</p>
                      <p className="text-2xl font-bold text-green-600">
                        LKR {card.remainingBalance.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expires</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(card.expiryDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleCopyCode(card.code)}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {copiedCode === card.code ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Expired/Redeemed Cards */}
        {(expiredCards.length > 0 || redeemedCards.length > 0) && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Expired / Redeemed Cards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...expiredCards, ...redeemedCards].map((card) => (
                <Card key={card._id} className="opacity-75">
                  <CardHeader className="bg-gray-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-mono">{card.code}</CardTitle>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          card.status,
                          card.isExpired
                        )}`}
                      >
                        {getStatusLabel(card.status, card.isExpired)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Original Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        LKR {card.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Remaining Balance</p>
                      <p className="text-lg font-medium text-gray-500">
                        LKR {card.remainingBalance.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expired</p>
                      <p className="text-sm font-medium text-gray-500">
                        {new Date(card.expiryDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {giftCards.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Gift Cards Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Purchase your first gift card to get started!
              </p>
              <Button
                onClick={() => router.push('/gift-cards/purchase')}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Purchase Gift Card
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

