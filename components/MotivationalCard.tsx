import React from 'react';
import { SparkleIcon } from './icons/SparkleIcon';

interface MotivationalCardProps {
  briefing: string | null;
  isLoading: boolean;
}

const MotivationalCard: React.FC<MotivationalCardProps> = ({ briefing, isLoading }) => {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-4 shadow-sm flex flex-col">
        <div className="flex items-start space-x-3">
          <div className="bg-emerald-100 p-2 rounded-full mt-1 flex-shrink-0">
            <SparkleIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-emerald-700 mb-1">AI Daily Briefing</h2>
            {isLoading ? (
              <div className="w-full space-y-2">
                  <div className="h-3 bg-gray-200 rounded-full w-32 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded-full w-24 animate-pulse"></div>
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-700 leading-snug">
                {briefing || "Consistency is the key to unlocking your full potential. You've got this!"}
              </p>
            )}
          </div>
        </div>
    </div>
  );
};

export default MotivationalCard;
