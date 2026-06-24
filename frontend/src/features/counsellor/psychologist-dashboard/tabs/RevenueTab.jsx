import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, CreditCard, Download, TrendingUp, DollarSign, Calendar, 
  Users, Filter, BookOpen, AlertCircle, ArrowUpRight, FileText, 
  Building, CheckCircle, Wallet
} from 'lucide-react';
import ApiService from '../../../../shared/services/api';
import { formatDateString } from '../../../../shared/utils/dateFormatter';
import { generateReceiptPDFDoc } from '../../../student/student-profile/utils';
import toast from 'react-hot-toast';

export default function RevenueTab(props) {
  const {
    bookings = [],
    profile = {},
    downloadDiagnosticPDF
  } = props;

  const [splitPercent, setSplitPercent] = useState(() => {
    try {
      const stored = localStorage.getItem('behold_site_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.counsellorSplitPercent !== undefined) {
          return Number(parsed.counsellorSplitPercent);
        }
      }
    } catch (e) {
      console.error("Error reading initial split percent", e);
    }
    return 50;
  });

  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    let active = true;
    const fetchLatestSettings = async () => {
      try {
        const res = await ApiService.getSettings();
        if (res.success && res.data && active) {
          const fetchedPercent = res.data.counsellorSplitPercent !== undefined
            ? Number(res.data.counsellorSplitPercent)
            : 50;
          setSplitPercent(fetchedPercent);
          localStorage.setItem('behold_site_settings', JSON.stringify(res.data));
        }
      } catch (err) {
        console.error("Failed to fetch settings in RevenueTab", err);
      } finally {
        if (active) setIsLoadingSettings(false);
      }
    };
    fetchLatestSettings();
    return () => {
      active = false;
    };
  }, []);

  // Main Calculations
  const metrics = useMemo(() => {
    let grossEarnings = 0;      // Total client payments for paid, completed sessions (net of refunds)
    let netPayoutEarned = 0;    // Payout share for completed paid sessions
    let completedPaidCount = 0;  // Count of paid completed sessions
    let pendingPayouts = 0;     // Payout share for booked sessions (CONFIRMED/APPROVED/PENDING) that are PAID but not completed yet
    let pendingPaidCount = 0;

    bookings.forEach(b => {
      const amount = Number(b.amountPaid) || 0;
      if (b.refundStatus === 'REFUNDED') {
        return; // Ignore refunded sessions
      }

      if (b.paymentStatus === 'PAID') {
        const payoutShare = amount * (splitPercent / 100);

        if (b.status === 'COMPLETED' || b.status === 'EXPIRED') {
          grossEarnings += amount;
          netPayoutEarned += payoutShare;
          completedPaidCount++;
        } else if (b.status === 'CONFIRMED' || b.status === 'APPROVED' || b.status === 'PENDING') {
          pendingPayouts += payoutShare;
          pendingPaidCount++;
        }
      }
    });

    return {
      grossEarnings,
      netPayoutEarned,
      completedPaidCount,
      pendingPayouts,
      pendingPaidCount,
      totalEarnedSessionCount: completedPaidCount
    };
  }, [bookings, splitPercent]);

  // Chart data calculations (Monthly SVG-based chart showing net payout earnings)
  const monthlyChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(m => ({ month: m, payout: 0, gross: 0 }));

    bookings.forEach(b => {
      if (b.paymentStatus === 'PAID' && b.refundStatus !== 'REFUNDED' && b.date) {
        const parts = b.date.split('-');
        if (parts.length === 3) {
          const monthIndex = parseInt(parts[1]) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            const val = Number(b.amountPaid) || 0;
            const payoutShare = val * (splitPercent / 100);
            data[monthIndex].payout += payoutShare;
            data[monthIndex].gross += val;
          }
        }
      }
    });

    // Find max value to scale the SVG chart
    const maxVal = Math.max(...data.map(d => d.gross), 1000);
    return { data, maxVal };
  }, [bookings, splitPercent]);

  // Filtering
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const studentName = b.userName || b.studentName || '';
      const matchesSearch = 
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.id && b.id.toString().includes(searchQuery));

      const matchesService = 
        serviceFilter === 'ALL' || 
        b.service === serviceFilter;

      const matchesPaymentStatus = 
        paymentStatusFilter === 'ALL' || 
        (paymentStatusFilter === 'REFUNDED' && b.refundStatus === 'REFUNDED') ||
        (paymentStatusFilter === 'PAID' && b.paymentStatus === 'PAID' && b.refundStatus !== 'REFUNDED') ||
        (paymentStatusFilter === 'PENDING' && b.paymentStatus === 'PENDING');

      return matchesSearch && matchesService && matchesPaymentStatus;
    });
  }, [bookings, searchQuery, serviceFilter, paymentStatusFilter]);

  // Pagination
  const pagedBookings = useMemo(() => {
    return filteredBookings.slice((page - 1) * limit, page * limit);
  }, [filteredBookings, page, limit]);

  const handleDownloadReceipt = async (booking) => {
    try {
      const amountPaid = Number(booking.amountPaid) || 1200;
      const appliedDiscount = Number(booking.appliedDiscount) || 0;
      const totalBeforeDiscount = amountPaid + appliedDiscount;
      
      const siteSettings = JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
      const gstEnabled = siteSettings.gstEnabled === true;
      const gstPercent = typeof siteSettings.gstPercent === 'number' ? siteSettings.gstPercent : 0;

      let baseFeeVal = totalBeforeDiscount;
      let gstAmountVal = 0;
      if (gstEnabled && gstPercent > 0) {
        baseFeeVal = Math.round(totalBeforeDiscount / (1 + gstPercent / 100));
        gstAmountVal = totalBeforeDiscount - baseFeeVal;
      }

      const details = {
        id: booking.id,
        service: booking.service === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring',
        mode: booking.mode === 'ONLINE' ? 'Video Call' : booking.mode === 'DOOR_STEP' ? 'Home Visit' : 'At Center',
        advisorName: booking.advisorName || profile.name || 'Counsellor',
        advisorRole: profile.role || 'Consultant Psychologist',
        date: booking.date,
        time: booking.time,
        clientName: booking.userName || 'Student',
        clientEmail: booking.userEmail || '',
        clientPhone: booking.userPhone || '',
        meetLink: booking.meetLink || null,
        amount: amountPaid,
        baseFee: baseFeeVal,
        gstPercent: gstEnabled ? gstPercent : 0,
        gstAmount: gstAmountVal,
        appliedDiscount: appliedDiscount
      };

      await generateReceiptPDFDoc(details, (msg) => toast.error(msg));
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF receipt');
    }
  };

  const shadowStyle = {
    background: '#18181b', // zinc-900
    border: '1px solid #27272a', // zinc-800
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.4), 0 6px 20px -6px rgba(0,0,0,0.6)'
  };

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / limit));
  const safeCurrentPage = Math.min(page, totalPages);
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const from = filteredBookings.length === 0 ? 0 : (safeCurrentPage - 1) * limit + 1;
  const to = Math.min(safeCurrentPage * limit, filteredBookings.length);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-sm text-left">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold capitalize text-white font-header">Revenue Console</h3>
          <p className="text-xs text-zinc-500 font-medium pt-1">Track your consultant earnings, service volume metrics, and check linked bank routing accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-450 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-brand" />
            My Earnings Share: {splitPercent}% Payout
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Net Payout Earned</span>
            <DollarSign className="w-4 h-4 text-brand" />
          </div>
          <div className="text-2xl font-bold text-brand font-header">
            ₹{Math.round(metrics.netPayoutEarned).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">Your absolute net share ({splitPercent}%) from completed bookings</p>
        </div>

        {/* Card 2 */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Session Billings</span>
            <TrendingUp className="w-4 h-4 text-emerald-450" />
          </div>
          <div className="text-2xl font-bold text-white font-header">
            ₹{metrics.grossEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">Total student payment volume for completed sessions</p>
        </div>

        {/* Card 3 */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Sessions Conducted</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-header">
            {metrics.completedPaidCount} Sessions
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">Completed and settled consultations</p>
        </div>

        {/* Card 4 */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Payouts</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-550 font-header">
            ₹{Math.round(metrics.pendingPayouts).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">{metrics.pendingPaidCount} booked sessions (Paid, pending completion)</p>
        </div>
      </div>

      {/* Monthly Chart and Bank Routing Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Chart */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl shadow-lg lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Monthly Earnings Trend</h4>
            <span className="text-[11px] text-zinc-500">Net payout share (INR)</span>
          </div>

          <div className="relative h-48 w-full pt-4">
            {/* Gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-t border-dashed border-zinc-800/60 text-[10px] text-zinc-600 pt-0.5 font-bold">
                ₹{Math.round(monthlyChartData.maxVal * (splitPercent / 100)).toLocaleString('en-IN')}
              </div>
              <div className="w-full border-t border-dashed border-zinc-800/60 text-[10px] text-zinc-600 pt-0.5 font-bold">
                ₹{Math.round(monthlyChartData.maxVal * (splitPercent / 100) / 2).toLocaleString('en-IN')}
              </div>
              <div className="w-full border-t border-dashed border-zinc-800/60 text-[10px] text-zinc-600 pt-0.5 font-bold">₹0</div>
            </div>
            
            {/* SVG Columns */}
            <div className="absolute inset-0 flex items-end justify-between px-2 pt-4">
              {monthlyChartData.data.map((d, i) => {
                const maxPayout = monthlyChartData.maxVal * (splitPercent / 100);
                const payoutHeight = d.payout > 0 ? (d.payout / maxPayout) * 100 : 0;
                const grossHeight = d.gross > 0 ? (d.gross / monthlyChartData.maxVal) * 100 : 0;
                
                return (
                  <div key={i} className="flex flex-col items-center flex-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-zinc-955 border border-zinc-800 rounded px-2.5 py-1 text-[10px] text-zinc-300 opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none z-20 whitespace-nowrap shadow-md">
                      <div>Gross Bookings: ₹{Math.round(d.gross)}</div>
                      <div className="text-brand font-bold">Your Share: ₹{Math.round(d.payout)}</div>
                    </div>
                    {/* Visual Bar representation */}
                    <div className="w-6 bg-zinc-850 border border-zinc-800 rounded-t relative overflow-hidden transition-all duration-300 hover:bg-zinc-800" style={{ height: `${Math.max(grossHeight, 2)}%` }}>
                      <div className="absolute bottom-0 inset-x-0 bg-brand rounded-t transition-all duration-300" style={{ height: `${payoutHeight}%` }} />
                    </div>
                    <span className="text-[10px] text-zinc-550 font-bold mt-2">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bank Routing details */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-2 border-b border-zinc-800/60 flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-header flex items-center gap-1.5">
                <Building className="w-4 h-4 text-zinc-500" />
                Payout Account
              </h4>
              {profile.razorpayAccountId ? (
                <span className="text-[10px] bg-emerald-955/30 border border-emerald-900/40 text-emerald-450 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Linked
                </span>
              ) : (
                <span className="text-[10px] bg-amber-955/30 border border-amber-900/40 text-amber-500 font-bold px-2 py-0.5 rounded">
                  Pending Link
                </span>
              )}
            </div>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Razorpay Merchant Account ID</span>
                <span className="text-xs font-mono font-semibold text-white">
                  {profile.razorpayAccountId && profile.razorpayAccountId.trim() 
                    ? profile.razorpayAccountId 
                    : <span className="text-zinc-600 italic">Not Configuration Keyed</span>
                  }
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Bank Account Holder</span>
                <span className="text-xs font-semibold text-white capitalize">
                  {profile.bankAccountName && profile.bankAccountName.trim() 
                    ? profile.bankAccountName 
                    : <span className="text-zinc-600 italic">Not set</span>
                  }
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Account Routing Number</span>
                <span className="text-xs font-mono font-semibold text-white">
                  {profile.bankAccountNumber && profile.bankAccountNumber.trim() 
                    ? (() => {
                        const num = profile.bankAccountNumber.trim();
                        if (num.length <= 4) return num;
                        return `•••• •••• •••• ${num.substring(num.length - 4)}`;
                      })() 
                    : <span className="text-zinc-600 italic">Not set</span>
                  }
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">IFSC Bank Code</span>
                <span className="text-xs font-mono font-semibold text-white uppercase">
                  {profile.bankIfscCode && profile.bankIfscCode.trim() 
                    ? profile.bankIfscCode 
                    : <span className="text-zinc-600 italic">Not set</span>
                  }
                </span>
              </div>
            </div>
          </div>

          {!profile.razorpayAccountId && (
            <div className="p-3 bg-amber-955/20 border border-amber-900/30 rounded-lg text-[11px] text-amber-300 font-semibold leading-normal">
              ⚠️ Payout Account Unlinked: Please complete your routing bank details in your Profile Tab to receive automated slot transfers.
            </div>
          )}
        </div>
      </div>

      {/* Audit ledger filter bar */}
      <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/60 pb-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-header">
            <Filter className="w-4 h-4 text-zinc-500" /> Professional Earnings Ledger
          </h4>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-[200px]">
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-semibold focus:border-brand text-white outline-none"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2" />
            </div>

            {/* Service Filter */}
            <select
              value={serviceFilter}
              onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
              className="bg-zinc-955 border border-zinc-800 rounded-lg text-xs font-semibold px-2.5 py-1.5 text-white outline-none cursor-pointer"
            >
              <option value="ALL">All Services</option>
              <option value="counselling">Psychological Sessions</option>
              <option value="mentoring">Career Sessions</option>
            </select>

            {/* Status Filter */}
            <select
              value={paymentStatusFilter}
              onChange={(e) => { setPaymentStatusFilter(e.target.value); setPage(1); }}
              className="bg-zinc-955 border border-zinc-800 rounded-lg text-xs font-semibold px-2.5 py-1.5 text-white outline-none cursor-pointer"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-zinc-900/60 text-zinc-400 font-bold border-b border-zinc-800 text-left uppercase">
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Session Date</th>
                  <th className="p-3">Session Mode</th>
                  <th className="p-3 text-right">Gross Paid</th>
                  <th className="p-3 text-right font-bold text-brand">My Share ({splitPercent}%)</th>
                  <th className="p-3 text-center">Payment Status</th>
                  <th className="p-3 text-center">Clinical Record</th>
                  <th className="p-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-zinc-500 italic">
                      No consultations registered on this account yet.
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-zinc-500 italic">
                      No matching transaction entries found in the ledger.
                    </td>
                  </tr>
                ) : (
                  pagedBookings.map((b) => {
                    const gross = Number(b.amountPaid) || 0;
                    const myPayout = gross * (splitPercent / 100);
                    const isRefunded = b.refundStatus === 'REFUNDED';
                    const isCompleted = b.status === 'COMPLETED' || b.status === 'EXPIRED';

                    return (
                      <tr key={b.id} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors">
                        <td className="p-3 font-mono font-semibold">SB-{b.id}</td>
                        <td className="p-3 font-bold text-white">{b.userName || b.studentName || 'Student'}</td>
                        <td className="p-3 text-zinc-350">{formatDateString(b.date)} at {b.time}</td>
                        <td className="p-3">
                          <span className="text-xs bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded font-semibold uppercase">
                            {b.mode}
                          </span>
                        </td>
                        <td className="p-3 text-right font-semibold text-zinc-450">₹{gross}</td>
                        <td className="p-3 text-right font-bold text-emerald-450">₹{Math.round(myPayout)}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold capitalize border ${
                            isRefunded
                              ? 'bg-rose-955/30 border-rose-900/40 text-rose-455'
                              : b.paymentStatus === 'PAID'
                                ? 'bg-emerald-955/30 border-emerald-900/40 text-emerald-400'
                                : 'bg-yellow-955/30 border-yellow-900/40 text-yellow-450'
                          }`}>
                            {isRefunded ? 'Refunded' : b.paymentStatus || 'Pending'}
                          </span>
                        </td>
                        
                        {/* Clinical assessment report download */}
                        <td className="p-3 text-center">
                          {isCompleted ? (
                            <button
                              onClick={() => downloadDiagnosticPDF(b)}
                              className="p-1 text-zinc-450 hover:text-white rounded hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
                              title="Download Diagnostic Report"
                            >
                              <FileText className="w-3.5 h-3.5 text-zinc-400 hover:text-brand" />
                            </button>
                          ) : (
                            <span className="text-zinc-600 italic text-[11px]">-</span>
                          )}
                        </td>

                        {/* Payment Receipt PDF download */}
                        <td className="p-3 text-center">
                          {b.paymentStatus === 'PAID' && !isRefunded ? (
                            <button
                              onClick={() => handleDownloadReceipt(b)}
                              className="p-1 text-zinc-450 hover:text-white rounded hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
                              title="Download Payment Receipt"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-zinc-600 italic text-[11px]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Dark Theme Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 px-1 border-t border-zinc-800 mt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">
              Showing <span className="text-zinc-300 font-bold">{from}–{to}</span> of <span className="text-zinc-300 font-bold">{filteredBookings.length}</span> entries
            </span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="ml-2 bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-lg px-2 py-1 cursor-pointer outline-none focus:border-brand"
            >
              {[5, 10, 25, 50].map(n => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Prev
            </button>
            {getPageNumbers().map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-7 h-7 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  n === safeCurrentPage
                    ? 'bg-brand border-brand text-zinc-955'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
