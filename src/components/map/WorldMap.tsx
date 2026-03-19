'use client';

import { useEffect, useRef, useState } from 'react';
import { RegionData } from '@/types';
import { mockRegions } from '@/lib/spotify/mockData';
import { formatNumber, getImageUrl } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { X, Music, Users, TrendingUp } from 'lucide-react';

// Lazy import Leaflet to avoid SSR issues
let L: typeof import('leaflet') | null = null;

interface PopupInfo {
  region: RegionData;
  position: { x: number; y: number };
}

export function WorldMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<PopupInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import for SSR safety
    import('leaflet').then((leaflet) => {
      L = leaflet.default ?? leaflet;

      // Fix default icon paths
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        scrollWheelZoom: true,
        minZoom: 2,
        maxZoom: 6,
        attributionControl: false,
      });

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add markers for each region
      mockRegions.forEach((region) => {
        const size = Math.max(20, (region.activityScore / 100) * 40);
        const pulseColor = region.activityScore > 85 ? '#1db954' : region.activityScore > 70 ? '#00d4ff' : '#7c3aed';

        const icon = L!.divIcon({
          className: '',
          html: `
            <div style="position:relative;width:${size}px;height:${size}px">
              <div style="
                position:absolute;inset:0;
                border-radius:50%;
                background:${pulseColor}20;
                border:1px solid ${pulseColor}60;
                animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;
              "></div>
              <div style="
                position:absolute;inset:4px;
                border-radius:50%;
                background:${pulseColor}40;
                border:1.5px solid ${pulseColor};
                display:flex;align-items:center;justify-content:center;
                font-size:${size * 0.3}px;
                backdrop-filter:blur(4px);
              ">${region.activityScore}</div>
            </div>
            <style>@keyframes ping{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.3);opacity:.4}}</style>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L!.marker(region.coordinates as [number, number], { icon });
        marker.addTo(map);

        marker.on('click', (e) => {
          const point = map.latLngToContainerPoint(e.latlng);
          setSelectedRegion({
            region,
            position: { x: point.x, y: point.y },
          });
        });
      });

      mapInstanceRef.current = map;
      setIsLoaded(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-white/5 bg-[#070b14]">
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '500px' }} />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass rounded-lg p-3 z-[400]">
        <p className="text-xs text-slate-400 font-medium mb-2">Activity Score</p>
        <div className="flex flex-col gap-1.5">
          {[
            { label: 'High (85+)', color: '#1db954' },
            { label: 'Medium (70-85)', color: '#00d4ff' },
            { label: 'Low (<70)', color: '#7c3aed' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#070b14] z-[500]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading map...</p>
          </div>
        </div>
      )}

      {/* Region popup */}
      {selectedRegion && (
        <div
          className="absolute z-[500] w-72"
          style={{
            left: Math.min(selectedRegion.position.x, window.innerWidth - 310),
            top: Math.max(selectedRegion.position.y - 20, 10),
          }}
        >
          <Card glow="cyan" className="shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100">{selectedRegion.region.country}</h3>
                <p className="text-xs text-slate-500">
                  Activity Score: <span className="text-cyan-400">{selectedRegion.region.activityScore}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedRegion(null)}
                className="p-1 rounded text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Top Track */}
            {selectedRegion.region.topTracks[0] && (
              <div className="mb-3">
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                  <Music className="w-3 h-3" /> Top Track
                </p>
                <div className="flex items-center gap-2">
                  <img
                    src={getImageUrl(selectedRegion.region.topTracks[0].album.images)}
                    alt=""
                    className="w-8 h-8 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">
                      {selectedRegion.region.topTracks[0].name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {selectedRegion.region.topTracks[0].artists[0]?.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Top Artists */}
            <div className="mb-3">
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                <Users className="w-3 h-3" /> Top Artists
              </p>
              <div className="flex gap-2 flex-wrap">
                {selectedRegion.region.topArtists.slice(0, 3).map((artist) => (
                  <div key={artist.id} className="flex items-center gap-1.5">
                    <img
                      src={getImageUrl(artist.images)}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-cyan-500/30"
                    />
                    <span className="text-xs text-slate-400">{artist.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                <TrendingUp className="w-3 h-3" /> Trending
              </p>
              <div className="space-y-1">
                {selectedRegion.region.trending.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 truncate flex-1">{item.name}</span>
                    <span className="text-xs text-green-400 ml-2">+{item.change}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
