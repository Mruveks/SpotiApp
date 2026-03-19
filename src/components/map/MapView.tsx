'use client';

import dynamic from 'next/dynamic';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatNumber } from '@/components/ui/StatNumber';
import { mockGlobalStats, mockRegions } from '@/lib/spotify/mockData';
import { formatNumber, countryCodeToEmoji, getImageUrl } from '@/lib/utils';
import { Globe, Activity, Users, Music } from 'lucide-react';

// Dynamic import to avoid SSR issues with Leaflet
const WorldMap = dynamic(
  () => import('@/components/map/WorldMap').then((m) => m.WorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] rounded-xl bg-[#0d1117]/80 border border-white/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Globe className="w-8 h-8 text-green-400 animate-pulse" />
          <p className="text-xs text-slate-400">Loading world map...</p>
        </div>
      </div>
    ),
  }
);

export function MapView() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card glow="green">
          <StatNumber value={formatNumber(mockGlobalStats.totalActiveUsers)} label="Global Listeners" color="green" />
        </Card>
        <Card glow="cyan">
          <StatNumber value={mockGlobalStats.topCountries.length} label="Active Markets" color="cyan" />
        </Card>
        <Card glow="purple">
          <StatNumber value="195" label="Countries Tracked" color="purple" />
        </Card>
        <Card>
          <StatNumber value={formatNumber(mockGlobalStats.totalTracksPlayed)} label="Tracks Played" color="pink" />
        </Card>
      </div>

      {/* Map */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 pb-0 flex items-center justify-between">
          <CardHeader
            title="Music Activity Heatmap"
            icon={<Globe className="w-4 h-4" />}
            subtitle="Click on any marker to explore regional data"
            className="mb-0"
          />
          <div className="flex items-center gap-2">
            <Badge variant="green">8 Regions Active</Badge>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400">Live</span>
            </div>
          </div>
        </div>
        <div className="p-4 pt-2" style={{ height: '560px' }}>
          <WorldMap />
        </div>
      </Card>

      {/* Region cards grid */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          Region Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {mockRegions.map((region) => (
            <Card key={region.countryCode} hover glow={region.activityScore > 85 ? 'green' : region.activityScore > 70 ? 'cyan' : 'none'}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{countryCodeToEmoji(region.countryCode)}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-100">{region.country}</p>
                    <p className="text-xs text-slate-500">Score: <span className="text-green-400 font-mono">{region.activityScore}</span></p>
                  </div>
                </div>
              </div>

              {/* Activity bar */}
              <div className="mb-3">
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${region.activityScore}%`,
                      background: region.activityScore > 85 ? '#1db954' : region.activityScore > 70 ? '#00d4ff' : '#7c3aed',
                    }}
                  />
                </div>
              </div>

              {/* Top artists */}
              <div className="mb-3">
                <p className="text-xs text-slate-600 flex items-center gap-1 mb-1.5">
                  <Users className="w-3 h-3" /> Top Artists
                </p>
                <div className="flex -space-x-2">
                  {region.topArtists.slice(0, 4).map((artist) => (
                    <img
                      key={artist.id}
                      src={getImageUrl(artist.images)}
                      alt={artist.name}
                      title={artist.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-[#070b14]"
                    />
                  ))}
                </div>
              </div>

              {/* Top track */}
              {region.topTracks[0] && (
                <div className="flex items-center gap-2">
                  <Music className="w-3 h-3 text-slate-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-300 truncate">{region.topTracks[0].name}</p>
                    <p className="text-xs text-slate-600 truncate">{region.topTracks[0].artists[0]?.name}</p>
                  </div>
                </div>
              )}

              {/* Trending */}
              <div className="mt-3 pt-3 border-t border-white/5">
                {region.trending.slice(0, 2).map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs py-0.5">
                    <span className="text-slate-500 truncate flex-1">{t.name}</span>
                    <span className="text-green-400 ml-2 flex-shrink-0 font-mono">+{t.change}%</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
