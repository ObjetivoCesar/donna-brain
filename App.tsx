import React, { useState, useMemo, useEffect, useRef } from 'react';
import DayScreen from './screens/DayScreen';
import RecordScreen from './screens/RecordScreen';
import SupportScreen from './screens/SupportScreen';
import SettingsScreen from './screens/SettingsScreen';
import BottomNavBar, { AppMode } from './components/BottomNavBar';
import { AppProvider, useApp } from './context/AppContext';
import { AmbientSound } from './types';
import MomentumModal from './components/momentum/MomentumModal';

type Pillar = 'living' | 'motivation' | 'work';

const backgrounds: Record<Pillar, string> = {
  living: "url('/images/living-bg.webp')",
  motivation: "url('/images/motivation-bg.webp')",
  work: "url('/images/work-bg.webp')",
};

const MainLayout: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>('day');
  const [isMomentumOpen, setIsMomentumOpen] = useState(false);
  const { currentActivity, ambientSound } = useApp();

  // --- Audio Logic (Global) ---
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }

    const audio = audioRef.current;
    if (ambientSound === 'none') {
      audio.pause();
      audio.currentTime = 0;
    } else {
      const soundMap: Record<AmbientSound, string> = {
        'none': '',
        'rain': '/audios/focus/rain.mp3',
        'whitenoise': '/audios/focus/whitenoise.mp3',
        'forest': '/audios/focus/forest.mp3',
        'cafe': '/audios/focus/cafe.mp3'
      };
      const src = soundMap[ambientSound];
      if (src && !audio.src.includes(src)) {
        audio.src = src;
        audio.load();
        audio.play().catch(e => console.error("Audio play error:", e));
      } else if (src && audio.paused) {
        audio.play().catch(e => console.error("Audio resume error:", e));
      }
    }
  }, [ambientSound]);

  // Determine background based on current activity's category
  const dynamicBackground = useMemo(() => {
    if (currentActivity?.category) {
      return backgrounds[currentActivity.category];
    }
    return backgrounds['living']; // Fallback
  }, [currentActivity]);

  const renderScreen = () => {
    switch (activeMode) {
      case 'day':
        return <DayScreen />;
      case 'record':
        return <RecordScreen />;
      case 'support':
        return <SupportScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DayScreen />;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-900 text-white overflow-x-hidden">
      {/* Background Image - Dynamic based on current activity */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 opacity-60 transition-all duration-1000"
        style={{ backgroundImage: dynamicBackground }}
      ></div>

      {/* Gradient Overlay - Reduced opacity to let background show through */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/90 z-10"></div>

      {/* Content */}
      <div className="relative z-20 pb-24"> {/* Padding bottom for nav bar */}
        {renderScreen()}
      </div>

      <BottomNavBar
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        onMomentumClick={() => setIsMomentumOpen(true)}
      />

      {/* Momentum Modal */}
      <MomentumModal isOpen={isMomentumOpen} onClose={() => setIsMomentumOpen(false)} />

      {/* Keyframe for modal animation */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;