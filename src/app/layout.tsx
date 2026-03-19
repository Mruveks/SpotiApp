import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'SpotiApp — Music Intelligence Dashboard',
  description: 'Advanced music analytics and visualization powered by Spotify API.',
  keywords: ['spotify', 'music analytics', 'dashboard', 'trends'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#070b14] text-slate-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
