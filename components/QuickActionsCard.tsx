
import React, { useState } from 'react';
import { getAiMealSuggestion, getAiWorkoutSuggestion } from '../services/geminiService';

const QuickActionsCard: React.FC = () => {
    const [suggestion, setSuggestion] = useState<{ title: string; content: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSuggestion = async (type: 'meal' | 'workout') => {
        setIsLoading(true);
        setSuggestion(null);
        try {
            if (type === 'meal') {
                const content = await getAiMealSuggestion();
                setSuggestion({ title: "AI Meal Idea:", content });
            } else {
                const content = await getAiWorkoutSuggestion();
                setSuggestion({ title: "AI Workout Idea:", content });
            }
        } catch (error) {
            console.error(`Error getting ${type} suggestion:`, error);
            setSuggestion({ title: "Error", content: "Could not fetch suggestion." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 mb-3">AI Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleSuggestion('meal')}
                    className="py-2 px-3 bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-sm hover:bg-emerald-200 transition-colors"
                >
                    Suggest a Meal
                </button>
                <button
                    onClick={() => handleSuggestion('workout')}
                    className="py-2 px-3 bg-sky-100 text-sky-800 font-semibold rounded-lg text-sm hover:bg-sky-200 transition-colors"
                >
                    Suggest a Workout
                </button>
            </div>
            {isLoading && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                     <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                     <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
            )}
            {suggestion && !isLoading && (
                 <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-sm text-gray-800">{suggestion.title}</h3>
                    <p className="text-sm text-gray-600">{suggestion.content}</p>
                 </div>
            )}
        </div>
    );
};

export default QuickActionsCard;
