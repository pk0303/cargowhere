import React, { useState } from 'react';
import { Crosshair, MapPin, Check, Loader2 } from 'lucide-react';
import { SIMULATED_LOCATIONS } from '../data/singaporeCarparks';

interface LocationSelectorProps {
  currentLocationName: string;
  onSelectPreset: (id: string) => void;
  onRequestGps: () => Promise<void>;
  isLocating: boolean;
  gpsActive: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  currentLocationName,
  onSelectPreset,
  onRequestGps,
  isLocating,
  gpsActive,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg dark:bg-slate-800">
        <button
          onClick={onRequestGps}
          disabled={isLocating}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
            gpsActive
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
          }`}
          title="Detect GPS Location in Singapore"
        >
          {isLocating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Crosshair className="h-3.5 w-3.5" />
          )}
          <span>{gpsActive ? 'GPS Active' : 'My Location'}</span>
        </button>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-md dark:text-slate-300 dark:hover:text-white"
        >
          <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="max-w-[140px] truncate">{currentLocationName}</span>
          <span className="text-[10px] text-slate-400">▾</span>
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 dark:border-slate-800 dark:bg-slate-900">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Simulate Singapore Hotspots
            </div>
            <div className="mt-1 space-y-0.5">
              {SIMULATED_LOCATIONS.map((loc) => {
                const isSelected = currentLocationName.includes(loc.label.split('/')[0].trim());
                return (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectPreset(loc.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{loc.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
