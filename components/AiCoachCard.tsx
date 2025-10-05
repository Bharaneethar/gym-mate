import React, { useState, useEffect } from 'react';
import { RobotIcon } from './icons/RobotIcon';
import { getAiCoachTip, getAiMealSuggestion, getAiWorkoutSuggestion } from '../services/geminiService';
import type { DailyFocus, DailyFuel } from '../types';

interface AiCoachCardProps {
  focusData: DailyFocus | null;
  fuelData: DailyFuel | null;
}

const AiCoachCard: React.FC<AiCoachCardProps> = ({ focusData, fuelData }) => {
  const [tip, setTip] = useState<string>('Loading advice...');
  const [isTipLoading, setIsTipLoading] = useState(true);

  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);

  useEffect(() => {
    const fetchTip = async () => {
      setIsTipLoading(true);
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
      setIsTipLoading(false);
    };

    fetchTip();
  }, [focusData, fuelData]);

  const handleSuggestion = async (type: 'meal' | 'workout') => {
    setIsSuggestionLoading(true);
    setSuggestion(null);
    try {
        const content = type === 'meal' ? await getAiMealSuggestion() : await getAiWorkoutSuggestion();
        setSuggestion(content);
    } catch (error) {
        console.error(`Error getting ${type} suggestion:`, error);
        setSuggestion("Could not fetch a suggestion right now.");
    } finally {
        setIsSuggestionLoading(false);
    }
  };

  const displayContent = suggestion || tip;
  const isLoading = isSuggestionLoading || isTipLoading;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="bg-emerald-100 p-2 rounded-full mt-1">
          <RobotIcon className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex-grow">
          <h2 className="text-lg font-bold text-gray-800 mb-1">AI Coach:</h2>
          {isLoading ? (
             <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-gray-600 leading-snug min-h-[40px]">{displayContent}</p>
          )}
        </div>
      </div>
       <div className="grid grid-cols-2 gap-3 mt-4 border-t pt-4">
            <button
                onClick={() => handleSuggestion('meal')}
                disabled={isSuggestionLoading}
                className="py-2 px-3 bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-sm hover:bg-emerald-200 transition-colors disabled:opacity-50"
            >
                Suggest a Meal
            </button>
            <button
                onClick={() => handleSuggestion('workout')}
                disabled={isSuggestionLoading}
                className="py-2 px-3 bg-sky-100 text-sky-800 font-semibold rounded-lg text-sm hover:bg-sky-200 transition-colors disabled:opacity-50"
            >
                Suggest a Workout
            </button>
        </div>
    </div>
  );
};

export default AiCoachCard;