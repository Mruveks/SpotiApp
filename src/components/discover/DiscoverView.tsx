'use client';

import { useTopArtists, useTopTracks, useSavedTracks } from '@/hooks/useSpotify';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GlowButton } from '@/components/ui/GlowButton';
import { getImageUrl, formatDuration, formatNumber } from '@/lib/utils';
import { Compass, Play, ExternalLink, Heart, Zap, Music, Star, Music2 } from 'lucide-react';
import { useState } from 'react';
import { SpotifyTrack } from '@/types';

interface TrackCardProps {
  track: SpotifyTrack;
  index: number;
}

function TrackCard({ track, index }: TrackCardProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group relative p-3 rounded-xl border border-white/5 hover:border-green-500/20 bg-white/2 hover:bg-white/5 transition-all duration-200 cursor-pointer">
      {/* Index badge */}
      <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-[#030609] border border-white/10 flex items-center justify-center z-10">
        <span className="text-xs font-mono text-slate-500">{index + 1}</span>
      </div>

      {/* Album art */}
      <div className="relative mb-3 aspect-square rounded-lg overflow-hidden">
        <img
          src={getImageUrl(track.album.images)}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
          <button className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center hover:scale-110 transition-transform">
            <Play className="w-4 h-4 text-black fill-black" />
          </button>
          <a
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-white hover:text-green-400 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-green-400 transition-colors">
          {track.name}
        </p>
        <p className="text-xs text-slate-500 truncate">
          {track.artists.map((a) => a.name).join(', ')}
        </p>
        <p className="text-xs text-slate-600 truncate">{track.album.name}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <span className="text-xs font-mono text-slate-600">{formatDuration(track.duration_ms)}</span>
        <button
          onClick={() => setLiked(!liked)}
          className={`transition-colors ${liked ? 'text-pink-400' : 'text-slate-600 hover:text-pink-400'}`}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}

type TabId = 'recent' | 'saved' | 'alltime';

export function DiscoverView() {
  const { selectedTimeRange } = useAppStore();
  const { data: shortTracks = [], isLoading: shortLoading } = useTopTracks('short_term');
  const { data: longTracks = [], isLoading: longLoading } = useTopTracks('long_term');
  const { data: savedTracks = [], isLoading: savedLoading } = useSavedTracks();
  const { data: artists = [] } = useTopArtists(selectedTimeRange);

  const [activeTab, setActiveTab] = useState<TabId>('recent');

  const tabs: { id: TabId; label: string; description: string }[] = [
    { id: 'recent',  label: 'Hot Right Now',  description: 'Your top tracks this month' },
    { id: 'saved',   label: 'Saved Tracks',    description: 'Your liked songs library' },
    { id: 'alltime', label: 'All-Time Favs',   description: 'Your top tracks over all time' },
  ];

  const activeData: SpotifyTrack[] = activeTab === 'recent'
    ? shortTracks
    : activeTab === 'saved'
    ? savedTracks
    : longTracks;

  const isLoading = activeTab === 'recent'
    ? shortLoading
    : activeTab === 'saved'
    ? savedLoading
    : longLoading;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card glow="cyan" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <Badge variant="cyan">Your Music Library</Badge>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-1">Explore Your Collection</h2>
            <p className="text-sm text-slate-400 max-w-md">
              Your recent hits, saved library, and all-time favourites — real data from your Spotify account.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-center">
            {[
              { icon: Zap, label: 'Real-Time',   color: 'text-yellow-400' },
              { icon: Music, label: 'Your Music', color: 'text-green-400' },
              { icon: Star, label: 'Personalised', color: 'text-purple-400' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className={`w-6 h-6 ${color}`} />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Tab selector */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <GlowButton
            key={tab.id}
            variant={activeTab === tab.id ? 'cyan' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </GlowButton>
        ))}
      </div>

      {/* Track grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            {tabs.find((t) => t.id === activeTab)?.description}
          </h3>
          <span className="text-xs text-slate-600">
            {activeData.length} track{activeData.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl skeleton" />
            ))}
          </div>
        ) : activeData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Music2 className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">
              {activeTab === 'saved'
                ? 'No saved tracks found — like some songs on Spotify first!'
                : 'No data yet — listen to more music on Spotify'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {activeData.slice(0, 15).map((track, i) => (
              <TrackCard key={track.id} track={track} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Artist recommendations */}
      {artists.length > 0 && (
        <Card>
          <CardHeader
            title="Your Top Artists"
            icon={<Star className="w-4 h-4" />}
            subtitle="based on your listening history"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {artists.slice(0, 6).map((artist) => (
              <a
                key={artist.id}
                href={artist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-all group cursor-pointer"
              >
                <img
                  src={getImageUrl(artist.images)}
                  alt={artist.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-transparent group-hover:ring-green-500/40 transition-all"
                />
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-200 truncate w-full text-center group-hover:text-green-400 transition-colors">
                    {artist.name}
                  </p>
                  <p className="text-xs text-slate-600">{formatNumber(artist.followers.total)}</p>
                </div>
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Mood playlists (static UI — open Spotify for actual playlist) */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Browse by Mood</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { mood: 'Focus',     emoji: '🎯', color: 'from-blue-500/20 to-blue-900/10',   border: 'border-blue-500/20',   query: 'focus+study' },
            { mood: 'Workout',   emoji: '⚡', color: 'from-red-500/20 to-red-900/10',     border: 'border-red-500/20',    query: 'workout+energy' },
            { mood: 'Chill',     emoji: '🌊', color: 'from-cyan-500/20 to-cyan-900/10',   border: 'border-cyan-500/20',   query: 'chill+relax' },
            { mood: 'Happy',     emoji: '☀️', color: 'from-yellow-500/20 to-yellow-900/10', border: 'border-yellow-500/20', query: 'happy+feel+good' },
            { mood: 'Late Night', emoji: '🌙', color: 'from-purple-500/20 to-purple-900/10', border: 'border-purple-500/20', query: 'late+night+vibes' },
            { mood: 'Party',     emoji: '🎉', color: 'from-pink-500/20 to-pink-900/10',   border: 'border-pink-500/20',   query: 'party+dance' },
          ].map(({ mood, emoji, color, border, query }) => (
            <a
              key={mood}
              href={`https://open.spotify.com/search/${query}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-4 rounded-xl bg-gradient-to-br ${color} border ${border} hover:scale-105 transition-all cursor-pointer text-center block`}
            >
              <div className="text-2xl mb-2">{emoji}</div>
              <p className="text-xs font-semibold text-slate-200">{mood}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
