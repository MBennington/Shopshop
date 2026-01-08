'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Wallet {
  _id: string;
  seller_id: string;
  available_balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  currency: string;
}

interface Payout {
  _id: string;
  seller_id: string;
  amount_requested: number;
  amount_paid: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'FAILED' | 'CANCELLED';
  method: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  requested_at: string;
  approved_at?: string;
  paid_at?: string;
  receipt_urls?: string[];
}

export default function PayoutsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Payout request dialog
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestMethod, setRequestMethod] = useState('BANK_TRANSFER');
  const [submitting, setSubmitting] = useState(false);
  
  // Cancel payout dialog
  const [cancelDialog, setCancelDialog] = useState<{ show: boolean; payoutId: string | null }>({
    show: false,
    payoutId: null,
  });

  useEffect(() => {
    if (user?._id) {
      fetchWallet();
      fetchPayouts();
    }
  }, [user]);

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/seller-wallet', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWallet(data.data);
      } else {
        const data = await response.json();
        const errorMessage = data.msg || data.error || 'Failed to load wallet information';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payout/seller?page=1&limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayouts(data.data.payouts || []);
      } else {
        const data = await response.json();
        const errorMessage = data.msg || data.error || 'Failed to load payout history';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
      toast.error('Network error. Please check your connection and try again.');
    }
  };

  const handleCreatePayout = async () => {
    if (!requestAmount || parseFloat(requestAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (wallet && parseFloat(requestAmount) > wallet.available_balance) {
      toast.error('Insufficient available balance');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount_requested: parseFloat(requestAmount),
          method: requestMethod,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Payout request created successfully!');
        setShowRequestDialog(false);
        setRequestAmount('');
        fetchWallet();
        fetchPayouts();
      } else {
        const errorMessage = data.msg || data.error || 'Failed to create payout request';
        
        // Check if error is about missing bank details
        if (errorMessage.toLowerCase().includes('bank details') || errorMessage.toLowerCase().includes('bank details not found')) {
          toast.error('Bank details required', {
            description: errorMessage.includes('Settings') ? errorMessage : 'Please fill in your bank details in Settings > Payout before making a payout request.',
            action: {
              label: 'Go to Settings',
              onClick: () => router.push('/sell/settings?tab=payouts'),
            },
            duration: 6000,
          });
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Payout creation error:', error);
      const errorMessage = error?.message || 'Network error. Please check your connection and try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPayout = async () => {
    if (!cancelDialog.payoutId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/payout/${cancelDialog.payoutId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Payout cancelled successfully');
        setCancelDialog({ show: false, payoutId: null });
        fetchWallet();
        fetchPayouts();
      } else {
        const errorMessage = data.msg || data.error || 'Failed to cancel payout';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Payout cancellation error:', error);
      const errorMessage = error?.message || 'Network error. Please check your connection and try again.';
      toast.error(errorMessage);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: wallet?.currency || 'LKR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'FAILED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingPayouts = payouts.filter(p => p.status === 'PENDING' || p.status === 'APPROVED');
  const completedPayouts = payouts.filter(p => p.status === 'PAID');
  const rejectedPayouts = payouts.filter(p => p.status === 'REJECTED' || p.status === 'FAILED' || p.status === 'CANCELLED');

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 overflow-y-auto">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">Payouts</p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">Track your earnings and manage payouts</p>
              </div>
              <Button
                onClick={() => {
                  if (!wallet || wallet.available_balance <= 0) {
                    toast.warning('No available balance', {
                      description: 'You need to have available balance to request a payout.',
                    });
                    return;
                  }
                  setShowRequestDialog(true);
                }}
                className="h-10 px-5 rounded-full bg-[#121416] text-white text-sm font-bold hover:bg-[#23272b] transition-colors"
                disabled={!wallet || wallet.available_balance <= 0}
              >
                Request Payout
              </Button>
            </div>


            {/* Wallet Metrics */}
            {loading ? (
              <div className="p-4 text-[#6a7581]">Loading wallet information...</div>
            ) : wallet ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                <div className="flex flex-col gap-2 p-4 rounded-xl border border-[#dde0e3] bg-white">
                  <p className="text-[#6a7581] text-sm font-normal leading-normal">Available Balance</p>
                  <p className="text-[#121416] text-2xl font-bold leading-tight">
                    {formatCurrency(wallet.available_balance)}
                  </p>
                  <p className="text-xs text-[#6a7581]">Ready to withdraw</p>
                </div>
                <div className="flex flex-col gap-2 p-4 rounded-xl border border-[#dde0e3] bg-white">
                  <p className="text-[#6a7581] text-sm font-normal leading-normal">Pending Balance</p>
                  <p className="text-[#121416] text-2xl font-bold leading-tight">
                    {formatCurrency(wallet.pending_balance)}
                  </p>
                  <p className="text-xs text-[#6a7581]">Awaiting delivery confirmation</p>
                </div>
                <div className="flex flex-col gap-2 p-4 rounded-xl border border-[#dde0e3] bg-white">
                  <p className="text-[#6a7581] text-sm font-normal leading-normal">Total Earned</p>
                  <p className="text-[#121416] text-2xl font-bold leading-tight">
                    {formatCurrency(wallet.total_earned)}
                  </p>
                  <p className="text-xs text-[#6a7581]">All time earnings</p>
                </div>
                <div className="flex flex-col gap-2 p-4 rounded-xl border border-[#dde0e3] bg-white">
                  <p className="text-[#6a7581] text-sm font-normal leading-normal">Total Withdrawn</p>
                  <p className="text-[#121416] text-2xl font-bold leading-tight">
                    {formatCurrency(wallet.total_withdrawn)}
                  </p>
                  <p className="text-xs text-[#6a7581]">Total payouts</p>
                </div>
              </div>
            ) : null}

            {/* Payout History */}
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pending/Active Payouts */}
                <div className="rounded-xl border border-[#dde0e3] bg-white p-4">
                  <h2 className="text-[#121416] text-lg font-bold leading-tight mb-4">
                    Active Payouts ({pendingPayouts.length})
                  </h2>
                  <div className="space-y-4">
                    {pendingPayouts.length === 0 ? (
                      <p className="text-sm text-[#6a7581] text-center py-4">No active payouts</p>
                    ) : (
                      pendingPayouts.map((payout) => (
                        <div key={payout._id} className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-[#121416]">
                                {formatCurrency(payout.amount_requested)}
                              </p>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(payout.status)}`}>
                                {payout.status}
                              </span>
                            </div>
                            <p className="text-sm text-[#6a7581]">
                              Requested on {formatDate(payout.requested_at)}
                            </p>
                            {payout.approved_at && (
                              <p className="text-sm text-[#6a7581]">
                                Approved on {formatDate(payout.approved_at)}
                              </p>
                            )}
                          </div>
                          {payout.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCancelDialog({ show: true, payoutId: payout._id });
                              }}
                              className="ml-2"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Completed Payouts */}
                <div className="rounded-xl border border-[#dde0e3] bg-white p-4">
                  <h2 className="text-[#121416] text-lg font-bold leading-tight mb-4">
                    Payout History ({completedPayouts.length})
                  </h2>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {completedPayouts.length === 0 ? (
                      <p className="text-sm text-[#6a7581] text-center py-4">No payout history</p>
                    ) : (
                      completedPayouts.map((payout) => (
                        <div key={payout._id} className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-lg">
                          <div>
                            <p className="font-medium text-[#121416]">
                              {formatCurrency(payout.amount_paid || payout.amount_requested)}
                            </p>
                            <p className="text-sm text-[#6a7581]">
                              Paid on {payout.paid_at ? formatDate(payout.paid_at) : formatDate(payout.requested_at)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(payout.status)}`}>
                            {payout.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Rejected Payouts */}
              {rejectedPayouts.length > 0 && (
                <div className="mt-4 rounded-xl border border-[#dde0e3] bg-white p-4">
                  <h2 className="text-[#121416] text-lg font-bold leading-tight mb-4">
                    Rejected/Cancelled Payouts ({rejectedPayouts.length})
                  </h2>
                  <div className="space-y-4">
                    {rejectedPayouts.map((payout) => (
                      <div key={payout._id} className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-lg">
                        <div>
                          <p className="font-medium text-[#121416]">
                            {formatCurrency(payout.amount_requested)}
                          </p>
                          <p className="text-sm text-[#6a7581]">
                            Requested on {formatDate(payout.requested_at)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(payout.status)}`}>
                          {payout.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Payout Request Dialog */}
      {showRequestDialog && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-[9998]" 
            onClick={() => {
              setShowRequestDialog(false);
              setRequestAmount('');
            }} 
          />
          <div className="fixed inset-0 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-[#121416] mb-2">Request Payout</h3>
              <p className="text-sm text-[#6a7581] mb-4">
                Enter the amount you want to withdraw from your available balance.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#121416]">Available Balance</label>
                  <p className="text-2xl font-bold text-[#121416]">
                    {wallet ? formatCurrency(wallet.available_balance) : 'Loading...'}
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium text-[#121416]">
                    Amount to Withdraw
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={wallet?.available_balance || 0}
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-[#6a7581]">
                    Maximum: {wallet ? formatCurrency(wallet.available_balance) : '0.00'}
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="method" className="text-sm font-medium text-[#121416]">
                    Payment Method
                  </label>
                  <select
                    id="method"
                    value={requestMethod}
                    onChange={(e) => setRequestMethod(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-gray-300"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button 
                variant="outline" 
                onClick={() => {
                  setShowRequestDialog(false);
                  setRequestAmount('');
                }} 
                className="flex-1"
              >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePayout}
                  disabled={submitting || !requestAmount || parseFloat(requestAmount) <= 0}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : 'Request Payout'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Cancel Payout Dialog */}
      {cancelDialog.show && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-[9998]" 
            onClick={() => {
              setCancelDialog({ show: false, payoutId: null });
            }} 
          />
          <div className="fixed inset-0 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-[#121416] mb-2">Cancel Payout Request</h3>
              <p className="text-sm text-[#6a7581] mb-4">
                Are you sure you want to cancel this payout request? The amount will be returned to your available balance.
              </p>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCancelDialog({ show: false, payoutId: null });
                  }} 
                  className="flex-1"
                >
                  Keep Request
                </Button>
                <Button onClick={handleCancelPayout} className="flex-1 bg-red-600 hover:bg-red-700">
                  Cancel Payout
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
