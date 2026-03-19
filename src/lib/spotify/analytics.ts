/**
 * Analytics module — computes all derived metrics from real Spotify API data.
 * Replaces mock data for MusicIntelligenceScore, AIInsights, and AudioProfile.
 *
 * Since the audio-features endpoint is deprecated (Nov 2024), AudioProfile is
 * estimated from the user's genre data using a curated genre→audio mapping.
 */

import {
  SpotifyArtist,
  SpotifyTrack,
  RecentlyPlayedItem,
  MusicIntelligenceScore,
  AIInsight,
  AudioProfile,
} from '@/types';

// ============================================================
// Genre → Audio Profile estimation
// ============================================================

type AudioKey = keyof Omit<AudioProfile, 'tempo'>;

const genreAudioMap: Record<string, Partial<Record<AudioKey, number>>> = {
  'dance pop':     { danceability: 0.80, energy: 0.72, valence: 0.70 },
  'pop':           { danceability: 0.65, energy: 0.60, valence: 0.62 },
  'edm':           { danceability: 0.85, energy: 0.88, valence: 0.58, instrumentalness: 0.35 },
  'electronic':    { danceability: 0.75, energy: 0.80, instrumentalness: 0.45 },
  'house':         { danceability: 0.84, energy: 0.80, valence: 0.65, instrumentalness: 0.52 },
  'techno':        { danceability: 0.78, energy: 0.90, valence: 0.40, instrumentalness: 0.70 },
  'synthpop':      { danceability: 0.70, energy: 0.70, valence: 0.55 },
  'hip hop':       { speechiness: 0.30, energy: 0.70, danceability: 0.75, valence: 0.50 },
  'rap':           { speechiness: 0.35, energy: 0.72, danceability: 0.76, valence: 0.50 },
  'trap':          { speechiness: 0.22, energy: 0.75, danceability: 0.80, valence: 0.45 },
  'r&b':           { danceability: 0.70, energy: 0.55, valence: 0.58, speechiness: 0.10 },
  'soul':          { danceability: 0.65, energy: 0.55, valence: 0.62, acousticness: 0.32 },
  'rock':          { energy: 0.86, valence: 0.45, danceability: 0.44, acousticness: 0.10 },
  'alternative rock': { energy: 0.76, valence: 0.46, danceability: 0.46, acousticness: 0.22 },
  'indie rock':    { energy: 0.66, valence: 0.50, danceability: 0.50, acousticness: 0.30 },
  'indie':         { energy: 0.60, valence: 0.50, danceability: 0.50, acousticness: 0.36 },
  'indie pop':     { energy: 0.55, valence: 0.58, danceability: 0.55, acousticness: 0.30 },
  'metal':         { energy: 0.94, valence: 0.24, danceability: 0.34, acousticness: 0.04 },
  'punk':          { energy: 0.90, valence: 0.40, danceability: 0.40, acousticness: 0.05 },
  'classical':     { acousticness: 0.95, energy: 0.24, danceability: 0.20, instrumentalness: 0.85, valence: 0.42 },
  'jazz':          { acousticness: 0.72, energy: 0.40, danceability: 0.50, instrumentalness: 0.52, valence: 0.62 },
  'blues':         { acousticness: 0.65, energy: 0.50, danceability: 0.45, valence: 0.45 },
  'folk':          { acousticness: 0.82, energy: 0.38, danceability: 0.40, speechiness: 0.04, valence: 0.56 },
  'country':       { acousticness: 0.72, energy: 0.50, danceability: 0.55, valence: 0.65 },
  'ambient':       { acousticness: 0.82, energy: 0.18, danceability: 0.18, instrumentalness: 0.92, valence: 0.28 },
  'latin':         { danceability: 0.84, energy: 0.76, valence: 0.82 },
  'reggaeton':     { danceability: 0.90, energy: 0.76, valence: 0.78 },
  'afrobeats':     { danceability: 0.88, energy: 0.74, valence: 0.80 },
  'k-pop':         { danceability: 0.80, energy: 0.76, valence: 0.72 },
  'funk':          { danceability: 0.88, energy: 0.72, valence: 0.72, acousticness: 0.18 },
  'disco':         { danceability: 0.90, energy: 0.78, valence: 0.80 },
  'reggae':        { danceability: 0.80, energy: 0.55, valence: 0.75, acousticness: 0.40 },
};

