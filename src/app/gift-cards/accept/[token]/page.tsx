'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GiftCardData {
  giftCard: {
    _id: string;
    code: string;
    amount: number;
    expiryDate: string;
    remainingBalance: number;
  };
  senderName: string;
  receiverEmail: string;
}

export default function AcceptGiftCardPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [giftCardData, setGiftCardData] = useState<GiftCardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Fetch gift card data first (no auth required)
    fetchGiftCardData();
    
    // Also check auth immediately in case user is already logged in
    const checkAuthImmediate = () => {
      const authToken = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (authToken && user) {
        try {
          const userData = JSON.parse(user);
          setUserEmail(userData.email);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    };
    checkAuthImmediate();
  }, [token]);

  const fetchGiftCardData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/gift-cards/accept/${token}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || 'Failed to fetch gift card');
      }

      setGiftCardData(data.data);
      
      // After gift card data is loaded, immediately check auth
      const authToken = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (authToken && user && data.data) {
        try {
          const userData = JSON.parse(user);
          const loggedInEmail = userData.email?.toLowerCase();
          const receiverEmail = data.data.receiverEmail?.toLowerCase();
          
          console.log('Immediate auth check after data load:', { loggedInEmail, receiverEmail, match: loggedInEmail === receiverEmail });
          
          if (receiverEmail && loggedInEmail === receiverEmail) {
            setIsAuthenticated(true);
            setUserEmail(userData.email);
            setError(null);
          } else if (receiverEmail && loggedInEmail !== receiverEmail) {
            setError(`This gift card was sent to ${data.data.receiverEmail}. You are logged in as ${userData.email}. Please log out and log in with the receiver's email address.`);
            setIsAuthenticated(false);
            setUserEmail(null);
          } else {
            setIsAuthenticated(true);
            setUserEmail(userData.email);
            setError(null);
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load gift card');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    // Check if user is authenticated after login
    const authToken = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!authToken || !user) {
      // Redirect to login with return URL
      const returnUrl = `/gift-cards/accept/${token}`;
      router.push(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // Verify email matches receiver email
    try {
      const userData = JSON.parse(user);
      const loggedInEmail = userData.email?.toLowerCase();
      const receiverEmail = giftCardData?.receiverEmail?.toLowerCase();
      
      if (receiverEmail && loggedInEmail !== receiverEmail) {
        setError(`This gift card was sent to ${giftCardData?.receiverEmail}. Please log in with that email address.`);
        // Clear wrong user's session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUserEmail(null);
        return;
      }

      setAccepting(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/gift-cards/accept/${token}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || 'Failed to accept gift card');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to accept gift card');
      // Clear session on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUserEmail(null);
    } finally {
      setAccepting(false);
    }
  };

  // Check authentication status when component updates (after login redirect)
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('Checking auth:', { hasToken: !!authToken, hasUser: !!user, hasGiftCardData: !!giftCardData });
      
      if (authToken && user && giftCardData) {
        try {
          const userData = JSON.parse(user);
          const loggedInEmail = userData.email?.toLowerCase();
          const receiverEmail = giftCardData.receiverEmail?.toLowerCase();
          
          console.log('Email comparison:', { loggedInEmail, receiverEmail, match: loggedInEmail === receiverEmail });
          
          // Only set as authenticated if email matches receiver email
          if (receiverEmail && loggedInEmail === receiverEmail) {
            console.log('Email matches - setting authenticated');
            setIsAuthenticated(true);
            setUserEmail(userData.email);
            setError(null); // Clear any previous errors
          } else if (receiverEmail && loggedInEmail !== receiverEmail) {
            // Wrong user logged in - show error but don't log out
            console.log('Email mismatch');
            setError(`This gift card was sent to ${giftCardData.receiverEmail}. You are logged in as ${userData.email}. Please log out and log in with the receiver's email address.`);
            setIsAuthenticated(false);
            setUserEmail(null);
          } else {
            // No receiver email specified - allow acceptance
            console.log('No receiver email - allowing acceptance');
            setIsAuthenticated(true);
            setUserEmail(userData.email);
            setError(null);
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
          setIsAuthenticated(false);
        }
      } else {
        console.log('No auth or gift card data');
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    };

    // Check auth when gift card data is loaded
    if (giftCardData) {
      checkAuth();
    }

    // Also check on window focus (in case user logged in in another tab)
    const handleFocus = () => {
      if (giftCardData) {
        checkAuth();
      }
    };
    
    // Check periodically in case user just logged in (after redirect)
    const interval = setInterval(() => {
      if (giftCardData) {
        checkAuth();
      }
    }, 500); // Check every 500ms for faster detection
    
    window.addEventListener('focus', handleFocus);
    
    // Also check when URL changes (after redirect)
    const handleLocationChange = () => {
      setTimeout(() => {
        if (giftCardData) {
          checkAuth();
        }
      }, 100);
    };
    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(interval);
    };
  }, [giftCardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading gift card...</p>
        </div>
      </div>
    );
  }

  if (error && !giftCardData) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push('/')}
              className="w-full mt-4"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full border-2 border-green-500">
          <CardHeader className="text-center bg-green-50">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              Gift Card Accepted!
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-center text-gray-700">
              The gift card has been successfully added to your account.
            </p>
            {giftCardData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  LKR {giftCardData.giftCard.amount.toLocaleString()}
                </p>
              </div>
            )}
            <div className="flex gap-4">
              <Button
                onClick={() => router.push('/gift-cards')}
                className="flex-1"
              >
                View My Gift Cards
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="flex-1"
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!giftCardData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">You've Received a Gift Card!</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 p-6 rounded-lg space-y-4">
            <div>
              <p className="text-sm text-gray-600">From</p>
              <p className="text-lg font-semibold">{giftCardData.senderName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Gift Card Amount</p>
              <p className="text-3xl font-bold text-blue-600">
                LKR {giftCardData.giftCard.amount.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Expiry Date</p>
              <p className="text-base font-medium">
                {new Date(giftCardData.giftCard.expiryDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="mb-2">You need to log in or create an account to accept this gift card.</p>
                  {giftCardData.receiverEmail && (
                    <p className="font-semibold text-blue-700">
                      This gift card was sent to: <span className="underline">{giftCardData.receiverEmail}</span>
                    </p>
                  )}
                </AlertDescription>
              </Alert>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-4">
                <Button
                  onClick={() => router.push(`/auth?returnUrl=${encodeURIComponent(`/gift-cards/accept/${token}`)}`)}
                  className="flex-1"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => router.push(`/auth?signup=true&returnUrl=${encodeURIComponent(`/gift-cards/accept/${token}`)}`)}
                  variant="outline"
                  className="flex-1"
                >
                  Sign Up
                </Button>
              </div>
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mt-2">
                  Debug: isAuthenticated={isAuthenticated ? 'true' : 'false'}, 
                  userEmail={userEmail || 'null'}, 
                  receiverEmail={giftCardData.receiverEmail || 'null'}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {giftCardData.receiverEmail && userEmail?.toLowerCase() === giftCardData.receiverEmail.toLowerCase() && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    You are logged in as {userEmail}. You can now accept this gift card.
                  </AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full h-12 text-lg"
              >
                {accepting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  'Accept Gift Card'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

