import React, { useState } from 'react';
import { Search, X, SlidersHorizontal, Zap, Moon, Sun, ArrowUpDown } from 'lucide-react';
import { FilterState, VehicleLotType, FilterAgency, FilterAvailability, SortOption } from '../types/carpark';

interface CarparkFilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
  totalCarparks: number;
}

const ZONES = [
  { value: 'ALL', label: 'All Singapore' },
  { value: 'Orchard', label: 'Orchard' },
  { value: 'CBD', label: 'CBD & Raffles' },
  { value: 'Marina Bay', label: 'Marina Bay' },
  { value: 'Bugis', label: 'Bugis' },
  { value: 'Toa Payoh', label: 'Toa Payoh' },
  { value: 'Jurong', label: 'Jurong' },
  { value: 'Tampines', label: 'Tampines' },
  { value: 'Bedok', label: 'Bedok' },
  { value: 'Woodlands', label: 'Woodlands' },
  { value: 'Changi', label: 'Changi' },
  { value: 'Sentosa', label: 'Sentosa' },
];

export const CarparkFilterBar: React.FC<CarparkFilterBarProps> = ({
  filters,
  setFilters,
  totalMatches,
  totalCarparks,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleVehicleChange = (type: VehicleLotType) => {
    setFilters((prev) => ({ ...prev, vehicleType: type }));
  };

  const handleAgencyChange = (agency: FilterAgency) => {
    setFilters((prev) => ({ ...prev, agency }));
  };

  const handleZoneChange = (zone: string) => {
    setFilters((prev) => ({ ...prev, zone }));
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      zone: 'ALL',
      agency: 'ALL',
      vehicleType: 'C',
      availability: 'ALL',
      minHeight: 0,
      evOnly: false,
      nightParkingOnly: false,
      freeSundayOnly: false,
      sortBy: 'distance',
    });
  };

  const hasActiveCustomFilters =
    filters.zone !== 'ALL' ||
    filters.agency !== 'ALL' ||
    filters.availability !== 'ALL' ||
    filters.minHeight > 0 ||
    filters.evOnly ||
    filters.nightParkingOnly ||
    filters.freeSundayOnly;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Primary Row: Search + Vehicle Selector + Sort */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            placeholder="Search carpark name, address, or code (e.g. ION, TP12, Suntec)..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-white dark:placeholder-slate-500"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Vehicle Type Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg dark:bg-slate-800 shrink-0">
          <button
            onClick={() => handleVehicleChange('C')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
              filters.vehicleType === 'C'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Cars
          </button>
          <button
            onClick={() => handleVehicleChange('Y')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
              filters.vehicleType === 'Y'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Motorcycles
          </button>
          <button
            onClick={() => handleVehicleChange('H')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
              filters.vehicleType === 'H'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Heavy Vehicles
          </button>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors shrink-0 ${
            showAdvanced || hasActiveCustomFilters
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
          {hasActiveCustomFilters && (
            <span className="flex h-2 w-2 rounded-full bg-emerald-600" />
          )}
        </button>
      </div>

      {/* Secondary Row: Quick Agency Bar + Zone selector + Result Count */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs dark:border-slate-800/60">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mr-1">Agency:</span>
          {(['ALL', 'HDB', 'MALL', 'URA', 'COMMERCIAL'] as FilterAgency[]).map((ag) => (
            <button
              key={ag}
              onClick={() => handleAgencyChange(ag)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                filters.agency === ag
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {ag === 'ALL' ? 'All Agencies' : ag === 'MALL' ? 'Shopping Malls' : ag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Zone Dropdown */}
          <select
            value={filters.zone}
            onChange={(e) => handleZoneChange(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            {ZONES.map((z) => (
              <option key={z.value} value={z.value}>
                {z.label}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value as SortOption }))
              }
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="distance">Nearest Distance</option>
              <option value="available">Most Available Lots</option>
              <option value="occupancy">Lowest Occupancy %</option>
              <option value="rate">Lowest Hourly Rate</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Collapsible Advanced Filters Drawer */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Availability Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Availability Level
            </label>
            <select
              value={filters.availability}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  availability: e.target.value as FilterAvailability,
                }))
              }
              className="w-full rounded-md border border-slate-200 bg-white p-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="ALL">Any availability</option>
              <option value="PLENTIFUL">Plentiful (≥30 lots)</option>
              <option value="AVAILABLE">Available (≥1 lot)</option>
              <option value="ALMOST_FULL">Almost Full (≤15 lots)</option>
            </select>
          </div>

          {/* Gantry Clearance Height */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Minimum Gantry Clearance
            </label>
            <select
              value={filters.minHeight}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minHeight: parseFloat(e.target.value),
                }))
              }
              className="w-full rounded-md border border-slate-200 bg-white p-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="0">Any height limit</option>
              <option value="1.9">At least 1.9m (Compact SUV)</option>
              <option value="2.0">At least 2.0m (Standard MPV)</option>
              <option value="2.1">At least 2.1m (High Van/SUV)</option>
              <option value="4.0">At least 4.0m (Lorry/Truck)</option>
            </select>
          </div>

          {/* Special Amenities Toggles */}
          <div className="sm:col-span-2 flex flex-wrap items-center gap-2 pt-3">
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, evOnly: !prev.evOnly }))
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                filters.evOnly
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-emerald-600" />
              <span>EV Charging Available</span>
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  freeSundayOnly: !prev.freeSundayOnly,
                }))
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                filters.freeSundayOnly
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span>Free Sunday/PH Parking</span>
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  nightParkingOnly: !prev.nightParkingOnly,
                }))
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                filters.nightParkingOnly
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <Moon className="h-3.5 w-3.5 text-indigo-500" />
              <span>Night Parking Scheme</span>
            </button>

            {hasActiveCustomFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-600 hover:underline dark:text-rose-400 ml-auto"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-slate-900 dark:text-white tabular-nums">{totalMatches}</strong> of{' '}
            <span className="tabular-nums">{totalCarparks}</span> carparks
          </span>
          {filters.zone !== 'ALL' && (
            <>
              <span aria-hidden="true">·</span>
              <span>Zone: {filters.zone}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
