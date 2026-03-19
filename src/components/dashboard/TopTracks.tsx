'use client';

import { SpotifyTrack } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { formatDuration, getImageUrl } from '@/lib/utils';
import { Music, ExternalLink, Play } from 'lucide-react';
import { useState } from 'react';

interface TopTracksProps {
  tracks: SpotifyTrack[];
  title?: string;
  limit?: number;
}

export function TopTracks({ tracks, title = 'Top Tracks', limit = 10 }: TopTracksProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const displayed = tracks.slice(0, limit);

  return (
    <Card className="h-full">
      <CardHeader title={title} icon={<Music className="w-4 h-4" />} />
      <div className="space-y-1">
        {displayed.map((track, index) => (
          <div
            key={track.id}
            onMouseEnter={() => setHoveredId(track.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-150 group"
          >
            {/* Rank */}
            <span className="text-xs font-mono text-slate-600 w-5 text-center flex-shrink-0">
              {hoveredId === track.id ? (
                <Play className="w-3 h-3 text-green-400" />
              ) : (
                index + 1
              )}
            </span>

            {/* Album art */}
            <div className="relative flex-shrink-0">
              <img
                src={getImageUrl(track.album.images)}
                alt=""
                className="w-9 h-9 rounded object-cover"
              />
              {hoveredId === track.id && (
                <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
              )}
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate group-hover:text-green-400 transition-colors">
                {track.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {track.artists.map((a) => a.name).join(', ')}
              </p>
            </div>

            {/* Duration */}
            <span className="text-xs text-slate-600 flex-shrink-0 font-mono">
              {formatDuration(track.duration_ms)}
            </span>

            {/* Popularity bar */}
            <div className="hidden sm:flex items-center gap-1 w-16 flex-shrink-0">
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${track.popularity}%` }}
                />
              </div>
            </div>

            {/* External link */}
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-green-400"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>
    </Card>
  );
}
