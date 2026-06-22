import React from 'react';
import { Clock, AlertCircle, Video } from 'lucide-react';
import { formatDateString } from '../../../../shared/utils/dateFormatter';

const OverviewTab = ({ profile, bookings, isSessionCompleted, setCurrentSection }) => {
  const shadowStyle = {
    background: '#ffffff',
    boxShadow: 'inset 0 0 0 1px rgba(11,20,36,0.05), 0 1px 3px rgba(11,20,36,0.04), 0 6px 20px -6px rgba(11,20,36,0.08)'
  };

  const pendingBookings = bookings.filter(b => (b.status === 'CONFIRMED' || b.status === 'APPROVED' || b.status === 'PENDING') && !isSessionCompleted(b));
  const completedHours = bookings.filter(isSessionCompleted).length + Number(profile.hours || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-sm">
      <div className="border-b border-zinc-200 pb-3 flex justify-between items-center">
        <h3 className="text-sm font-bold capitalize text-zinc-500">Psychology Dashboard Overview</h3>
        <span className="text-sm bg-brand/10 text-brand border border-brand/20 px-2 py-0.5 rounded font-bold capitalize">Active Status</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Next session card */}
        <div 
          className="rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group min-h-[160px] transition-all hover:-translate-y-1"
          style={shadowStyle}
        >
          <div className="space-y-3">
            <span className="text-xs bg-brand/10 text-brand border border-brand/20 px-2 py-0.5 rounded font-bold capitalize">Next Client Session</span>
            {pendingBookings.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                <h4 className="font-header font-bold text-sm text-zinc-900 capitalize">{pendingBookings[0].userName}</h4>
                <p className="text-sm text-zinc-500">Session Type: {pendingBookings[0].service === 'counselling' ? 'Emotional Wellbeing' : 'Career Mapping'}</p>
                <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-700">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{formatDateString(pendingBookings[0].date)} at {pendingBookings[0].time}</span>
                </div>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-sm capitalize font-semibold text-zinc-500">Room Status:</span>
                  {pendingBookings[0].meetLink ? (
                    <span className="text-sm font-bold text-emerald-600 capitalize tracking-wide">Link Set</span>
                  ) : (
                    <span className="text-sm font-bold text-amber-600 flex items-center gap-1 capitalize tracking-wide">
                      <AlertCircle className="w-3 h-3" /> Missing Link
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-zinc-500 text-sm pt-1">No upcoming scheduled bookings.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {pendingBookings.length > 0 && pendingBookings[0].meetLink && pendingBookings[0].mode === 'ONLINE' && (
              <button
                type="button"
                onClick={() => window.open(pendingBookings[0].meetLink, '_blank')}
                className="text-sm font-bold capitalize bg-brand text-zinc-950 hover:bg-brand-dark px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors border-none"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Meet</span>
              </button>
            )}
            <button
              onClick={() => setCurrentSection('bookings')}
              className="text-sm font-bold capitalize bg-zinc-900 text-white hover:bg-zinc-800 px-3.5 py-2 rounded-lg cursor-pointer border-none transition-colors"
            >
              {pendingBookings.length > 0 && !pendingBookings[0].meetLink ? 'Set Meet Link' : 'Manage Bookings'}
            </button>
          </div>
        </div>

        {/* Pricing stats card */}
        <div 
          className="rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[160px] transition-all hover:-translate-y-1"
          style={shadowStyle}
        >
          <div className="space-y-2">
            <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-bold capitalize">Financial Rate Card</span>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between font-bold text-zinc-500">
                <span>Hourly Booking Charge</span>
                <span className="text-zinc-900">₹{profile.price} / Hr</span>
              </div>
              <div className="flex justify-between font-bold text-zinc-500">
                <span>Consultant Credential</span>
                <span className="text-zinc-900 truncate max-w-[150px]">{profile.education}</span>
              </div>
              <div className="flex justify-between font-bold text-zinc-500">
                <span>Language scope</span>
                <span className="text-zinc-900">{profile.lang}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setCurrentSection('profile')}
            className="w-fit text-sm font-bold capitalize bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200 px-4 py-2 rounded-lg mt-4 cursor-pointer transition-colors"
          >
            Edit Profile Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
