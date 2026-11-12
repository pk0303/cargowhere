import { SingaporeCarpark, FilterState, VehicleLotType } from '../types/carpark';

// Haversine formula to compute accurate distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function getLotAvailabilityForVehicle(
  carpark: SingaporeCarpark,
  vehicleType: VehicleLotType
): { available: number; total: number; pct: number } {
  const lot = carpark.lots[vehicleType] || carpark.lots.C;
  if (!lot || lot.totalLots <= 0) {
    return { available: 0, total: 0, pct: 0 };
  }
  const pct = Math.round(((lot.totalLots - lot.lotsAvailable) / lot.totalLots) * 100);
  return {
    available: lot.lotsAvailable,
    total: lot.totalLots,
    pct: Math.min(100, Math.max(0, pct)),
  };
}

export function getStatusTier(available: number, total: number): {
  label: string;
  status: 'plentiful' | 'moderate' | 'low' | 'full';
  colorClass: string;
  bgClass: string;
  badgeBorder: string;
} {
  if (total <= 0) {
    return {
      label: 'No Data',
      status: 'full',
      colorClass: 'text-slate-500',
      bgClass: 'bg-slate-500/10',
      badgeBorder: 'border-slate-300 dark:border-slate-700',
    };
  }

  const ratio = available / total;

  if (available === 0) {
    return {
      label: 'Full',
      status: 'full',
      colorClass: 'text-rose-600 dark:text-rose-400',
      bgClass: 'bg-rose-500/10',
      badgeBorder: 'border-rose-300 dark:border-rose-900',
    };
  }
  if (available < 15 || ratio < 0.1) {
    return {
      label: 'Filling Fast',
      status: 'low',
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-500/10',
      badgeBorder: 'border-amber-300 dark:border-amber-900',
    };
  }
  if (available < 35 || ratio < 0.25) {
    return {
      label: 'Moderate',
      status: 'moderate',
      colorClass: 'text-sky-600 dark:text-sky-400',
      bgClass: 'bg-sky-500/10',
      badgeBorder: 'border-sky-300 dark:border-sky-900',
    };
  }
  return {
    label: 'Lots Available',
    status: 'plentiful',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-300 dark:border-emerald-900',
  };
}

