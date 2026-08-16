import React, { useState } from 'react';
import { Clock, AlertCircle, Video, Link2, Copy, CheckCheck, ExternalLink, Share2 } from 'lucide-react';
import { formatDateString } from '../../../../utils/dateFormatter';

const formatAmount = (num) => {
    const val = Number(num) || 0;
    if (val % 1 === 0) {
        return val.toLocaleString('en-IN');
    }
    return val.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const OverviewTab = ({ profile, bookings, isSessionCompleted, setCurrentSection }) => {
    const [copied, setCopied] = useState(false);

    const shadowStyle = {
        background: '#18181b', // zinc-900
        border: '1px solid #27272a', // zinc-800
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.4), 0 6px 20px -6px rgba(0,0,0,0.6)'
    };

    const pendingBookings = bookings.filter(b => (b.status === 'CONFIRMED' || b.status === 'APPROVED' || b.status === 'PENDING') && !isSessionCompleted(b));
    const completedHours = bookings.filter(isSessionCompleted).length + Number(profile.hours || 0);

    const siteSettings = JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
    const defaultSplit = siteSettings.counsellorSplitPercent !== undefined ? Number(siteSettings.counsellorSplitPercent) : 50;
    const activeCommissionPercent = profile?.commissionPercent !== undefined ? Number(profile.commissionPercent) : defaultSplit;

    const completedPaidBookings = bookings.filter(b => isSessionCompleted(b) && b.paymentStatus === 'PAID');
    const completedEarnings = completedPaidBookings.reduce((acc, b) => {
        const commPercent = b.commissionPercent !== undefined ? Number(b.commissionPercent) : activeCommissionPercent;
        return acc + (Number(b.amountPaid || 0) * (commPercent / 100));
    }, 0);

    const pendingPaidBookings = bookings.filter(b =>
        (b.status === 'CONFIRMED' || b.status === 'APPROVED' || b.status === 'PENDING') &&
        !isSessionCompleted(b) &&
        b.paymentStatus === 'PAID'
    );
    const pendingPayouts = pendingPaidBookings.reduce((acc, b) => {
        const commPercent = b.commissionPercent !== undefined ? Number(b.commissionPercent) : activeCommissionPercent;
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
                        <span className="text-xs bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded font-bold ">Earnings & Payouts ({activeCommissionPercent}% Share)</span>
                        <div className="space-y-1.5 pt-2">
                            <div className="flex justify-between font-bold text-zinc-400">
                                <span>Completed Earnings</span>
                                <span className="text-emerald-400">₹{formatAmount(completedEarnings)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-zinc-400 items-center">
                                <span>Payout Mode</span>
                                <span className="text-brand font-bold text-xs">Direct Platform Settlement</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <button
                            onClick={() => setCurrentSection('revenue')}
                            className="text-xs font-bold bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 px-3.5 py-2 rounded-[10px] cursor-pointer transition-colors"
                        >
                            View Revenue Ledger
                        </button>
                        <button
                            onClick={() => setCurrentSection('profile')}
                            className="text-xs font-bold bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 px-3.5 py-2 rounded-[10px] cursor-pointer transition-colors"
                        >
                            Bank Details
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Shareable Instagram Bio Link Card ─────────────────────────── */}
            {(() => {
                const counsellorId = profile?._id || profile?.id;
                if (!counsellorId) return null;
                const shareableLink = `${window.location.origin}/advisor/${counsellorId}`;

                const handleCopy = () => {
                    navigator.clipboard.writeText(shareableLink).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }).catch(() => {
                        // Fallback for older browsers
                        const el = document.createElement('textarea');
                        el.value = shareableLink;
                        document.body.appendChild(el);
                        el.select();
                        document.execCommand('copy');
                        document.body.removeChild(el);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    });
                };

                const isMobile = /iPhone|Android/i.test(navigator.userAgent);

                return (
                    <div
                        className="rounded-[10px] p-5 relative overflow-hidden flex flex-col gap-4 transition-all hover:-translate-y-1"
                        style={shadowStyle}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                                <span className="text-xs bg-gradient-to-r from-purple-900/60 to-pink-900/40 border border-purple-700/40 text-purple-300 px-2 py-0.5 rounded font-bold flex items-center gap-1.5 w-fit">
                                    <Share2 className="w-3 h-3" />
                                    Instagram Bio Link
                                </span>
                                <p className="text-zinc-400 text-xs font-semibold mt-1.5">
                                    Share this link in your Instagram bio so clients can book directly.
                                </p>
                            </div>
                            <Link2 className="w-5 h-5 text-zinc-600 shrink-0 mt-0.5" />
                        </div>

                        {/* URL display */}
                        <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800 rounded-[8px] px-3 py-2.5">
                            <span className="flex-1 text-xs font-mono text-zinc-300 truncate select-all" title={shareableLink}>
                                {shareableLink}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={handleCopy}
                                className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-[8px] border transition-all cursor-pointer ${
                                    copied
                                        ? 'bg-emerald-900/40 border-emerald-700/50 text-emerald-400'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white'
                                }`}
                            >
                                {copied ? (
                                    <><CheckCheck className="w-3.5 h-3.5" /> Copied!</>
                                ) : (
                                    <><Copy className="w-3.5 h-3.5" /> Copy Link</>
                                )}
                            </button>

                            <a
                                href={shareableLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-[8px] border bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                            >
                                <ExternalLink className="w-3.5 h-3.5" /> Preview
                            </a>

                            {isMobile ? (
                                <a
                                    href="instagram://"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-[8px] border bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-700/40 text-purple-300 hover:from-purple-800/60 hover:to-pink-800/60 transition-all"
                                >
                                    <Share2 className="w-3.5 h-3.5" /> Open Instagram
                                </a>
                            ) : (
                                <span className="text-[10px] text-zinc-600 font-semibold tracking-wide">
                                    💡 Copy &amp; paste into your Instagram bio → Edit Profile → Website
                                </span>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default OverviewTab;
