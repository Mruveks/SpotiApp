/**
 * Spotify Web API client
 * Handles all API calls with rate limiting, error handling, and retry logic.
 *
 * IMPORTANT — API status as of March 2026:
 *  - /audio-features        → DEPRECATED (Nov 2024), returns 403 for dev-mode apps
 *  - /recommendations       → DEPRECATED (Nov 2024), returns 404 for dev-mode apps
 *  - /artists/{id}/top-tracks → REMOVED (Feb 2026) for dev-mode apps
 *  - /browse/new-releases   → REMOVED (Feb 2026) for dev-mode apps
 *  - /browse/featured-playlists → REMOVED (Feb 2026) for dev-mode apps
 *  - /playlists/{id}/tracks → renamed to /playlists/{id}/items (Feb 2026)
 *  - /search limit          → max 10 per request (Feb 2026)
 *  - track.popularity       → removed from response (Feb 2026)
 *  - user.email/country/followers/product → removed (Feb 2026)
 */

import {
  SpotifyUser,
  SpotifyTrack,
  SpotifyArtist,
  RecentlyPlayedItem,
  TimeRange,
  SpotifyPlaylist,
  SpotifyAlbumFull,
} from '@/types';

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';

/**
 * Core fetch wrapper with auth, error handling, and 429-retry logic
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
    next: { revalidate: 60 },
  });

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('Retry-After') ?? '2', 10);
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
// Library endpoints (saved tracks / albums)
// ============================================================

export async function getSavedTracks(
  accessToken: string,
  limit = 50,
  offset = 0
): Promise<{ items: Array<{ added_at: string; track: SpotifyTrack }>; total: number }> {
  return spotifyFetch(
    `/me/tracks?limit=${limit}&offset=${offset}`,
    accessToken
  );
}

export async function getSavedAlbums(
  accessToken: string,
  limit = 20
): Promise<{ items: Array<{ added_at: string; album: SpotifyAlbumFull }>; total: number }> {
  return spotifyFetch(`/me/albums?limit=${limit}`, accessToken);
}

// ============================================================
// Tracks
// ============================================================

export async function getTrack(
  accessToken: string,
  trackId: string
): Promise<SpotifyTrack> {
  return spotifyFetch(`/tracks/${trackId}`, accessToken);
}

// ============================================================
// Artists
// ============================================================

export async function getArtist(
  accessToken: string,
  artistId: string
): Promise<SpotifyArtist> {
  return spotifyFetch(`/artists/${artistId}`, accessToken);
}

/**
 * Get an artist's albums (still available as of Feb 2026).
 * Use this instead of the removed /artists/{id}/top-tracks.
 */
export async function getArtistAlbums(
  accessToken: string,
  artistId: string,
  limit = 10
): Promise<{ items: SpotifyAlbumFull[] }> {
  return spotifyFetch(
    `/artists/${artistId}/albums?limit=${limit}&include_groups=album,single`,
    accessToken
  );
}

// ============================================================
// Search  (limit max 10 per request as of Feb 2026)
// ============================================================

export async function searchSpotify(
  accessToken: string,
  query: string,
  types: string[] = ['track', 'artist'],
  limit = 10
): Promise<{ tracks?: { items: SpotifyTrack[] }; artists?: { items: SpotifyArtist[] } }> {
  const typeStr = types.join(',');
  const capped = Math.min(limit, 10); // API enforces max 10 from Feb 2026
  return spotifyFetch(
    `/search?q=${encodeURIComponent(query)}&type=${typeStr}&limit=${capped}`,
    accessToken
  );
}

// ============================================================
// Playlists  (items endpoint — renamed from /tracks in Feb 2026)
// ============================================================

/**
 * Fetch tracks from a playlist the current user owns or collaborates on.
 * NOTE: As of February 2026, items are only returned for playlists owned
 * by or collaborated on by the authenticated user. Public playlists return
 * only metadata.
 */
export async function getPlaylistItems(
  accessToken: string,
  playlistId: string,
  limit = 50
): Promise<{ items: Array<{ track: SpotifyTrack }> }> {
  return spotifyFetch(`/playlists/${playlistId}/items?limit=${limit}`, accessToken);
}
