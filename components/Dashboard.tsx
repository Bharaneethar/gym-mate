import React, { useState, useEffect, useCallback } from 'react';
import MotivationalCard from './MotivationalCard';
import AiCoachCard from './AiCoachCard';
import CheatMealModal from './CheatMealModal';
import DailyRecapCard from './DailyRecapCard';
import WeeklyActivityCard from './WeeklyActivityCard';
import FuelCard from './FuelCard';

import {
  getProfile,
  getTodaysFocus,
  getYesterdaysPerformance,
  getTodaysFuel,
} from '../services/api';
import { getAiDailyBriefing } from '../services/geminiService';
import type { Profile, DailyFocus, DailyFuel } from '../types';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [focusData, setFocusData] = useState<DailyFocus | null>(null);
  const [fuelData, setFuelData] = useState<DailyFuel | null>(null);
  const [dailyBriefing, setDailyBriefing] = useState<string | null>(null);
  const [isBriefingLoading, setIsBriefingLoading] = useState(true);
  const [isCheatMealModalOpen, setIsCheatMealModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setIsBriefingLoading(true);

      const [profileRes, focusRes, performanceRes, fuelRes] = await Promise.all([
        getProfile(),
        getTodaysFocus(),
        getYesterdaysPerformance(),
        getTodaysFuel(),
      ]);
      
      setProfile(profileRes);
      setFocusData(focusRes);
      setFuelData(fuelRes);

      if (profileRes && performanceRes && focusRes) {
        const briefing = await getAiDailyBriefing(profileRes.name, performanceRes, focusRes);
        setDailyBriefing(briefing);
      }

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setIsBriefingLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleMealLogged = () => {
    // Re-fetch all data to ensure dashboard is up-to-date
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="h-28 bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <MotivationalCard briefing={dailyBriefing} isLoading={isBriefingLoading} />
      <DailyRecapCard data={focusData} />
      <WeeklyActivityCard />
      <FuelCard data={fuelData} onLogCheatMeal={() => setIsCheatMealModalOpen(true)} />
      <AiCoachCard focusData={focusData} fuelData={fuelData} />
      {isCheatMealModalOpen && (
        <CheatMealModal 
          onClose={() => setIsCheatMealModalOpen(false)}
          onMealLogged={handleMealLogged}
        />
      )}
    </div>
  );
};

export default Dashboard;