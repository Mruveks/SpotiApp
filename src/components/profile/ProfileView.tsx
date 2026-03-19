'use client';

import { useSession } from 'next-auth/react';
import { useTopTracks, useTopArtists, useRecentlyPlayed, useAudioProfile, useGenreStats, useRecommendations } from '@/hooks/useSpotify';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TopTracks } from '@/components/dashboard/TopTracks';
import { TopArtists } from '@/components/dashboard/TopArtists';
import { AudioRadarChart } from '@/components/charts/GenreChart';
import { GlowButton } from '@/components/ui/GlowButton';
import { formatNumber, getTimeRangeLabel, calculateAudioMoodLabel, getImageUrl } from '@/lib/utils';
import {
  User, Music, Clock, Heart, ExternalLink, Headphones
} from 'lucide-react';
import Link from 'next/link';

const TIME_RANGES = ['short_term', 'medium_term', 'long_term'] as const;

export function ProfileView() {
  const { data: session } = useSession();
  const { selectedTimeRange, setSelectedTimeRange } = useAppStore();

  const { data: tracks = [] } = useTopTracks(selectedTimeRange);
  const { data: artists = [] } = useTopArtists(selectedTimeRange);
  const { data: recent = [] } = useRecentlyPlayed();
  const { data: audioProfile } = useAudioProfile(selectedTimeRange);
  const { data: genres } = useGenreStats(selectedTimeRange);
  const { data: recommendations = [] } = useRecommendations(selectedTimeRange);

  const moodLabel = audioProfile
    ? calculateAudioMoodLabel(audioProfile.valence, audioProfile.energy)
    : 'Analyzing...';

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
          <User className="w-10 h-10 text-green-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-200 mb-2">Connect Your Spotify</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-md">
            Sign in with Spotify to see your personal music analytics, top tracks, artists, and AI-powered insights.
          </p>
          <Link href="/login">
            <GlowButton size="lg" variant="green">Connect Spotify Account</GlowButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <Card glow="green" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent" />
        <div className="relative flex items-center gap-4">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="w-16 h-16 rounded-full ring-4 ring-green-500/30 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-500/20 ring-4 ring-green-500/30 flex items-center justify-center">
              <User className="w-8 h-8 text-green-400" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{session.user?.name}</h2>
            <p className="text-sm text-slate-400">{session.user?.email}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="green">Spotify Connected</Badge>
              <Badge variant="cyan">{moodLabel}</Badge>
              <Badge variant="purple">{genres[0]?.genre ?? 'Music Lover'}</Badge>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-center">
            <div>
              <p className="text-lg font-bold text-green-400 font-mono">{tracks.length}</p>
              <p className="text-xs text-slate-500">Top Tracks</p>
            </div>
            <div>
              <p className="text-lg font-bold text-cyan-400 font-mono">{artists.length}</p>
              <p className="text-xs text-slate-500">Artists</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-400 font-mono">{genres.length}</p>
              <p className="text-xs text-slate-500">Genres</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Time range */}
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

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <TopTracks tracks={tracks} title="Your Top Tracks" limit={10} />
          <TopArtists artists={artists} title="Your Top Artists" limit={8} layout="grid" />

          {/* Recently Played */}
          <Card>
            <CardHeader title="Recently Played" icon={<Clock className="w-4 h-4" />} />
            <div className="space-y-1">
              {recent.slice(0, 10).map((item, i) => (
                <div key={`${item.track.id}-${i}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group transition-all">
                  <img
                    src={getImageUrl(item.track.album.images)}
                    alt=""
                    className="w-8 h-8 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{item.track.name}</p>
                    <p className="text-xs text-slate-500 truncate">{item.track.artists[0]?.name}</p>
                  </div>
                  <span className="text-xs text-slate-600 flex-shrink-0">
                    {new Date(item.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Sound Profile */}
          {audioProfile && (
            <Card glow="cyan">
              <CardHeader title="Your Sound Profile" icon={<Headphones className="w-4 h-4" />} />
              <AudioRadarChart profile={audioProfile} />
              <div className="grid grid-cols-2 gap-2 mt-3">
                {[
                  { label: 'Danceability', value: audioProfile.danceability, color: '#1db954' },
                  { label: 'Energy', value: audioProfile.energy, color: '#00d4ff' },
                  { label: 'Positivity', value: audioProfile.valence, color: '#f472b6' },
                  { label: 'Acoustic', value: audioProfile.acousticness, color: '#7c3aed' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-2 rounded bg-white/3">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm font-bold font-mono" style={{ color }}>{Math.round(value * 100)}%</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader title="Recommended For You" icon={<Heart className="w-4 h-4" />} subtitle="based on your taste" />
            <div className="space-y-2">
              {recommendations.slice(0, 6).map((track) => (
                <div key={track.id} className="flex items-center gap-2 group">
                  <img
                    src={getImageUrl(track.album.images)}
                    alt=""
                    className="w-8 h-8 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate group-hover:text-green-400 transition-colors">
                      {track.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{track.artists[0]?.name}</p>
                  </div>
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="w-3 h-3 text-slate-500 hover:text-green-400" />
                  </a>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
