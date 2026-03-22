'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { THEMES, type ThemeId } from '@/lib/theme';
import { useTheme } from '@/hooks/useTheme';

const ONBOARDING_KEY = 'polymath-onboarding-complete';

interface Slide {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: 'welcome',
    icon: 'psychology',
    title: 'Welcome to Polymath OS',
    description: 'Your personal knowledge operating system. Track what you learn, discover connections, and grow your expertise across every domain.',
  },
  {
    id: 'features',
    icon: 'auto_awesome',
    title: 'Smart Knowledge Graph',
    description: 'Every article, video, and note you capture gets analyzed by AI. Discover hidden connections between your interests through the neural mesh.',
  },
  {
    id: 'journal',
    icon: 'edit_note',
    title: 'Reflect & Journal',
    description: 'Capture your thoughts with rich journaling. Tag entries, link them to your activities, and build a timeline of your intellectual journey.',
  },
  {
    id: 'agent',
    icon: 'smart_toy',
    title: 'Your AI Agent',
    description: 'Chat with an AI that knows your learning history. Get personalized suggestions, summaries, and insights tailored to your knowledge graph.',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const { theme: currentTheme, setTheme } = useTheme();
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If already completed, redirect
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (done === 'true') {
      router.replace('/');
    }
  }, [router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  const isLast = current === SLIDES.length - 1;

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/');
  };

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrent((p) => p + 1);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-m3-surface">
        <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const slide = SLIDES[current];

  return (
    <div className="min-h-screen flex flex-col bg-m3-surface">
      {/* Skip */}
      <div className="flex justify-end p-4">
        <button
          onClick={handleComplete}
          className="text-sm text-m3-on-surface-variant hover:text-m3-on-surface transition-standard"
        >
          Skip
        </button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 max-w-lg mx-auto">
        <div className="w-24 h-24 rounded-full bg-m3-primary flex items-center justify-center mb-8">
          <span
            className="material-symbols-outlined text-m3-on-primary"
            style={{ fontSize: 48, fontVariationSettings: "'FILL' 1" }}
          >
            {slide.icon}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-m3-on-surface text-center mb-4">
          {slide.title}
        </h1>
        <p className="text-base text-m3-on-surface-variant text-center leading-relaxed max-w-sm">
          {slide.description}
        </p>

        {/* Theme picker on welcome slide */}
        {slide.id === 'welcome' && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <span className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant">
              CHOOSE YOUR THEME
            </span>
            <div className="flex gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-standard ${
                    currentTheme === t.id
                      ? 'border-m3-primary'
                      : 'border-m3-outline-variant hover:border-m3-outline'
                  }`}
                  title={t.label}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: t.swatch }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dots + Next */}
      <div className="flex flex-col items-center gap-6 pb-8 px-8">
        <div className="flex gap-2 items-center">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 bg-m3-primary'
                  : 'w-2 bg-m3-outline-variant'
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleNext}
          className="w-full max-w-sm h-12 rounded-2xl bg-m3-primary text-m3-on-primary font-bold text-[15px] hover:opacity-90 transition-standard flex items-center justify-center gap-2"
        >
          {isLast ? 'Get Started' : 'Next'}
          {!isLast && (
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          )}
        </button>
      </div>
    </div>
  );
}
