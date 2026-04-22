
import React, { useState } from 'react';
import type { Meal } from '../types';

interface NutritionPlanProps {
  plan: Meal[];
}

const ArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const NutritionPlan: React.FC<NutritionPlanProps> = ({ plan }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/20">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-green-300 font-medium">PLAN NUTRICIONAL</p>
            <h3 className="text-2xl font-bold text-white mt-1">Comidas del Día</h3>
          </div>
          <ArrowDownIcon className={`w-8 h-8 text-white/50 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 mt-4 overflow-y-auto' : 'max-h-0'}`}>
        <div className="w-full h-px bg-white/20 my-2"></div>
        <ul className="space-y-4">
          {plan.map((meal, index) => (
            <li key={index}>
              <p className="font-semibold text-white">{meal.time} - {meal.meal}</p>
              <p className="text-sm text-gray-300 ml-2">{meal.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NutritionPlan;
