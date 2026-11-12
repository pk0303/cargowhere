import React from 'react';
import { RefreshCw, Moon, Sun, MapPin, Bookmark, Compass, Calculator, Code2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'map' | 'list' | 'calculator' | 'saved' | 'api';
  setActiveTab: (tab: 'map' | 'list' | 'calculator' | 'saved' | 'api') => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdatedTime: string;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  onRefresh,
  isRefreshing,
  lastUpdatedTime,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-900/95">
      {/* Zone 1: Single element wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('map')}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-lg shadow-sm">
            P
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              ParkSG
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-none">
              Singapore Real-Time Availability
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'map'
              ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Compass className="h-4 w-4" />
          Live Map
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'list'
              ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MapPin className="h-4 w-4" />
          All Carparks
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'calculator'
              ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="h-4 w-4" />
          Fee Calculator
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'saved'
              ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          Saved ({savedCount})
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'api'
              ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Code2 className="h-4 w-4" />
          Backend API
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setIsDark(!isDark)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 disabled:opacity-60 transition-all whitespace-nowrap shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
          <span className="hidden sm:inline text-emerald-200 font-normal">
            ({lastUpdatedTime})
          </span>
        </button>
      </div>
    </header>
  );
};
