export type CarparkAgency = 'HDB' | 'URA' | 'LTA' | 'MALL' | 'COMMERCIAL';

export type CarparkType = 
  | 'Multi-Storey Car Park'
  | 'Surface Car Park'
  | 'Basement Car Park'
  | 'Covered Car Park'
  | 'Mechanised Car Park';

export type VehicleLotType = 'C' | 'Y' | 'H'; // C: Car, Y: Motorcycle, H: Heavy Vehicle

export interface LotAvailability {
  totalLots: number;
  lotsAvailable: number;
  lotType: VehicleLotType;
}

export interface RatesInfo {
  weekdayDay: string;
  weekdayNight: string;
  saturday: string;
  sundayPh: string;
  gracePeriodMins: number;
  ratePerHalfHourDay: number;
  ratePerHalfHourNight: number;
  freeParkingPromo?: string;
}

export interface HourlyTrend {
  hour: string; // e.g., '08:00', '12:00', '18:00'
  occupancyPct: number; // 0 to 100
}

export interface SingaporeCarpark {
  id: string;
  carparkNumber: string; // e.g. "ACB", "TP12", "ION01"
  name: string;
  address: string;
  region: 'Central' | 'East' | 'West' | 'North' | 'North-East';
  zone: 'Orchard' | 'CBD' | 'Marina Bay' | 'Jurong' | 'Tampines' | 'Woodlands' | 'Toa Payoh' | 'Bedok' | 'Bugis' | 'Sentosa' | 'Changi' | 'Other';
  agency: CarparkAgency;
  type: CarparkType;
  coordinates: {
    lat: number;
    lng: number;
  };
  gantryHeightMeters: number; // e.g. 2.1, 1.9, 4.5
  lots: {
    C?: LotAvailability;
    Y?: LotAvailability;
    H?: LotAvailability;
  };
  evChargersCount?: number;
  hasNightParking: boolean;
  electronicParkingSystem: boolean;
  rates: RatesInfo;
  trends: HourlyTrend[];
  lastUpdated: string;
  distanceKm?: number;
}

export type SortOption = 'distance' | 'available' | 'occupancy' | 'rate' | 'name';
export type FilterAgency = 'ALL' | 'HDB' | 'URA' | 'LTA' | 'MALL' | 'COMMERCIAL';
export type FilterAvailability = 'ALL' | 'PLENTIFUL' | 'AVAILABLE' | 'ALMOST_FULL';

export interface FilterState {
  searchQuery: string;
  zone: string;
  agency: FilterAgency;
  vehicleType: VehicleLotType;
  availability: FilterAvailability;
  minHeight: number;
  evOnly: boolean;
  nightParkingOnly: boolean;
  freeSundayOnly: boolean;
  sortBy: SortOption;
}

export interface SimulatedLocation {
  id: string;
  label: string;
  coords: {
    lat: number;
    lng: number;
  };
}
