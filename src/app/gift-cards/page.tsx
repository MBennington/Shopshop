'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Plus, Copy, Check, Calendar, Wallet, Send, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface GiftCard {
  _id: string;
  code: string;
  amount: number;
  remainingBalance: number;
  expiryDate: string;
  status: string;
  isExpired?: boolean;
  isShared?: boolean;
  isAccepted?: boolean;
  sentAt?: string;
  acceptedAt?: string;
  receiverEmail?: string;
}

interface GiftCardsData {
  owned: GiftCard[];
  shared: GiftCard[];
  sharedAccepted: GiftCard[];
  received: GiftCard[];
}

export default function GiftCardsPage() {
  const router = useRouter();
  const [giftCardsData, setGiftCardsData] = useState<GiftCardsData>({
    owned: [],
    shared: [],
    sharedAccepted: [],
    received: [],
  });
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sharingCard, setSharingCard] = useState<string | null>(null);
  const [receiverEmail, setReceiverEmail] = useState('');
  const [shareError, setShareError] = useState<string | null>(null);

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

        setGiftCardsData(data.data || {
          owned: [],
          shared: [],
          sharedAccepted: [],
          received: [],
        });
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

  const handleShare = async (giftCardId: string) => {
    if (!receiverEmail.trim()) {
      setShareError('Please enter receiver email');
      return;
    }

    setShareError(null);
    setSharingCard(giftCardId);

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
          action: 'send',
          giftCardId,
          receiverEmail: receiverEmail.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || 'Failed to send gift card');
      }

      // Refresh gift cards
      const refreshResponse = await fetch('/api/gift-cards', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok) {
        setGiftCardsData(refreshData.data || {
          owned: [],
          shared: [],
          sharedAccepted: [],
          received: [],
        });
      }

      setSharingCard(null);
      setReceiverEmail('');
      toast.success('Gift card sent successfully!');
    } catch (err: any) {
      setShareError(err.message || 'Failed to send gift card');
      setSharingCard(null);
    }
  };

  // Filter cards by status
  const activeOwnedCards = giftCardsData.owned.filter(
    (card) => card.status === 'active' && !card.isExpired && !card.isShared
  );
  const expiredOwnedCards = giftCardsData.owned.filter(
    (card) => (card.status === 'expired' || card.isExpired) && !card.isShared
  );
  const redeemedOwnedCards = giftCardsData.owned.filter(
    (card) => card.status === 'fully_redeemed' && !card.isShared
  );

  const renderGiftCard = (card: GiftCard, showShare: boolean = false) => (
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
        {showShare && !card.isShared && (
          <div className="space-y-2">
            {sharingCard === card._id ? (
              <>
                <Input
                  type="email"
                  placeholder="Enter receiver email"
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                  className="w-full"
                />
                {shareError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{shareError}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleShare(card._id)}
                    className="flex-1"
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                  <Button
                    onClick={() => {
                      setSharingCard(null);
                      setReceiverEmail('');
                      setShareError(null);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <Button
                onClick={() => {
                  setSharingCard(card._id);
                  setReceiverEmail('');
                  setShareError(null);
                }}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Share Gift Card
              </Button>
            )}
          </div>
        )}
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

  const totalOwned = activeOwnedCards.length;
  const totalBalance = activeOwnedCards.reduce((sum, card) => sum + card.remainingBalance, 0);
  const totalShared = giftCardsData.shared.length;
  const totalReceived = giftCardsData.received.length;

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">My Cards</p>
                  <p className="text-2xl font-bold text-green-600">{totalOwned}</p>
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
                    LKR {totalBalance.toFixed(2)}
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
                  <p className="text-sm text-gray-600">Shared (Pending)</p>
                  <p className="text-2xl font-bold text-orange-600">{totalShared}</p>
                </div>
                <Send className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Received</p>
                  <p className="text-2xl font-bold text-purple-600">{totalReceived}</p>
                </div>
                <Gift className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Gift Cards (Owned) */}
        {activeOwnedCards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Gift Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOwnedCards.map((card) => renderGiftCard(card, true))}
            </div>
          </div>
        )}

        {/* Shared Gift Cards (Pending Acceptance) */}
        {giftCardsData.shared.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Shared Gift Cards (Pending Acceptance)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {giftCardsData.shared.map((card) => (
                <Card key={card._id} className="border-2 border-orange-200">
                  <CardHeader className="bg-orange-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-mono">{card.code}</CardTitle>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                        Pending
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        LKR {card.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sent To</p>
                      <p className="text-sm font-medium text-gray-900">
                        {card.receiverEmail || 'N/A'}
                      </p>
                    </div>
                    {card.sentAt && (
                      <div>
                        <p className="text-sm text-gray-600">Sent On</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(card.sentAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Shared & Accepted */}
        {giftCardsData.sharedAccepted.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Shared & Accepted
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {giftCardsData.sharedAccepted.map((card) => (
                <Card key={card._id} className="border-2 border-blue-200">
                  <CardHeader className="bg-blue-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-mono">{card.code}</CardTitle>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        Accepted
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        LKR {card.amount.toFixed(2)}
                      </p>
                    </div>
                    {card.acceptedAt && (
                      <div>
                        <p className="text-sm text-gray-600">Accepted On</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(card.acceptedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Received Gift Cards */}
        {giftCardsData.received.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Received Gift Cards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {giftCardsData.received.map((card) => renderGiftCard(card, false))}
            </div>
          </div>
        )}

        {/* Expired/Redeemed Cards */}
        {(expiredOwnedCards.length > 0 || redeemedOwnedCards.length > 0) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Expired / Redeemed Cards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...expiredOwnedCards, ...redeemedOwnedCards].map((card) => (
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalOwned === 0 && totalShared === 0 && totalReceived === 0 && (
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
