import type { Profile, DailyFocus, DailyFuel, ProgressData, WorkoutLog, Exercise, WorkoutTemplate, DailyDietLog, Meal, MealType, HistoricalDataPoint, WorkoutHistorySummary, ExerciseCategory, YesterdaysPerformance, FoodItem, MealTemplate, UserProfile, ActivityDataPoint, User } from '../types';

const DB_KEY = 'gymmate_data';

// --- Database Structure ---
interface AppData {
    profile: UserProfile;
    workoutTemplates: WorkoutTemplate[];
    mealTemplates: MealTemplate[];
    dietLogs: { [date: string]: DailyDietLog };
    workoutLogs: { [date: string]: { exercises: WorkoutLog[], level: number } };
}

interface Database {
    users: User[];
    currentUser: string | null;
    appData: { [email: string]: AppData };
}

// --- Helper Functions ---
const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

const getDatabase = (): Database => {
    try {
        const dbString = localStorage.getItem(DB_KEY);
        if (dbString) {
            return JSON.parse(dbString);
        }
    } catch (error) {
        console.error("Could not parse database from localStorage:", error);
    }
    // Return a default structure if nothing is found or parsing fails
    return { users: [], currentUser: null, appData: {} };
};

const saveDatabase = (db: Database) => {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (error) {
        console.error("Could not save database to localStorage:", error);
    }
};

const getCurrentUserEmail = (): string | null => {
    const db = getDatabase();
    return db.currentUser;
};

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const getDefaultAppData = (name: string): AppData => ({
    profile: {
        name: name,
        avatar_url: `https://i.pravatar.cc/150?u=${name}`,
        height: 180,
        weight: 83,
        weightHistory: [{ date: formatDate(new Date()), value: 83 }],
        prs: { bench: 102, squat: 143, deadlift: 184 }
    },
    workoutTemplates: [
        { id: 'tmpl_1', name: 'Full Body Strength', exercises: [{ exerciseId: '2', exerciseName: 'Squat', setCount: 3, reps: 5 }, { exerciseId: '1', exerciseName: 'Bench Press', setCount: 3, reps: 5 }, { exerciseId: '5', exerciseName: 'Barbell Row', setCount: 3, reps: 5 }] },
        { id: 'tmpl_2', name: 'Push Day', exercises: [{ exerciseId: '1', exerciseName: 'Bench Press', setCount: 4, reps: 8 }, { exerciseId: '4', exerciseName: 'Overhead Press', setCount: 3, reps: 10 }, { exerciseId: '11', exerciseName: 'Incline Dumbbell Press', setCount: 3, reps: 10 }, { exerciseId: '12', exerciseName: 'Lateral Raises', setCount: 3, reps: 12 }, { exerciseId: '7', exerciseName: 'Tricep Pushdowns', setCount: 3, reps: 12 }] },
        { id: 'tmpl_3', name: 'Pull Day', exercises: [{ exerciseId: '3', exerciseName: 'Deadlift', setCount: 1, reps: 5 }, { exerciseId: '9', exerciseName: 'Lat Pulldowns', setCount: 3, reps: 10 }, { exerciseId: '5', exerciseName: 'Barbell Row', setCount: 3, reps: 8 }, { exerciseId: '16', exerciseName: 'Face Pulls', setCount: 3, reps: 15 }, { exerciseId: '6', exerciseName: 'Bicep Curls', setCount: 3, reps: 12 }] },
        { id: 'tmpl_4', name: 'Leg Day', exercises: [{ exerciseId: '2', exerciseName: 'Squat', setCount: 4, reps: 8 }, { exerciseId: '8', exerciseName: 'Leg Press', setCount: 3, reps: 12 }, { exerciseId: '13', exerciseName: 'Romanian Deadlift', setCount: 3, reps: 10 }, { exerciseId: '15', exerciseName: 'Leg Extensions', setCount: 3, reps: 15 }, { exerciseId: '14', exerciseName: 'Leg Curls', setCount: 3, reps: 15 }] }
    ],
    mealTemplates: [
         { id: 'mtmpl_1', name: 'Typical Indian Lunch', type: 'Lunch', items: [{ name: 'Basmati Rice (1 cup, cooked)', calories: 205, protein: 4, carbs: 45, fat: 0 }, { name: 'Dal Tadka (1 cup)', calories: 180, protein: 9, carbs: 25, fat: 5 }] }
    ],
    dietLogs: {},
    workoutLogs: {}
});