/** Estimate an AudioProfile from a list of genre strings. */
export function estimateAudioProfileFromGenres(genres: string[]): AudioProfile {
  if (!genres.length) {
    return { danceability: 0.50, energy: 0.50, valence: 0.50, acousticness: 0.30, instrumentalness: 0.10, speechiness: 0.06, tempo: 120 };
  }

  const buckets: Record<AudioKey, number[]> = {
    danceability: [], energy: [], valence: [], acousticness: [], instrumentalness: [], speechiness: [],
  };

  genres.forEach((genre) => {
    const lower = genre.toLowerCase();
    for (const [key, values] of Object.entries(genreAudioMap)) {
      if (lower === key || lower.includes(key) || key.includes(lower)) {
        for (const [attr, val] of Object.entries(values)) {
          buckets[attr as AudioKey].push(val as number);
        }
      }
    }
  });

  const avg = (arr: number[], fallback: number) =>
    arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : fallback;

  // Estimate BPM from energy: low energy ~80bpm, high energy ~160bpm
  const energyAvg = avg(buckets.energy, 0.5);
  const estimatedTempo = Math.round(80 + energyAvg * 80);

  return {
    danceability:     avg(buckets.danceability, 0.50),
    energy:           avg(buckets.energy, 0.50),
    valence:          avg(buckets.valence, 0.50),
    acousticness:     avg(buckets.acousticness, 0.30),
    instrumentalness: avg(buckets.instrumentalness, 0.10),
    speechiness:      avg(buckets.speechiness, 0.06),
    tempo:            estimatedTempo,
  };
}

// ============================================================
// Music Intelligence Score
// ============================================================

function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function computeMusicScore(
  artists: SpotifyArtist[],
  tracks: SpotifyTrack[],
  recentlyPlayed: RecentlyPlayedItem[]
): MusicIntelligenceScore {
  if (!artists.length && !tracks.length) {
    return {
      overall: 0, diversity: 0, discovery: 0, mainstreamScore: 0, consistency: 0,
      breakdown: [], personality: 'Loading...', personalityDescription: '',
    };
  }

  // Diversity: unique genres per artist (normalised 0-100)
  const allGenres = artists.flatMap((a) => a.genres);
  const uniqueGenres = new Set(allGenres);
  const diversity = Math.min(100, Math.round((uniqueGenres.size / Math.max(1, artists.length)) * 120));

  // Discovery: share of artists with < 1 M followers
  const nicheArtists = artists.filter((a) => a.followers.total < 1_000_000);
  const discovery = artists.length
    ? Math.min(100, Math.round((nicheArtists.length / artists.length) * 100))
    : 50;

  // Mainstream score: log-normalised average follower count (0-100)
  const avgFollowers = artists.length
    ? artists.reduce((s, a) => s + a.followers.total, 0) / artists.length
    : 0;
  const mainstreamScore = Math.min(100, Math.round((Math.log10(Math.max(1, avgFollowers)) / 8) * 100));

  // Consistency: unique days in recent history (target 30 days)
  const activeDays = new Set(recentlyPlayed.map((r) => r.played_at.split('T')[0]));
  const consistency = Math.min(100, Math.round((activeDays.size / 30) * 100));

  // Temporal range: year spread of top track release dates
  const years = tracks
    .map((t) => parseInt(t.album.release_date?.split('-')[0] ?? '0', 10))
    .filter((y) => y > 1900);
  const yearSpread = years.length ? Math.max(...years) - Math.min(...years) : 0;
  const temporalRange = Math.min(100, Math.round(yearSpread * 2.5));

  const overall = Math.round((diversity + discovery + consistency + temporalRange) / 4);

  // Personality type
  let personality = 'The Music Lover';
  let personalityDescription = 'You have a balanced and eclectic taste in music across many styles and eras.';

  if (diversity > 70 && discovery > 60) {
    personality = 'The Explorer';
    personalityDescription = 'You combine diverse genres with a genuine curiosity for discovering hidden gems. Your playlist bridges the mainstream and the underground.';
  } else if (discovery > 70) {
    personality = 'The Trendsetter';
    personalityDescription = "You find artists before they blow up. Your niche taste is ahead of the curve.";
  } else if (mainstreamScore > 70 && consistency > 60) {
    personality = 'The Enthusiast';
    personalityDescription = 'You love what you love and listen every day. High-energy, passionate listening sessions define you.';
  } else if (temporalRange > 60) {
    personality = 'The Archivist';
    personalityDescription = 'You appreciate music across decades, connecting the past and present through your playlist.';
  } else if (consistency > 80) {
    personality = 'The Devotee';
    personalityDescription = 'Consistent daily listening builds deep connections with a curated set of artists and tracks.';
  }

  return {
    overall,
    diversity,
    discovery,
    mainstreamScore,
    consistency,
    breakdown: [
      { label: 'Genre Diversity', score: diversity, description: `${uniqueGenres.size} unique genres across your top artists` },
      { label: 'Artist Discovery', score: discovery, description: `${nicheArtists.length}/${artists.length} artists have below 1M followers` },
      { label: 'Underground Ratio', score: Math.max(0, 100 - mainstreamScore), description: mainstreamScore > 60 ? 'Mix of mainstream and niche artists' : 'Strong lean toward underground music' },
      { label: 'Listening Consistency', score: consistency, description: `Active on ${activeDays.size} different day${activeDays.size !== 1 ? 's' : ''} recently` },
      { label: 'Temporal Range', score: temporalRange, description: yearSpread > 0 ? `Music spanning ${yearSpread} years` : 'Focused on contemporary releases' },
    ],
    personality,
    personalityDescription,
  };
}

