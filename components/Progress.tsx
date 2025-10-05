import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { getHistoricalWeight, getWorkoutVolumeHistory, getStrengthProgression, getExercises } from '../services/api';
import type { HistoricalDataPoint, WorkoutHistorySummary, Exercise, ExerciseCategory } from '../types';
import ActivityHeatmap from './ActivityHeatmap';

type TimeRange = '1m' | '3m' | '6m';
type VolumeCategory = 'All' | ExerciseCategory;

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">{title}</h2>
        {children}
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const date = new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return (
            <div className="bg-white/80 backdrop-blur-sm p-2 border border-gray-200 rounded-md shadow-sm">
                <p className="label text-sm text-gray-600">{`${date}`}</p>
                <p className="intro font-semibold text-gray-800">{`${payload[0].value} ${payload[0].unit || ''}`}</p>
            </div>
        );
    }
    return null;
};


const Progress: React.FC = () => {
    const [weightData, setWeightData] = useState<HistoricalDataPoint[]>([]);
    const [timeRange, setTimeRange] = useState<TimeRange>('1m');
    const [volumeData, setVolumeData] = useState<WorkoutHistorySummary[]>([]);
    const [strengthData, setStrengthData] = useState<HistoricalDataPoint[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>('1'); // Default to Bench Press
    const [selectedCategory, setSelectedCategory] = useState<VolumeCategory>('All');
    const [loading, setLoading] = useState({ weight: true, volume: true, strength: true, exercises: true });

    useEffect(() => {
        const fetchExercises = async () => {
            setLoading(p => ({ ...p, exercises: true }));
            const exercisesRes = await getExercises();
            setExercises(exercisesRes);
            setLoading(p => ({ ...p, exercises: false }));
        };
        fetchExercises();
    }, []);

    useEffect(() => {
        const fetchWeight = async () => {
            setLoading(p => ({ ...p, weight: true }));
            const data = await getHistoricalWeight(timeRange);
            setWeightData(data);
            setLoading(p => ({ ...p, weight: false }));
        };
        fetchWeight();
    }, [timeRange]);
    
    useEffect(() => {
        const fetchVolume = async () => {
            setLoading(p => ({ ...p, volume: true }));
            const categoryParam = selectedCategory === 'All' ? undefined : selectedCategory;
            const data = await getWorkoutVolumeHistory(categoryParam);
            setVolumeData(data);
             setLoading(p => ({ ...p, volume: false }));
        };
        fetchVolume();
    }, [selectedCategory]);

    const filteredExercises = useMemo(() => {
        if (selectedCategory === 'All') return exercises;
        return exercises.filter(ex => ex.category === selectedCategory);
    }, [exercises, selectedCategory]);

    useEffect(() => {
        if (filteredExercises.length > 0) {
            const isSelectedExerciseStillVisible = filteredExercises.some(ex => ex.id === selectedExerciseId);
            if (!isSelectedExerciseStillVisible) {
                setSelectedExerciseId(filteredExercises[0].id);
            }
        }
    }, [filteredExercises, selectedExerciseId]);

    useEffect(() => {
        if (!selectedExerciseId || loading.exercises) return;
        const fetchStrength = async () => {
            setLoading(p => ({...p, strength: true}));
            const data = await getStrengthProgression(selectedExerciseId);
            setStrengthData(data);
            setLoading(p => ({...p, strength: false}));
        };
        fetchStrength();
    }, [selectedExerciseId, loading.exercises]);
    
    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Your Progress</h1>
            
            <ChartCard title="Activity Heatmap">
                <ActivityHeatmap />
            </ChartCard>

            {/* Weight Chart */}
            <ChartCard title="Weight Trend">
                <div className="flex space-x-2 mb-4">
                    {(['1m', '3m', '6m'] as TimeRange[]).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${timeRange === range ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            {range.toUpperCase()}
                        </button>
                    ))}
                </div>
                 <div className="w-full h-52">
                    {loading.weight ? <div className="animate-pulse bg-gray-200 h-full w-full rounded-md"></div> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weightData}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short' })} dy={5} tick={{ fontSize: 12 }} />
                                <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#colorWeight)" unit="kg" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </ChartCard>

            {/* Workout Volume */}
             <ChartCard title="Weekly Workout Volume">
                 <div className="flex space-x-2 mb-4">
                    {(['All', 'Upper Body', 'Lower Body'] as VolumeCategory[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${selectedCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                 <div className="w-full h-52">
                    {loading.volume ? <div className="animate-pulse bg-gray-200 h-full w-full rounded-md"></div> : (
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={volumeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} dy={5} tick={{ fontSize: 12 }} />
                                <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}/>
                                <Bar dataKey="volume" fill="#3b82f6" name="Volume" unit="kg" radius={[4, 4, 0, 0]} />
                           </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </ChartCard>

            {/* Strength Progression */}
             <ChartCard title="Strength Progression (Est. 1RM)">
                <select 
                    value={selectedExerciseId} 
                    onChange={e => setSelectedExerciseId(e.target.value)}
                    className="mb-4 block w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    disabled={filteredExercises.length === 0}
                >
                    {filteredExercises.length > 0 ? filteredExercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>) : <option>No exercises for this category</option>}
                </select>
                 <div className="w-full h-52">
                    {loading.strength || loading.exercises ? <div className="animate-pulse bg-gray-200 h-full w-full rounded-md"></div> : (
                        <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={strengthData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} dy={5} tick={{ fontSize: 12 }} />
                                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" height={36} />
                                <Line type="monotone" dataKey="value" stroke="#ef4444" name={exercises.find(e=>e.id === selectedExerciseId)?.name || 'Strength'} strokeWidth={2} unit="kg" dot={false} activeDot={{ r: 6 }} />
                           </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </ChartCard>

        </div>
    );
};

export default Progress;