// --- Auth API Functions ---

export const signupUser = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await simulateDelay(500);
    const db = getDatabase();
    if (db.users.some(u => u.email === email)) {
        return { success: false, error: "User with this email already exists." };
    }
    db.users.push({ email, password }); // In a real app, hash the password
    db.appData[email] = getDefaultAppData(email.split('@')[0]);
    db.currentUser = email;
    saveDatabase(db);
    return { success: true };
};

export const loginUser = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await simulateDelay(500);
    const db = getDatabase();
    const user = db.users.find(u => u.email === email);
    if (!user || user.password !== password) { // In a real app, compare hashed passwords
        return { success: false, error: "Invalid email or password." };
    }
    db.currentUser = email;
    saveDatabase(db);
    return { success: true };
};

export const logoutUser = async (): Promise<void> => {
    await simulateDelay(100);
    const db = getDatabase();
    db.currentUser = null;
    saveDatabase(db);
};

export const checkSession = async (): Promise<boolean> => {
    await simulateDelay(50);
    return !!getCurrentUserEmail();
};


// --- Refactored API Functions ---

const getUserData = (): AppData | null => {
    const email = getCurrentUserEmail();
    if (!email) return null;
    const db = getDatabase();
    return db.appData[email] || null;
}

export const getProfile = async (): Promise<Profile> => {
    await simulateDelay(100);
    const data = getUserData();
    if (!data) throw new Error("Not authenticated");
    return {
        name: data.profile.name,
        avatar_url: data.profile.avatar_url
    };
};

export const getUserProfile = async (): Promise<UserProfile> => {
    await simulateDelay(400);
    const data = getUserData();
    if (!data) throw new Error("Not authenticated");
    return JSON.parse(JSON.stringify(data.profile));
};

export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    await simulateDelay(800);
    const email = getCurrentUserEmail();
    if (!email) throw new Error("Not authenticated");
    const db = getDatabase();
    
    const oldWeight = db.appData[email].profile.weight;
    db.appData[email].profile = { ...db.appData[email].profile, ...updates };
    
    // If weight was updated, add it to history
    if (updates.weight && updates.weight !== oldWeight) {
        const today = formatDate(new Date());
        const history = db.appData[email].profile.weightHistory || [];
        const todayIndex = history.findIndex(h => h.date === today);
        if (todayIndex > -1) {
            history[todayIndex].value = updates.weight;
        } else {
            history.push({ date: today, value: updates.weight });
        }
        db.appData[email].profile.weightHistory = history.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    saveDatabase(db);
    return JSON.parse(JSON.stringify(db.appData[email].profile));
};

