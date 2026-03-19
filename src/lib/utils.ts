import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function getImageUrl(images: { url: string }[] | undefined, fallback = '/placeholder.png'): string {
  return images?.[0]?.url ?? fallback;
}

export function getGenreColor(genre: string): string {
  const colors: Record<string, string> = {
    'indie rock': '#1db954',
    'alternative': '#00d4ff',
    'electronic': '#7c3aed',
    'pop': '#f472b6',
    'hip-hop': '#fbbf24',
    'rap': '#f59e0b',
    'r&b': '#ec4899',
    'classical': '#64748b',
    'jazz': '#06b6d4',
    'metal': '#ef4444',
    'country': '#84cc16',
    'folk': '#a78bfa',
  };
  const key = genre.toLowerCase();
  return colors[key] ?? '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

export function calculateAudioMoodLabel(valence: number, energy: number): string {
  if (valence > 0.6 && energy > 0.6) return 'Happy & Energetic';
  if (valence > 0.6 && energy <= 0.6) return 'Peaceful & Positive';
  if (valence <= 0.4 && energy > 0.6) return 'Angry & Intense';
  if (valence <= 0.4 && energy <= 0.4) return 'Sad & Melancholic';
  return 'Balanced';
}

export function getTimeRangeLabel(range: string): string {
  const labels: Record<string, string> = {
    short_term: 'Last 4 Weeks',
    medium_term: 'Last 6 Months',
    long_term: 'All Time',
  };
  return labels[range] ?? range;
}

export function countryCodeToEmoji(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}
