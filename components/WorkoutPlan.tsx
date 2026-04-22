
import React, { useState, useMemo } from 'react';
import type { Workout } from '../types';

interface WorkoutPlanProps {
  workouts: Workout[];
}

const ArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const dayMap: { [key: number]: string } = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
};

const WorkoutPlan: React.FC<WorkoutPlanProps> = ({ workouts }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const todayWorkout = useMemo(() => {
    const today = new Date().getDay(); // Sunday - 0, Monday - 1
    const dayName = dayMap[today];
    return workouts.find(w => w.day === dayName);
  }, [workouts]);

  if (!todayWorkout) {
    return (
      <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/20 text-center">
        <h3 className="text-xl font-bold text-white">Día de Descanso</h3>
        <p className="text-gray-300 mt-1">No hay entrenamiento programado para hoy.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/20">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-green-300 font-medium">RUTINA DE HOY</p>
            <h3 className="text-2xl font-bold text-white mt-1">{todayWorkout.focus}</h3>
          </div>
          <ArrowDownIcon className={`w-8 h-8 text-white/50 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 mt-4 overflow-y-auto' : 'max-h-0'}`}>
        <div className="w-full h-px bg-white/20 my-2"></div>
        {todayWorkout.duration && <p className="text-sm text-gray-300 mb-2">Duración: {todayWorkout.duration}</p>}
        <ul className="space-y-2">
          {todayWorkout.exercises.map((exercise, index) => (
            <li key={index} className="flex justify-between">
              <span className="text-white">{exercise.name}</span>
              <span className="font-mono text-gray-300">{exercise.setsReps}</span>
            </li>
          ))}
        </ul>
        {todayWorkout.final && (
            <div className="mt-4">
                <p className="font-semibold text-green-300">Final:</p>
                <p className="text-gray-200">{todayWorkout.final}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPlan;