const mockExercises: Exercise[] = [
    { id: '1', name: 'Bench Press', category: 'Upper Body' },
    { id: '2', name: 'Squat', category: 'Lower Body' },
    { id: '3', name: 'Deadlift', category: 'Lower Body' },
    { id: '4', name: 'Overhead Press', category: 'Upper Body' },
    { id: '5', name: 'Barbell Row', category: 'Upper Body' },
    { id: '6', name: 'Bicep Curls', category: 'Upper Body' },
    { id: '7', name: 'Tricep Pushdowns', category: 'Upper Body' },
    { id: '8', name: 'Leg Press', category: 'Lower Body' },
    { id: '9', name: 'Lat Pulldowns', category: 'Upper Body' },
    { id: '10', name: 'Plank', category: 'Core' },
    { id: '11', name: 'Incline Dumbbell Press', category: 'Upper Body' },
    { id: '12', name: 'Lateral Raises', category: 'Upper Body' },
    { id: '13', name: 'Romanian Deadlift', category: 'Lower Body' },
    { id: '14', name: 'Leg Curls', category: 'Lower Body' },
    { id: '15', name: 'Leg Extensions', category: 'Lower Body' },
    { id: '16', name: 'Face Pulls', category: 'Upper Body' },
    { id: '17', name: 'Crunches', category: 'Core' },
    { id: '18', name: 'Leg Raises', category: 'Core' },
    { id: '19', name: 'Push Ups', category: 'Upper Body' },
    { id: '20', name: 'Pull Ups', category: 'Upper Body' },
    { id: '21', name: 'Dumbbell Lunges', category: 'Lower Body' },
    { id: '22', 'name': 'Calf Raises', category: 'Lower Body' },
    { id: '23', 'name': 'Russian Twists', category: 'Core' },
    { id: '24', 'name': 'Dumbbell Shoulder Press', category: 'Upper Body'},
    { id: '25', 'name': 'Hammer Curls', category: 'Upper Body'}
];

export const getExercises = async (): Promise<Exercise[]> => {
    await simulateDelay(100);
    return JSON.parse(JSON.stringify(mockExercises));
}

export const getWorkoutTemplates = async (): Promise<WorkoutTemplate[]> => {
    await simulateDelay(300);
    const data = getUserData();
    if (!data) throw new Error("Not authenticated");
    return JSON.parse(JSON.stringify(data.workoutTemplates));
}

export const saveWorkoutTemplate = async (templateName: string, workoutLog: WorkoutLog[]): Promise<WorkoutTemplate> => {
    await simulateDelay(800);
    const email = getCurrentUserEmail();
    if (!email) throw new Error("Not authenticated");

    const newTemplate: WorkoutTemplate = {
        id: `tmpl_${Date.now()}`,
        name: templateName,
        exercises: workoutLog.map(log => ({
            exerciseId: log.exerciseId,
            exerciseName: log.exerciseName,
            setCount: log.sets.length,
            reps: parseInt(log.sets[0]?.reps) || 10
        })),
    };

    const db = getDatabase();
    db.appData[email].workoutTemplates.push(newTemplate);
    saveDatabase(db);
    return newTemplate;
}

export const saveWorkout = async (date: string, workout: WorkoutLog[]): Promise<{ success: boolean }> => {
    await simulateDelay(1000);
    const email = getCurrentUserEmail();
    if (!email) throw new Error("Not authenticated");

    if (workout.length === 0) {
        const db = getDatabase();
        delete db.appData[email].workoutLogs[date];
        saveDatabase(db);
        return { success: true };
    }

    const volume = workout.reduce((total, ex) => total + ex.sets.reduce((sum, set) => sum + (parseInt(set.reps) * parseInt(set.weight)), 0), 0);
    const newHistoryEntry = {
        level: volume > 2000 ? 3 : volume > 1000 ? 2 : 1,
        exercises: workout
    };

    const db = getDatabase();
    db.appData[email].workoutLogs[date] = newHistoryEntry;
    saveDatabase(db);
    return { success: true };
};

export const getWorkoutForDate = async (date: string): Promise<WorkoutLog[] | null> => {
    await simulateDelay(400);
    const data = getUserData();
    if (!data) return null;
    return data.workoutLogs[date]?.exercises || null;
};

export const getWorkoutLogMarkers = async (): Promise<string[]> => {
    await simulateDelay(300);
    const data = getUserData();
    if (!data) return [];
    return Object.keys(data.workoutLogs);
}

