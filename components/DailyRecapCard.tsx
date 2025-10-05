import React, { useState, useEffect } from 'react';
import { DumbbellIcon } from './icons/DumbbellIcon';
import { UtensilIcon } from './icons/UtensilIcon';
import { WaterDropIcon } from './icons/WaterDropIcon';
// FIX: The function getTodaysDietLog does not exist. It has been replaced with getDietLogForDate.
import { getDietLogForDate } from '../services/api';
import { getAiMealSuggestion } from '../services/geminiService';
import type { DailyFocus } from '../types';

const CircularProgress: React.FC<{ progress: number }> = ({ progress }) => {
    const radius = 50;
    const stroke = 10;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-32 h-32">
            <svg
                height="100%"
                width="100%"
                viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                className="transform -rotate-90"
            >
                <circle
                    stroke="#e5e7eb"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke="#10b981"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-3xl font-bold text-gray-800">{progress}%</span>
                 <span className="text-sm text-gray-500">Done</span>
            </div>
        </div>
    );
};


interface DailyRecapCardProps {
  data: DailyFocus | null;
}


const DailyRecapCard: React.FC<DailyRecapCardProps> = ({ data }) => {
    const [calories, setCalories] = useState({ consumed: 0, goal: 2500 });
    const [waterCount, setWaterCount] = useState(0);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

    useEffect(() => {
        const fetchDietData = async () => {
            // FIX: The function getTodaysDietLog does not exist. It has been replaced with getDietLogForDate.
            const dietLog = await getDietLogForDate(new Date().toISOString().split('T')[0]);
            if (dietLog) {
                setCalories({
                    consumed: dietLog.totals.calories,
                    goal: dietLog.goals.calories,
                });
            }
        };
        fetchDietData();
    }, []);

    const handleSuggestMeal = async () => {
        setIsLoadingSuggestion(true);
        setSuggestion(null);
        const mealIdea = await getAiMealSuggestion();
        setSuggestion(mealIdea);
        setIsLoadingSuggestion(false);
    };

    const caloriePercentage = calories.goal > 0 ? Math.min((calories.consumed / calories.goal) * 100, 100) : 0;
    const workoutProgress = data?.workout_progress ?? 0;

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-2">
                 <div className="bg-emerald-100 p-1.5 rounded-full">
                    <DumbbellIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Today's Focus</h2>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center my-4">
                <CircularProgress progress={workoutProgress} />
                 <button className="mt-4 w-4/5 text-center py-2.5 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors">
                    Continue Workout
                </button>
            </div>
            
            <div className="space-y-4 border-t pt-4">
                 <div>
                     <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <UtensilIcon className="w-5 h-5 text-orange-500"/>
                        Nutrition
                    </h3>
                     <p className="text-sm text-gray-600">
                        <span className="font-bold text-gray-800">{calories.consumed}</span> / {calories.goal} kcal
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 my-1">
                        <div className="bg-orange-400 h-2 rounded-full" style={{ width: `${caloriePercentage}%` }}></div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <WaterDropIcon className="w-5 h-5 text-sky-500" />
                        Hydration
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex gap-1.5">
                        {Array.from({length: 8}).map((_, i) => (
                            <div key={i} className={`w-5 h-5 rounded-full ${i < waterCount ? 'bg-sky-400' : 'bg-gray-200'}`}></div>
                        ))}
                        </div>
                        <button onClick={() => setWaterCount(w => Math.min(w + 1, 8))} className="w-6 h-6 bg-sky-100 text-sky-700 rounded-full font-bold text-lg flex items-center justify-center">+</button>
                    </div>
                </div>

                <div>
                    {isLoadingSuggestion && <p className="text-sm text-gray-500 text-center animate-pulse">Getting idea...</p>}
                    {suggestion && !isLoadingSuggestion && (
                        <div className="text-sm bg-gray-100 p-2 rounded-lg text-gray-600 mb-2">
                            <span className="font-bold">AI Idea: </span>{suggestion}
                        </div>
                    )}
                    <button 
                        onClick={handleSuggestMeal}
                        disabled={isLoadingSuggestion}
                        className="w-full text-center py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-300 transition-colors"
                    >
                        Suggest a Meal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyRecapCard;