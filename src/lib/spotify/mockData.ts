/**
 * Mock data fallback for when Spotify API is unavailable
 * or user is not authenticated
 */

import {
  SpotifyTrack,
  SpotifyArtist,
  RecentlyPlayedItem,
  GenreStats,
  TrendingItem,
  RegionData,
  GlobalStats,
  ListeningActivity,
  MusicIntelligenceScore,
  AIInsight,
  AudioProfile,
} from '@/types';

export const mockArtists: SpotifyArtist[] = [
  {
    id: '1',
    name: 'The Weeknd',
    images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb', width: 640, height: 640 }],
    genres: ['canadian contemporary r&b', 'pop'],
    popularity: 96,
    followers: { total: 38500000 },
    external_urls: { spotify: 'https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ' },
  },
  {
    id: '2',
    name: 'Billie Eilish',
    images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb42e4db5e5b0e38e95bca54a7', width: 640, height: 640 }],
    genres: ['electropop', 'pop'],
    popularity: 94,
    followers: { total: 32000000 },
    external_urls: { spotify: 'https://open.spotify.com/artist/6qqNVTkY8uBg9cP3Jd7DAH' },
  },
  {
    id: '3',
    name: 'Drake',
    images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9', width: 640, height: 640 }],
    genres: ['canadian hip hop', 'rap'],
    popularity: 95,
    followers: { total: 55000000 },
    external_urls: { spotify: 'https://open.spotify.com/artist/3TVXtAsR1Inumwj472S9r4' },
  },
  {
    id: '4',
    name: 'Taylor Swift',
    images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb5a00969a4698c3132a15fbb0', width: 640, height: 640 }],
    genres: ['pop', 'country pop'],
    popularity: 98,
    followers: { total: 75000000 },
    external_urls: { spotify: 'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02' },
  },
  {
    id: '5',
    name: 'Arctic Monkeys',
    images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb7da39dea0a72f581535fb11f', width: 640, height: 640 }],
    genres: ['indie rock', 'alternative rock'],
    popularity: 84,
    followers: { total: 17000000 },
    external_urls: { spotify: 'https://open.spotify.com/artist/7Ln80lUS6He07XvHI8qqHH' },
  },
  {
    id: '6',
    name: 'Radiohead',
    images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb5c8d88de47cd6853beb44d66', width: 640, height: 640 }],
    genres: ['alternative rock', 'art rock'],
    popularity: 78,
    followers: { total: 8000000 },
    external_urls: { spotify: 'https://open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb' },
  },
];

