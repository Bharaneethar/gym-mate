import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getExercises, saveWorkout, getWorkoutTemplates, saveWorkoutTemplate, getUserProfile, getWorkoutForDate, getWorkoutLogMarkers, getWorkoutVolumeHistory } from '../services/api';
import { getAiWeeklyWorkoutPlan } from '../services/geminiService';
import type { Exercise, WorkoutLog, WorkoutSet, WorkoutTemplate, ExerciseCategory, UserProfile, WorkoutHistorySummary } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import Calendar from './Calendar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';


const REST_DURATION = 60; // 60 seconds

const RestTimer: React.FC<{ onSkip: () => void }> = ({ onSkip }) => {
    const [timeLeft, setTimeLeft] = useState(REST_DURATION);

    useEffect(() => {
        if (timeLeft === 0) {
            onSkip();
            return;
        };
        const timerId = setInterval(() => { setTimeLeft(timeLeft - 1); }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, onSkip]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center shadow-lg">
                <p className="text-lg font-bold text-gray-700">Resting...</p>
                <p className="text-6xl font-bold text-emerald-500 my-4">{timeLeft}</p>
                <button onClick={onSkip} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition-colors">Skip</button>
            </div>
        </div>
    );
};

type CategoryFilter = 'All' | ExerciseCategory;
const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const Workout: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentWorkout, setCurrentWorkout] = useState<WorkoutLog[]>([]);
    const [isResting, setIsResting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [aiPlan, setAiPlan] = useState<string | null>(null);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [workoutLogMarkers, setWorkoutLogMarkers] = useState<Set<string>>(new Set());
    const [volumeHistory, setVolumeHistory] = useState<WorkoutHistorySummary[]>([]);

    const fetchDataForDate = useCallback(async (date: Date) => {
        setIsLoading(true);
        try {
            const dateString = formatDate(date);
            const [workoutLog, markers, volume] = await Promise.all([
                getWorkoutForDate(dateString),
                getWorkoutLogMarkers(),
                getWorkoutVolumeHistory()
            ]);
            
            setCurrentWorkout(workoutLog || []);
            setWorkoutLogMarkers(new Set(markers));
            setVolumeHistory(volume);

        } catch (error) {
            console.error(`Failed to fetch data for ${formatDate(date)}:`, error);
        } finally {
            setIsLoading(false);
        }
    }, []);


    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [exerciseList, templateList, profile] = await Promise.all([
                    getExercises(), getWorkoutTemplates(), getUserProfile(),
                ]);
                setExercises(exerciseList);
                setTemplates(templateList);
                setUserProfile(profile);
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchDataForDate(selectedDate);
    }, [selectedDate, fetchDataForDate]);


    const filteredExercises = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const currentExerciseIds = new Set(currentWorkout.map(w => w.exerciseId));
        return exercises
            .filter(ex => !currentExerciseIds.has(ex.id))
            .filter(ex => selectedCategory === 'All' || ex.category === selectedCategory)
            .filter(ex => ex.name.toLowerCase().includes(lowercasedQuery));
    }, [searchQuery, exercises, currentWorkout, selectedCategory]);
    
    const handleAddExercise = (exercise: Exercise) => {
        if (!exercise) return;
        const newWorkoutLog: WorkoutLog = {
            id: Date.now(),
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: [{ id: Date.now(), reps: '', weight: '', completed: false }],
        };
        setCurrentWorkout(prev => [...prev, newWorkoutLog]);
        setSearchQuery('');
    };

    const handleQuickAddSets = (workoutLogId: number, reps: number, setCount: number) => {
        const updatedWorkout = currentWorkout.map(log => {
            if (log.id === workoutLogId) {
                const newSets: WorkoutSet[] = Array.from({ length: setCount }, () => ({
                    id: Date.now() + Math.random(),
                    reps: reps.toString(),
                    weight: log.sets[log.sets.length-1]?.weight || '',
                    completed: false,
                }));
                return { ...log, sets: [...log.sets, ...newSets] };
            }
            return log;
        });
        setCurrentWorkout(updatedWorkout);
    }
    
    const handleAddSet = (workoutLogId: number) => {
        const updatedWorkout = currentWorkout.map(log => {
            if (log.id === workoutLogId) {
                const lastSet = log.sets[log.sets.length - 1];
                return { ...log, sets: [...log.sets, { id: Date.now(), reps: lastSet?.reps || '', weight: lastSet?.weight || '', completed: false }] };
            }
            return log;
        });
        setCurrentWorkout(updatedWorkout);
    };

    const handleSetChange = (workoutLogId: number, setId: number, field: 'reps' | 'weight', value: string) => {
        setCurrentWorkout(currentWorkout.map(log => log.id === workoutLogId ? { ...log, sets: log.sets.map(set => set.id === setId ? { ...set, [field]: value } : set) } : log));
    };

    const handleCompleteSet = (workoutLogId: number, setId: number) => {
        let shouldStartRest = false;
        const updatedWorkout = currentWorkout.map(log => {
            if (log.id === workoutLogId) {
                const updatedSets = log.sets.map(set => {
                    if (set.id === setId) {
                        if (!set.completed) shouldStartRest = true;
                        return { ...set, completed: !set.completed };
                    }
                    return set;
                });
                return { ...log, sets: updatedSets };
            }
            return log;
        });
        setCurrentWorkout(updatedWorkout);
        if (shouldStartRest) setIsResting(true);
    };
    
    const handleRemoveExercise = (workoutLogId: number) => setCurrentWorkout(currentWorkout.filter(log => log.id !== workoutLogId));

    const handleFinishWorkout = async () => {
        setIsSaving(true);
        try {
            await saveWorkout(formatDate(selectedDate), currentWorkout);
            alert("Workout saved successfully!");
            if (formatDate(selectedDate) === formatDate(new Date())) {
                // If it's today, we clear it to start fresh if needed
                setCurrentWorkout([]);
            }
            fetchDataForDate(selectedDate); // Refresh markers and view
        } catch (error) {
            console.error("Failed to save workout:", error);
            alert("Could not save workout. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAsTemplate = async () => {
        if (currentWorkout.length === 0) {
            alert("Add at least one exercise to save a template.");
            return;
        }

        const templateName = prompt("Enter a name for your new template:");
        if (templateName) {
            setIsSavingTemplate(true);
            try {
                await saveWorkoutTemplate(templateName, currentWorkout);
                alert("Template saved successfully!");
                // Refresh templates
                const newTemplates = await getWorkoutTemplates();
                setTemplates(newTemplates);
            } catch (error) {
                console.error("Failed to save template:", error);
                alert("Could not save template. Please try again.");
            } finally {
                setIsSavingTemplate(false);
            }
        }
    };
    
    const handleGeneratePlan = async () => {
        if (!userProfile) return;
        setIsGeneratingPlan(true); setAiPlan(null);
        try {
            const plan = await getAiWeeklyWorkoutPlan(userProfile);
            setAiPlan(plan);
        } catch (error) {
            console.error("Failed to generate weekly plan", error);
            setAiPlan("Could not generate a plan at this time.");
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    const handleLoadTemplate = () => {
        if (templates.length === 0) return;
        const templateId = (document.getElementById('template-select') as HTMLSelectElement).value;
        const template = templates.find(t => t.id === templateId);
        if (template) {
            if (currentWorkout.length > 0 && !window.confirm("This will replace your current workout. Are you sure?")) return;
            const newWorkout: WorkoutLog[] = template.exercises.map(ex => ({
                id: Date.now() + Math.random(), exerciseId: ex.exerciseId, exerciseName: ex.exerciseName,
                sets: Array.from({ length: ex.setCount }, (_, i) => ({ id: Date.now() + Math.random() + i, reps: ex.reps.toString(), weight: '', completed: false })),
            }));
            setCurrentWorkout(newWorkout);
        }
    };
    
    return (
        <div className="p-4 space-y-6">
            {isResting && <RestTimer onSkip={() => setIsResting(false)} />}
            <h1 className="text-2xl font-bold text-gray-800">Workout</h1>
            
            <Calendar
                markedDates={workoutLogMarkers}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
            />
            
            <div className="bg-white p-4 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Weekly Volume</h2>
                <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={volumeHistory}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} dy={5} tick={{ fontSize: 12 }} />
                            <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} formatter={(value: number) => [`${value} kg`, 'Volume']} />
                            <Bar dataKey="volume" fill="#3b82f6" name="Volume" radius={[4, 4, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-gray-800">AI Weekly Plan</h2>
                    <button onClick={handleGeneratePlan} disabled={isGeneratingPlan} className="px-3 py-1.5 text-xs font-semibold bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors disabled:bg-emerald-300">
                        {isGeneratingPlan ? 'Generating...' : 'New Plan'}
                    </button>
                </div>
                {isGeneratingPlan && <div className="animate-pulse h-20 bg-gray-200 rounded-md"></div>}
                {aiPlan && <div className="prose prose-sm max-w-none prose-li:my-1" dangerouslySetInnerHTML={{ __html: aiPlan.replace(/### (.*?)\n/g, '<h3>$1</h3>').replace(/\n/g, '<br />').replace(/\*\*-\s/g, '<li>').replace(/- /g, '<li>') }} />}
            </div>
            
             <div className="bg-white p-4 rounded-xl shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Load Template</label>
                <div className="flex gap-2">
                    <select id="template-select" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <button onClick={handleLoadTemplate} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md text-sm hover:bg-gray-300 transition-colors flex-shrink-0">Load</button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Exercise to {selectedDate.toLocaleDateString()}</label>
                <div className="flex space-x-2 mb-3">
                    {(['All', 'Upper Body', 'Lower Body', 'Core'] as CategoryFilter[]).map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${selectedCategory === cat ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{cat}</button>
                    ))}
                </div>
                <div className="relative">
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for an exercise..." className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" autoComplete="off" />
                    {searchQuery && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {filteredExercises.map(ex => (
                                <button key={ex.id} onClick={() => handleAddExercise(ex)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50">{ex.name}</button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {currentWorkout.length > 0 ? (
                    currentWorkout.map((log) => (
                    <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-bold text-gray-800">{log.exerciseName}</h3>
                            <button onClick={() => handleRemoveExercise(log.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Remove</button>
                        </div>
                         <div className="space-y-2">
                            <div className="grid grid-cols-10 gap-2 text-xs font-semibold text-gray-500 px-2">
                                <div className="col-span-1 text-center">Set</div>
                                <div className="col-span-4 text-center">Reps</div>
                                <div className="col-span-4 text-center">Weight (kg)</div>
                                <div className="col-span-1"></div>
                            </div>
                            {log.sets.map((set, setIndex) => (
                                <div key={set.id} className={`grid grid-cols-10 gap-2 items-center p-1 rounded-md transition-colors ${set.completed ? 'bg-emerald-50' : ''}`}>
                                    <div className="col-span-1 text-center font-medium text-gray-700">{setIndex + 1}</div>
                                    <div className="col-span-4"><input type="number" value={set.reps} onChange={e => handleSetChange(log.id, set.id, 'reps', e.target.value)} className={`w-full p-2 border rounded-md text-center focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500 ${set.completed ? 'border-emerald-200' : 'border-gray-200'}`} placeholder="0" /></div>
                                    <div className="col-span-4"><input type="number" value={set.weight} onChange={e => handleSetChange(log.id, set.id, 'weight', e.target.value)} className={`w-full p-2 border rounded-md text-center focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500 ${set.completed ? 'border-emerald-200' : 'border-gray-200'}`} placeholder="0" /></div>
                                    <div className="col-span-1 flex justify-center"><button onClick={() => handleCompleteSet(log.id, set.id)} className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${set.completed ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-200 border-gray-200 hover:bg-gray-300'}`}><CheckIcon className={`w-4 h-4 ${set.completed ? 'text-white' : 'text-gray-500'}`} /></button></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button onClick={() => handleAddSet(log.id)} className="flex-1 py-2 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors">Add Set</button>
                            <button onClick={() => handleQuickAddSets(log.id, 10, 3)} className="flex-1 py-2 text-sm font-semibold text-sky-600 bg-sky-50 rounded-md hover:bg-sky-100 transition-colors">3x10</button>
                            <button onClick={() => handleQuickAddSets(log.id, 5, 5)} className="flex-1 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors">5x5</button>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        <p>No workout logged for {selectedDate.toLocaleDateString()}.</p>
                        <p className="text-sm">Add an exercise to get started!</p>
                    </div>
                )}
            </div>

            {currentWorkout.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={handleSaveAsTemplate} 
                        disabled={isSaving || isSavingTemplate} 
                        className="w-full py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-md hover:bg-gray-300 transition-colors disabled:bg-gray-400 disabled:text-gray-600"
                    >
                        {isSavingTemplate ? 'Saving...' : 'Save Template'}
                    </button>
                    <button 
                        onClick={handleFinishWorkout} 
                        disabled={isSaving || isSavingTemplate} 
                        className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
                    >
                        {isSaving ? 'Saving...' : 'Finish Workout'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Workout;