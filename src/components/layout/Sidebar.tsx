'use client';

import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Globe,
  User,
  TrendingUp,
  Compass,
  ChevronLeft,
  ChevronRight,
  Zap,
  Music2,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'World Map', icon: Globe },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'discover', label: 'Discover', icon: Compass },
] as const;

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, activeView, setActiveView, isLiveMode, toggleLiveMode } =
    useAppStore();
  const { data: session } = useSession();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen z-40 flex flex-col',
        'bg-[#070b14]/95 backdrop-blur-xl border-r border-white/5',
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center">
          <Music2 className="w-4 h-4 text-green-400" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <span className="text-sm font-bold text-white tracking-wide">SpotiApp</span>
            <p className="text-xs text-slate-500">Music Intelligence</p>
          </div>
        )}
      </div>

      {/* Live mode toggle */}
      {!sidebarCollapsed && (
        <div className="px-3 pt-3">
          <button
            onClick={toggleLiveMode}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200',
              isLiveMode
                ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', isLiveMode ? 'bg-green-400 animate-pulse' : 'bg-slate-600')} />
            <Zap className="w-3 h-3" />
            {isLiveMode ? 'LIVE MODE ON' : 'LIVE MODE OFF'}
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              title={sidebarCollapsed ? label : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group',
                isActive
                  ? 'bg-green-500/15 border border-green-500/30 text-green-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-green-400' : 'text-slate-500 group-hover:text-slate-300')} />
              {!sidebarCollapsed && <span className="font-medium">{label}</span>}
              {isActive && !sidebarCollapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      {session?.user && !sidebarCollapsed && (
        <div className="px-3 py-3 border-t border-white/5">
          <div className="flex items-center gap-2 px-2">
            {session.user.image ? (
              <img src={session.user.image} alt="" className="w-7 h-7 rounded-full ring-2 ring-green-500/30" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
                <User className="w-3 h-3 text-green-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{session.user.name}</p>
              <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="flex items-center justify-center h-10 border-t border-white/5 text-slate-500 hover:text-slate-300 transition-colors"
      >
        {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
