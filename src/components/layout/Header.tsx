'use client';

import { useSession, signOut } from 'next-auth/react';
import { useAppStore } from '@/store/useAppStore';
import { Bell, Settings, LogOut, Search, Activity } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';

const viewTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your music intelligence hub' },
  map: { title: 'World Map', subtitle: 'Global music activity' },
  profile: { title: 'My Profile', subtitle: 'Personal analytics' },
  trending: { title: 'Trending', subtitle: 'What the world is listening to' },
  discover: { title: 'Discover', subtitle: 'Find your next obsession' },
};

export function Header() {
  const { data: session } = useSession();
  const { activeView, isLiveMode } = useAppStore();
  const { title, subtitle } = viewTitles[activeView] ?? viewTitles.dashboard;

  return (
    <header className="fixed top-0 right-0 left-0 z-30 h-16 bg-[#070b14]/90 backdrop-blur-xl border-b border-white/5 flex items-center px-6 gap-4 ml-60 transition-all duration-300">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base font-semibold text-slate-100">{title}</h1>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          {isLiveMode && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Global stats ticker */}
      <div className="hidden lg:flex items-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-green-400" />
          <span className="text-slate-400">{formatNumber(456_000_000)}</span>
          <span>active users</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-400">9.7B</span>
          <span>tracks today</span>
        </div>
      </div>

      {/* Search */}
      <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
        <Search className="w-4 h-4" />
      </button>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-400" />
      </button>

      {/* Auth */}
      {session ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <Link href="/login">
          <GlowButton size="sm" variant="green">Connect Spotify</GlowButton>
        </Link>
      )}
    </header>
  );
}
