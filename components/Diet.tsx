import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getDietLogForDate, getMealTemplates, saveMealTemplate, logMealFromTemplate, getDietLogMarkers, getWeeklyCalorieHistory } from '../services/api';
import type { DailyDietLog, Meal, MealTemplate, MealType, HistoricalDataPoint } from '../types';
import LogMealModal from './LogMealModal';
import { PlusIcon } from './icons/PlusIcon';
import Calendar from './Calendar';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MacroCircle: React.FC<{ label: string; value: number; goal: number; color: string }> = ({ label, value, goal, color }) => {
    const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
    const circumference = 2 * Math.PI * 30;
    const offset = circumference - (percentage / 100) * circumference;
    return (
        <div className="flex flex-col items-center">
            <svg className="w-20 h-20 transform -rotate-90">
                <circle className="text-gray-200" strokeWidth="6" stroke="currentColor" fill="transparent" r="30" cx="40" cy="40" />
                <circle className={color} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r="30" cx="40" cy="40" style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} />
            </svg>
            <span className="text-xl font-bold -mt-14">{Math.round(value)}g</span>
            <span className="text-sm text-gray-500 mt-10">{label}</span>
        </div>
    );
};

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const Diet: React.FC = () => {
    const [dietLog, setDietLog] = useState<DailyDietLog | null>(null);
    const [templates, setTemplates] = useState<MealTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dietLogMarkers, setDietLogMarkers] = useState<Set<string>>(new Set());
    const [calorieHistory, setCalorieHistory] = useState<HistoricalDataPoint[]>([]);

    const isToday = useMemo(() => formatDate(selectedDate) === formatDate(new Date()), [selectedDate]);

    const fetchDataForDate = useCallback(async (date: Date) => {
        setIsLoading(true);
        try {
            const dateString = formatDate(date);
            // Fetch log for the specific date, and markers/history for general view
            const [log, markers, history] = await Promise.all([
                getDietLogForDate(dateString),
                getDietLogMarkers(),
                getWeeklyCalorieHistory()
            ]);
            setDietLog(log);
            setDietLogMarkers(new Set(markers));
            setCalorieHistory(history);
        } catch (error) {
            console.error("Failed to fetch diet data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchDataForDate(selectedDate);
    }, [selectedDate, fetchDataForDate]);

    useEffect(() => {
        const fetchTemplates = async () => {
            const templateList = await getMealTemplates();
            setTemplates(templateList);
        };
        fetchTemplates();
    }, []);

    const handleMealLogged = () => {
        // After a meal is logged for selectedDate, we need to refresh the data
        fetchDataForDate(selectedDate);
    };

    const handleSaveTemplate = async (mealType: MealType, mealsToSave: Meal[]) => {
        if (mealsToSave.length === 0) {
            alert("No meals to save in this group.");
            return;
        }
        const templateName = prompt(`Enter a name for this ${mealType} template:`);
        if (templateName) {
            try {
                const itemsToSave = mealsToSave.map(({ id, type, ...item}) => item);
                await saveMealTemplate(templateName, mealType, itemsToSave);
                alert("Template saved!");
                const updatedTemplates = await getMealTemplates(); // Refresh templates
                setTemplates(updatedTemplates);
            } catch (error) {
                console.error("Failed to save template:", error);
                alert("Could not save template.");
            }
        }
    };

    const handleLogTemplate = async (templateId: string) => {
        if (!isToday) {
            alert("Quick logging from templates is only available for today's date.");
            return;
        }
        try {
            await logMealFromTemplate(templateId);
            fetchDataForDate(selectedDate);
        } catch (error) {
            console.error("Failed to log from template:", error);
            alert("Could not log meals from template.");
        }
    };

    const groupMealsByType = (meals: Meal[]) => {
        return meals.reduce((acc, meal) => {
            (acc[meal.type] = acc[meal.type] || []).push(meal);
            return acc;
        }, {} as Record<string, Meal[]>);
    };

    if (isLoading && !dietLog) { // Show loading skeleton only on initial load
        return <div className="p-4 text-center text-gray-500">Loading your diet log...</div>;
    }
    
    if (!dietLog) {
        return <div className="p-4 text-center text-gray-500">Could not load diet log.</div>;
    }

    const groupedMeals = groupMealsByType(dietLog.meals);
    const mealOrder: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

    return (
        <div className="p-4 space-y-6 pb-24">
            <h1 className="text-2xl font-bold text-gray-800">Diet</h1>
            
            <Calendar
                markedDates={dietLogMarkers}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
            />

            {/* Summary Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                 <p className="text-gray-500">Calories on {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                <p className="text-5xl font-bold text-emerald-600 my-2">{Math.round(dietLog.totals.calories)}</p>
                <p className="text-gray-500">Goal: {dietLog.goals.calories} kcal</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${Math.min((dietLog.totals.calories / dietLog.goals.calories) * 100, 100)}%` }}></div>
                </div>
                <div className="flex justify-around mt-6">
                    <MacroCircle label="Protein" value={dietLog.totals.protein} goal={dietLog.goals.protein} color="text-sky-500" />
                    <MacroCircle label="Carbs" value={dietLog.totals.carbs} goal={dietLog.goals.carbs} color="text-orange-500" />
                    <MacroCircle label="Fat" value={dietLog.totals.fat} goal={dietLog.goals.fat} color="text-yellow-500" />
                </div>
            </div>

            {/* Calorie History */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Weekly Calorie Trend</h2>
                <div className="w-full h-40">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={calorieHistory}>
                            <defs>
                                <linearGradient id="colorCalorie" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { weekday: 'short' })} dy={5} tick={{ fontSize: 12 }} />
                            <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} formatter={(value: number) => [`${value} kcal`, 'Calories']} />
                            <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="url(#colorCalorie)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {isToday && templates.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Quick Log Templates</h2>
                    <div className="space-y-2">
                        {templates.map(template => (
                            <div key={template.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-800">{template.name}</p>
                                    <p className="text-xs text-gray-500">{template.items.length} items</p>
                                </div>
                                <button
                                    onClick={() => handleLogTemplate(template.id)}
                                    className="px-4 py-1.5 bg-emerald-500 text-white text-sm font-semibold rounded-full hover:bg-emerald-600 transition-colors"
                                >
                                    Log
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* Meals List */}
            <div className="space-y-4">
                {mealOrder.map(mealType => {
                    const mealsForType = groupedMeals[mealType] || [];
                    return (
                        <div key={mealType}>
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-lg font-semibold text-gray-700">{mealType}</h2>
                                {isToday && mealsForType.length > 0 && (
                                    <button
                                        onClick={() => handleSaveTemplate(mealType, mealsForType)}
                                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                                    >
                                        Save as template
                                    </button>
                                )}
                            </div>
                            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                                {mealsForType.length > 0 ? (
                                    mealsForType.map(meal => (
                                        <div key={meal.id} className="p-4 flex justify-between items-center">
                                            <p className="font-medium text-gray-800">{meal.name}</p>
                                            <p className="text-gray-500">{meal.calories} kcal</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-400 text-sm">
                                        No {mealType.toLowerCase()} logged for this day.
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-20 right-4 h-16 w-16 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-transform transform hover:scale-110 z-40"
                aria-label="Log new meal"
            >
                <PlusIcon className="w-8 h-8" />
            </button>

            {isModalOpen && <LogMealModal onClose={() => setIsModalOpen(false)} onMealLogged={handleMealLogged} selectedDate={formatDate(selectedDate)} />}

        </div>
    );
};

export default Diet;