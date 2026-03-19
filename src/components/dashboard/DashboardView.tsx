'use client';

import {
  useTopTracks,
  useTopArtists,
  useGenreStats,
  useListeningActivity,
  useAudioProfile,
  useMusicScore,
  useAIInsights,
  usePersonalTrending,
} from '@/hooks/useSpotify';
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
import { formatNumber, getTimeRangeLabel } from '@/lib/utils';
import { Clock, BarChart2, Music, Users } from 'lucide-react';

const TIME_RANGES = ['short_term', 'medium_term', 'long_term'] as const;

export function DashboardView() {
  const { selectedTimeRange, setSelectedTimeRange } = useAppStore();
  const { data: tracks = [], isLoading: tracksLoading } = useTopTracks(selectedTimeRange);
  const { data: artists = [], isLoading: artistsLoading } = useTopArtists(selectedTimeRange);
  const { data: genres } = useGenreStats(selectedTimeRange);
  const { data: activity, isLoading: activityLoading } = useListeningActivity();
  const { data: audioProfile } = useAudioProfile(selectedTimeRange);
  const { data: score } = useMusicScore(selectedTimeRange);
  const { data: insights = [] } = useAIInsights();
  const { data: trending = [] } = usePersonalTrending();

  const totalMinutes = activity?.reduce((sum, d) => sum + d.minutes, 0) ?? 0;

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
          <Users className="w-8 h-8 text-purple-500/10 absolute bottom-3 right-3" />
        </Card>
        <Card glow="none">
          <StatNumber
            value={genres.length}
            label="Genres in Rotation"
            color="pink"
          />
          <BarChart2 className="w-8 h-8 text-pink-500/10 absolute bottom-3 right-3" />
        </Card>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Tracks + Artists */}
        <div className="xl:col-span-2 space-y-6">
          {/* Activity chart */}
          <Card>
            <CardHeader
              title="Listening Activity"
              icon={<BarChart2 className="w-4 h-4" />}
              subtitle="minutes & tracks from recent history"
            />
            {activityLoading ? (
              <div className="h-48 flex items-center justify-center">
                <span className="text-xs text-slate-500">Loading activity…</span>
              </div>
            ) : activity && activity.length > 0 ? (
              <ActivityChart data={activity} />
            ) : (
              <div className="h-48 flex items-center justify-center">
                <span className="text-xs text-slate-500">
                  No recent listening history available
                </span>
              </div>
            )}
          </Card>

          {/* Tracks */}
          <TopTracks
            tracks={tracks}
            title={`Top Tracks · ${getTimeRangeLabel(selectedTimeRange)}`}
            limit={8}
          />

          {/* Artists */}
          <TopArtists
            artists={artists}
            title={`Top Artists · ${getTimeRangeLabel(selectedTimeRange)}`}
            limit={8}
            layout="grid"
          />
        </div>

        {/* Right: Score + Genres + Insights */}
        <div className="space-y-6">
          {/* Music Score */}
          {score ? (
            <MusicScoreCard score={score} />
          ) : (
            <Card glow="purple">
              <div className="h-48 flex items-center justify-center">
                <span className="text-xs text-slate-500">
                  {tracksLoading || artistsLoading ? 'Computing score…' : 'Sign in to see your Music Intelligence Score'}
                </span>
              </div>
            </Card>
          )}

          {/* Genre breakdown */}
          {genres.length > 0 && (
            <Card>
              <CardHeader title="Genre Breakdown" />
              <GenrePieChart data={genres} />
              <div className="mt-3 grid grid-cols-2 gap-1">
                {genres.slice(0, 6).map((g) => (
                  <div key={g.genre} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: g.color }}
                    />
                    <span className="text-xs text-slate-400 truncate">{g.genre}</span>
                    <span className="text-xs text-slate-600 ml-auto">{g.percentage}%</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Audio profile (genre-estimated) */}
          {audioProfile && (
            <Card>
              <CardHeader
                title="Sound Profile"
                subtitle="estimated from your genres"
              />
              <AudioRadarChart profile={audioProfile} />
            </Card>
          )}

          {/* Personal trending */}
          {trending.length > 0 && (
            <TrendingList items={trending} title="Rising in Your Charts" />
          )}
        </div>
      </div>

      {/* AI Insights full width */}
      {insights.length > 0 && <AIInsights insights={insights} />}
    </div>
  );
}