// ============================================================
// AI Insights
// ============================================================

export function computeAIInsights(
  shortTermArtists: SpotifyArtist[],
  longTermArtists: SpotifyArtist[],
  shortTermTracks: SpotifyTrack[],
  recentlyPlayed: RecentlyPlayedItem[]
): AIInsight[] {
  const insights: AIInsight[] = [];

  // 1. Genre trend — compare short vs long term
  const shortGenres = shortTermArtists.flatMap((a) => a.genres);
  const longGenreSet = new Set(longTermArtists.flatMap((a) => a.genres));
  const newGenres = [...new Set(shortGenres)].filter((g) => !longGenreSet.has(g));

  if (newGenres.length > 0) {
    const topNew = newGenres[0];
    insights.push({
      id: '1',
      type: 'trend',
      title: `Shifting Toward ${topNew.charAt(0).toUpperCase() + topNew.slice(1)}`,
      description: `In the last 4 weeks, ${topNew} has entered your listening rotation for the first time. You're exploring ${newGenres.length} new genre${newGenres.length > 1 ? 's' : ''}.`,
      confidence: 0.87,
      tags: ['genre', 'trend', 'growth'],
      icon: '📈',
    });
  } else if (shortGenres.length > 0) {
    const topGenre = shortGenres[0];
    insights.push({
      id: '1',
      type: 'trend',
      title: 'Consistent Taste Profile',
      description: `Your genre preferences have been stable over time. You have a refined identity built around ${topGenre}${shortGenres[1] ? ` and ${shortGenres[1]}` : ''}.`,
      confidence: 0.91,
      tags: ['consistency', 'genre', 'identity'],
      icon: '🎯',
    });
  }

  // 2. Listening time pattern from recently-played timestamps
  if (recentlyPlayed.length > 5) {
    const hours = recentlyPlayed.map((r) => new Date(r.played_at).getHours());
    const total = hours.length;
    const night   = hours.filter((h) => h >= 22 || h < 4).length;
    const morning = hours.filter((h) => h >= 6 && h < 12).length;
    const evening = hours.filter((h) => h >= 18 && h < 22).length;

    let title = 'All-Day Listener';
    let desc = 'You listen throughout the day — music is a constant companion.';
    let icon = '🎧';

    if (night / total > 0.30) {
      title = 'Night Owl Listener';
      desc = `${Math.round((night / total) * 100)}% of your listening happens between 10 PM and 4 AM. Late-night sessions define your sound.`;
      icon = '🌙';
    } else if (morning / total > 0.35) {
      title = 'Morning Commuter';
      desc = `${Math.round((morning / total) * 100)}% of your plays are in the morning. You set the tone for your day with music.`;
      icon = '☀️';
    } else if (evening / total > 0.35) {
      title = 'Evening Wind-Down';
      desc = `${Math.round((evening / total) * 100)}% of your listening is in the evening. Music is your daily decompression ritual.`;
      icon = '🌆';
    }

    insights.push({
      id: '2',
      type: 'pattern',
      title,
      description: desc,
      confidence: Math.min(0.95, 0.55 + recentlyPlayed.length / 100),
      tags: ['pattern', 'time', 'habit'],
      icon,
    });
  }

  // 3. Discovery — least-followed artist in short-term top list
  if (shortTermArtists.length > 0) {
    const sorted = [...shortTermArtists].sort((a, b) => a.followers.total - b.followers.total);
    const gem = sorted[0];
    insights.push({
      id: '3',
      type: 'discovery',
      title: 'Hidden Gem in Your Rotation',
      description: `${gem.name} has just ${fmtFollowers(gem.followers.total)} followers but made your recent top list. You have a talent for finding artists early.`,
      confidence: 0.88,
      tags: ['discovery', 'niche', 'underground'],
      icon: '💎',
    });
  }

  // 4. Sound DNA — synthesised profile recommendation
  const topGenre = shortGenres[0] ?? longTermArtists[0]?.genres[0] ?? 'music';
  const recentCount = recentlyPlayed.length;
  const avgDuration = recentlyPlayed.length
    ? recentlyPlayed.reduce((s, r) => s + r.track.duration_ms, 0) / recentlyPlayed.length
    : 0;

  insights.push({
    id: '4',
    type: 'recommendation',
    title: 'Your Sound DNA',
    description: `Your musical identity is rooted in ${topGenre}${avgDuration > 220_000 ? ', with a preference for longer, immersive tracks' : ', favouring concise and punchy tracks'}. Your library spans ${shortTermArtists.length} distinct artists in this period — ${shortTermArtists.length > 30 ? 'broad and expansive' : 'focused and intentional'}.`,
    confidence: 0.92,
    tags: ['identity', 'dna', 'profile'],
    icon: '🧬',
  });

  return insights;
}

