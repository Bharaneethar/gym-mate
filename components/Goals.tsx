import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../services/api';
import { getAiGoalPlan } from '../services/geminiService';
import type { UserProfile } from '../types';
import { TargetIcon } from './icons/TargetIcon';

const Goals: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [targetWeight, setTargetWeight] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [plan, setPlan] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const userProfile = await getUserProfile();
            setProfile(userProfile);
            setTargetWeight(userProfile.weight.toString());
            // Set default date to 3 months from now
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 3);
            setTargetDate(futureDate.toISOString().split('T')[0]);
            setIsLoading(false);
        };
        fetchProfile();
    }, []);

    const handleGeneratePlan = async () => {
        if (!profile || !targetWeight || !targetDate) {
            alert("Please fill in all fields.");
            return;
        }
        setIsGenerating(true);
        setPlan('');
        try {
            const generatedPlan = await getAiGoalPlan(profile, parseFloat(targetWeight), targetDate);
            setPlan(generatedPlan);
        } catch (error) {
            console.error("Failed to generate plan:", error);
            setPlan("Sorry, we couldn't generate a plan at this time. Please try again later.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return <div className="p-4 text-center">Loading your profile...</div>;
    }

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Set Your Goal</h1>
            
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                    <TargetIcon className="w-6 h-6 text-emerald-600" />
                    <span>What do you want to achieve?</span>
                </h2>
                <div>
                    <label htmlFor="targetWeight" className="block text-sm font-medium text-gray-700">Target Weight (kg)</label>
                    <input
                        type="number"
                        id="targetWeight"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
                 <div>
                    <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700">By When?</label>
                    <input
                        type="date"
                        id="targetDate"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
                 <button
                    onClick={handleGeneratePlan}
                    disabled={isGenerating}
                    className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
                >
                    {isGenerating ? 'Generating Your Plan...' : 'Generate AI Plan'}
                </button>
            </div>

            {(isGenerating || plan) && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Your AI-Generated Plan</h2>
                    {isGenerating ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-4/5 mt-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ) : (
                        <div 
                            className="prose prose-sm max-w-none prose-headings:font-bold prose-h3:text-gray-700 prose-li:my-1" 
                            dangerouslySetInnerHTML={{ __html: plan.replace(/### (.*?)\n/g, '<h3>$1</h3>').replace(/\n/g, '<br />').replace(/\* /g, '<li>') }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default Goals;