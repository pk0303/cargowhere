import React from 'react';
import { Bookmark, Navigation, Zap, ShieldCheck } from 'lucide-react';
import { SingaporeCarpark, VehicleLotType } from '../types/carpark';
import { getLotAvailabilityForVehicle, getStatusTier } from '../services/carparkService';

interface CarparkCardProps {
  carpark: SingaporeCarpark;
  vehicleType: VehicleLotType;
  isSelected?: boolean;
  isSaved?: boolean;
  onSelect: (cp: SingaporeCarpark) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  vehicleType,
  isSelected,
  isSaved,
  onSelect,
  onToggleSave,
}) => {
  const { available, total, pct } = getLotAvailabilityForVehicle(carpark, vehicleType);
  const status = getStatusTier(available, total);

  const vehicleLabel = vehicleType === 'C' ? 'Cars' : vehicleType === 'Y' ? 'Motorcycles' : 'Heavy Vehicles';

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}&travelmode=driving`;
  const wazeUrl = `https://waze.com/ul?ll=${carpark.coordinates.lat},${carpark.coordinates.lng}&navigate=yes`;

  return (
    <div
      onClick={() => onSelect(carpark)}
      className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all cursor-pointer ${
        isSelected
          ? 'border-emerald-500 bg-emerald-50/40 shadow-sm dark:border-emerald-500/80 dark:bg-emerald-950/20'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
      }`}
    >
      <div>
        {/* Top Header: Name, Carpark Code, Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                {carpark.carparkNumber}
              </span>
              <span aria-hidden="true">·</span>
              <span>{carpark.agency}</span>
              <span aria-hidden="true">·</span>
              <span>{carpark.zone}</span>
              {carpark.distanceKm !== undefined && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {carpark.distanceKm.toFixed(1)} km
                  </span>
                </>
              )}
            </div>

            <h3 className="mt-1 text-base font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400 line-clamp-1 transition-colors">
              {carpark.name}
            </h3>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {carpark.address}
            </p>
          </div>

          <button
            onClick={(e) => onToggleSave(carpark.id, e)}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
              isSaved
                ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400'
                : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 dark:border-slate-800 dark:hover:text-slate-200'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save carpark'}
            aria-label="Save carpark"
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Live Lot Availability Block */}
        <div className="mt-3.5 rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-800/40">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-extrabold tracking-tight tabular-nums ${status.colorClass}`}>
                {available}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                / {total} {vehicleLabel.toLowerCase()} available
              </span>
            </div>

            <span className={`text-xs font-semibold ${status.colorClass}`}>
              {status.label}
            </span>
          </div>

          {/* Occupancy bar */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                available === 0
                  ? 'bg-rose-500'
                  : available < 15
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Occupancy</span>
            <span className="tabular-nums font-medium">{pct}% full</span>
          </div>
        </div>

        {/* Feature Badges & Specs: Clean unboxed metadata */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Max Height:</span>
            <span className="font-medium tabular-nums">{carpark.gantryHeightMeters}m</span>
          </div>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Grace:</span>
            <span className="font-medium tabular-nums">{carpark.rates.gracePeriodMins} mins</span>
          </div>
          {carpark.evChargersCount && carpark.evChargersCount > 0 && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Zap className="h-3 w-3" />
                <span className="font-medium tabular-nums">{carpark.evChargersCount} EV Ports</span>
              </div>
            </>
          )}
          {carpark.electronicParkingSystem && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-3 w-3" />
                <span>EPS Gantry</span>
              </div>
            </>
          )}
        </div>

        {/* Rates Sneak Peek */}
        <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
          <span className="font-medium text-slate-700 dark:text-slate-200">Rate:</span>{' '}
          {carpark.rates.weekdayDay}
        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Click card for full rates & trends
        </span>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            title="Navigate with Google Maps"
          >
            <Navigation className="h-3 w-3" />
            Maps
          </a>
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            title="Navigate with Waze"
          >
            Waze
          </a>
        </div>
      </div>
    </div>
  );
};