export const mockTracks: SpotifyTrack[] = [
  {
    id: 't1',
    name: 'Blinding Lights',
    artists: [mockArtists[0]],
    album: {
      id: 'a1',
      name: 'After Hours',
      images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36', width: 640, height: 640 }],
      release_date: '2020-03-20',
      artists: [mockArtists[0]],
      album_type: 'album',
    },
    duration_ms: 200040,
    popularity: 95,
    preview_url: null,
    external_urls: { spotify: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b' },
    audio_features: { danceability: 0.51, energy: 0.73, key: 1, loudness: -5.9, mode: 1, speechiness: 0.06, acousticness: 0.0, instrumentalness: 0.0, liveness: 0.09, valence: 0.33, tempo: 171.0, duration_ms: 200040, id: 't1' },
  },
  {
    id: 't2',
    name: 'Bad Guy',
    artists: [mockArtists[1]],
    album: {
      id: 'a2',
      name: 'When We All Fall Asleep, Where Do We Go?',
      images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273096bca083a1c8ff34a12a020', width: 640, height: 640 }],
      release_date: '2019-03-29',
      artists: [mockArtists[1]],
      album_type: 'album',
    },
    duration_ms: 194088,
    popularity: 91,
    preview_url: null,
    external_urls: { spotify: 'https://open.spotify.com/track/2Fxmhks0live' },
    audio_features: { danceability: 0.70, energy: 0.43, key: 0, loudness: -13.6, mode: 0, speechiness: 0.37, acousticness: 0.31, instrumentalness: 0.0, liveness: 0.18, valence: 0.56, tempo: 135.0, duration_ms: 194088, id: 't2' },
  },
  {
    id: 't3',
    name: 'Anti-Hero',
    artists: [mockArtists[3]],
    album: {
      id: 'a3',
      name: 'Midnights',
      images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5', width: 640, height: 640 }],
      release_date: '2022-10-21',
      artists: [mockArtists[3]],
      album_type: 'album',
    },
    duration_ms: 200690,
    popularity: 96,
    preview_url: null,
    external_urls: { spotify: 'https://open.spotify.com/track/0V3wPSX9ygBnCm8psDIegu' },
    audio_features: { danceability: 0.64, energy: 0.46, key: 0, loudness: -9.4, mode: 0, speechiness: 0.05, acousticness: 0.39, instrumentalness: 0.0, liveness: 0.12, valence: 0.49, tempo: 97.0, duration_ms: 200690, id: 't3' },
  },
  {
    id: 't4',
    name: 'R U Mine?',
    artists: [mockArtists[4]],
    album: {
      id: 'a4',
      name: 'AM',
      images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b63d6e8e52d9c9a1cb5e5da1', width: 640, height: 640 }],
      release_date: '2013-09-09',
      artists: [mockArtists[4]],
      album_type: 'album',
    },
    duration_ms: 207453,
    popularity: 82,
    preview_url: null,
    external_urls: { spotify: 'https://open.spotify.com/track/3g23kEMKdOoSAWbKJVCQjM' },
    audio_features: { danceability: 0.46, energy: 0.87, key: 5, loudness: -5.3, mode: 0, speechiness: 0.06, acousticness: 0.0, instrumentalness: 0.0, liveness: 0.09, valence: 0.38, tempo: 136.0, duration_ms: 207453, id: 't4' },
  },
  {
    id: 't5',
    name: 'Creep',
    artists: [mockArtists[5]],
    album: {
      id: 'a5',
      name: 'Pablo Honey',
      images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2739293c743fa542094a8da5e0b', width: 640, height: 640 }],
      release_date: '1993-02-22',
      artists: [mockArtists[5]],
      album_type: 'album',
    },
    duration_ms: 238640,
    popularity: 80,
    preview_url: null,
    external_urls: { spotify: 'https://open.spotify.com/track/70LcF31zb1H0PyJoS1Sx1r' },
    audio_features: { danceability: 0.52, energy: 0.43, key: 0, loudness: -11.7, mode: 1, speechiness: 0.03, acousticness: 0.34, instrumentalness: 0.0, liveness: 0.11, valence: 0.10, tempo: 92.0, duration_ms: 238640, id: 't5' },
  },
];

export const mockGenres: GenreStats[] = [
  { genre: 'Indie Rock', count: 42, percentage: 28, color: '#1db954' },
  { genre: 'Alternative', count: 35, percentage: 23, color: '#00d4ff' },
  { genre: 'Electronic', count: 28, percentage: 19, color: '#7c3aed' },
  { genre: 'Pop', count: 20, percentage: 13, color: '#f472b6' },
  { genre: 'Hip-Hop', count: 15, percentage: 10, color: '#fbbf24' },
  { genre: 'Classical', count: 10, percentage: 7, color: '#64748b' },
];

export const mockTrendingItems: TrendingItem[] = [
  { id: '1', name: 'Flowers', artist: 'Miley Cyrus', change: 124, rank: 1, imageUrl: 'https://i.scdn.co/image/ab67616d0000b2736dd716e644d22f30e3f1ec7d', previewUrl: undefined },
  { id: '2', name: 'As It Was', artist: 'Harry Styles', change: 89, rank: 2, imageUrl: 'https://i.scdn.co/image/ab67616d0000b273b46f74096bec604bc48b7da0', previewUrl: undefined },
  { id: '3', name: 'Unholy', artist: 'Sam Smith ft. Kim Petras', change: 67, rank: 3, imageUrl: 'https://i.scdn.co/image/ab67616d0000b273a36dc12124a08f3a9c7c5c5c', previewUrl: undefined },
  { id: '4', name: 'Calm Down', artist: 'Rema & Selena Gomez', change: 45, rank: 4, imageUrl: 'https://i.scdn.co/image/ab67616d0000b273d7b0fcca4cec2b7a1de8e12d', previewUrl: undefined },
  { id: '5', name: 'Die For You', artist: 'The Weeknd', change: 33, rank: 5, imageUrl: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36', previewUrl: undefined },
  { id: '6', name: 'Shakira: Bzrp Music Sessions, Vol. 53', artist: 'Bizarrap & Shakira', change: 28, rank: 6, imageUrl: 'https://i.scdn.co/image/ab67616d0000b273d1d62e36a6ca4e9b0c0db6f6', previewUrl: undefined },
];

export const mockRegions: RegionData[] = [
  {
    country: 'United States',
    countryCode: 'US',
    coordinates: [37.0902, -95.7129],
    topTracks: mockTracks.slice(0, 3),
    topArtists: mockArtists.slice(0, 3),
    activityScore: 98,
    trending: mockTrendingItems.slice(0, 3),
  },
  {
    country: 'United Kingdom',
    countryCode: 'GB',
    coordinates: [55.3781, -3.4360],
    topTracks: mockTracks.slice(1, 4),
    topArtists: mockArtists.slice(2, 5),
    activityScore: 87,
    trending: mockTrendingItems.slice(1, 4),
  },
  {
    country: 'Germany',
    countryCode: 'DE',
    coordinates: [51.1657, 10.4515],
    topTracks: mockTracks.slice(0, 3),
    topArtists: mockArtists.slice(3, 6),
    activityScore: 76,
    trending: mockTrendingItems.slice(2, 5),
  },
  {
    country: 'Brazil',
    countryCode: 'BR',
    coordinates: [-14.2350, -51.9253],
    topTracks: mockTracks.slice(2, 5),
    topArtists: mockArtists.slice(1, 4),
    activityScore: 82,
    trending: mockTrendingItems.slice(0, 3),
  },
  {
    country: 'Japan',
    countryCode: 'JP',
    coordinates: [36.2048, 138.2529],
    topTracks: mockTracks.slice(1, 4),
    topArtists: mockArtists.slice(0, 3),
    activityScore: 71,
    trending: mockTrendingItems.slice(3, 6),
  },
  {
    country: 'Poland',
    countryCode: 'PL',
    coordinates: [51.9194, 19.1451],
    topTracks: mockTracks.slice(0, 3),
    topArtists: mockArtists.slice(4, 6),
    activityScore: 65,
    trending: mockTrendingItems.slice(1, 4),
  },
  {
    country: 'Mexico',
    countryCode: 'MX',
    coordinates: [23.6345, -102.5528],
    topTracks: mockTracks.slice(1, 4),
    topArtists: mockArtists.slice(2, 5),
    activityScore: 79,
    trending: mockTrendingItems.slice(2, 5),
  },
  {
    country: 'Australia',
    countryCode: 'AU',
    coordinates: [-25.2744, 133.7751],
    topTracks: mockTracks.slice(0, 3),
    topArtists: mockArtists.slice(1, 4),
    activityScore: 68,
    trending: mockTrendingItems.slice(0, 3),
  },
];

export const mockGlobalStats: GlobalStats = {
  totalActiveUsers: 456_000_000,
  totalTracksPlayed: 9_700_000_000,
  topCountries: [
    { country: 'United States', code: 'US', score: 98 },
    { country: 'Brazil', code: 'BR', score: 82 },
    { country: 'United Kingdom', code: 'GB', score: 87 },
    { country: 'Germany', code: 'DE', score: 76 },
    { country: 'Mexico', code: 'MX', score: 79 },
  ],
  viralTracks: mockTrendingItems,
  emergingArtists: mockArtists.slice(4, 6),
};

export const mockListeningActivity: ListeningActivity[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  minutes: Math.floor(Math.random() * 120) + 30,
  tracks: Math.floor(Math.random() * 40) + 10,
}));

