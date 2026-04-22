import React from 'react';
import type { ScheduledActivity } from '../types';

interface CurrentActivityProps {
  activity: ScheduledActivity | null;
  onClick: () => void;
}

const ExpandIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
    </svg>
);


const CurrentActivity: React.FC<CurrentActivityProps> = ({ activity, onClick }) => {
  if (!activity) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
        <h3 className="text-xl font-semibold text-gray-800">Descansando</h3>
        <p className="text-gray-500 mt-2">No hay actividades programadas en este momento.</p>
      </div>
    );
  }

  return (
    <div 
      className="bg-white text-gray-800 p-5 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalles de ${activity.activity}`}
    >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm text-green-600 font-semibold">ACTIVIDAD ACTUAL ({activity.time})</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{activity.activity}</h3>
          </div>
          <ExpandIcon className="w-6 h-6 text-gray-400 ml-2" />
        </div>
        <div className="mt-3 text-left">
            <p className="text-gray-600 text-sm truncate">
                <span className="font-bold text-gray-700">Enfoque: </span>{activity.focus}
            </p>
        </div>
    </div>
  );
};

export default CurrentActivity;