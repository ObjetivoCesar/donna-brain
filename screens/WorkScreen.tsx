
import React from 'react';

const WorkScreen: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto p-4 md:p-6 min-h-screen flex flex-col space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Pilar: Trabajo</h1>
        <div className="w-10 h-10 bg-gray-500 rounded-full bg-cover bg-center" style={{backgroundImage: `url(https://picsum.photos/seed/person/100/100)`}}></div>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Contenido de Trabajo próximamente.</p>
        </div>
      </main>
    </div>
  );
};

export default WorkScreen;
