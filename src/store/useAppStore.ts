import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TimeRange, RegionData, DashboardWidget } from '@/types';

interface AppStore {
  // UI State
  sidebarCollapsed: boolean;
  activeView: 'dashboard' | 'map' | 'profile' | 'trending' | 'discover';
  selectedTimeRange: TimeRange;
  selectedRegion: RegionData | null;
  isLiveMode: boolean;

  // Actions
  setSidebarCollapsed: (v: boolean) => void;
  setActiveView: (view: AppStore['activeView']) => void;
  setSelectedTimeRange: (range: TimeRange) => void;
  setSelectedRegion: (region: RegionData | null) => void;
  toggleLiveMode: () => void;

  // Dashboard widgets
  widgets: DashboardWidget[];
  setWidgets: (widgets: DashboardWidget[]) => void;
  toggleWidget: (id: string) => void;
}

const defaultWidgets: DashboardWidget[] = [
  { id: 'score', type: 'score', title: 'Music Intelligence Score', size: 'md', visible: true },
  { id: 'top-tracks', type: 'top-tracks', title: 'Top Tracks', size: 'lg', visible: true },
  { id: 'top-artists', type: 'top-artists', title: 'Top Artists', size: 'lg', visible: true },
  { id: 'genres', type: 'genres', title: 'Genre Breakdown', size: 'md', visible: true },
  { id: 'activity', type: 'activity', title: 'Listening Activity', size: 'xl', visible: true },
  { id: 'insights', type: 'insights', title: 'AI Insights', size: 'lg', visible: true },
  { id: 'trending', type: 'trending', title: 'Global Trending', size: 'md', visible: true },
];

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeView: 'dashboard',
      selectedTimeRange: 'medium_term',
      selectedRegion: null,
      isLiveMode: false,
      widgets: defaultWidgets,

      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setActiveView: (activeView) => set({ activeView }),
      setSelectedTimeRange: (selectedTimeRange) => set({ selectedTimeRange }),
      setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
      toggleLiveMode: () => set((s) => ({ isLiveMode: !s.isLiveMode })),
      setWidgets: (widgets) => set({ widgets }),
      toggleWidget: (id) =>
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.id === id ? { ...w, visible: !w.visible } : w
          ),
        })),
    }),
    {
      name: 'spotiapp-store',
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        selectedTimeRange: s.selectedTimeRange,
        widgets: s.widgets,
      }),
    }
  )
);
