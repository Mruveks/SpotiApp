/**
 * Spotify Web API client
 * Handles all API calls with rate limiting, caching, and error handling
 */

import {
  SpotifyUser,
  SpotifyTrack,
  SpotifyArtist,
  RecentlyPlayedItem,
  AudioFeatures,
  TimeRange,
  SpotifyPlaylist,
} from '@/types';

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';

// Rate limiting: max 180 requests per minute
const requestQueue: Array<() => Promise<unknown>> = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return;
  isProcessing = true;

  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) await request();
    await new Promise((r) => setTimeout(r, 334)); // ~180 req/min
  }

  isProcessing = false;
}

/**
 * Core fetch wrapper with auth, error handling, and retry logic
 */
async function spotifyFetch<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${SPOTIFY_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('Retry-After') ?? '1', 10);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return spotifyFetch(endpoint, accessToken, options);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error?.error?.message ?? `Spotify API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ============================================================
// User endpoints
// ============================================================

export async function getCurrentUser(accessToken: string): Promise<SpotifyUser> {
  return spotifyFetch('/me', accessToken);
}

export async function getUserTopTracks(
  accessToken: string,
  timeRange: TimeRange = 'medium_term',
  limit = 50
): Promise<{ items: SpotifyTrack[] }> {
  return spotifyFetch(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    accessToken
  );
}

export async function getUserTopArtists(
  accessToken: string,
  timeRange: TimeRange = 'medium_term',
  limit = 50
): Promise<{ items: SpotifyArtist[] }> {
  return spotifyFetch(
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`,
    accessToken
  );
}

export async function getRecentlyPlayed(
  accessToken: string,
  limit = 50
): Promise<{ items: RecentlyPlayedItem[] }> {
  return spotifyFetch(`/me/player/recently-played?limit=${limit}`, accessToken);
}

export async function getUserPlaylists(
  accessToken: string,
  limit = 20
): Promise<{ items: SpotifyPlaylist[]; total: number }> {
  return spotifyFetch(`/me/playlists?limit=${limit}`, accessToken);
}

// ============================================================
// Tracks & Audio Features
// ============================================================

export async function getAudioFeatures(
  accessToken: string,
  trackIds: string[]
): Promise<{ audio_features: AudioFeatures[] }> {
  const ids = trackIds.slice(0, 100).join(',');
  return spotifyFetch(`/audio-features?ids=${ids}`, accessToken);
}

export async function getTrack(
  accessToken: string,
  trackId: string
): Promise<SpotifyTrack> {
  return spotifyFetch(`/tracks/${trackId}`, accessToken);
}

// ============================================================
// Search & Discovery
// ============================================================

export async function searchSpotify(
  accessToken: string,
  query: string,
  types: string[] = ['track', 'artist'],
  limit = 10
): Promise<{ tracks?: { items: SpotifyTrack[] }; artists?: { items: SpotifyArtist[] } }> {
  const typeStr = types.join(',');
  return spotifyFetch(
    `/search?q=${encodeURIComponent(query)}&type=${typeStr}&limit=${limit}`,
    accessToken
  );
}

export async function getRecommendations(
  accessToken: string,
  seedArtists: string[] = [],
  seedTracks: string[] = [],
  seedGenres: string[] = [],
  limit = 20
): Promise<{ tracks: SpotifyTrack[] }> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (seedArtists.length) params.set('seed_artists', seedArtists.slice(0, 5).join(','));
  if (seedTracks.length) params.set('seed_tracks', seedTracks.slice(0, 5).join(','));
  if (seedGenres.length) params.set('seed_genres', seedGenres.slice(0, 5).join(','));

  return spotifyFetch(`/recommendations?${params}`, accessToken);
}

// ============================================================
// Browse (global charts - using featured playlists)
// ============================================================

export async function getFeaturedPlaylists(
  accessToken: string,
  country?: string,
  limit = 20
): Promise<{ playlists: { items: SpotifyPlaylist[] } }> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (country) params.set('country', country);
  return spotifyFetch(`/browse/featured-playlists?${params}`, accessToken);
}

export async function getPlaylistTracks(
  accessToken: string,
  playlistId: string,
  limit = 50
): Promise<{ items: Array<{ track: SpotifyTrack }> }> {
  return spotifyFetch(`/playlists/${playlistId}/tracks?limit=${limit}`, accessToken);
}

export async function getArtist(
  accessToken: string,
  artistId: string
): Promise<SpotifyArtist> {
  return spotifyFetch(`/artists/${artistId}`, accessToken);
}

export async function getArtistTopTracks(
  accessToken: string,
  artistId: string,
  market = 'US'
): Promise<{ tracks: SpotifyTrack[] }> {
  return spotifyFetch(`/artists/${artistId}/top-tracks?market=${market}`, accessToken);
}

// ============================================================
// New Releases & Trending
// ============================================================

export async function getNewReleases(
  accessToken: string,
  country?: string,
  limit = 20
): Promise<{ albums: { items: Array<{ id: string; name: string; artists: SpotifyArtist[]; images: { url: string }[] }> } }> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (country) params.set('country', country);
  return spotifyFetch(`/browse/new-releases?${params}`, accessToken);
}
