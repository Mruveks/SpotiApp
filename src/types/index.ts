// ============================================================
// Spotify API Types
// ============================================================

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  country: string;
  followers: { total: number };
  product: string;
  external_urls: { spotify: string };
}

export interface SpotifyImage {
  url: string;
  width: number | null;
  height: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  genres: string[];
  popularity: number;
  followers: { total: number };
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: { spotify: string };
  audio_features?: AudioFeatures;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  artists: SpotifyArtist[];
  album_type: string;
}

export interface AudioFeatures {
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  duration_ms: number;
  id: string;
}

export interface RecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
  context: {
    type: string;
    href: string;
  } | null;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  tracks: { total: number };
  owner: { display_name: string };
  public: boolean;
}

// ============================================================
// App-specific Types
// ============================================================

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface RegionData {
  country: string;
  countryCode: string;
  coordinates: [number, number];
  topTracks: SpotifyTrack[];
  topArtists: SpotifyArtist[];
  activityScore: number;
  trending: TrendingItem[];
}

export interface TrendingItem {
  id: string;
  name: string;
  artist: string;
  change: number; // percentage change
  rank: number;
  imageUrl: string;
  previewUrl?: string;
}

export interface GenreStats {
  genre: string;
  count: number;
  percentage: number;
  color: string;
}

export interface MusicIntelligenceScore {
  overall: number;
  diversity: number;
  discovery: number;
  mainstreamScore: number;
  consistency: number;
  breakdown: {
    label: string;
    score: number;
    description: string;
  }[];
  personality: string;
  personalityDescription: string;
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'discovery' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  tags: string[];
  icon: string;
}

export interface ListeningActivity {
  date: string;
  minutes: number;
  tracks: number;
}

export interface GlobalStats {
  totalActiveUsers: number;
  totalTracksPlayed: number;
  topCountries: { country: string; code: string; score: number }[];
  viralTracks: TrendingItem[];
  emergingArtists: SpotifyArtist[];
}

export interface DashboardWidget {
  id: string;
  type: 'top-tracks' | 'top-artists' | 'genres' | 'activity' | 'score' | 'insights' | 'trending' | 'map';
  title: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  visible: boolean;
}

export interface UserStats {
  topTracks: SpotifyTrack[];
  topArtists: SpotifyArtist[];
  recentTracks: RecentlyPlayedItem[];
  genres: GenreStats[];
  audioProfile: AudioProfile;
  listeningActivity: ListeningActivity[];
}

export interface AudioProfile {
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
  tempo: number;
}
