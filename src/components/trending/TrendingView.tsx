'use client';

import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatNumber } from '@/components/ui/StatNumber';
import { GlowButton } from '@/components/ui/GlowButton';
import { TrendingList } from './TrendingList';
import {
  mockTrendingItems,
  mockGlobalStats,
  mockArtists,
  mockRegions,
} from '@/lib/spotify/mockData';
import { formatNumber, countryCodeToEmoji, getImageUrl } from '@/lib/utils';
import { Globe, TrendingUp, Flame, Users, Music, ArrowUp } from 'lucide-react';

const REGIONS = ['Global', 'Europe', 'Americas', 'Asia', 'Oceania'] as const;

export function TrendingView() {
  const [selectedRegion, setSelectedRegion] = useState<string>('Global');

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card glow="green">
          <StatNumber value={formatNumber(mockGlobalStats.totalActiveUsers)} label="Active Listeners" color="green" change={12} />
        </Card>
        <Card glow="cyan">
          <StatNumber value={formatNumber(mockGlobalStats.totalTracksPlayed)} label="Tracks Played Today" color="cyan" change={8} />
        </Card>
        <Card glow="purple">
          <StatNumber value="195" label="Countries Active" color="purple" />
        </Card>
        <Card glow="none">
          <StatNumber value={mockTrendingItems.length} label="Viral Tracks" color="pink" change={34} />
        </Card>
      </div>

      {/* Region selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <Globe className="w-4 h-4 text-slate-500" />
        {REGIONS.map((region) => (
          <GlowButton
            key={region}
            variant={selectedRegion === region ? 'cyan' : 'ghost'}
            size="sm"
            onClick={() => setSelectedRegion(region)}
          >
            {region}
          </GlowButton>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main trending */}
        <div className="xl:col-span-2 space-y-6">
          {/* Viral chart */}
          <Card>
            <CardHeader
              title="Viral Tracks Chart"
              icon={<Flame className="w-4 h-4" />}
              subtitle={`Top 50 · ${selectedRegion}`}
              action={
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-xs text-red-400">HOT</span>
                </div>
              }
            />
            <div className="space-y-1">
              {mockTrendingItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-150 group border border-transparent hover:border-white/5"
                >
                  {/* Rank */}
                  <div className="w-8 text-center flex-shrink-0">
                    {index < 3 ? (
                      <Flame className={`w-5 h-5 mx-auto ${
                        index === 0 ? 'text-yellow-400' : index === 1 ? 'text-orange-400' : 'text-red-400'
                      }`} />
                    ) : (
                      <span className="text-sm font-mono text-slate-600">{item.rank}</span>
                    )}
                  </div>

                  {/* Image */}
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/40/40`;
                    }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-green-400 transition-colors">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{item.artist}</p>
                  </div>

                  {/* Trend bar */}
                  <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <ArrowUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs font-mono text-green-400 font-bold">+{item.change}%</span>
                    </div>
                    <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${Math.min(100, item.change)}%` }}
                      />
                    </div>
                  </div>

                  <Badge variant="green" size="sm" className="flex-shrink-0">Viral</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Country comparison */}
          <Card>
            <CardHeader title="Country Rankings" icon={<Globe className="w-4 h-4" />} subtitle="by music activity score" />
            <div className="space-y-3">
              {mockGlobalStats.topCountries.map((c, i) => (
                <div key={c.code} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-600 w-4">{i + 1}</span>
                  <span className="text-lg">{countryCodeToEmoji(c.code)}</span>
                  <span className="text-sm text-slate-300 flex-1">{c.country}</span>
                  <div className="flex items-center gap-2 w-40">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${c.score}%`,
                          background: `linear-gradient(90deg, #1db954, #00d4ff)`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-400 w-6 text-right">{c.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Emerging artists */}
          <Card>
            <CardHeader
              title="Emerging Artists"
              icon={<Users className="w-4 h-4" />}
              action={<Badge variant="yellow">Rising</Badge>}
            />
            <div className="space-y-3">
              {mockArtists.slice(4, 6).concat(mockArtists.slice(0, 3)).map((artist, i) => (
                <div key={artist.id} className="flex items-center gap-3 group">
                  <img
                    src={getImageUrl(artist.images)}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-green-500/30 transition-all"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{artist.name}</p>
                    <p className="text-xs text-slate-500">{formatNumber(artist.followers.total)} followers</p>
                    <div className="flex gap-1 mt-0.5">
                      {artist.genres.slice(0, 1).map((g) => (
                        <span key={g} className="text-xs text-slate-600 bg-white/5 rounded px-1">{g}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-green-400">+{[45, 28, 67, 34, 89][i % 5]}%</p>
                    <p className="text-xs text-slate-600">growth</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Regional trending */}
          {mockRegions.slice(0, 3).map((region) => (
            <Card key={region.countryCode} hover>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{countryCodeToEmoji(region.countryCode)}</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{region.country}</p>
                    <p className="text-xs text-slate-500">Score: <span className="text-green-400">{region.activityScore}</span></p>
                  </div>
                </div>
                <Badge variant={region.activityScore > 85 ? 'green' : region.activityScore > 70 ? 'cyan' : 'purple'}>
                  {region.activityScore > 85 ? 'HOT' : region.activityScore > 70 ? 'Active' : 'Growing'}
                </Badge>
              </div>
              <div className="space-y-1">
                {region.trending.slice(0, 3).map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 truncate flex-1">{t.name}</span>
                    <span className="text-green-400 ml-2 flex-shrink-0">+{t.change}%</span>
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
