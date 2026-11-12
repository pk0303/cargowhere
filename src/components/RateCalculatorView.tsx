import React, { useState } from 'react';
import { Calculator, Clock, Calendar, CheckCircle2, ArrowRight, Zap, Info } from 'lucide-react';
import { SingaporeCarpark } from '../types/carpark';
import { estimateParkingFee } from '../services/carparkService';

interface RateCalculatorViewProps {
  carparks: SingaporeCarpark[];
  onSelectCarpark: (cp: SingaporeCarpark) => void;
}

export const RateCalculatorView: React.FC<RateCalculatorViewProps> = ({
  carparks,
  onSelectCarpark,
}) => {
  const [selectedId, setSelectedId] = useState<string>(carparks[0]?.id || '');
  const [dayType, setDayType] = useState<'today' | 'saturday' | 'sunday'>('today');
  const [entryHour, setEntryHour] = useState<number>(14); // 2 PM
  const [entryMinute, setEntryMinute] = useState<number>(0);
  const [durationMins, setDurationMins] = useState<number>(120); // 2 hours

  const selectedCp = carparks.find((c) => c.id === selectedId) || carparks[0];

  // Construct target Date based on selection
  const calcDate = new Date();
  if (dayType === 'saturday') {
    const daysUntilSat = (6 - calcDate.getDay() + 7) % 7 || 7;
    calcDate.setDate(calcDate.getDate() + daysUntilSat);
  } else if (dayType === 'sunday') {
    const daysUntilSun = (7 - calcDate.getDay()) % 7 || 7;
    calcDate.setDate(calcDate.getDate() + daysUntilSun);
  }
  calcDate.setHours(entryHour, entryMinute, 0, 0);

  const estimate = selectedCp ? estimateParkingFee(selectedCp, calcDate, durationMins) : null;

  // Nearby alternate carparks in the same zone to compare pricing!
  const alternatives = selectedCp
    ? carparks
        .filter((c) => c.zone === selectedCp.zone && c.id !== selectedCp.id)
        .slice(0, 3)
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title & Intro */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calculator className="h-5 w-5 text-emerald-600" />
          Singapore Parking Fee Calculator
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Estimate parking charges for any Singapore carpark across peak/off-peak, weekend, and night parking schemes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="md:col-span-7 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          {/* Select Carpark */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Destination Carpark
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            >
              {carparks.map((cp) => (
                <option key={cp.id} value={cp.id}>
                  {cp.name} ({cp.zone}) · {cp.carparkNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Day of Visit
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDayType('today')}
                className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                  dayType === 'today'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                Today (Current)
              </button>
              <button
                type="button"
                onClick={() => setDayType('saturday')}
                className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                  dayType === 'saturday'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                Saturday
              </button>
              <button
                type="button"
                onClick={() => setDayType('sunday')}
                className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                  dayType === 'sunday'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                Sunday / PH
              </button>
            </div>
          </div>

          {/* Entry Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Estimated Entry Time: {entryHour.toString().padStart(2, '0')}:
              {entryMinute.toString().padStart(2, '0')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="23"
                value={entryHour}
                onChange={(e) => setEntryHour(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <select
                value={entryMinute}
                onChange={(e) => setEntryMinute(parseInt(e.target.value))}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="0">:00</option>
                <option value="15">:15</option>
                <option value="30">:30</option>
                <option value="45">:45</option>
              </select>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Parking Duration: {durationMins < 60 ? `${durationMins} mins` : `${(durationMins / 60).toFixed(1)} hours`}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[15, 30, 45, 60, 90, 120, 180, 240, 360, 480].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDurationMins(mins)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    durationMins === mins
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculation Summary Column */}
        <div className="md:col-span-5 flex flex-col justify-between rounded-xl border border-emerald-300/80 bg-gradient-to-b from-emerald-50/50 to-white p-5 shadow-xs dark:border-emerald-900/60 dark:from-emerald-950/20 dark:to-slate-900">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Estimated Total Fee
            </span>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                {estimate?.estimatedCost === 0 ? 'FREE' : `SGD $${estimate?.estimatedCost.toFixed(2)}`}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {estimate?.breakdown}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Selected Carpark</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
                  {selectedCp?.name}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Grace Period</span>
                <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                  {selectedCp?.rates.gracePeriodMins} minutes
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Day Rate</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  ${selectedCp?.rates.ratePerHalfHourDay.toFixed(2)} / 30m
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Sunday Scheme</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {selectedCp?.rates.freeParkingPromo || 'Standard rate'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => selectedCp && onSelectCarpark(selectedCp)}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              <span>View Full Carpark Details</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Alternatives Comparison */}
      {alternatives.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-emerald-600" />
            <span>Price Comparison for other carparks in {selectedCp.zone}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {alternatives.map((alt) => {
              const altEst = estimateParkingFee(alt, calcDate, durationMins);
              const priceDelta = (altEst.estimatedCost - (estimate?.estimatedCost || 0));

              return (
                <div
                  key={alt.id}
                  onClick={() => onSelectCarpark(alt)}
                  className="rounded-lg border border-slate-100 p-3 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 cursor-pointer transition-all"
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {alt.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {alt.agency} · {alt.lots.C?.lotsAvailable ?? 0} lots
                  </div>

                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                      {altEst.estimatedCost === 0 ? 'FREE' : `$${altEst.estimatedCost.toFixed(2)}`}
                    </span>
                    {priceDelta < 0 && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Save ${Math.abs(priceDelta).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
