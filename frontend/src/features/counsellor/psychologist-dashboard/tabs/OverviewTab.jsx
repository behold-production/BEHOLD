import React from 'react';
import { Clock, AlertCircle, Video } from 'lucide-react';
import { formatDateString } from '../../../../shared/utils/dateFormatter';

const formatAmount = (num) => {
 const val = Number(num) || 0;
 return Number(val.toFixed(2)).toLocaleString('en-IN', {
 minimumFractionDigits: 0,
 maximumFractionDigits: 2
 });
};

const OverviewTab = ({ profile, bookings, isSessionCompleted, setCurrentSection }) => {
 const shadowStyle = {
 background: '#18181b', // zinc-900
 border: '1px solid #27272a', // zinc-800
 boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.4), 0 6px 20px -6px rgba(0,0,0,0.6)'
 };

 const pendingBookings = bookings.filter(b => (b.status === 'CONFIRMED' || b.status === 'APPROVED' || b.status === 'PENDING') && !isSessionCompleted(b));
 const completedHours = bookings.filter(isSessionCompleted).length + Number(profile.hours || 0);

 const siteSettings = JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
 const defaultSplit = siteSettings.counsellorSplitPercent !== undefined ? Number(siteSettings.counsellorSplitPercent) : 50;

 const completedPaidBookings = bookings.filter(b => isSessionCompleted(b) && b.paymentStatus === 'PAID');
 const completedEarnings = completedPaidBookings.reduce((acc, b) => {
 const commPercent = b.commissionPercent !== undefined ? Number(b.commissionPercent) : defaultSplit;
 return acc + (Number(b.amountPaid || 0) * (commPercent / 100));
 }, 0);

 const pendingPaidBookings = bookings.filter(b =>
 (b.status === 'CONFIRMED' || b.status === 'APPROVED' || b.status === 'PENDING') &&
 !isSessionCompleted(b) &&
 b.paymentStatus === 'PAID'
 );
 const pendingPayouts = pendingPaidBookings.reduce((acc, b) => {
 const commPercent = b.commissionPercent !== undefined ? Number(b.commissionPercent) : defaultSplit;
 return acc + (Number(b.amountPaid || 0) * (commPercent / 100));
 }, 0);

 return (
 <div className="space-y-6 animate-in fade-in duration-200 text-sm">
 <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
 <h3 className="text-sm font-bold text-zinc-500 font-header">Psychology Dashboard Overview</h3>
 <span className="text-sm bg-brand/10 text-brand border border-brand/20 px-2 py-0.5 rounded font-bold ">Active Status</span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
 {/* Next session card */}
 <div
 className="rounded-[10px] p-5 relative overflow-hidden flex flex-col justify-between group min-h-[160px] transition-all hover:-translate-y-1"
 style={shadowStyle}
 >
 <div className="space-y-3">
 <span className="text-xs bg-brand/10 text-brand border border-brand/20 px-2 py-0.5 rounded font-bold ">Next Client Session</span>
 {pendingBookings.length > 0 ? (
 <div className="space-y-1.5 pt-1">
 <h4 className="font-header font-bold text-sm text-white ">{pendingBookings[0].userName}</h4>
 <p className="text-sm text-zinc-400">Session Type: {pendingBookings[0].service === 'counselling' ? 'Emotional Wellbeing' : 'Career Mapping'}</p>
 <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-300">
 <Clock className="w-3.5 h-3.5 text-zinc-550" />
 <span>{formatDateString(pendingBookings[0].date)} at {pendingBookings[0].time}</span>
 </div>
 <div className="pt-1 flex items-center gap-2">
 <span className="text-sm font-semibold text-zinc-450">Room Status:</span>
 {pendingBookings[0].meetLink ? (
 <span className="text-sm font-bold text-emerald-400 tracking-wide">Link Set</span>
 ) : (
 <span className="text-sm font-bold text-amber-500 flex items-center gap-1 tracking-wide">
 <AlertCircle className="w-3 h-3" /> Missing Link
 </span>
 )}
 </div>
 </div>
 ) : (
 <p className="text-zinc-500 text-sm pt-1 font-medium">No upcoming scheduled bookings.</p>
 )}
 </div>
 <div className="flex flex-wrap gap-2 mt-4">
 {pendingBookings.length > 0 && pendingBookings[0].meetLink && pendingBookings[0].mode === 'ONLINE' && (
 <button
 type="button"
 onClick={() => window.open(pendingBookings[0].meetLink, '_blank')}
 className="text-sm font-bold bg-brand text-zinc-955 hover:bg-brand-dark px-3.5 py-2 rounded-[10px] cursor-pointer flex items-center gap-1.5 transition-colors border-none"
 >
 <Video className="w-3.5 h-3.5" />
 <span>Join Meet</span>
 </button>
 )}
 <button
 onClick={() => setCurrentSection('bookings')}
 className="text-sm font-bold bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 px-3.5 py-2 rounded-[10px] cursor-pointer transition-colors"
 >
 {pendingBookings.length > 0 && !pendingBookings[0].meetLink ? 'Set Meet Link' : 'Manage Bookings'}
 </button>
 </div>
 </div>

 {/* Pricing stats card */}
 <div
 className="rounded-[10px] p-5 relative overflow-hidden flex flex-col justify-between min-h-[160px] transition-all hover:-translate-y-1"
 style={shadowStyle}
 >
 <div className="space-y-2">
 <span className="text-xs bg-zinc-800/80 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded font-bold ">Financial Rate Card</span>
 <div className="space-y-1.5 pt-2">
 <div className="flex justify-between font-bold text-zinc-400">
 <span>Hourly Booking Charge</span>
 <span className="text-white">₹{profile.price} / Hr</span>
 </div>
 <div className="flex justify-between font-bold text-zinc-400">
 <span>Consultant Credential</span>
 <span className="text-white truncate max-w-[150px]">{profile.education}</span>
 </div>
 <div className="flex justify-between font-bold text-zinc-400">
 <span>Language scope</span>
 <span className="text-white">{profile.lang}</span>
 </div>
 </div>
 </div>
 <button
 onClick={() => setCurrentSection('profile')}
 className="w-fit text-sm font-bold bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 px-4 py-2 rounded-[10px] mt-4 cursor-pointer transition-colors"
 >
 Edit Profile Info
 </button>
 </div>

 {/* Earnings & Revenue split card */}
 <div
 className="rounded-[10px] p-5 relative overflow-hidden flex flex-col justify-between min-h-[160px] transition-all hover:-translate-y-1"
 style={shadowStyle}
 >
 <div className="space-y-2">
 <span className="text-xs bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded font-bold ">Earnings & Payouts (({profile.commissionPercent !== undefined ? profile.commissionPercent : defaultSplit}% Split))</span>
 <div className="space-y-1.5 pt-2">
 <div className="flex justify-between font-bold text-zinc-400">
 <span>Completed Earnings</span>
 <span className="text-emerald-400">₹{formatAmount(completedEarnings)}</span>
 </div>
 <div className="flex justify-between font-bold text-zinc-400">
 <span>Pending Payouts</span>
 <span className="text-amber-500">₹{formatAmount(pendingPayouts)}</span>
 </div>
 <div className="flex justify-between font-bold text-zinc-400 items-center">
                  <span>Payout Mode</span>
                  <span className="text-zinc-500 font-medium text-xs">Internal (Manual)</span>
                </div>
              </div>
 </div>
 {false ? (
 <button
 onClick={() => setCurrentSection('profile')}
 className="w-fit text-sm font-bold bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 px-4 py-2 rounded-[10px] mt-4 cursor-pointer transition-colors"
 >
 Update Payout Account
 </button>
 ) : (
 <button
 onClick={() => setCurrentSection('profile')}
 className="w-fit text-sm font-bold bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 border border-rose-900/50 px-4 py-2 rounded-[10px] mt-4 cursor-pointer transition-colors flex items-center gap-1.5"
 >
 <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
 <span>Configure Account</span>
 </button>
 )}
 </div>
 </div>
 </div>
 );
};

export default OverviewTab;