export const mockMusicScore: MusicIntelligenceScore = {
  overall: 78,
  diversity: 85,
  discovery: 72,
  mainstreamScore: 45,
  consistency: 88,
  breakdown: [
    { label: 'Genre Diversity', score: 85, description: 'You explore a wide range of musical genres' },
    { label: 'Artist Discovery', score: 72, description: 'You\'re above average at finding new artists' },
    { label: 'Underground Ratio', score: 55, description: 'Mix of mainstream and niche artists' },
    { label: 'Listening Consistency', score: 88, description: 'You listen regularly and maintain strong habits' },
    { label: 'Temporal Range', score: 91, description: 'You enjoy music from multiple decades' },
  ],
  personality: 'The Explorer',
  personalityDescription: 'You combine mainstream taste with a genuine curiosity for discovering hidden gems. Your playlist is a bridge between the popular and the underground.',
};

export const mockAIInsights: AIInsight[] = [
  {
    id: '1',
    type: 'trend',
    title: 'Shifting Toward Electronic',
    description: 'Over the past 3 months, your electronic music consumption has increased by 34%. Artists like Four Tet and Floating Points are becoming regulars in your rotation.',
    confidence: 0.89,
    tags: ['electronic', 'trend', 'growth'],
    icon: '🔌',
  },
  {
    id: '2',
    type: 'pattern',
    title: 'Late Night Listener',
    description: 'You listen to 67% of your music between 10 PM and 2 AM. Your night sessions favor slower, more introspective tracks with lower energy scores.',
    confidence: 0.94,
    tags: ['pattern', 'time', 'mood'],
    icon: '🌙',
  },
  {
    id: '3',
    type: 'discovery',
    title: 'Hidden Gem Detected',
    description: 'Based on your taste for Arctic Monkeys and Radiohead, you may have missed Black Country, New Road – currently trending in the UK indie scene.',
    confidence: 0.82,
    tags: ['recommendation', 'indie', 'discovery'],
    icon: '💎',
  },
  {
    id: '4',
    type: 'recommendation',
    title: 'Mood Board: Your Sound',
    description: 'Your music profile suggests: lo-fi aesthetics + indie alternative core, with a growing electronic influence. Think: "post-midnight existentialism with a beat drop."',
    confidence: 0.91,
    tags: ['mood', 'identity', 'profile'],
    icon: '🎭',
  },
];

export const mockAudioProfile: AudioProfile = {
  danceability: 0.58,
  energy: 0.65,
  valence: 0.42,
  acousticness: 0.22,
  instrumentalness: 0.18,
  speechiness: 0.08,
  tempo: 118,
};

export const mockRecentlyPlayed: RecentlyPlayedItem[] = mockTracks.map((track, i) => ({
  track,
  played_at: new Date(Date.now() - i * 30 * 60 * 1000).toISOString(),
  context: null,
}));