export function filterAndSortCarparks(
  carparks: SingaporeCarpark[],
  filters: FilterState,
  userLocation: { lat: number; lng: number } | null
): SingaporeCarpark[] {
  let list = carparks.map((cp) => {
    let distanceKm = cp.distanceKm;
    if (userLocation) {
      distanceKm = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        cp.coordinates.lat,
        cp.coordinates.lng
      );
    }
    return { ...cp, distanceKm };
  });

  // Filter by search query
  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    list = list.filter(
      (cp) =>
        cp.name.toLowerCase().includes(q) ||
        cp.address.toLowerCase().includes(q) ||
        cp.carparkNumber.toLowerCase().includes(q) ||
        cp.zone.toLowerCase().includes(q)
    );
  }

  // Filter by zone
  if (filters.zone && filters.zone !== 'ALL') {
    list = list.filter((cp) => cp.zone === filters.zone);
  }

  // Filter by agency
  if (filters.agency !== 'ALL') {
    list = list.filter((cp) => cp.agency === filters.agency);
  }

  // Filter by vehicle type lot existence
  list = list.filter((cp) => {
    const lot = cp.lots[filters.vehicleType];
    return lot !== undefined && lot.totalLots > 0;
  });

  // Filter by availability tier
  if (filters.availability !== 'ALL') {
    list = list.filter((cp) => {
      const stats = getLotAvailabilityForVehicle(cp, filters.vehicleType);
      if (filters.availability === 'PLENTIFUL') return stats.available >= 30;
      if (filters.availability === 'AVAILABLE') return stats.available > 0;
      if (filters.availability === 'ALMOST_FULL') return stats.available <= 15;
      return true;
    });
  }

  // Filter by minimum height clearance
  if (filters.minHeight > 0) {
    list = list.filter((cp) => cp.gantryHeightMeters >= filters.minHeight);
  }

  // Filter by EV charging
  if (filters.evOnly) {
    list = list.filter((cp) => (cp.evChargersCount || 0) > 0);
  }

  // Filter by night parking
  if (filters.nightParkingOnly) {
    list = list.filter((cp) => cp.hasNightParking);
  }

  // Filter by free Sunday parking
  if (filters.freeSundayOnly) {
    list = list.filter(
      (cp) =>
        cp.rates.sundayPh.toLowerCase().includes('free') ||
        (cp.rates.freeParkingPromo && cp.rates.freeParkingPromo.toLowerCase().includes('free'))
    );
  }

  // Sorting
  list.sort((a, b) => {
    switch (filters.sortBy) {
      case 'distance':
        return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
      case 'available': {
        const aAvail = a.lots[filters.vehicleType]?.lotsAvailable ?? 0;
        const bAvail = b.lots[filters.vehicleType]?.lotsAvailable ?? 0;
        return bAvail - aAvail;
      }
      case 'occupancy': {
        const aStats = getLotAvailabilityForVehicle(a, filters.vehicleType);
        const bStats = getLotAvailabilityForVehicle(b, filters.vehicleType);
        return aStats.pct - bStats.pct; // lowest occupancy first
      }
      case 'rate':
        return a.rates.ratePerHalfHourDay - b.rates.ratePerHalfHourDay;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return list;
}

// Estimate parking rate in SGD
export function estimateParkingFee(
  carpark: SingaporeCarpark,
  entryTime: Date,
  durationMinutes: number
): {
  estimatedCost: number;
  breakdown: string;
  isGracePeriod: boolean;
  isSundayFree: boolean;
} {
  if (durationMinutes <= carpark.rates.gracePeriodMins) {
    return {
      estimatedCost: 0,
      breakdown: `Within ${carpark.rates.gracePeriodMins} mins grace period. Free entry.`,
      isGracePeriod: true,
      isSundayFree: false,
    };
  }

  const isSunday = entryTime.getDay() === 0;
  const isSundayFree =
    isSunday &&
    (carpark.rates.sundayPh.toLowerCase().includes('free') ||
      (carpark.rates.freeParkingPromo && carpark.rates.freeParkingPromo.toLowerCase().includes('free')));

  if (isSundayFree) {
    const hours = entryTime.getHours();
    if (hours >= 7 && hours <= 22) {
      return {
        estimatedCost: 0,
        breakdown: 'Sunday Free Parking scheme active (7:00 AM - 10:30 PM)',
        isGracePeriod: false,
        isSundayFree: true,
      };
    }
  }

  // Calculate billable half hours (ceiling)
  const halfHours = Math.ceil(durationMinutes / 30);
  const entryHour = entryTime.getHours();
  const isNight = entryHour >= 18 || entryHour < 7;

  let unitRate = isNight ? carpark.rates.ratePerHalfHourNight : carpark.rates.ratePerHalfHourDay;
  let totalCost = halfHours * unitRate;

  // HDB night parking cap check ($5.00)
  if (carpark.agency === 'HDB' && isNight && totalCost > 5.0) {
    totalCost = 5.0;
  }

  // Round to 2 decimals
  const cost = Math.round(totalCost * 100) / 100;
  return {
    estimatedCost: cost,
    breakdown: `${halfHours} × 30-min blocks @ ~$${unitRate.toFixed(2)}/30m (${isNight ? 'Night' : 'Day'} rate)`,
    isGracePeriod: false,
    isSundayFree: false,
  };
}

// Simulates live turnover fluctuations (lots fluctuating +/- 1-4 naturally)
export function simulateRealtimeUpdate(carparks: SingaporeCarpark[]): SingaporeCarpark[] {
  const now = new Date().toISOString();
  return carparks.map((cp) => {
    // 60% chance this carpark has a lot update
    if (Math.random() > 0.4) {
      const updatedLots = { ...cp.lots };
      (['C', 'Y', 'H'] as VehicleLotType[]).forEach((type) => {
        const lot = updatedLots[type];
        if (lot && lot.totalLots > 0) {
          const delta = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
          const newAvail = Math.max(0, Math.min(lot.totalLots, lot.lotsAvailable + delta));
          updatedLots[type] = {
            ...lot,
            lotsAvailable: newAvail,
          };
        }
      });
      return {
        ...cp,
        lots: updatedLots,
        lastUpdated: now,
      };
    }
    return cp;
  });
}
