import React, { useState } from 'react';
import {
  X,
  Bookmark,
  Navigation,
  Car,
  Clock,
  ShieldCheck,
  Zap,
  TrendingUp,
  Share2,
  Check,
  Calendar,
} from 'lucide-react';
import { SingaporeCarpark, VehicleLotType } from '../types/carpark';
import { getLotAvailabilityForVehicle, getStatusTier, estimateParkingFee } from '../services/carparkService';

interface CarparkDetailModalProps {
  carpark: SingaporeCarpark;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  selectedVehicleType: VehicleLotType;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  onClose,
  isSaved,
  onToggleSave,
  selectedVehicleType,
}) => {
  const [durationMins, setDurationMins] = useState(120); // 2 hours default
  const [copied, setCopied] = useState(false);

  // Calculation for parking rate estimation
  const now = new Date();
  const feeEstimate = estimateParkingFee(carpark, now, durationMins);

  const carStats = carpark.lots.C ? getLotAvailabilityForVehicle(carpark, 'C') : null;
  const motoStats = carpark.lots.Y ? getLotAvailabilityForVehicle(carpark, 'Y') : null;
  const heavyStats = carpark.lots.H ? getLotAvailabilityForVehicle(carpark, 'H') : null;

  const currentStats = getLotAvailabilityForVehicle(carpark, selectedVehicleType);
  const status = getStatusTier(currentStats.available, currentStats.total);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}&travelmode=driving`;
  const wazeUrl = `https://waze.com/ul?ll=${carpark.coordinates.lat},${carpark.coordinates.lng}&navigate=yes`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${carpark.coordinates.lat},${carpark.coordinates.lng}&dirflg=d`;

  const handleShare = () => {
    navigator.clipboard.writeText(
      `${carpark.name} (${carpark.carparkNumber})\nAvailable Lots: ${currentStats.available}/${currentStats.total}\nAddress: ${carpark.address}\nNavigate: ${googleMapsUrl}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-auto dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {carpark.carparkNumber}
              </span>
              <span aria-hidden="true">·</span>
              <span>{carpark.agency}</span>
              <span aria-hidden="true">·</span>
              <span>{carpark.type}</span>
              <span aria-hidden="true">·</span>
              <span>{carpark.zone}</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {carpark.name}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {carpark.address}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => onToggleSave(carpark.id, e)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                isSaved
                  ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400'
                  : 'border-slate-200 text-slate-400 hover:text-slate-600 dark:border-slate-800 dark:hover:text-slate-200'
              }`}
              title={isSaved ? 'Saved' : 'Save carpark'}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              title="Copy carpark details"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            </button>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* Live Lots Availability Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Live Lot Availability
              </span>
              <span className={`text-xs font-semibold ${status.colorClass}`}>
                {status.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Cars */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5" />
                    Cars (C)
                  </span>
                  <span>{carStats ? `${carStats.pct}% full` : 'N/A'}</span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {carStats ? carStats.available : 0}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    / {carStats ? carStats.total : 0}
                  </span>
                </div>
              </div>

              {/* Motorcycles */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    Motorcycles (Y)
                  </span>
                  <span>{motoStats ? `${motoStats.pct}% full` : 'N/A'}</span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {motoStats ? motoStats.available : 0}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    / {motoStats ? motoStats.total : 0}
                  </span>
                </div>
              </div>

              {/* Heavy Vehicles */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    Heavy Vehicles (H)
                  </span>
                  <span>{heavyStats ? `${heavyStats.pct}% full` : 'No lots'}</span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {heavyStats ? heavyStats.available : '—'}
                  {heavyStats && (
                    <span className="text-xs font-normal text-slate-400 ml-1">
                      / {heavyStats.total}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gantry & Facility Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg border border-slate-100 p-2.5 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-slate-400 block mb-0.5">Max Height</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                {carpark.gantryHeightMeters}m
              </span>
            </div>
            <div className="rounded-lg border border-slate-100 p-2.5 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-slate-400 block mb-0.5">Grace Period</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                {carpark.rates.gracePeriodMins} mins
              </span>
            </div>
            <div className="rounded-lg border border-slate-100 p-2.5 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-slate-400 block mb-0.5">EV Chargers</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" />
                {carpark.evChargersCount ? `${carpark.evChargersCount} Ports` : 'None'}
              </span>
            </div>
            <div className="rounded-lg border border-slate-100 p-2.5 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-slate-400 block mb-0.5">Parking System</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                {carpark.electronicParkingSystem ? 'EPS Gantry' : 'Coupon'}
              </span>
            </div>
          </div>

          {/* Official Singapore Rates Schedule */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Parking Rates Schedule
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <td className="py-2 px-3 font-medium text-slate-500 dark:text-slate-400 w-1/3">
                      Mondays - Fridays (Day)
                    </td>
                    <td className="py-2 px-3 text-slate-900 dark:text-white">
                      {carpark.rates.weekdayDay}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-500 dark:text-slate-400">
                      Mondays - Fridays (Night)
                    </td>
                    <td className="py-2 px-3 text-slate-900 dark:text-white">
                      {carpark.rates.weekdayNight}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <td className="py-2 px-3 font-medium text-slate-500 dark:text-slate-400">
                      Saturdays
                    </td>
                    <td className="py-2 px-3 text-slate-900 dark:text-white">
                      {carpark.rates.saturday}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-500 dark:text-slate-400">
                      Sundays & Public Holidays
                    </td>
                    <td className="py-2 px-3 text-slate-900 dark:text-white font-medium">
                      {carpark.rates.sundayPh}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-Time Parking Fee Estimator */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
              <Clock className="h-4 w-4" />
              <span>Instant Parking Fee Estimator</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Parking duration from right now ({now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}):
                </div>
                <div className="flex items-center gap-1.5">
                  {[30, 60, 120, 180, 240].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDurationMins(mins)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                        durationMins === mins
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200 dark:border-emerald-900">
                <div className="text-xs text-slate-500 dark:text-slate-400">Estimated Cost</div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {feeEstimate.estimatedCost === 0 ? 'FREE' : `SGD $${feeEstimate.estimatedCost.toFixed(2)}`}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {feeEstimate.breakdown}
                </div>
              </div>
            </div>
          </div>

          {/* 24-Hour Occupancy Trends */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Typical Rush Hour Occupancy Curve</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="grid grid-cols-6 gap-2 text-center">
                {carpark.trends.map((trend) => (
                  <div key={trend.hour} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">{trend.hour}</span>
                    <div className="h-20 w-5 bg-slate-200 dark:bg-slate-700 rounded-md relative overflow-hidden flex items-end">
                      <div
                        className={`w-full rounded-b-md transition-all ${
                          trend.occupancyPct >= 85
                            ? 'bg-rose-500'
                            : trend.occupancyPct >= 65
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ height: `${trend.occupancyPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                      {trend.occupancyPct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Coordinates: {carpark.coordinates.lat.toFixed(4)}, {carpark.coordinates.lng.toFixed(4)}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              <Navigation className="h-3.5 w-3.5" />
              Google Maps
            </a>
            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Waze
            </a>
            <a
              href={appleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Apple
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
