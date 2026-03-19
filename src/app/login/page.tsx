'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Music2, BarChart2, Globe, Brain, Zap } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';

const features = [
  { icon: BarChart2, title: 'Personal Analytics', desc: 'Deep dive into your top tracks, artists and listening patterns' },
  { icon: Globe, title: 'World Map', desc: 'Explore global music trends across 195 countries in real-time' },
  { icon: Brain, title: 'AI Insights', desc: 'Machine learning powered analysis of your musical DNA' },
  { icon: Zap, title: 'Live Tracking', desc: 'Monitor what\'s trending globally as it happens' },
];

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) router.push('/');
  }, [session, router]);

  const handleSignIn = async () => {
    setLoading(true);
    await signIn('spotify', { callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] grid-bg flex flex-col lg:flex-row">
      {/* Left: Branding */}
      <div className="lg:flex-1 flex flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-green-500/5 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl" />

        <div className="relative max-w-md text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center glow-green">
              <Music2 className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-white">SpotiApp</h1>
              <p className="text-xs text-green-400">Music Intelligence</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Your Music.<br />
            <span className="gradient-text">Visualized.</span>
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            The most advanced Spotify analytics dashboard. Track global trends, analyze your taste, and discover new music with AI-powered insights.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 text-left">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-3 rounded-xl bg-white/3 border border-white/5 hover:border-green-500/20 transition-all">
                <Icon className="w-4 h-4 text-green-400 mb-2" />
                <p className="text-xs font-semibold text-slate-200">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Auth */}
      <div className="lg:w-96 flex flex-col items-center justify-center p-12 bg-[#0d1117]/50 border-l border-white/5">
        <div className="w-full max-w-xs">
          <h3 className="text-xl font-bold text-white mb-2">Get Started</h3>
          <p className="text-sm text-slate-400 mb-8">
            Connect your Spotify account to unlock your personalized music intelligence dashboard.
          </p>

          <GlowButton
            variant="green"
            size="lg"
            loading={loading}
            onClick={handleSignIn}
            className="w-full justify-center"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Connect with Spotify
          </GlowButton>

          <div className="mt-6 p-4 rounded-lg bg-white/3 border border-white/5">
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-400">Demo mode:</strong> Don't have Spotify? The app works with mock data too — just navigate to the dashboard without signing in.
            </p>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/"
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors underline underline-offset-2"
            >
              Continue without signing in (demo mode)
            </a>
          </div>

          <div className="mt-8 flex items-center gap-2">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-slate-600">Permissions</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="mt-3 space-y-1">
            {[
              'Read your top tracks and artists',
              'Access recently played history',
              'View your playlists',
              'Get personalized recommendations',
            ].map((perm) => (
              <div key={perm} className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500/60 flex-shrink-0" />
                {perm}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
