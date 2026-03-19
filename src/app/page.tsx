'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { MapView } from '@/components/map/MapView';
import { ProfileView } from '@/components/profile/ProfileView';
import { TrendingView } from '@/components/trending/TrendingView';
import { DiscoverView } from '@/components/discover/DiscoverView';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const { activeView, sidebarCollapsed } = useAppStore();

  const views: Record<string, React.ReactNode> = {
    dashboard: <DashboardView />,
    map: <MapView />,
    profile: <ProfileView />,
    trending: <TrendingView />,
    discover: <DiscoverView />,
  };

  return (
    <div className="min-h-screen bg-[#070b14] grid-bg">
      <Sidebar />
      <Header />
      <main
        className={cn(
          'transition-all duration-300 pt-16 min-h-screen',
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        )}
      >
        <div className="p-6 max-w-screen-2xl mx-auto">
          <div className="fade-in">
            {views[activeView] ?? <DashboardView />}
          </div>
        </div>
      </main>
    </div>
  );
}