// --- Dashboard Functions (now dynamic) ---
export const getTodaysFocus = async (): Promise<DailyFocus> => {
    await simulateDelay(100);
    const todayStr = formatDate(new Date());
    const data = getUserData();
    if (!data) return { workout_progress: 0, meal_logged: false };

    const workoutLog = data.workoutLogs[todayStr];
    const dietLog = data.dietLogs[todayStr];

    let workout_progress = 0;
    if (workoutLog && workoutLog.exercises.length > 0) {
        const totalSets = workoutLog.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        const completedSets = workoutLog.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);
        if (totalSets > 0) {
            workout_progress = Math.round((completedSets / totalSets) * 100);
        }
    }

    return {
        workout_progress,
        meal_logged: !!dietLog && dietLog.meals.length > 0,
    };
};
export const getYesterdaysPerformance = async (): Promise<YesterdaysPerformance> => {
    await simulateDelay(100);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);
    
    const data = getUserData();
    if (!data) return { workout_completed: false, protein_goal_met: false };

    const workoutLog = data.workoutLogs[yesterdayStr];
    const dietLog = data.dietLogs[yesterdayStr];

    return {
        workout_completed: !!workoutLog && workoutLog.exercises.length > 0,
        protein_goal_met: !!dietLog && dietLog.totals.protein >= dietLog.goals.protein,
    };
};
export const getWeightProgress = async (): Promise<ProgressData[]> => {
    await simulateDelay(200);
    const data = getUserData();
    if (!data || !data.profile.weightHistory || data.profile.weightHistory.length < 2) {
        return [{ day: '1', weight: 84 }, { day: '30', weight: 82.5 }];
    }
    const history = data.profile.weightHistory;
    const first = history[0];
    const last = history[history.length - 1];
    return [
        { day: '1', weight: first.value },
        { day: '30', weight: last.value },
    ];
};
export const getTodaysFuel = async (): Promise<DailyFuel> => {
    await simulateDelay(150);
    const todayStr = formatDate(new Date());
    const data = getUserData();
    if (!data) return { breakfast: 'Not logged', lunch: 'Not logged' };
    
    const dietLog = data.dietLogs[todayStr];
    if (!dietLog) return { breakfast: 'Not logged', lunch: 'Not logged' };

    const breakfast = dietLog.meals.find(m => m.type === 'Breakfast')?.name || 'Not logged';
    const lunch = dietLog.meals.find(m => m.type === 'Lunch')?.name || 'Not logged';

    return { breakfast, lunch };
};


export const getDietLogForDate = async (date: string): Promise<DailyDietLog> => {
    await simulateDelay(500);
    const data = getUserData();
    const defaultGoals = { calories: 2500, protein: 180, carbs: 250, fat: 80 };
    if (!data || !data.dietLogs[date]) {
        return {
            date,
            meals: [],
            totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            goals: defaultGoals
        };
    }
    return JSON.parse(JSON.stringify(data.dietLogs[date]));
};

export const logMeal = async (date: string, newMealData: Omit<Meal, 'id'>): Promise<Meal> => {
    await simulateDelay(800);
    const email = getCurrentUserEmail();
    if (!email) throw new Error("Not authenticated");
    
    const db = getDatabase();
    const userData = db.appData[email];
    
    const newMeal: Meal = { ...newMealData, id: `meal_${Date.now()}` };

    let dayLog = userData.dietLogs[date];
    if (!dayLog) {
        dayLog = {
            date,
            meals: [],
            totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            goals: { calories: 2500, protein: 180, carbs: 250, fat: 80 }
        };
    }

    dayLog.meals.push(newMeal);
    dayLog.totals.calories += newMeal.calories;
    dayLog.totals.protein += newMeal.protein;
    dayLog.totals.carbs += newMeal.carbs;
    dayLog.totals.fat += newMeal.fat;

    userData.dietLogs[date] = dayLog;
    saveDatabase(db);
    
    return newMeal;
};

export const logCheatMeal = async (name: string, calories: number): Promise<Meal> => {
    const today = formatDate(new Date());
    return await logMeal(today, {
      name,
      calories,
      type: 'Snack',
      protein: 0,
      carbs: 0,
      fat: 0
    });
};

