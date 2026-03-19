/**
 * Custom hooks for Spotify data fetching
 * Uses React Query with mock data fallback
 */

'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import {
  getUserTopTracks,
  getUserTopArtists,
  getRecentlyPlayed,
  getAudioFeatures,
  getRecommendations,
} from '@/lib/spotify/api';
import {
  mockTracks,
  mockArtists,
  mockRecentlyPlayed,
  mockAudioProfile,
  mockGenres,
  mockListeningActivity,
} from '@/lib/spotify/mockData';
import { TimeRange, GenreStats, AudioProfile, ListeningActivity } from '@/types';
import { getGenreColor } from '@/lib/utils';

function useAccessToken() {
  const { data: session } = useSession();
  return (session as { accessToken?: string })?.accessToken;
}

export function useTopTracks(timeRange: TimeRange = 'medium_term') {
  const token = useAccessToken();

  return useQuery({
    queryKey: ['top-tracks', timeRange, !!token],
    queryFn: async () => {
      if (!token) return mockTracks;
      const data = await getUserTopTracks(token, timeRange, 50);
      return data.items;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: mockTracks,
  });
}

export function useTopArtists(timeRange: TimeRange = 'medium_term') {
  const token = useAccessToken();

  return useQuery({
    queryKey: ['top-artists', timeRange, !!token],
    queryFn: async () => {
      if (!token) return mockArtists;
      const data = await getUserTopArtists(token, timeRange, 50);
      return data.items;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: mockArtists,
  });
}

export function useRecentlyPlayed() {
  const token = useAccessToken();

  return useQuery({
    queryKey: ['recently-played', !!token],
    queryFn: async () => {
      if (!token) return mockRecentlyPlayed;
      const data = await getRecentlyPlayed(token, 50);
      return data.items;
    },
    staleTime: 60 * 1000,
    placeholderData: mockRecentlyPlayed,
  });
}

export function useAudioProfile(timeRange: TimeRange = 'medium_term') {
  const token = useAccessToken();
  const { data: tracks } = useTopTracks(timeRange);

  return useQuery({
    queryKey: ['audio-profile', timeRange, !!token],
    queryFn: async (): Promise<AudioProfile> => {
      if (!token || !tracks?.length) return mockAudioProfile;

      const trackIds = tracks.slice(0, 50).map((t) => t.id);
      const { audio_features } = await getAudioFeatures(token, trackIds);

      const valid = audio_features.filter(Boolean);
      if (!valid.length) return mockAudioProfile;

      const avg = (key: keyof typeof valid[0]) =>
        valid.reduce((sum, f) => sum + (f[key] as number), 0) / valid.length;

      return {
        danceability: avg('danceability'),
        energy: avg('energy'),
        valence: avg('valence'),
        acousticness: avg('acousticness'),
        instrumentalness: avg('instrumentalness'),
        speechiness: avg('speechiness'),
        tempo: avg('tempo'),
      };
    },
    enabled: !!tracks,
    staleTime: 10 * 60 * 1000,
    placeholderData: mockAudioProfile,
  });
}

export function useGenreStats(timeRange: TimeRange = 'medium_term'): {
  data: GenreStats[];
  isLoading: boolean;
} {
  const { data: artists, isLoading } = useTopArtists(timeRange);

  if (isLoading || !artists) {
    return { data: mockGenres, isLoading };
  }

  const genreCounts: Record<string, number> = {};
  artists.forEach((artist) => {
    artist.genres.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] ?? 0) + 1;
    });
  });

  const total = Object.values(genreCounts).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const data: GenreStats[] = sorted.map(([genre, count]) => ({
    genre: genre.charAt(0).toUpperCase() + genre.slice(1),
    count,
    percentage: Math.round((count / total) * 100),
    color: getGenreColor(genre),
  }));

  return { data: data.length ? data : mockGenres, isLoading: false };
}

export function useListeningActivity(): {
  data: ListeningActivity[];
  isLoading: boolean;
} {
  const { data: recent, isLoading } = useRecentlyPlayed();

  if (isLoading || !recent) {
    return { data: mockListeningActivity, isLoading };
  }

  // Group by day
  const byDay: Record<string, { minutes: number; tracks: number }> = {};
  recent.forEach((item) => {
    const day = item.played_at.split('T')[0];
    if (!byDay[day]) byDay[day] = { minutes: 0, tracks: 0 };
    byDay[day].minutes += item.track.duration_ms / 60000;
    byDay[day].tracks += 1;
  });

  const activity: ListeningActivity[] = Object.entries(byDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, { minutes, tracks }]) => ({
      date,
      minutes: Math.round(minutes),
      tracks,
    }));

  // Merge with mock to ensure 30 days
  const merged = mockListeningActivity.map((m) => {
    const real = activity.find((a) => a.date === m.date);
    return real ?? m;
  });

  return { data: merged, isLoading: false };
}

export function useRecommendations(timeRange: TimeRange = 'medium_term') {
  const token = useAccessToken();
  const { data: artists } = useTopArtists(timeRange);
  const { data: tracks } = useTopTracks(timeRange);

  return useQuery({
    queryKey: ['recommendations', timeRange, !!token],
    queryFn: async () => {
      if (!token || !artists || !tracks) return mockTracks;
      const seedArtists = artists.slice(0, 2).map((a) => a.id);
      const seedTracks = tracks.slice(0, 3).map((t) => t.id);
      const data = await getRecommendations(token, seedArtists, seedTracks, [], 20);
      return data.tracks;
    },
    enabled: !!artists && !!tracks,
    staleTime: 15 * 60 * 1000,
    placeholderData: mockTracks,
  });
}
