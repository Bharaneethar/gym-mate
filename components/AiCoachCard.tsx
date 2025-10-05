import React, { useState, useEffect } from 'react';
import { RobotIcon } from './icons/RobotIcon';
import { getAiCoachTip } from '../services/geminiService';
import type { DailyFocus, DailyFuel } from '../types';

interface AiCoachCardProps {
  focusData: DailyFocus | null;
  fuelData: DailyFuel | null;
}

const AiCoachCard: React.FC<AiCoachCardProps> = ({ focusData, fuelData }) => {
  const [tip, setTip] = useState<string>('Loading advice...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTip = async () => {
      setIsLoading(true);
      let context;
      if (focusData && fuelData) {
        context = {
          workoutProgress: focusData.workout_progress,
          breakfast: fuelData.breakfast,
          lunch: fuelData.lunch,
        };
      }
      const newTip = await getAiCoachTip(context);
      setTip(newTip);
      setIsLoading(false);
    };

    fetchTip();
  }, [focusData, fuelData]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="bg-emerald-100 p-2 rounded-full mt-1">
          <RobotIcon className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">AI Coach:</h2>
          {isLoading ? (
             <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-gray-600 leading-snug">{tip}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiCoachCard;