// ============================================================
// Personal "trending" — derived from top tracks comparison
// ============================================================

/**
 * Convert a user's short-term top tracks into TrendingItem format.
 * The "change" value is derived from position in the chart (rank 1 = highest).
 */
export function deriveTrendingFromTopTracks(
  shortTermTracks: SpotifyTrack[],
  mediumTermTracks: SpotifyTrack[]
): import('@/types').TrendingItem[] {
  const mediumRankMap = new Map(mediumTermTracks.map((t, i) => [t.id, i + 1]));

  return shortTermTracks.slice(0, 20).map((track, i) => {
    const shortRank = i + 1;
    const prevRank = mediumRankMap.get(track.id) ?? shortTermTracks.length + 10;
    const change = Math.max(0, Math.round(((prevRank - shortRank) / Math.max(1, prevRank)) * 100));

    return {
      id: track.id,
      name: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      change,
      rank: shortRank,
      imageUrl: track.album.images[0]?.url ?? '',
      previewUrl: track.preview_url ?? undefined,
    };
  });
}

// ============================================================
// Genre → Country origin estimation for the world map
// ============================================================

export interface ArtistOrigin {
  artist: SpotifyArtist;
  country: string;
  code: string;
  lat: number;
  lng: number;
}

const genreCountryMap: Record<string, { country: string; code: string; lat: number; lng: number }> = {
  'k-pop':          { country: 'South Korea',    code: 'KR', lat:  37.56, lng:  126.97 },
  'korean':         { country: 'South Korea',    code: 'KR', lat:  37.56, lng:  126.97 },
  'j-pop':          { country: 'Japan',           code: 'JP', lat:  35.68, lng:  139.69 },
  'j-rock':         { country: 'Japan',           code: 'JP', lat:  35.68, lng:  139.69 },
  'anime':          { country: 'Japan',           code: 'JP', lat:  35.68, lng:  139.69 },
  'reggaeton':      { country: 'Puerto Rico',     code: 'PR', lat:  18.46, lng:  -66.10 },
  'latin':          { country: 'Mexico',          code: 'MX', lat:  19.43, lng:  -99.13 },
  'latin pop':      { country: 'Mexico',          code: 'MX', lat:  19.43, lng:  -99.13 },
  'uk pop':         { country: 'United Kingdom',  code: 'GB', lat:  51.50, lng:   -0.12 },
  'british':        { country: 'United Kingdom',  code: 'GB', lat:  51.50, lng:   -0.12 },
  'afrobeats':      { country: 'Nigeria',         code: 'NG', lat:   6.52, lng:    3.38 },
  'afropop':        { country: 'Nigeria',         code: 'NG', lat:   6.52, lng:    3.38 },
  'german':         { country: 'Germany',         code: 'DE', lat:  52.52, lng:   13.40 },
  'french':         { country: 'France',          code: 'FR', lat:  48.85, lng:    2.35 },
  'french pop':     { country: 'France',          code: 'FR', lat:  48.85, lng:    2.35 },
  'canadian':       { country: 'Canada',          code: 'CA', lat:  45.42, lng:  -75.69 },
  'australian':     { country: 'Australia',       code: 'AU', lat: -33.87, lng:  151.21 },
  'brazilian':      { country: 'Brazil',          code: 'BR', lat: -15.78, lng:  -47.93 },
  'mpb':            { country: 'Brazil',          code: 'BR', lat: -15.78, lng:  -47.93 },
  'swedish':        { country: 'Sweden',          code: 'SE', lat:  59.33, lng:   18.07 },
  'norwegian':      { country: 'Norway',          code: 'NO', lat:  59.91, lng:   10.75 },
  'scandinavian':   { country: 'Sweden',          code: 'SE', lat:  59.33, lng:   18.07 },
  'italian':        { country: 'Italy',           code: 'IT', lat:  41.90, lng:   12.50 },
  'spanish':        { country: 'Spain',           code: 'ES', lat:  40.42, lng:   -3.70 },
  'hindi':          { country: 'India',           code: 'IN', lat:  28.61, lng:   77.21 },
  'bollywood':      { country: 'India',           code: 'IN', lat:  28.61, lng:   77.21 },
  'mandopop':       { country: 'China',           code: 'CN', lat:  39.91, lng:  116.39 },
  'c-pop':          { country: 'China',           code: 'CN', lat:  39.91, lng:  116.39 },
  'russian':        { country: 'Russia',          code: 'RU', lat:  55.75, lng:   37.62 },
  'turkish':        { country: 'Turkey',          code: 'TR', lat:  39.93, lng:   32.86 },
};

const DEFAULT_ORIGIN = { country: 'United States', code: 'US', lat: 37.09, lng: -95.71 };

/** Estimate the country of origin for an artist based on their genres. */
export function estimateArtistOrigin(artist: SpotifyArtist): ArtistOrigin {
  for (const genre of artist.genres) {
    const lower = genre.toLowerCase();
    for (const [key, loc] of Object.entries(genreCountryMap)) {
      if (lower.includes(key) || key.includes(lower)) {
        return { artist, ...loc };
      }
    }
  }
  return { artist, ...DEFAULT_ORIGIN };
}

/** Group artists by estimated country of origin. */
export function groupArtistsByOrigin(
  artists: SpotifyArtist[]
): Map<string, ArtistOrigin[]> {
  const map = new Map<string, ArtistOrigin[]>();
  for (const artist of artists) {
    const origin = estimateArtistOrigin(artist);
    const existing = map.get(origin.code) ?? [];
    existing.push(origin);
    map.set(origin.code, existing);
  }
  return map;
}