const mockIndianFoods: FoodItem[] = [
  { id: 'food_1', name: 'Roti (1 medium)', calories: 104, protein: 3, carbs: 20, fat: 1 },
  { id: 'food_2', name: 'Dal Tadka (1 cup)', calories: 180, protein: 9, carbs: 25, fat: 5 },
  { id: 'food_3', name: 'Paneer Butter Masala (1 cup)', calories: 350, protein: 15, carbs: 10, fat: 28 },
  { id: 'food_4', name: 'Basmati Rice (1 cup, cooked)', calories: 205, protein: 4, carbs: 45, fat: 0 },
  { id: 'food_5', name: 'Chicken Biryani (1 plate)', calories: 450, protein: 25, carbs: 50, fat: 18 },
  { id: 'food_6', name: 'Samosa (1 piece)', calories: 250, protein: 4, carbs: 30, fat: 12 },
  { id: 'food_7', name: 'Aloo Gobi (1 cup)', calories: 150, protein: 4, carbs: 20, fat: 7 },
  { id: 'food_8', name: 'Mixed Vegetable Curry (1 cup)', calories: 120, protein: 3, carbs: 15, fat: 6 },
];

export const searchFoods = async (query: string): Promise<FoodItem[]> => {
    await simulateDelay(300);
    if (!query) return [];
    const lowercasedQuery = query.toLowerCase();
    return mockIndianFoods.filter(food => food.name.toLowerCase().includes(lowercasedQuery));
};

export const getFrequentFoods = async (): Promise<FoodItem[]> => {
    await simulateDelay(300);
    return [
        { id: 'food_11', name: 'Greek Yogurt (1 cup)', calories: 150, protein: 22, carbs: 8, fat: 3 },
        { id: 'food_12', name: 'Whey Protein (1 scoop)', calories: 120, protein: 25, carbs: 3, fat: 1 },
        { id: 'food_4', name: 'Basmati Rice (1 cup, cooked)', calories: 205, protein: 4, carbs: 45, fat: 0 },
    ];
};
export const getMealTemplates = async (): Promise<MealTemplate[]> => { 
    await simulateDelay(200);
    const data = getUserData();
    if(!data) return []; 
    return data.mealTemplates; 
};
export const saveMealTemplate = async (name: string, type: MealType, meals: Omit<Meal, 'id' | 'type'>[]): Promise<MealTemplate> => { 
    await simulateDelay(700);
    const email = getCurrentUserEmail();
    if (!email) throw new Error("Not authenticated");
    const newTemplate = { id: `mtmpl_${Date.now()}`, name, type, items: meals };
    const db = getDatabase();
    db.appData[email].mealTemplates.push(newTemplate);
    saveDatabase(db);
    return newTemplate; 
};

export const logMealFromTemplate = async (templateId: string): Promise<DailyDietLog> => {
    await simulateDelay(900);
    const data = getUserData();
    const today = formatDate(new Date());
    if (!data) throw new Error("Not authenticated");
    
    const template = data.mealTemplates.find(t => t.id === templateId);
    if (!template) throw new Error("Template not found");

    for (const item of template.items) {
        await logMeal(today, { ...item, type: template.type });
    }
    
    return getDietLogForDate(today);
};

export const getActivityHistory = async (): Promise<ActivityDataPoint[]> => {
    await simulateDelay(1000);
    const data = getUserData();
    if (!data) return [];
    return Object.entries(data.workoutLogs).map(([date, log]) => ({
        date: date,
        level: log.level
    }));
};

export const getWeeklyActivity = async (): Promise<{ date: string, day: string, workedOut: boolean }[]> => {
    await simulateDelay(400);
    const data = getUserData();
    if (!data) return [];

    const today = new Date();
    const result = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(today);
        day.setDate(today.getDate() - (6 - i));
        const dateString = formatDate(day);
        result.push({
            date: dateString,
            day: day.toLocaleDateString('en-US', { weekday: 'short' }),
            workedOut: !!data.workoutLogs[dateString]
        });
    }
    return result;
};


