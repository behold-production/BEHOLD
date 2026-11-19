import React from 'react';
import { MapPin, CheckCircle2, X, Globe, Building2 } from 'lucide-react';

export const LOCATIONS = [
  { id: 'kochi', name: 'Kochi, Kerala', label: 'Main Center • In-Person & Doorstep', type: 'hub' },
  { id: 'calicut', name: 'Calicut, Kerala', label: 'Partner Center • In-Person & Doorstep', type: 'partner' },
  { id: 'trivandrum', name: 'Trivandrum, Kerala', label: 'Consultation Suite • In-Person & Doorstep', type: 'partner' },
  { id: 'bangalore', name: 'Bengaluru, Karnataka', label: 'Metro Wellness Hub • In-Person & Online', type: 'hub' },
  { id: 'online', name: 'Online / Virtual (Worldwide)', label: 'Encrypted Tele-Counselling Worldwide', type: 'online' },
];

export default function MobileLocationModal({ isOpen, onClose, selectedLocation, onSelectLocation }) {
  if (!isOpen) return null;

  const handleSelect = (locName) => {
    try {
      localStorage.setItem('behold_selected_location', locName);
      window.dispatchEvent(new CustomEvent('behold_location_changed', { detail: locName }));
    } catch {}
    if (onSelectLocation) onSelectLocation(locName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs md:hidden animate-fade-in">
      <div
        className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl animate-slide-up border-t border-slate-200"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Select Your Location</h3>
            <p className="text-xs text-slate-500 mt-0.5">Find nearby clinical centers and online sessions</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer border-none"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {LOCATIONS.map((loc) => {
            const isSelected = selectedLocation === loc.name;
            const isOnline = loc.id === 'online';
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleSelect(loc.name)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0E7490]/10 border border-[#0E7490]/30 text-[#0E7490]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                      isSelected
                        ? 'bg-[#0E7490] text-white shadow-xs'
                        : 'bg-white text-slate-500 border border-slate-200'
                    }`}
                  >
                    {isOnline ? (
                      <Globe className="h-5 w-5" />
                    ) : (
                      <MapPin className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <span className={`text-sm block ${isSelected ? 'font-bold text-[#0E7490]' : 'font-semibold text-slate-800'}`}>
                      {loc.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block">{loc.label}</span>
                  </div>
                </div>

                {isSelected && <CheckCircle2 className="h-5 w-5 text-[#0E7490]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
