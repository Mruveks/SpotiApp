/**
 * Custom hooks for Spotify data fetching.
 * Uses React Query. All data comes from the real Spotify Web API — no mock fallbacks.
 *
 * Hooks return { data, isLoading, error } so components can render appropriate
 * empty/error states instead of falling back to fake data.
 */

'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import {
  getUserTopTracks,
  getUserTopArtists,
  getRecentlyPlayed,
  getSavedTracks,
} from '@/lib/spotify/api';
import {
  estimateAudioProfileFromGenres,
  computeMusicScore,
  computeAIInsights,
  deriveTrendingFromTopTracks,
} from '@/lib/spotify/analytics';
import { TimeRange, GenreStats, AudioProfile, ListeningActivity } from '@/types';
import { getGenreColor } from '@/lib/utils';

function useAccessToken(): string | undefined {
  const { data: session } = useSession();
  return (session as { accessToken?: string })?.accessToken;
}

// ============================================================
// Core data hooks
// ============================================================

export function useTopTracks(timeRange: TimeRange = 'medium_term') {
  const token = useAccessToken();

  return useQuery({
    queryKey: ['top-tracks', timeRange],
    queryFn: async () => {
      if (!token) return [];
      const data = await getUserTopTracks(token, timeRange, 50);
      return data.items;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useTopArtists(timeRange: TimeRange = 'medium_term') {
  const token = useAccessToken();

  return useQuery({
    queryKey: ['top-artists', timeRange],
    queryFn: async () => {
      if (!token) return [];
      const data = await getUserTopArtists(token, timeRange, 50);
      return data.items;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useRecentlyPlayed() {
  const token = useAccessToken();

  return useQuery({
    queryKey: ['recently-played'],
    queryFn: async () => {
      if (!token) return [];
      const data = await getRecentlyPlayed(token, 50);
      return data.items;
    },
    enabled: !!token,
    staleTime: 60 * 1000,
    retry: 2,
  });
}

export function useSavedTracks() {
  const token = useAccessToken();

  return useQuery({
    queryKey: ['saved-tracks'],
    queryFn: async () => {
      if (!token) return [];
      const data = await getSavedTracks(token, 50);
      return data.items.map((i) => i.track);
    },
    enabled: !!token,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
}

// ============================================================
// Derived / computed hooks
// ============================================================

/** Genre stats derived from top artists' genres. */
export function useGenreStats(timeRange: TimeRange = 'medium_term'): {
  data: GenreStats[];
  isLoading: boolean;
} {
  const { data: artists = [], isLoading } = useTopArtists(timeRange);

  if (isLoading) return { data: [], isLoading: true };
  if (!artists.length) return { data: [], isLoading: false };

  const genreCounts: Record<string, number> = {};
  artists.forEach((artist) => {
    artist.genres.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] ?? 0) + 1;
    });
  });

  const total = Object.values(genreCounts).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const data: GenreStats[] = sorted.map(([genre, count]) => ({
    genre: genre.charAt(0).toUpperCase() + genre.slice(1),
    count,
    percentage: Math.round((count / total) * 100),
    color: getGenreColor(genre),
  }));

  return { data, isLoading: false };
}

/**
 * Audio profile estimated from top artist genres.
 * NOTE: The /audio-features endpoint was deprecated in November 2024.
 * This hook uses genre-based heuristics from analytics.ts instead.
 */
export function useAudioProfile(timeRange: TimeRange = 'medium_term'): {
  data: AudioProfile | undefined;
  isLoading: boolean;
} {
  const { data: artists = [], isLoading } = useTopArtists(timeRange);

  if (isLoading) return { data: undefined, isLoading: true };
  if (!artists.length) return { data: undefined, isLoading: false };

  const allGenres = artists.flatMap((a) => a.genres);
  const profile = estimateAudioProfileFromGenres(allGenres);
  return { data: profile, isLoading: false };
}

/** Listening activity grouped by day from recently played history. */
export function useListeningActivity(): {
  data: ListeningActivity[];
  isLoading: boolean;
} {
  const { data: recent = [], isLoading } = useRecentlyPlayed();

  if (isLoading) return { data: [], isLoading: true };
  if (!recent.length) return { data: [], isLoading: false };

  const byDay: Record<string, { minutes: number; tracks: number }> = {};
  recent.forEach((item) => {
    const day = item.played_at.split('T')[0];
    if (!byDay[day]) byDay[day] = { minutes: 0, tracks: 0 };
    byDay[day].minutes += item.track.duration_ms / 60_000;
    byDay[day].tracks += 1;
  });

  const activity: ListeningActivity[] = Object.entries(byDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, { minutes, tracks }]) => ({
      date,
      minutes: Math.round(minutes),
      tracks,
    }));

  return { data: activity, isLoading: false };
}

/** Music Intelligence Score computed from real user data. */
export function useMusicScore(timeRange: TimeRange = 'medium_term') {
  const { data: artists = [], isLoading: artistsLoading } = useTopArtists(timeRange);
  const { data: tracks = [], isLoading: tracksLoading } = useTopTracks(timeRange);
  const { data: recent = [], isLoading: recentLoading } = useRecentlyPlayed();

  const isLoading = artistsLoading || tracksLoading || recentLoading;

  if (isLoading || (!artists.length && !tracks.length)) {
    return { data: undefined, isLoading };
  }

  return { data: computeMusicScore(artists, tracks, recent), isLoading: false };
}

/** AI Insights computed by comparing short-term vs long-term listening patterns. */
export function useAIInsights() {
  const { data: shortArtists = [], isLoading: aLoad } = useTopArtists('short_term');
  const { data: longArtists = [], isLoading: bLoad } = useTopArtists('long_term');
  const { data: shortTracks = [], isLoading: cLoad } = useTopTracks('short_term');
  const { data: recent = [], isLoading: dLoad } = useRecentlyPlayed();

  const isLoading = aLoad || bLoad || cLoad || dLoad;

  if (isLoading || (!shortArtists.length && !longArtists.length)) {
    return { data: [], isLoading };
  }

  return {
    data: computeAIInsights(shortArtists, longArtists, shortTracks, recent),
    isLoading: false,
  };
}

/**
 * Personal trending: compares short-term top tracks to medium-term to compute
 * rank changes without any external/global API data.
 */
export function usePersonalTrending() {
  const { data: shortTracks = [], isLoading: aLoad } = useTopTracks('short_term');
  const { data: mediumTracks = [], isLoading: bLoad } = useTopTracks('medium_term');

  const isLoading = aLoad || bLoad;

  if (isLoading || !shortTracks.length) return { data: [], isLoading };

  return {
    data: deriveTrendingFromTopTracks(shortTracks, mediumTracks),
    isLoading: false,
  };
}
