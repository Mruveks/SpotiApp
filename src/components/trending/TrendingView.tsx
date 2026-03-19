'use client';

import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatNumber } from '@/components/ui/StatNumber';
import { GlowButton } from '@/components/ui/GlowButton';
import { TrendingList } from './TrendingList';
import {
  useTopTracks,
  useTopArtists,
  useListeningActivity,
  usePersonalTrending,
} from '@/hooks/useSpotify';
import { useAppStore } from '@/store/useAppStore';
import { formatNumber, getImageUrl } from '@/lib/utils';
import { TrendingUp, Flame, Users, BarChart2, ArrowUp, Music2 } from 'lucide-react';

const TIME_RANGES = ['short_term', 'medium_term', 'long_term'] as const;
const RANGE_LABEL: Record<string, string> = {
  short_term: 'Last 4 Weeks',
  medium_term: 'Last 6 Months',
  long_term: 'All Time',
};

export function TrendingView() {
  const { selectedTimeRange, setSelectedTimeRange } = useAppStore();
  const { data: shortTracks = [], isLoading: tracksLoading } = useTopTracks('short_term');
  const { data: shortArtists = [], isLoading: artistsLoading } = useTopArtists('short_term');
  const { data: mediumArtists = [] } = useTopArtists('medium_term');
  const { data: activity = [], isLoading: activityLoading } = useListeningActivity();
  const { data: trending = [], isLoading: trendingLoading } = usePersonalTrending();

  const totalMinutes = activity.reduce((s, d) => s + d.minutes, 0);
  const totalTracks = activity.reduce((s, d) => s + d.tracks, 0);
  const activeDays = activity.length;

  // Artists that newly appeared in short-term (not in medium-term)
  const mediumArtistIds = new Set(mediumArtists.map((a) => a.id));
  const newArtists = shortArtists.filter((a) => !mediumArtistIds.has(a.id));
  const risingArtists = newArtists.length > 0 ? newArtists : shortArtists.slice(0, 5);

  const isLoading = tracksLoading || artistsLoading;

  return (
    <div className="space-y-6">
      {/* Personal stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card glow="green">
          <StatNumber value={formatNumber(totalMinutes)} label="Minutes Listened" color="green" />
        </Card>
        <Card glow="cyan">
          <StatNumber value={formatNumber(totalTracks)} label="Tracks Played" color="cyan" />
        </Card>
        <Card glow="purple">
          <StatNumber value={shortArtists.length} label="Artists This Month" color="purple" />
        </Card>
        <Card glow="none">
          <StatNumber value={activeDays} label="Active Days" color="pink" />
        </Card>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <TrendingUp className="w-4 h-4 text-slate-500" />
        {TIME_RANGES.map((range) => (
          <GlowButton
            key={range}
            variant={selectedTimeRange === range ? 'green' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTimeRange(range)}
          >
            {RANGE_LABEL[range]}
          </GlowButton>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Personal chart */}
        <div className="xl:col-span-2 space-y-6">
          {/* Rising tracks */}
          <Card>
            <CardHeader
              title="Your Personal Chart"
              icon={<Flame className="w-4 h-4" />}
              subtitle="Short-term top tracks ranked by recent listening"
              action={
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-400">Live Data</span>
                </div>
              }
            />
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-lg skeleton" />
                ))}
              </div>
            ) : shortTracks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Music2 className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No chart data yet — keep listening!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {shortTracks.slice(0, 15).map((track, index) => {
                  const trendItem = trending.find((t) => t.id === track.id);
                  const change = trendItem?.change ?? 0;

                  return (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-150 group border border-transparent hover:border-white/5"
                    >
                      {/* Rank */}
                      <div className="w-8 text-center flex-shrink-0">
                        {index < 3 ? (
                          <Flame
                            className={`w-5 h-5 mx-auto ${
                              index === 0 ? 'text-yellow-400' : index === 1 ? 'text-orange-400' : 'text-red-400'
                            }`}
                          />
                        ) : (
                          <span className="text-sm font-mono text-slate-600">{index + 1}</span>
                        )}
                      </div>

                      {/* Artwork */}
                      <img
                        src={track.album.images[0]?.url}
                        alt=""
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate group-hover:text-green-400 transition-colors">
                          {track.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {track.artists.map((a) => a.name).join(', ')}
                        </p>
                      </div>

                      {/* Trend indicator */}
                      {change > 0 && (
                        <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <ArrowUp className="w-3 h-3 text-green-400" />
                            <span className="text-xs font-mono text-green-400 font-bold">
                              +{change}%
                            </span>
                          </div>
                          <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${Math.min(100, change)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <Badge variant="green" size="sm" className="flex-shrink-0">
                        {track.album.release_date?.split('-')[0] ?? '—'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Listening activity breakdown */}
          {activity.length > 0 && (
            <Card>
              <CardHeader
                title="Listening Activity Breakdown"
                icon={<BarChart2 className="w-4 h-4" />}
                subtitle="most active days from recent history"
              />
              <div className="space-y-2">
                {[...activity]
                  .sort((a, b) => b.minutes - a.minutes)
                  .slice(0, 7)
                  .map((day) => (
                    <div key={day.date} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500 w-24 flex-shrink-0">
                        {new Date(day.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (day.minutes / Math.max(...activity.map((d) => d.minutes))) * 100)}%`,
                            background: 'linear-gradient(90deg, #17a84a, #00b8e0)',
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono text-slate-400 w-20 text-right flex-shrink-0">
                        {day.minutes} min · {day.tracks} tracks
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Rising artists */}
          <Card>
            <CardHeader
              title={newArtists.length > 0 ? 'New in Your Rotation' : 'Your Top Artists'}
              icon={<Users className="w-4 h-4" />}
              action={
                <Badge variant={newArtists.length > 0 ? 'yellow' : 'green'}>
                  {newArtists.length > 0 ? 'Rising' : 'Top'}
                </Badge>
              }
            />
            {artistsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-lg skeleton" />
                ))}
              </div>
            ) : risingArtists.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                Listen more to see rising artists
              </p>
            ) : (
              <div className="space-y-3">
                {risingArtists.slice(0, 5).map((artist, i) => (
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
                          <span key={g} className="text-xs text-slate-600 bg-white/5 rounded px-1">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-green-400">#{i + 1}</p>
                      <p className="text-xs text-slate-600">rank</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Personal trending compact list */}
          {trending.length > 0 && (
            <TrendingList
              items={trending.slice(0, 8)}
              title="Rising Tracks"
            />
          )}

          {/* Top track details */}
          {shortTracks[0] && (
            <Card glow="green" hover>
              <CardHeader title="Your #1 Right Now" icon={<Flame className="w-4 h-4" />} />
              <div className="flex items-center gap-3 mt-1">
                <img
                  src={shortTracks[0].album.images[0]?.url}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-100 truncate">{shortTracks[0].name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {shortTracks[0].artists.map((a) => a.name).join(', ')}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 truncate">{shortTracks[0].album.name}</p>
                  <Badge variant="green" size="sm" className="mt-2">
                    {shortTracks[0].album.release_date?.split('-')[0]}
                  </Badge>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
