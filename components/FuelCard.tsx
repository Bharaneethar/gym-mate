import React from 'react';
import type { DailyFuel } from '../types';

interface FuelCardProps {
  data: DailyFuel | null;
  onLogCheatMeal: () => void;
}

const FuelCard: React.FC<FuelCardProps> = ({ data, onLogCheatMeal }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Daily Fuel</h2>
      <div className="flex justify-between items-start">
        <div className="space-y-2 text-gray-700">
          <div>
            <span className="font-semibold">Breakfast: </span>
            <span>{data?.breakfast ?? 'Not logged'}</span>
          </div>
          <div>
            <span className="font-semibold">Lunch: </span>
            <span>{data?.lunch ?? 'Not logged'}</span>
          </div>
        </div>
        <button 
          onClick={onLogCheatMeal}
          className="flex items-center space-x-2 px-4 py-2 border border-emerald-500 text-emerald-600 rounded-full text-sm font-medium hover:bg-emerald-50 transition-colors"
        >
          <span>Log Cheat Meal</span>
        </button>
      </div>
    </div>
  );
};

export default FuelCard;