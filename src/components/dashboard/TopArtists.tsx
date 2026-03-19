'use client';

import { SpotifyArtist } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { formatNumber, getImageUrl } from '@/lib/utils';
import { Users, ExternalLink } from 'lucide-react';

interface TopArtistsProps {
  artists: SpotifyArtist[];
  title?: string;
  limit?: number;
  layout?: 'list' | 'grid';
}

export function TopArtists({ artists, title = 'Top Artists', limit = 8, layout = 'grid' }: TopArtistsProps) {
  const displayed = artists.slice(0, limit);

  if (layout === 'grid') {
    return (
      <Card className="h-full">
        <CardHeader title={title} icon={<Users className="w-4 h-4" />} />
        <div className="grid grid-cols-2 gap-3">
          {displayed.map((artist, index) => (
            <div
              key={artist.id}
              className="relative flex items-center gap-2 p-2 rounded-lg bg-white/3 hover:bg-white/8 border border-white/5 hover:border-green-500/20 transition-all duration-200 group overflow-hidden"
            >
              {/* Rank badge */}
              <span className="absolute top-1 left-1 text-xs font-bold text-green-400/60 font-mono">
                #{index + 1}
              </span>

              <img
                src={getImageUrl(artist.images)}
                alt=""
                className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-green-500/30 transition-all flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-green-400 transition-colors">
                  {artist.name}
                </p>
                <p className="text-xs text-slate-600 truncate">
                  {formatNumber(artist.followers.total)} followers
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500/60 rounded-full"
                      style={{ width: `${artist.popularity}%` }}
                    />
                  </div>
                </div>
              </div>
              <a
                href={artist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-green-400 flex-shrink-0"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // List layout
  return (
    <Card className="h-full">
      <CardHeader title={title} icon={<Users className="w-4 h-4" />} />
      <div className="space-y-2">
        {displayed.map((artist, index) => (
          <div key={artist.id} className="flex items-center gap-3 group">
            <span className="text-xs font-mono text-slate-600 w-5">{index + 1}</span>
            <img
              src={getImageUrl(artist.images)}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{artist.name}</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {artist.genres.slice(0, 2).map((g) => (
                  <span key={g} className="text-xs text-slate-600 bg-white/5 rounded px-1">{g}</span>
                ))}
              </div>
            </div>
            <span className="text-xs text-slate-600">{artist.popularity}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
