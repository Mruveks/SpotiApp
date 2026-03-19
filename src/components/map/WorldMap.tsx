'use client';

import { useEffect, useRef, useState } from 'react';
import { useTopArtists } from '@/hooks/useSpotify';
import { groupArtistsByOrigin, ArtistOrigin } from '@/lib/spotify/analytics';
import { formatNumber, getImageUrl, countryCodeToEmoji } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { X, Users } from 'lucide-react';

let L: typeof import('leaflet') | null = null;

interface PopupInfo {
  origins: ArtistOrigin[];
  country: string;
  code: string;
  position: { x: number; y: number };
}

export function WorldMap() {
  const { data: artists = [] } = useTopArtists('medium_term');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const markersRef = useRef<import('leaflet').Marker[]>([]);
  const [selected, setSelected] = useState<PopupInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Group artists by origin country
  const originGroups = groupArtistsByOrigin(artists);
  const countryEntries = [...originGroups.entries()].map(([code, origins]) => ({
    code,
    origins,
    country: origins[0].country,
    lat: origins[0].lat,
    lng: origins[0].lng,
  }));

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((leaflet) => {
      L = leaflet.default ?? leaflet;

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

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

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

  // Re-render markers whenever artist data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !L || !isLoaded || !countryEntries.length) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const map = mapInstanceRef.current;
    const totalArtists = artists.length || 1;

    countryEntries.forEach(({ code, country, origins, lat, lng }) => {
      const share = origins.length / totalArtists;
      const size = Math.max(24, Math.min(52, 24 + share * 140));
      const pulseColor = share > 0.2 ? '#17a84a' : share > 0.08 ? '#00b8e0' : '#6b24d6';

      const icon = L!.divIcon({
        className: '',
        html: `
          <div style="position:relative;width:${size}px;height:${size}px">
            <div style="
              position:absolute;inset:0;border-radius:50%;
              background:${pulseColor}18;border:1px solid ${pulseColor}55;
              animation:ping 2.2s cubic-bezier(0,0,0.2,1) infinite;
            "></div>
            <div style="
              position:absolute;inset:4px;border-radius:50%;
              background:${pulseColor}35;border:1.5px solid ${pulseColor};
              display:flex;align-items:center;justify-content:center;
              font-size:${Math.round(size * 0.28)}px;font-weight:700;color:${pulseColor};
              backdrop-filter:blur(4px);font-family:monospace;
            ">${origins.length}</div>
          </div>
          <style>@keyframes ping{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.32);opacity:.38}}</style>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L!.marker([lat, lng], { icon }).addTo(map);
      marker.on('click', (e) => {
        const point = map.latLngToContainerPoint(e.latlng);
        setSelected({ origins, country, code, position: { x: point.x, y: point.y } });
      });
      markersRef.current.push(marker);
    });
  }, [isLoaded, countryEntries.length, artists.length]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-white/5 bg-[#030609]">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '500px' }} />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass rounded-lg p-3 z-[400]">
        <p className="text-xs text-slate-400 font-medium mb-2">Artist Share</p>
        <div className="flex flex-col gap-1.5">
          {[
            { label: 'High (>20%)',  color: '#17a84a' },
            { label: 'Medium (8–20%)', color: '#00b8e0' },
            { label: 'Low (<8%)',   color: '#6b24d6' },
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
        <div className="absolute inset-0 flex items-center justify-center bg-[#030609] z-[500]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading map…</p>
          </div>
        </div>
      )}

      {/* Country popup */}
      {selected && (
        <div
          className="absolute z-[500] w-72"
          style={{
            left: Math.min(selected.position.x, (typeof window !== 'undefined' ? window.innerWidth : 1024) - 310),
            top: Math.max(selected.position.y - 20, 10),
          }}
        >
          <Card glow="cyan" className="shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {countryCodeToEmoji(selected.code)} {selected.country}
                </h3>
                <p className="text-xs text-slate-500">
                  {selected.origins.length} artist{selected.origins.length !== 1 ? 's' : ''} from this region
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-3">
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                <Users className="w-3 h-3" /> Your Top Artists Here
              </p>
              <div className="space-y-2">
                {selected.origins.slice(0, 4).map(({ artist }) => (
                  <a
                    key={artist.id}
                    href={artist.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 group"
                  >
                    <img
                      src={getImageUrl(artist.images)}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-cyan-500/30"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate group-hover:text-cyan-400 transition-colors">
                        {artist.name}
                      </p>
                      <p className="text-xs text-slate-600">
                        {formatNumber(artist.followers.total)} followers
                      </p>
                    </div>
                  </a>
                ))}
                {selected.origins.length > 4 && (
                  <p className="text-xs text-slate-600">
                    +{selected.origins.length - 4} more artist{selected.origins.length - 4 > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-600 italic">
              Origin estimated from genre data
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
