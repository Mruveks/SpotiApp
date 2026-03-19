# SpotiApp — Music Intelligence Dashboard

A professional Spotify analytics dashboard inspired by Arkham Intelligence and WorldTracker, built with Next.js, TypeScript, TailwindCSS, and Recharts.

## Features

- **Dashboard** — Personal analytics with top tracks, artists, genre breakdown, activity charts, listening patterns
- **World Map** — Interactive Leaflet map with regional music activity heatmap, click markers for regional top charts
- **Profile** — User stats across 3 time ranges (4 weeks / 6 months / all time), audio profile radar, recommendations
- **Trending** — Global viral chart, country rankings, emerging artists, regional trending
- **Discover** — AI-curated track recommendations, mood-based playlists, artist discovery
- **Music Intelligence Score** — Unique scoring system: diversity, discovery, mainstream ratio, consistency
- **AI Insights** — Pattern analysis (e.g., shift toward electronic, night listener habits)
- **Live Mode** — Simulated real-time global listening activity

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4 |
| Charts | Recharts |
| Map | Leaflet + react-leaflet |
| Auth | NextAuth.js v5 (Spotify OAuth 2.0) |
| State | Zustand |
| Data Fetching | TanStack Query v5 |
| Animations | Framer Motion |
| Icons | Lucide React |

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Configure Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:3000/api/auth/callback/spotify`
4. Copy Client ID and Client Secret

### 3. Environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXTAUTH_SECRET=any-random-secret-string
NEXTAUTH_URL=http://localhost:3000
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> **Demo mode:** The app works without Spotify credentials using realistic mock data. Just navigate to the dashboard without signing in.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/auth/          # NextAuth route handler
│   ├── login/             # Login page
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main SPA entry point
├── components/
│   ├── ui/                # Reusable primitives (Card, Badge, GlowButton, StatNumber)
│   ├── layout/            # Sidebar, Header
│   ├── charts/            # ActivityChart, GenrePieChart, AudioRadarChart
│   ├── dashboard/         # DashboardView, MusicScore, AIInsights, TopTracks, TopArtists
│   ├── map/               # WorldMap (Leaflet), MapView
│   ├── profile/           # ProfileView
│   ├── trending/          # TrendingList, TrendingView
│   └── discover/          # DiscoverView
├── hooks/                 # useSpotify, useTopTracks, useTopArtists, etc.
├── lib/
│   ├── spotify/           # API client, auth config, mock data
│   └── utils.ts           # Utilities
├── store/                 # Zustand store (UI state, time range, widgets)
├── styles/                # Global CSS with glow effects, glassmorphism
└── types/                 # TypeScript type definitions
```

## Design System

- **Theme:** Dark mode, futuristic data-intelligence UI
- **Palette:** Deep navy (#070b14) + Spotify green (#1db954) + Cyan (#00d4ff) + Purple (#7c3aed)
- **Effects:** Glassmorphism, glow/neon borders, animated charts, pulse indicators
- **Typography:** Monospace for stats, Inter for body text
- **Animations:** Smooth transitions, skeleton loading, fade-in views

## API Integration

The Spotify API client (`src/lib/spotify/api.ts`) supports:
- User profile & top items (tracks, artists)
- Recently played history
- Audio features analysis
- Personalized recommendations
- Featured playlists & new releases
- Automatic token refresh
- Rate limiting (180 req/min)
- ISR caching (`next: { revalidate: 60 }`)

All endpoints gracefully fall back to realistic mock data when unauthenticated.
