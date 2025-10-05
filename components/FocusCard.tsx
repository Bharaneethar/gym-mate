
import React from 'react';
import { DumbbellIcon } from './icons/DumbbellIcon';
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


const FocusCard: React.FC<{ data: DailyFocus | null }> = ({ data }) => {
  const workoutProgress = data?.workout_progress ?? 0;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center justify-between">
      <h2 className="text-base font-bold text-gray-800 self-start flex items-center gap-2">
        <div className="bg-emerald-100 p-1.5 rounded-full">
            <DumbbellIcon className="w-4 h-4 text-emerald-600" />
        </div>
        Today's Workout
      </h2>
      <div className="my-4">
        <CircularProgress progress={workoutProgress} />
      </div>
      <button className="w-full text-center py-2 bg-emerald-500 text-white font-semibold rounded-lg text-sm hover:bg-emerald-600 transition-colors">
          Continue Workout
      </button>
    </div>
  );
};

export default FocusCard;