import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Check, X, CreditCard, ChevronDown, ChevronUp, Clock, User, Building2, HelpCircle } from 'lucide-react';
import ApiService from '../../../../shared/services/api';
import { SkeletonTableRows, PaginationBar } from '../components/SharedAdminUI';
import { formatDateString } from '../utils';
import { toast } from 'react-hot-toast';

export default function RefundRequestsTab(props) {
  const { settingsForm } = props;
  const [refunds, setRefunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING'); // PENDING, REFUNDED, REJECTED, ALL
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [expandedId, setExpandedId] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  // Fetch refund requests
  const fetchRefunds = async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const res = await ApiService.getRefundRequests();
      if (res.success && res.data) {
        setRefunds(res.data);
      } else {
        toast.error('Failed to load refund requests');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while loading refund requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchRefunds(false);
    });
  }, []);

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this refund? This will attempt to refund via Razorpay if applicable and flag the booking as REFUNDED.')) {
      setActioningId(id);
      try {
        const res = await ApiService.approveRefund(id);
        if (res.success) {
          toast.success(res.message || 'Refund approved successfully!');
          fetchRefunds(true);
        } else {
          toast.error(res.message || 'Failed to approve refund.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error occurred while approving refund.');
      } finally {
        setActioningId(null);
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this refund request?')) {
      setActioningId(id);
      try {
        const res = await ApiService.rejectRefund(id);
        if (res.success) {
          toast.success(res.message || 'Refund request rejected successfully.');
          fetchRefunds(true);
        } else {
          toast.error(res.message || 'Failed to reject refund.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error occurred while rejecting refund.');
      } finally {
        setActioningId(null);
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filtering
  const filtered = refunds.filter(r => {
    const matchesSearch =
      (r.studentName && r.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.counsellorName && r.counsellorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.razorpayPaymentId && r.razorpayPaymentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.cancellationReason && r.cancellationReason.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && r.refundStatus === statusFilter;
  });

  // Pagination
  const pagedRefunds = filtered.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-sm">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold capitalize text-white font-header">Refund Requests & Payouts</h3>
          <p className="text-sm text-zinc-500 font-medium pt-1">
            Manage refund payouts to students and review linked counsellor bank accounts.
          </p>
        </div>
        <div className="relative w-full sm:max-w-[240px]">
          <input
            type="text"
            placeholder="Search refunds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-955 border border-zinc-800 rounded-lg text-sm font-semibold focus:border-brand text-white outline-none"
          />
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Info notice about refund flow */}
      <div className="bg-zinc-955/60 p-4 rounded-xl border border-zinc-850 text-xs text-zinc-400 space-y-1">
        <div className="flex items-center gap-2 font-bold text-white mb-1">
          <ShieldAlert className="w-4 h-4 text-brand" />
          <span>About Cancellation Payouts & Refund Operations</span>
        </div>
        <p>When a booking is cancelled, if the payment was paid online via Razorpay, the refund status is set to PENDING.</p>
        <p>Approving the refund triggers the Razorpay Refund API. If the credentials or payments are sandbox/manual, the system falls back gracefully to a manual refund status to prevent blocking test workflows.</p>
      </div>

      {/* Filters and Counters */}
      <div className="flex flex-wrap gap-1.5 bg-zinc-950 p-3 rounded-xl border border-zinc-850">
        {['ALL', 'PENDING', 'REFUNDED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
              statusFilter === status
                ? 'bg-brand text-zinc-955 border-brand'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {status} ({
              status === 'ALL'
                ? refunds.length
                : refunds.filter(r => r.refundStatus === status).length
            })
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-950">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-zinc-900 text-zinc-400 font-bold border-b border-zinc-850 text-left">
                <th className="p-3 w-8 text-center"></th>
                <th className="p-3">Student / Payer</th>
                <th className="p-3">Counsellor</th>
                <th className="p-3">Booking Details</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonTableRows cols={7} />
              ) : pagedRefunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500 italic">
                    No refund requests matching the active filter.
                  </td>
                </tr>
              ) : (
                pagedRefunds.map((booking) => {
                  const isExpanded = expandedId === booking.id;
                  const isPending = booking.refundStatus === 'PENDING';
                  return (
                    <React.Fragment key={booking.id}>
                      <tr className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors">
                        <td className="p-3 text-center">
                          <button
                            onClick={() => toggleExpand(booking.id)}
                            className="p-1 text-zinc-500 hover:text-white rounded hover:bg-zinc-800 transition cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-white block leading-tight">{booking.studentName}</span>
                          <span className="text-xs text-zinc-500">{booking.studentEmail || 'No Email'}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-white block leading-tight">{booking.counsellorName}</span>
                          <span className="text-xs text-zinc-500">{booking.counsellorEmail || 'No Email'}</span>
                        </td>
                        <td className="p-3">
                          <div className="text-zinc-300 font-semibold text-xs">
                            {formatDateString(booking.date)} at {booking.time}
                          </div>
                          <div className="text-xs text-zinc-555 font-bold capitalize pt-0.5">
                            {booking.mode} ({booking.service === 'counselling' ? 'Wellbeing' : 'Career'})
                          </div>
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-400">
                          ₹{booking.amountPaid || 0}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold capitalize ${
                            booking.refundStatus === 'PENDING'
                              ? 'bg-yellow-955/30 border border-yellow-900/40 text-yellow-400'
                              : booking.refundStatus === 'REFUNDED'
                                ? 'bg-emerald-955/30 border border-emerald-900/40 text-emerald-450'
                                : 'bg-rose-955/30 border border-rose-900/40 text-rose-400'
                          }`}>
                            {booking.refundStatus === 'PENDING' ? 'Pending Approval' : booking.refundStatus}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => handleApprove(booking.id)}
                                  disabled={actioningId !== null}
                                  className="p-1.5 bg-emerald-955/20 text-emerald-450 hover:bg-emerald-900 hover:text-white rounded border border-emerald-900/30 transition text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Approve & Payout"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleReject(booking.id)}
                                  disabled={actioningId !== null}
                                  className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Reject Request"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <span className="text-zinc-555 italic text-xs">Processed</span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <tr className="bg-zinc-955/30 border-b border-zinc-900">
                          <td colSpan={7} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top duration-200">
                              {/* Cancellation Details */}
                              <div className="bg-zinc-900/30 border border-zinc-850 p-3 rounded-lg space-y-2">
                                <h5 className="text-xs font-bold text-zinc-400 capitalize tracking-wider flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                  Cancellation Details
                                </h5>
                                <div className="text-xs text-zinc-300 space-y-1 pt-1">
                                  <div>
                                    <span className="text-zinc-500 font-semibold">Cancelled By:</span>{' '}
                                    <span className="capitalize">{booking.cancelledBy || 'Unknown'}</span>
                                  </div>
                                  <div>
                                    <span className="text-zinc-500 font-semibold">Reason:</span>{' '}
                                    <span className="italic">"{booking.cancellationReason || 'Not Specified'}"</span>
                                  </div>
                                  <div>
                                    <span className="text-zinc-500 font-semibold">Razorpay Order ID:</span>{' '}
                                    <span>{booking.razorpayOrderId || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-zinc-500 font-semibold">Razorpay Payment ID:</span>{' '}
                                    <span>{booking.razorpayPaymentId || 'N/A'}</span>
                                  </div>
                                  {booking.refundId && (
                                    <>
                                      <div>
                                        <span className="text-zinc-500 font-semibold">Refund ID:</span>{' '}
                                        <span className="text-brand font-mono">{booking.refundId}</span>
                                      </div>
                                      <div>
                                        <span className="text-zinc-500 font-semibold">Refunded At:</span>{' '}
                                        <span>{booking.refundedAt ? new Date(booking.refundedAt).toLocaleString() : 'N/A'}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Counsellor Bank Settings */}
                              <div className="bg-zinc-900/30 border border-zinc-850 p-3 rounded-lg space-y-2">
                                <h5 className="text-xs font-bold text-brand capitalize tracking-wider flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-brand" />
                                  Counsellor Bank Details
                                </h5>
                                <div className="text-xs text-zinc-300 space-y-1 pt-1">
                                  {booking.counsellorBank && booking.counsellorBank.accountNumber ? (
                                    <>
                                      <div>
                                        <span className="text-zinc-500 font-semibold">Holder:</span>{' '}
                                        {booking.counsellorBank.accountName}
                                      </div>
                                      <div>
                                        <span className="text-zinc-500 font-semibold">Account #:</span>{' '}
                                        {booking.counsellorBank.accountNumber}
                                      </div>
                                      <div>
                                        <span className="text-zinc-500 font-semibold">IFSC Code:</span>{' '}
                                        {booking.counsellorBank.ifscCode}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-zinc-500 italic pt-1">No bank details configured in counsellor profile.</div>
                                  )}
                                  {booking.razorpayAccountId && (
                                    <div className="pt-1.5 border-t border-zinc-850/50 mt-1">
                                      <span className="text-zinc-500 font-semibold">Linked Acc ID:</span>{' '}
                                      <code className="text-yellow-450 bg-zinc-950 px-1 py-0.5 rounded font-mono text-[10px]">
                                        {booking.razorpayAccountId}
                                      </code>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Platform Bank Settings */}
                              <div className="bg-zinc-900/30 border border-zinc-850 p-3 rounded-lg space-y-2">
                                <h5 className="text-xs font-bold text-emerald-500 capitalize tracking-wider flex items-center gap-1.5">
                                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                                  Platform Payout Bank Details
                                </h5>
                                <div className="text-xs text-zinc-300 space-y-1 pt-1">
                                  {settingsForm?.adminBankAccountNumber ? (
                                    <>
                                      <div>
                                        <span className="text-zinc-500 font-semibold">Holder:</span>{' '}
                                        {settingsForm.adminBankAccountName}
                                      </div>
                                      <div>
                                        <span className="text-zinc-500 font-semibold">Account #:</span>{' '}
                                        {settingsForm.adminBankAccountNumber}
                                      </div>
                                      <div>
                                        <span className="text-zinc-500 font-semibold">IFSC Code:</span>{' '}
                                        {settingsForm.adminBankIfscCode}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-zinc-500 italic pt-1">No platform bank details configured in admin settings.</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <PaginationBar
        total={filtered.length}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  );
}
