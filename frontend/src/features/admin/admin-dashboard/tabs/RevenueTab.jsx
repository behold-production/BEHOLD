import React, { useState, useMemo } from 'react';
import { Search, CreditCard, Download, TrendingUp, DollarSign, Calendar, Users, Filter, BookOpen, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { SkeletonTableRows, PaginationBar } from '../components/SharedAdminUI';
import { formatDateString } from '../utils';

const formatAmount = (num) => {
 const val = Number(num) || 0;
 return Number(val.toFixed(2)).toLocaleString('en-IN', {
 minimumFractionDigits: 0,
 maximumFractionDigits: 2
 });
};

export default function RevenueTab(props) {
 const {
 bookingsDb,
 usersDb,
 settingsForm,
 downloadPDFReceipt,
 isDbLoading
 } = props;

 const [searchQuery, setSearchQuery] = useState('');
 const [counsellorFilter, setCounsellorFilter] = useState('ALL');
 const [serviceFilter, setServiceFilter] = useState('ALL');
 const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(10);

 // List of counsellors for dropdown filter
 const counsellors = useMemo(() => {
 const list = usersDb.filter(u => u.role === 'PSYCHOLOGIST');
 return list;
 }, [usersDb]);

 // Settings commission split percentage
 const splitPercent = useMemo(() => {
 return settingsForm.counsellorSplitPercent !== undefined ? Number(settingsForm.counsellorSplitPercent) : 50;
 }, [settingsForm]);

 // Main Calculations
 const metrics = useMemo(() => {
 let grossVolume = 0;
 let retentionVolume = 0; // Platform share
 let payoutVolume = 0; // Counsellor share
 let refundedVolume = 0;
 let completedCount = 0;
 let activePaidCount = 0;

 bookingsDb.forEach(b => {
 const amount = Number(b.amountPaid) || 0;
 if (b.refundStatus === 'REFUNDED') {
 refundedVolume += amount;
 } else if (b.paymentStatus === 'PAID') {
 grossVolume += amount;
 
 // Calculate shares
 const pShare = amount * ((100 - splitPercent) / 100);
 const cShare = amount * (splitPercent / 100);
 retentionVolume += pShare;
 payoutVolume += cShare;

 if (b.status === 'COMPLETED') {
 completedCount++;
 } else {
 activePaidCount++;
 }
 }
 });

 return {
 grossVolume,
 retentionVolume,
 payoutVolume,
 refundedVolume,
 completedCount,
 activePaidCount,
 totalPaidBookings: completedCount + activePaidCount
 };
 }, [bookingsDb, splitPercent]);

 // Chart data calculations (Monthly SVG-based charts)
 const monthlyChartData = useMemo(() => {
 const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
 const data = months.map(m => ({ month: m, amount: 0, platform: 0 }));

 bookingsDb.forEach(b => {
 if (b.paymentStatus === 'PAID' && b.refundStatus !== 'REFUNDED' && b.date) {
 // Simple month parsing from date format "YYYY-MM-DD"
 const parts = b.date.split('-');
 if (parts.length === 3) {
 const monthIndex = parseInt(parts[1]) - 1;
 if (monthIndex >= 0 && monthIndex < 12) {
 const val = Number(b.amountPaid) || 0;
 data[monthIndex].amount += val;
 data[monthIndex].platform += val * ((100 - splitPercent) / 100);
 }
 }
 }
 });

 // Find max value to scale the SVG chart
 const maxVal = Math.max(...data.map(d => d.amount), 1000);
 return { data, maxVal };
 }, [bookingsDb, splitPercent]);

 // Filtering
 const filteredBookings = useMemo(() => {
 return bookingsDb.filter(b => {
 const studentName = b.studentName || b.userName || '';
 const advisorName = b.counsellorName || b.advisorName || '';
 const matchesSearch = 
 studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 advisorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (b.id && b.id.toString().includes(searchQuery));

 const matchesCounsellor = 
 counsellorFilter === 'ALL' || 
 b.counsellorId === counsellorFilter || 
 b.advisorId === counsellorFilter;

 const matchesService = 
 serviceFilter === 'ALL' || 
 b.service === serviceFilter;

 const matchesPaymentStatus = 
 paymentStatusFilter === 'ALL' || 
 b.paymentStatus === paymentStatusFilter ||
 (paymentStatusFilter === 'REFUNDED' && b.refundStatus === 'REFUNDED');

 return matchesSearch && matchesCounsellor && matchesService && matchesPaymentStatus;
 });
 }, [bookingsDb, searchQuery, counsellorFilter, serviceFilter, paymentStatusFilter]);

 // Pagination
 const pagedBookings = useMemo(() => {
 return filteredBookings.slice((page - 1) * limit, page * limit);
 }, [filteredBookings, page, limit]);

 return (
 <div className="space-y-6 animate-in fade-in duration-200 text-sm text-left">
 {/* Header */}
 <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <h3 className="text-sm font-bold text-white font-header">Revenue Operations Control</h3>
 <p className="text-xs text-zinc-500 font-medium pt-1">Auditing transactions, payout configurations, service fee commissions, and refunds ledger</p>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-1 rounded font-bold">
 Platform Split: {100 - splitPercent}% Retention / {splitPercent}% Payout
 </span>
 </div>
 </div>

 {/* Metrics Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {/* Card 1 */}
 <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl space-y-2 shadow-lg">
 <div className="flex justify-between items-center text-zinc-500">
 <span className="text-xs font-bold tracking-wider">Gross Platform Volume</span>
 <DollarSign className="w-4 h-4 text-emerald-450" />
 </div>
 <div className="text-2xl font-bold text-white font-header">
 ₹{formatAmount(metrics.grossVolume)}
 </div>
 <p className="text-[11px] text-zinc-500 font-medium">All settled client payments (net of refunds)</p>
 </div>

 {/* Card 2 */}
 <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl space-y-2 shadow-lg">
 <div className="flex justify-between items-center text-zinc-500">
 <span className="text-xs font-bold tracking-wider">Platform Retention (Net Fee)</span>
 <TrendingUp className="w-4 h-4 text-brand" />
 </div>
 <div className="text-2xl font-bold text-brand font-header">
 ₹{formatAmount(metrics.retentionVolume)}
 </div>
 <p className="text-[11px] text-zinc-500 font-medium">Platform commission earnings ({100 - splitPercent}%)</p>
 </div>

 {/* Card 3 */}
 <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl space-y-2 shadow-lg">
 <div className="flex justify-between items-center text-zinc-500">
 <span className="text-xs font-bold tracking-wider">Counsellor Payouts Volume</span>
 <Users className="w-4 h-4 text-indigo-400" />
 </div>
 <div className="text-2xl font-bold text-white font-header">
 ₹{formatAmount(metrics.payoutVolume)}
 </div>
 <p className="text-[11px] text-zinc-500 font-medium">Routed directly to consultant accounts ({splitPercent}%)</p>
 </div>

 {/* Card 4 */}
 <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl space-y-2 shadow-lg">
 <div className="flex justify-between items-center text-zinc-500">
 <span className="text-xs font-bold tracking-wider">Total Refunds Paid</span>
 <AlertCircle className="w-4 h-4 text-rose-500" />
 </div>
 <div className="text-2xl font-bold text-rose-500 font-header">
 ₹{formatAmount(metrics.refundedVolume)}
 </div>
 <p className="text-[11px] text-zinc-500 font-medium">Cancelled bookings returned to client banks</p>
 </div>
 </div>

 {/* Monthly Chart and Analytics Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* SVG Chart */}
 <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl shadow-lg lg:col-span-2 space-y-4">
 <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
 <h4 className="text-xs font-bold text-white tracking-wider">Monthly Revenue Trend</h4>
 <span className="text-[11px] text-zinc-500">Gross volume vs Platform Retention (Teal)</span>
 </div>

 <div className="relative h-48 w-full pt-4">
 <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
 <div className="w-full border-t border-dashed border-zinc-800 text-[10px] text-zinc-600 pt-0.5 font-bold">₹{formatAmount(monthlyChartData.maxVal)}</div>
 <div className="w-full border-t border-dashed border-zinc-800 text-[10px] text-zinc-600 pt-0.5 font-bold">₹{formatAmount(monthlyChartData.maxVal / 2)}</div>
 <div className="w-full border-t border-dashed border-zinc-800 text-[10px] text-zinc-600 pt-0.5 font-bold">₹0</div>
 </div>
 
 <div className="absolute inset-0 flex items-end justify-between px-2 pt-4">
 {monthlyChartData.data.map((d, i) => {
 const totalHeight = d.amount > 0 ? (d.amount / monthlyChartData.maxVal) * 100 : 0;
 const platformHeight = d.platform > 0 ? (d.platform / monthlyChartData.maxVal) * 100 : 0;
 return (
 <div key={i} className="flex flex-col items-center flex-1 group relative">
 {/* Tooltip */}
 <div className="absolute bottom-full mb-2 bg-zinc-955 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-300 opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none z-20 whitespace-nowrap shadow-md">
 <div>Gross: ₹{formatAmount(d.amount)}</div>
 <div className="text-brand">Platform: ₹{formatAmount(d.platform)}</div>
 </div>
 {/* Visual columns */}
 <div className="w-6 bg-zinc-850 border border-zinc-800 rounded-t relative overflow-hidden transition-all duration-300 hover:bg-zinc-700" style={{ height: `${Math.max(totalHeight, 2)}%` }}>
 <div className="absolute bottom-0 inset-x-0 bg-brand rounded-t transition-all duration-300" style={{ height: `${platformHeight}%` }} />
 </div>
 <span className="text-[10px] text-zinc-550 font-bold mt-2">{d.month}</span>
 </div>
 );
 })}
 </div>
 </div>
 </div>

 {/* distribution summary */}
 <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl shadow-lg space-y-4">
 <div className="pb-2 border-b border-zinc-800/60">
 <h4 className="text-xs font-bold text-white tracking-wider font-header">Platform Summary</h4>
 </div>

 <div className="space-y-4 pt-2">
 <div className="flex justify-between items-center text-xs pb-2 border-b border-zinc-800/40">
 <span className="text-zinc-500 font-bold ">Total Bookings Count</span>
 <span className="text-white font-bold">{bookingsDb.length}</span>
 </div>
 <div className="flex justify-between items-center text-xs pb-2 border-b border-zinc-800/40">
 <span className="text-zinc-500 font-bold ">Completed & Paid</span>
 <span className="text-white font-bold">{metrics.totalPaidBookings}</span>
 </div>
 <div className="flex justify-between items-center text-xs pb-2 border-b border-zinc-800/40">
 <span className="text-zinc-500 font-bold ">Average Order Value</span>
 <span className="text-white font-bold">₹{metrics.totalPaidBookings > 0 ? Math.round(metrics.grossVolume / metrics.totalPaidBookings) : 0}</span>
 </div>
 <div className="flex justify-between items-center text-xs">
 <span className="text-zinc-500 font-bold ">Active Pending Bookings</span>
 <span className="text-white font-bold">{bookingsDb.filter(b => b.status === 'PENDING').length}</span>
 </div>
 </div>
 </div>
 </div>

 {/* Counsellor breakdown matrix */}
 <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl shadow-lg space-y-4">
 <div className="pb-2 border-b border-zinc-800/60 flex items-center justify-between">
 <h4 className="text-xs font-bold text-white tracking-wider">Counsellors Ledger & Account Routing</h4>
 </div>

 <div className="overflow-x-auto w-full">
 <table className="w-full text-xs text-left border-collapse">
 <thead>
 <tr className="bg-zinc-950 text-zinc-500 border-b border-zinc-800 font-bold ">
 <th className="p-3">Counsellor</th>
 <th className="p-3 text-center">Sessions</th>
 <th className="p-3 text-right">Gross Earned</th>
 <th className="p-3 text-right">Retained Commission</th>
 <th className="p-3 text-right font-bold text-brand">Payout Share</th>
 <th className="p-3 text-center">Razorpay Account ID</th>
 </tr>
 </thead>
 <tbody>
 {counsellors.map((c) => {
 const cBookings = bookingsDb.filter(b => b.counsellorId === c.id || b.advisorId === c.id);
 const paidBookings = cBookings.filter(b => b.paymentStatus === 'PAID' && b.refundStatus !== 'REFUNDED');
 const gross = paidBookings.reduce((sum, b) => sum + (Number(b.amountPaid) || 0), 0);
 const payout = gross * (splitPercent / 100);
 const ret = gross * ((100 - splitPercent) / 100);

 return (
 <tr key={c.id} className="border-b border-zinc-850 hover:bg-zinc-950/40 transition-colors">
 <td className="p-3 font-semibold text-white">{c.name || 'Counsellor'}</td>
 <td className="p-3 text-center text-zinc-300 font-bold">{paidBookings.length}</td>
 <td className="p-3 text-right text-zinc-455 font-semibold">₹{formatAmount(gross)}</td>
 <td className="p-3 text-right text-zinc-455 font-semibold">₹{formatAmount(ret)}</td>
 <td className="p-3 text-right font-bold text-emerald-450">₹{formatAmount(payout)}</td>
 <td className="p-3 text-center font-mono text-[11px]">
 {c.razorpayAccountId && c.razorpayAccountId.trim() ? (
 <span className="text-brand font-semibold">{c.razorpayAccountId}</span>
 ) : (
 <span className="text-zinc-600 italic">Not Linked (Manual routing required)</span>
 )}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>

 {/* Audit ledger filter bar */}
 <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl space-y-4 shadow-lg">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/60 pb-3">
 <h4 className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5 font-header">
 <Filter className="w-4 h-4 text-zinc-500" /> Payment & Transaction Ledger
 </h4>

 <div className="flex flex-wrap items-center gap-2">
 <div className="relative w-full sm:max-w-[200px]">
 <input
 type="text"
 placeholder="Search ledger..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-semibold focus:border-brand text-white outline-none"
 />
 <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2" />
 </div>

 <select
 value={counsellorFilter}
 onChange={(e) => setCounsellorFilter(e.target.value)}
 className="bg-zinc-955 border border-zinc-800 rounded-lg text-xs font-semibold px-2 py-1.5 text-white outline-none cursor-pointer"
 >
 <option value="ALL">All Counsellors</option>
 {counsellors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
 </select>

 <select
 value={serviceFilter}
 onChange={(e) => setServiceFilter(e.target.value)}
 className="bg-zinc-955 border border-zinc-800 rounded-lg text-xs font-semibold px-2 py-1.5 text-white outline-none cursor-pointer"
 >
 <option value="ALL">All Services</option>
 <option value="counselling">Counselling</option>
 <option value="mentoring">Mentoring</option>
 </select>

 <select
 value={paymentStatusFilter}
 onChange={(e) => setPaymentStatusFilter(e.target.value)}
 className="bg-zinc-955 border border-zinc-800 rounded-lg text-xs font-semibold px-2 py-1.5 text-white outline-none cursor-pointer"
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
 <table className="w-full text-xs border-collapse min-w-[900px]">
 <thead>
 <tr className="bg-zinc-900 text-zinc-400 font-bold border-b border-zinc-800 text-left ">
 <th className="p-3">Ref ID</th>
 <th className="p-3">Student Name</th>
 <th className="p-3">Counsellor</th>
 <th className="p-3">Session Date</th>
 <th className="p-3 text-right">Gross Paid</th>
 <th className="p-3 text-right">Commission ({100 - splitPercent}%)</th>
 <th className="p-3 text-right font-bold text-brand">Payout ({splitPercent}%)</th>
 <th className="p-3 text-center">Payment Status</th>
 <th className="p-3 text-center">Receipt</th>
 </tr>
 </thead>
 <tbody>
 {isDbLoading ? (
 <SkeletonTableRows cols={9} />
 ) : pagedBookings.length === 0 ? (
 <tr>
 <td colSpan={9} className="p-8 text-center text-zinc-500 italic">
 No matching transaction entries found in the ledger.
 </td>
 </tr>
 ) : (
 pagedBookings.map((b) => {
 const gross = Number(b.amountPaid) || 0;
 const commission = gross * ((100 - splitPercent) / 100);
 const payout = gross * (splitPercent / 100);
 const isRefunded = b.refundStatus === 'REFUNDED';

 return (
 <tr key={b.id} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors">
 <td className="p-3 font-mono font-semibold">SB-{b.id}</td>
 <td className="p-3 font-bold text-white">{b.userName || b.studentName || 'Student'}</td>
 <td className="p-3 text-zinc-400 font-medium">{b.advisorName || b.counsellorName || 'Counsellor'}</td>
 <td className="p-3 text-zinc-350">{formatDateString(b.date)} at {b.time}</td>
 <td className="p-3 text-right font-bold text-white">₹{formatAmount(gross)}</td>
 <td className="p-3 text-right text-zinc-500">₹{formatAmount(commission)}</td>
 <td className="p-3 text-right font-bold text-emerald-450">₹{formatAmount(payout)}</td>
 <td className="p-3 text-center">
 <div className="flex flex-col items-center gap-1">
 <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
 isRefunded
 ? 'bg-rose-955/30 border border-rose-900/40 text-rose-400'
 : b.paymentStatus === 'PAID'
 ? 'bg-emerald-955/30 border border-emerald-900/40 text-emerald-400'
 : 'bg-yellow-955/30 border border-yellow-900/40 text-yellow-450'
 }`}>
 {isRefunded ? 'Refunded' : b.paymentStatus || 'Pending'}
 </span>
 {b.razorpaySplitError && (
 <span className="text-[9px] text-rose-450 font-semibold bg-rose-955/10 border border-rose-900/20 px-1 py-0.2 rounded" title={b.razorpaySplitError}>
 ⚠️ Split Failed
 </span>
 )}
 </div>
 </td>
 <td className="p-3 text-center">
 <button
 onClick={() => downloadPDFReceipt(b)}
 className="p-1 text-zinc-450 hover:text-white rounded hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
 title="Download PDF Receipt"
 >
 <Download className="w-3.5 h-3.5" />
 </button>
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Pagination */}
 <PaginationBar
 total={filteredBookings.length}
 page={page}
 limit={limit}
 onPageChange={setPage}
 onLimitChange={setLimit}
 />
 </div>
 </div>
 );
}