export const getHistoricalWeight = async (range: '1m' | '3m' | '6m'): Promise<HistoricalDataPoint[]> => { 
    await simulateDelay(700); 
    const data = getUserData();
    if (!data || !data.profile.weightHistory) return [];
    
    const history = data.profile.weightHistory;
    const today = new Date();
    let startDate = new Date();

    if (range === '1m') startDate.setMonth(today.getMonth() - 1);
    if (range === '3m') startDate.setMonth(today.getMonth() - 3);
    if (range === '6m') startDate.setMonth(today.getMonth() - 6);

    return history.filter(h => new Date(h.date) >= startDate);
};

export const getWorkoutVolumeHistory = async(category?: ExerciseCategory): Promise<WorkoutHistorySummary[]> => {
    await simulateDelay(800);
    const data = getUserData();
    if (!data) return [];

    const exerciseMap = new Map(mockExercises.map(ex => [ex.id, ex.category]));
    const summaries: WorkoutHistorySummary[] = [];
    
    for (let i = 3; i >= 0; i--) { // Last 4 weeks
        const weekStartDate = new Date();
        weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() - (i * 7));
        weekStartDate.setHours(0,0,0,0);
        const dateStr = formatDate(weekStartDate);

        let weeklyVolume = 0;
        for (let j = 0; j < 7; j++) {
            const dayDate = new Date(weekStartDate);
            dayDate.setDate(weekStartDate.getDate() + j);
            const dayStr = formatDate(dayDate);
            const log = data.workoutLogs[dayStr];
            if (log) {
                 weeklyVolume += log.exercises
                    // FIX: Removed comparison of `category` to 'All' as the type `ExerciseCategory` does not include 'All'. The `!category` check correctly handles the "all" case.
                    .filter(ex => !category || exerciseMap.get(ex.exerciseId) === category)
                    .reduce((total, ex) => total + ex.sets.reduce((sum, set) => sum + ((parseInt(set.reps) || 0) * (parseInt(set.weight) || 0)), 0), 0);
            }
        }
        summaries.push({ date: dateStr, volume: Math.round(weeklyVolume) });
    }
    return summaries;
};

export const getStrengthProgression = async (exerciseId: string): Promise<HistoricalDataPoint[]> => {
    await simulateDelay(600);
    const data = getUserData();
    if (!data) return [];

    const progression: HistoricalDataPoint[] = [];
    Object.entries(data.workoutLogs).forEach(([date, log]) => {
        const relevantExercise = log.exercises.find(ex => ex.exerciseId === exerciseId);
        if (relevantExercise) {
            const maxWeightSet = relevantExercise.sets.reduce((maxSet, currentSet) => {
                const maxWeight = parseInt(maxSet.weight) || 0;
                const currentWeight = parseInt(currentSet.weight) || 0;
                return currentWeight > maxWeight ? currentSet : maxSet;
            }, relevantExercise.sets[0]);
            
            if (maxWeightSet) {
                 const weight = parseInt(maxWeightSet.weight);
                 const reps = parseInt(maxWeightSet.reps);
                 // Epley formula for 1RM estimation
                 const estimated1RM = Math.round(weight * (1 + reps / 30));
                 progression.push({ date, value: estimated1RM });
            }
        }
    });

    return progression.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getDietLogMarkers = async (): Promise<string[]> => {
    await simulateDelay(300);
    const data = getUserData();
    if (!data) return [];
    return Object.keys(data.dietLogs);
}

export const getWeeklyCalorieHistory = async (): Promise<HistoricalDataPoint[]> => {
    await simulateDelay(500);
    const data = getUserData();
    if (!data) return [];

    const today = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        const dateString = formatDate(day);
        const log = data.dietLogs[dateString];
        result.push({
            date: dateString,
            value: log ? log.totals.calories : 0
        });
    }
    return result;
};