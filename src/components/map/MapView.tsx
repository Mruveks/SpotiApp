'use client';

import dynamic from 'next/dynamic';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatNumber } from '@/components/ui/StatNumber';
import { useTopArtists } from '@/hooks/useSpotify';
import { groupArtistsByOrigin } from '@/lib/spotify/analytics';
import { formatNumber, countryCodeToEmoji, getImageUrl } from '@/lib/utils';
import { Globe, Activity, Users } from 'lucide-react';

const WorldMap = dynamic(
  () => import('@/components/map/WorldMap').then((m) => m.WorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] rounded-xl bg-[#060c12]/80 border border-white/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Globe className="w-8 h-8 text-green-400 animate-pulse" />
          <p className="text-xs text-slate-400">Loading world map…</p>
        </div>
      </div>
    ),
  }
);

export function MapView() {
  const { data: artists = [], isLoading } = useTopArtists('medium_term');

  const originGroups = groupArtistsByOrigin(artists);
  const countryEntries = [...originGroups.entries()]
    .map(([code, origins]) => ({ code, origins, country: origins[0].country }))
    .sort((a, b) => b.origins.length - a.origins.length);

  const totalCountries = countryEntries.length;
  const topCountry = countryEntries[0];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card glow="green">
          <StatNumber value={artists.length} label="Artists Mapped" color="green" />
        </Card>
        <Card glow="cyan">
          <StatNumber value={totalCountries} label="Countries of Origin" color="cyan" />
        </Card>
        <Card glow="purple">
          <StatNumber
            value={topCountry ? countryCodeToEmoji(topCountry.code) : '—'}
            label="Top Region"
            color="purple"
          />
        </Card>
        <Card>
          <StatNumber
            value={topCountry?.origins.length ?? 0}
            label="Artists from #1 Region"
            color="pink"
          />
        </Card>
      </div>

      {/* Map */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 pb-0 flex items-center justify-between">
          <CardHeader
            title="Artist Origins Map"
            icon={<Globe className="w-4 h-4" />}
            subtitle="Genre-estimated country of origin for your top artists"
            className="mb-0"
          />
          <div className="flex items-center gap-2">
            <Badge variant="green">{totalCountries} Regions</Badge>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs text-cyan-400">Genre Data</span>
            </div>
          </div>
        </div>
        <div className="p-4 pt-2" style={{ height: '560px' }}>
          <WorldMap />
        </div>
      </Card>

      {/* Country breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          Artist Origins Breakdown
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-36 rounded-xl skeleton" />
            ))}
          </div>
        ) : countryEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Globe className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Sign in and listen to music to build your artist map</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {countryEntries.slice(0, 8).map(({ code, country, origins }) => {
              const score = Math.round((origins.length / artists.length) * 100);
              const glowVariant = score > 20 ? 'green' : score > 10 ? 'cyan' : 'none';

              return (
                <Card key={code} hover glow={glowVariant}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{countryCodeToEmoji(code)}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-100">{country}</p>
                        <p className="text-xs text-slate-500">
                          {origins.length} artist{origins.length !== 1 ? 's' : ''} · <span className="text-green-400 font-mono">{score}%</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activity bar */}
                  <div className="mb-3">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${score}%`,
                          background: score > 20 ? '#17a84a' : score > 10 ? '#00b8e0' : '#6b24d6',
                        }}
                      />
                    </div>
                  </div>

                  {/* Artist avatars */}
                  <div className="mb-3">
                    <p className="text-xs text-slate-600 flex items-center gap-1 mb-1.5">
                      <Users className="w-3 h-3" /> Artists
                    </p>
                    <div className="flex -space-x-2">
                      {origins.slice(0, 4).map(({ artist }) => (
                        <img
                          key={artist.id}
                          src={getImageUrl(artist.images)}
                          alt={artist.name}
                          title={artist.name}
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-[#030609]"
                        />
                      ))}
                      {origins.length > 4 && (
                        <div className="w-7 h-7 rounded-full ring-2 ring-[#030609] bg-white/10 flex items-center justify-center">
                          <span className="text-xs text-slate-400">+{origins.length - 4}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Artist names */}
                  <div className="space-y-0.5">
                    {origins.slice(0, 2).map(({ artist }) => (
                      <p key={artist.id} className="text-xs text-slate-400 truncate">
                        {artist.name}
                        <span className="text-slate-600 ml-1">· {formatNumber(artist.followers.total)} followers</span>
                      </p>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
