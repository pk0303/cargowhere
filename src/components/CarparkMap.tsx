import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { SingaporeCarpark, VehicleLotType } from '../types/carpark';
import { getLotAvailabilityForVehicle } from '../services/carparkService';

interface CarparkMapProps {
  carparks: SingaporeCarpark[];
  selectedCarpark: SingaporeCarpark | null;
  onSelectCarpark: (cp: SingaporeCarpark) => void;
  userLocation: { lat: number; lng: number } | null;
  vehicleType: VehicleLotType;
  isDark: boolean;
}

const REGION_BOUNDS: Record<string, [number, number]> = {
  All: [1.3521, 103.8198],
  Orchard: [1.3039, 103.8350],
  CBD: [1.2840, 103.8500],
  'Marina Bay': [1.2860, 103.8600],
  'Toa Payoh': [1.3340, 103.8490],
  Jurong: [1.3350, 103.7430],
  Tampines: [1.3530, 103.9440],
  Woodlands: [1.4360, 103.7860],
  Changi: [1.3580, 103.9880],
};

export const CarparkMap: React.FC<CarparkMapProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  userLocation,
  vehicleType,
  isDark,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [1.3521, 103.8198],
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      const tileLayerUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileLayerUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tile theme if dark mode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileLayerUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileLayerUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);
  }, [isDark]);

  // Update markers whenever carparks, vehicleType, or selectedCarpark change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    carparks.forEach((cp) => {
      const { available } = getLotAvailabilityForVehicle(cp, vehicleType);
      const isSelected = selectedCarpark?.id === cp.id;

      // Color coding for pins
      let bgColor = '#10b981'; // emerald green: plentiful
      let borderColor = '#047857';
      if (available === 0) {
        bgColor = '#ef4444'; // red: full
        borderColor = '#b91c1c';
      } else if (available < 15) {
        bgColor = '#f59e0b'; // amber: filling fast
        borderColor = '#b45309';
      } else if (available < 35) {
        bgColor = '#0ea5e9'; // sky blue: moderate
        borderColor = '#0369a1';
      }

      const pinSize = isSelected ? 44 : 36;
      const markerHtml = `
        <div style="
          width: ${pinSize}px;
          height: ${pinSize}px;
          background: ${bgColor};
          border: ${isSelected ? '3px solid #ffffff' : `2px solid ${borderColor}`};
          box-shadow: ${isSelected ? '0 0 0 3px #10b981, 0 8px 16px rgba(0,0,0,0.3)' : '0 4px 10px rgba(0,0,0,0.2)'};
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: ${pinSize > 40 ? '13px' : '11px'};
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          ${available}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-carpark-pin',
        iconSize: [pinSize, pinSize],
        iconAnchor: [pinSize / 2, pinSize / 2],
        popupAnchor: [0, -(pinSize / 2 + 5)],
      });

      const marker = L.marker([cp.coordinates.lat, cp.coordinates.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 10,
      });

      // Popup Content
      const popupHtml = `
        <div style="padding: 12px; font-family: 'Plus Jakarta Sans', sans-serif; min-width: 200px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 2px;">
            ${cp.carparkNumber} · ${cp.agency}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
            ${cp.name}
          </div>
          <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px;">
            <span style="font-size: 20px; font-weight: 800; color: ${bgColor};">
              ${available}
            </span>
            <span style="font-size: 12px; color: #64748b;">
              lots available
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            Height: ${cp.gantryHeightMeters}m · Grace: ${cp.rates.gracePeriodMins}m
          </div>
          <button id="view-details-${cp.id}" style="
            width: 100%;
            padding: 6px 12px;
            background: #10b981;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          ">
            View Carpark Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false });

      marker.on('click', () => {
        onSelectCarpark(cp);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-details-${cp.id}`);
        if (btn) {
          btn.onclick = () => onSelectCarpark(cp);
        }
      });

      markersLayer.addLayer(marker);
    });
  }, [carparks, vehicleType, selectedCarpark, onSelectCarpark]);

  // Center on selected carpark smoothly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedCarpark) return;

    map.flyTo([selectedCarpark.coordinates.lat, selectedCarpark.coordinates.lng], 15, {
      duration: 1.0,
    });
  }, [selectedCarpark]);

  // Handle user location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const userHtml = `
          <div style="
            width: 20px;
            height: 20px;
            background: #2563eb;
            border: 3px solid #ffffff;
            border-radius: 9999px;
            box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.3);
          "></div>
        `;
        const userIcon = L.divIcon({
          html: userHtml,
          className: 'user-location-pin',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          zIndexOffset: 2000,
        }).addTo(map);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  const handleFlyToRegion = (regionName: string) => {
    const map = mapInstanceRef.current;
    const coords = REGION_BOUNDS[regionName];
    if (map && coords) {
      const zoom = regionName === 'All' ? 12 : 14;
      map.flyTo(coords, zoom, { duration: 1.2 });
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Quick Jump Hotspot Bar */}
      <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-1 max-w-[calc(100%-60px)]">
        {Object.keys(REGION_BOUNDS).map((region) => (
          <button
            key={region}
            onClick={() => handleFlyToRegion(region)}
            className="rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-xs backdrop-blur-xs hover:bg-white hover:text-slate-900 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-all whitespace-nowrap"
          >
            {region}
          </button>
        ))}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 rounded-lg bg-white/90 px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-xs backdrop-blur-xs dark:bg-slate-900/90 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-white">Lots:</span>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>&gt;35 Plentiful</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
          <span>15-35 Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span>&lt;15 Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <span>0 Full</span>
        </div>
      </div>

      {/* The Leaflet Container */}
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
};
