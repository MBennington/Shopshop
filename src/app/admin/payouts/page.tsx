'use client';

import { useState, useEffect, Suspense } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Payout {
  _id: string;
  seller_id: string | {
    _id: string;
    name: string;
    email: string;
    sellerInfo?: {
      businessName?: string;
    };
  };
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
  admin_note?: string;
}

function AdminPayoutsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [sellerFilter, setSellerFilter] = useState('');
  
  // Action dialogs
  const [actionDialog, setActionDialog] = useState<{
    show: boolean;
    type: 'approve' | 'reject' | 'mark-paid' | null;
    payout: Payout | null;
    adminNote: string;
    amountPaid: string;
    receiptFiles: File[];
  }>({
    show: false,
    type: null,
    payout: null,
    adminNote: '',
    amountPaid: '',
    receiptFiles: [],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    if (user?.role === 'admin') {
      fetchPayouts();
    }
  }, [user, router, page, statusFilter]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (sellerFilter) params.append('seller_id', sellerFilter);

      const response = await fetch(`/api/admin/payouts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayouts(data.data.payouts || []);
        setTotalPages(data.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
      toast.error('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionDialog.payout || !actionDialog.type) return;

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      let url = `/api/admin/payouts/${actionDialog.payout._id}`;
      let method = 'POST';
      let body: any = {};

      if (actionDialog.type === 'approve') {
        url += '/approve';
        body = { admin_note: actionDialog.adminNote };
      } else if (actionDialog.type === 'reject') {
        url += '/reject';
        body = { admin_note: actionDialog.adminNote };
      } else if (actionDialog.type === 'mark-paid') {
        url += '/mark-paid';
        
        // Upload receipt files first if any
        let receiptUrls: string[] = [];
        if (actionDialog.receiptFiles.length > 0) {
          const formData = new FormData();
          actionDialog.receiptFiles.forEach((file) => {
            formData.append('receipts', file);
          });

          const uploadResponse = await fetch('/api/admin/payouts/upload-receipts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json();
            throw new Error(uploadError.msg || uploadError.error || 'Failed to upload receipts');
          }

          const uploadData = await uploadResponse.json();
          receiptUrls = uploadData.data?.receipt_urls || [];
        }

        body = {
          amount_paid: parseFloat(actionDialog.amountPaid) || actionDialog.payout.amount_requested,
          admin_note: actionDialog.adminNote,
          receipt_urls: receiptUrls,
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Payout ${actionDialog.type === 'approve' ? 'approved' : actionDialog.type === 'reject' ? 'rejected' : 'marked as paid'} successfully`);
        setActionDialog({ show: false, type: null, payout: null, adminNote: '', amountPaid: '', receiptFiles: [] });
        fetchPayouts();
      } else {
        toast.error(data.msg || data.error || `Failed to ${actionDialog.type} payout`);
      }
    } catch (error) {
      console.error('Action error:', error);
      toast.error(error instanceof Error ? error.message : 'Server error during payout action');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const getSellerName = (seller: Payout['seller_id']) => {
    if (typeof seller === 'string') return 'Unknown Seller';
    return seller.sellerInfo?.businessName || seller.name || seller.email || 'Unknown Seller';
  };

  const pendingCount = payouts.filter(p => p.status === 'PENDING').length;
  const pendingAmount = payouts
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount_requested, 0);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 overflow-y-auto">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">Payout Management</p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">Manage all seller payout requests</p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="px-4 py-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                  <p className="text-[#6a7581] text-xs font-medium mb-1">Pending Payouts</p>
                  <p className="text-yellow-600 text-2xl font-bold">{pendingCount}</p>
                  <p className="text-xs text-[#6a7581] mt-1">Amount: {formatCurrency(pendingAmount)}</p>
                </div>
                <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                  <p className="text-[#6a7581] text-xs font-medium mb-1">Total Payouts</p>
                  <p className="text-[#121416] text-2xl font-bold">{payouts.length}</p>
                </div>
                <div className="bg-white border border-[#dde0e3] rounded-xl p-4">
                  <p className="text-[#6a7581] text-xs font-medium mb-1">Total Amount</p>
                  <p className="text-[#121416] text-2xl font-bold">
                    {formatCurrency(payouts.reduce((sum, p) => sum + (p.amount_paid || p.amount_requested), 0))}
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 py-3">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-[#121416] mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full h-10 px-3 rounded-md border border-gray-300"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PAID">Paid</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-[#121416] mb-1">Seller ID</label>
                  <Input
                    type="text"
                    placeholder="Filter by seller ID"
                    value={sellerFilter}
                    onChange={(e) => {
                      setSellerFilter(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <Button
                  onClick={fetchPayouts}
                  className="h-10 px-4"
                >
                  Apply Filters
                </Button>
              </div>
            </div>

            {/* Payouts Table */}
            <div className="px-4 py-3">
              {loading ? (
                <div className="text-center py-8 text-[#6a7581]">Loading payouts...</div>
              ) : payouts.length === 0 ? (
                <div className="text-center py-8 text-[#6a7581]">No payouts found</div>
              ) : (
                <div className="bg-white border border-[#dde0e3] rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#f8f9fa] border-b border-[#dde0e3]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#6a7581] uppercase">Seller</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#6a7581] uppercase">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#6a7581] uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#6a7581] uppercase">Requested</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#6a7581] uppercase">Bank Details</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#6a7581] uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dde0e3]">
                        {payouts.map((payout) => (
                          <tr key={payout._id} className="hover:bg-[#f8f9fa]">
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-[#121416]">{getSellerName(payout.seller_id)}</p>
                              {typeof payout.seller_id !== 'string' && (
                                <p className="text-xs text-[#6a7581]">{payout.seller_id.email}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-[#121416]">
                                {formatCurrency(payout.amount_requested)}
                              </p>
                              {payout.amount_paid > 0 && payout.amount_paid !== payout.amount_requested && (
                                <p className="text-xs text-[#6a7581]">Paid: {formatCurrency(payout.amount_paid)}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(payout.status)}`}>
                                {payout.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm text-[#121416]">{formatDate(payout.requested_at)}</p>
                              {payout.approved_at && (
                                <p className="text-xs text-[#6a7581]">Approved: {formatDate(payout.approved_at)}</p>
                              )}
                              {payout.paid_at && (
                                <p className="text-xs text-[#6a7581]">Paid: {formatDate(payout.paid_at)}</p>
                              )}
                              {payout.receipt_urls && payout.receipt_urls.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-[#6a7581] mb-1">Receipts:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {payout.receipt_urls.map((url, idx) => (
                                      <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-[#528bc5] hover:underline"
                                      >
                                        Receipt {idx + 1}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {payout.bank_name && (
                                <div className="text-sm">
                                  <p className="text-[#121416]">{payout.bank_name}</p>
                                  <p className="text-xs text-[#6a7581]">{payout.bank_account_name}</p>
                                  <p className="text-xs text-[#6a7581]">{payout.bank_account_number}</p>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {payout.status === 'PENDING' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setActionDialog({
                                          show: true,
                                          type: 'approve',
                                          payout,
                                          adminNote: '',
                                          amountPaid: '',
                                          receiptFiles: [],
                                        });
                                      }}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setActionDialog({
                                          show: true,
                                          type: 'reject',
                                          payout,
                                          adminNote: '',
                                          amountPaid: '',
                                          receiptFiles: [],
                                        });
                                      }}
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {payout.status === 'APPROVED' && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setActionDialog({
                                        show: true,
                                        type: 'mark-paid',
                                        payout,
                                        adminNote: '',
                                        amountPaid: payout.amount_requested.toString(),
                                        receiptFiles: [],
                                      });
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Mark as Paid
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-[#6a7581]">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Dialog */}
      {actionDialog.show && actionDialog.payout && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-[9998]"
            onClick={() => {
              setActionDialog({ show: false, type: null, payout: null, adminNote: '', amountPaid: '', receiptFiles: [] });
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-[#121416] mb-2">
                {actionDialog.type === 'approve' && 'Approve Payout'}
                {actionDialog.type === 'reject' && 'Reject Payout'}
                {actionDialog.type === 'mark-paid' && 'Mark Payout as Paid'}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-[#6a7581] mb-2">
                  Seller: <span className="font-medium text-[#121416]">{getSellerName(actionDialog.payout.seller_id)}</span>
                </p>
                <p className="text-sm text-[#6a7581] mb-2">
                  Amount: <span className="font-medium text-[#121416]">{formatCurrency(actionDialog.payout.amount_requested)}</span>
                </p>
              </div>

              <div className="space-y-4">
                {actionDialog.type === 'mark-paid' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#121416] mb-1">
                        Amount Paid
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={actionDialog.amountPaid}
                        onChange={(e) =>
                          setActionDialog({ ...actionDialog, amountPaid: e.target.value })
                        }
                        placeholder={actionDialog.payout.amount_requested.toString()}
                      />
                      <p className="text-xs text-[#6a7581] mt-1">
                        Default: {formatCurrency(actionDialog.payout.amount_requested)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#121416] mb-1">
                        Transaction Receipt (PDF or Image)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setActionDialog({ ...actionDialog, receiptFiles: files });
                        }}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#528bc5] file:text-white hover:file:bg-[#4a7bb3] cursor-pointer"
                      />
                      <p className="text-xs text-[#6a7581] mt-1">
                        Upload PDF or image files (max 5 files, 10MB each)
                      </p>
                      {actionDialog.receiptFiles.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {actionDialog.receiptFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                              <span className="text-[#121416] truncate flex-1">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newFiles = actionDialog.receiptFiles.filter((_, i) => i !== index);
                                  setActionDialog({ ...actionDialog, receiptFiles: newFiles });
                                }}
                                className="ml-2 text-red-600 hover:text-red-800 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-[#121416] mb-1">
                    Admin Note (Optional)
                  </label>
                  <textarea
                    value={actionDialog.adminNote}
                    onChange={(e) =>
                      setActionDialog({ ...actionDialog, adminNote: e.target.value })
                    }
                    className="w-full h-24 px-3 py-2 rounded-md border border-gray-300 resize-none"
                    placeholder="Add a note about this action..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActionDialog({ show: false, type: null, payout: null, adminNote: '', amountPaid: '', receiptFiles: [] });
                  }}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAction}
                  disabled={submitting}
                  className={`flex-1 ${
                    actionDialog.type === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : actionDialog.type === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {submitting
                    ? 'Processing...'
                    : actionDialog.type === 'approve'
                    ? 'Approve'
                    : actionDialog.type === 'reject'
                    ? 'Reject'
                    : 'Mark as Paid'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminPayoutsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AdminPayoutsContent />
    </Suspense>
  );
}

