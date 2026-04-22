import React from 'react';

export type AppMode = 'day' | 'record' | 'support' | 'settings';

interface BottomNavBarProps {
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  onMomentumClick: () => void;
}

const DayIcon = ({ isActive }: { isActive: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isActive ? 'text-green-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const RecordIcon = ({ isActive }: { isActive: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isActive ? 'text-green-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const SupportIcon = ({ isActive }: { isActive: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isActive ? 'text-green-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
    {/* Simple Lifebuoy / Support Icon alternative */}
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

// Better Support Icon (Lifebuoy)
const SupportIconImproved = ({ isActive }: { isActive: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isActive ? 'text-green-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);


const SettingsIcon = ({ isActive }: { isActive: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isActive ? 'text-green-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const NavButton: React.FC<{ mode: AppMode; label: string; activeMode: AppMode; onClick: () => void; children: React.ReactNode }> = ({ mode, label, activeMode, onClick, children }) => {
  const isActive = mode === activeMode;
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center w-1/4 transition-colors duration-200">
      {children}
      <span className={`text-[10px] mt-1 ${isActive ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>{label}</span>
    </button>
  );
};


const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeMode, setActiveMode, onMomentumClick }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900/95 backdrop-blur-xl border-t border-white/5 flex justify-around items-center z-50 pb-2 safe-area-bottom">
      <NavButton mode="day" label="Mi día" activeMode={activeMode} onClick={() => setActiveMode('day')}>
        <DayIcon isActive={activeMode === 'day'} />
      </NavButton>
      <NavButton mode="record" label="Registro" activeMode={activeMode} onClick={() => setActiveMode('record')}>
        <RecordIcon isActive={activeMode === 'record'} />
      </NavButton>

      {/* Momentum Button (Fire) */}
      <button
        onClick={onMomentumClick}
        className="flex flex-col items-center justify-center -mt-6 group"
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)] group-hover:scale-110 transition-transform duration-300 border-4 border-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white animate-pulse-slow font-bold" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-[10px] mt-1 text-red-500 font-bold tracking-wider">MOMENTUM</span>
      </button>

      <NavButton mode="support" label="Apoyo" activeMode={activeMode} onClick={() => setActiveMode('support')}>
        <SupportIconImproved isActive={activeMode === 'support'} />
      </NavButton>
      <NavButton mode="settings" label="Ajustes" activeMode={activeMode} onClick={() => setActiveMode('settings')}>
        <SettingsIcon isActive={activeMode === 'settings'} />
      </NavButton>
    </nav>
  );
};

export default BottomNavBar;
