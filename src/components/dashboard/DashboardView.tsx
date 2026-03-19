'use client';

import { useTopTracks, useTopArtists, useGenreStats, useListeningActivity, useAudioProfile } from '@/hooks/useSpotify';
import { useAppStore } from '@/store/useAppStore';
import { MusicScoreCard } from '@/components/dashboard/MusicScore';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { TopTracks } from '@/components/dashboard/TopTracks';
import { TopArtists } from '@/components/dashboard/TopArtists';
import { TrendingList } from '@/components/trending/TrendingList';
import { ActivityChart } from '@/components/charts/ActivityChart';
import { GenrePieChart, AudioRadarChart } from '@/components/charts/GenreChart';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatNumber } from '@/components/ui/StatNumber';
import { GlowButton } from '@/components/ui/GlowButton';
import { mockTrendingItems, mockAIInsights, mockMusicScore } from '@/lib/spotify/mockData';
import { formatNumber, getTimeRangeLabel } from '@/lib/utils';
import { Clock, BarChart2, Music, Calendar } from 'lucide-react';

const TIME_RANGES = ['short_term', 'medium_term', 'long_term'] as const;

export function DashboardView() {
  const { selectedTimeRange, setSelectedTimeRange } = useAppStore();
  const { data: tracks = [], isLoading: tracksLoading } = useTopTracks(selectedTimeRange);
  const { data: artists = [], isLoading: artistsLoading } = useTopArtists(selectedTimeRange);
  const { data: genres } = useGenreStats(selectedTimeRange);
  const { data: activity } = useListeningActivity();
  const { data: audioProfile } = useAudioProfile(selectedTimeRange);

  // Calculate summary stats from data
  const totalMinutes = activity?.reduce((sum, d) => sum + d.minutes, 0) ?? 0;
  const avgPopularity = tracks.length
    ? Math.round(tracks.reduce((s, t) => s + t.popularity, 0) / tracks.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 mr-1">Period:</span>
        {TIME_RANGES.map((range) => (
          <GlowButton
            key={range}
            variant={selectedTimeRange === range ? 'green' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTimeRange(range)}
          >
            {getTimeRangeLabel(range)}
          </GlowButton>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card glow="green">
          <StatNumber
            value={formatNumber(totalMinutes)}
            label="Minutes Listened"
            color="green"
          />
          <Clock className="w-8 h-8 text-green-500/10 absolute bottom-3 right-3" />
        </Card>
        <Card glow="cyan">
          <StatNumber value={tracks.length} label="Unique Tracks" color="cyan" />
          <Music className="w-8 h-8 text-cyan-500/10 absolute bottom-3 right-3" />
        </Card>
        <Card glow="purple">
          <StatNumber value={artists.length} label="Artists Explored" color="purple" />
          <BarChart2 className="w-8 h-8 text-purple-500/10 absolute bottom-3 right-3" />
        </Card>
        <Card glow="none">
          <StatNumber value={avgPopularity} label="Avg Popularity" color="pink" />
          <Calendar className="w-8 h-8 text-pink-500/10 absolute bottom-3 right-3" />
        </Card>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Tracks + Artists */}
        <div className="xl:col-span-2 space-y-6">
          {/* Activity chart */}
          <Card>
            <CardHeader title="Listening Activity (30 Days)" icon={<BarChart2 className="w-4 h-4" />} subtitle="minutes & tracks per day" />
            {activity && <ActivityChart data={activity} />}
          </Card>

          {/* Tracks */}
          <TopTracks tracks={tracks} title={`Top Tracks · ${getTimeRangeLabel(selectedTimeRange)}`} limit={8} />

          {/* Artists */}
          <TopArtists artists={artists} title={`Top Artists · ${getTimeRangeLabel(selectedTimeRange)}`} limit={8} layout="grid" />
        </div>

        {/* Right: Score + Genres + Insights */}
        <div className="space-y-6">
          {/* Music Score */}
          <MusicScoreCard score={mockMusicScore} />

          {/* Genre breakdown */}
          <Card>
            <CardHeader title="Genre Breakdown" />
            <GenrePieChart data={genres} />
            <div className="mt-3 grid grid-cols-2 gap-1">
              {genres.slice(0, 6).map((g) => (
                <div key={g.genre} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
                  <span className="text-xs text-slate-400 truncate">{g.genre}</span>
                  <span className="text-xs text-slate-600 ml-auto">{g.percentage}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Audio profile */}
          {audioProfile && (
            <Card>
              <CardHeader title="Sound Profile" subtitle="audio features radar" />
              <AudioRadarChart profile={audioProfile} />
            </Card>
          )}

          {/* Trending */}
          <TrendingList items={mockTrendingItems} title="Global Trending" />
        </div>
      </div>

      {/* AI Insights full width */}
      <AIInsights insights={mockAIInsights} />
    </div>
  );
}
