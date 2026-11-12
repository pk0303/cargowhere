import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { CarparkFilterBar } from './components/CarparkFilterBar';
import { CarparkCard } from './components/CarparkCard';
import { CarparkMap } from './components/CarparkMap';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { RateCalculatorView } from './components/RateCalculatorView';
import { BackendIntegrationGuide } from './components/BackendIntegrationGuide';
import { LocationSelector } from './components/LocationSelector';
import { INITIAL_CARPARKS, SIMULATED_LOCATIONS } from './data/singaporeCarparks';
import { SingaporeCarpark, FilterState } from './types/carpark';
import { filterAndSortCarparks, simulateRealtimeUpdate } from './services/carparkService';
import { Bookmark, Sparkles, Map, List, Radio } from 'lucide-react';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('parksg_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('parksg_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('parksg_theme', 'light');
    }
  }, [isDark]);

  // Data & Selection State
  const [carparks, setCarparks] = useState<SingaporeCarpark[]>(INITIAL_CARPARKS);
  const [selectedCarpark, setSelectedCarpark] = useState<SingaporeCarpark | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'calculator' | 'saved' | 'api'>('map');

  // Bookmarking / Saved Carparks
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('parksg_saved');
      return stored ? JSON.parse(stored) : ['sg-ion-orchard', 'sg-toa-payoh-hub'];
    } catch {
      return ['sg-ion-orchard', 'sg-toa-payoh-hub'];
    }
  });

  const toggleSave = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem('parksg_saved', JSON.stringify(next));
      return next;
    });
  }, []);

  // Location State (Default: Orchard MRT)
  const defaultLocation = SIMULATED_LOCATIONS[0];
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    defaultLocation.coords
  );
  const [currentLocationName, setCurrentLocationName] = useState<string>(
    defaultLocation.label.split('/')[0].trim()
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsActive, setGpsActive] = useState<boolean>(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
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

  // Real-time update ticker
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const handleManualRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCarparks((prev) => simulateRealtimeUpdate(prev));
      setLastUpdatedTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setIsRefreshing(false);
    }, 400);
  }, []);

  // Periodic real-time simulator (every 30 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setCarparks((prev) => simulateRealtimeUpdate(prev));
      setLastUpdatedTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Request actual browser geolocation
  const handleRequestGps = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setCurrentLocationName('My GPS Location');
        setGpsActive(true);
        setIsLocating(false);
      },
      (error) => {
        console.warn('GPS location request error:', error.message);
        setIsLocating(false);
        // Fallback to Orchard
        setUserLocation(defaultLocation.coords);
        setCurrentLocationName(defaultLocation.label.split('/')[0].trim());
        setGpsActive(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectPresetLocation = (id: string) => {
    const loc = SIMULATED_LOCATIONS.find((l) => l.id === id);
    if (loc) {
      setUserLocation(loc.coords);
      setCurrentLocationName(loc.label.split('/')[0].trim());
      setGpsActive(false);
    }
  };

  // Filtered carpark list
  const filteredCarparks = useMemo(() => {
    return filterAndSortCarparks(carparks, filters, userLocation);
  }, [carparks, filters, userLocation]);

  // Saved carparks list
  const savedCarparks = useMemo(() => {
    return filteredCarparks.filter((c) => savedIds.includes(c.id));
  }, [filteredCarparks, savedIds]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        lastUpdatedTime={lastUpdatedTime}
        savedCount={savedIds.length}
      />

      {/* Sub-bar with Location Simulator and Live Status */}
      <div className="border-b border-slate-200/80 bg-white/60 px-4 py-2 backdrop-blur-xs sm:px-6 dark:border-slate-800/80 dark:bg-slate-900/40">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Origin:
            </span>
            <LocationSelector
              currentLocationName={currentLocationName}
              onSelectPreset={handleSelectPresetLocation}
              onRequestGps={handleRequestGps}
              isLocating={isLocating}
              gpsActive={gpsActive}
            />
          </div>

          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Radio
                className={`h-3.5 w-3.5 ${
                  autoRefresh ? 'text-emerald-500 animate-pulse' : 'text-slate-400'
                }`}
              />
              <span className="tabular-nums">
                Live Feed: {autoRefresh ? 'Auto 30s' : 'Paused'}
              </span>
            </button>
            <span aria-hidden="true">·</span>
            <span>Covering HDB, URA, LTA & Shopping Malls</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-5 max-w-[1700px] w-full mx-auto">
        {/* VIEW 1: INTERACTIVE MAP & SPLIT LIST */}
        {activeTab === 'map' && (
          <div className="flex flex-col gap-4">
            <CarparkFilterBar
              filters={filters}
              setFilters={setFilters}
              totalMatches={filteredCarparks.length}
              totalCarparks={carparks.length}
            />

            {/* Split Screen Layout on Large Screens */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-250px)] min-h-[550px]">
              {/* Left Column: Carpark Cards Feed */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 p-3 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Available Carparks ({filteredCarparks.length})</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Sorted by {filters.sortBy}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {filteredCarparks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                      <p className="text-sm font-semibold">No carparks found</p>
                      <p className="text-xs mt-1">Try adjusting your filters or search keywords.</p>
                      <button
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            searchQuery: '',
                            zone: 'ALL',
                            agency: 'ALL',
                            availability: 'ALL',
                            evOnly: false,
                            nightParkingOnly: false,
                          }))
                        }
                        className="mt-3 text-xs text-emerald-600 hover:underline font-semibold"
                      >
                        Reset filters
                      </button>
                    </div>
                  ) : (
                    filteredCarparks.map((cp) => (
                      <CarparkCard
                        key={cp.id}
                        carpark={cp}
                        vehicleType={filters.vehicleType}
                        isSelected={selectedCarpark?.id === cp.id}
                        isSaved={savedIds.includes(cp.id)}
                        onSelect={(carpark) => setSelectedCarpark(carpark)}
                        onToggleSave={toggleSave}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Full Interactive Map */}
              <div className="lg:col-span-7 xl:col-span-8 h-full min-h-[400px]">
                <CarparkMap
                  carparks={filteredCarparks}
                  selectedCarpark={selectedCarpark}
                  onSelectCarpark={(cp) => setSelectedCarpark(cp)}
                  userLocation={userLocation}
                  vehicleType={filters.vehicleType}
                  isDark={isDark}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ALL CARPARKS GRID */}
        {activeTab === 'list' && (
          <div className="flex flex-col gap-4">
            <CarparkFilterBar
              filters={filters}
              setFilters={setFilters}
              totalMatches={filteredCarparks.length}
              totalCarparks={carparks.length}
            />

            {filteredCarparks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  No carparks match your filters
                </p>
                <p className="text-xs mt-1">Try clearing some filter criteria to see more locations.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCarparks.map((cp) => (
                  <CarparkCard
                    key={cp.id}
                    carpark={cp}
                    vehicleType={filters.vehicleType}
                    isSelected={selectedCarpark?.id === cp.id}
                    isSaved={savedIds.includes(cp.id)}
                    onSelect={(carpark) => setSelectedCarpark(carpark)}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: PARKING RATE CALCULATOR */}
        {activeTab === 'calculator' && (
          <RateCalculatorView
            carparks={carparks}
            onSelectCarpark={(cp) => setSelectedCarpark(cp)}
          />
        )}

        {/* VIEW 4: SAVED CARPARKS */}
        {activeTab === 'saved' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-amber-500 fill-current" />
                  Saved Carparks ({savedCarparks.length})
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Quick access to your preferred Singapore parking spots with live lot tracking.
                </p>
              </div>
            </div>

            {savedCarparks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
                <Bookmark className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No saved carparks yet
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Click the bookmark icon on any carpark card to save it for quick lookup.
                </p>
                <button
                  onClick={() => setActiveTab('map')}
                  className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                >
                  Browse Carparks on Map
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedCarparks.map((cp) => (
                  <CarparkCard
                    key={cp.id}
                    carpark={cp}
                    vehicleType={filters.vehicleType}
                    isSelected={selectedCarpark?.id === cp.id}
                    isSaved={true}
                    onSelect={(carpark) => setSelectedCarpark(carpark)}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: BACKEND API GUIDE */}
        {activeTab === 'api' && <BackendIntegrationGuide />}
      </main>

      {/* Selected Carpark Detailed Modal */}
      {selectedCarpark && (
        <CarparkDetailModal
          carpark={selectedCarpark}
          onClose={() => setSelectedCarpark(null)}
          isSaved={savedIds.includes(selectedCarpark.id)}
          onToggleSave={toggleSave}
          selectedVehicleType={filters.vehicleType}
        />
      )}

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ParkSG · Singapore Real-Time Carpark Availability Tracker
          </span>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <span>Data format compatible with LTA DataMall & HDB APIs</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('api')}
              className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Developer Spec
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
