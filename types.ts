export interface ProgressData {
  day: string;
  weight: number;
}

export interface Profile {
  name: string;
  avatar_url?: string;
}

export interface UserProfile extends Profile {
    height: number; // in cm
    weight: number; // in kg
    weightHistory?: HistoricalDataPoint[];
    prs: {
        bench: number; // in kg
        squat: number; // in kg
        deadlift: number; // in kg
    }
}

export interface DailyFocus {
  workout_progress: number;
  meal_logged: boolean;
}

export interface YesterdaysPerformance {
  workout_completed: boolean;
  protein_goal_met: boolean;
}

export interface DailyFuel {
  breakfast: string;
  lunch: string;
}

export type ExerciseCategory = 'Upper Body' | 'Lower Body' | 'Core';

export interface Exercise {
  id: string;
  name:string;
  category: ExerciseCategory;
}

export interface WorkoutSet {
    id: number;
    reps: string;
    weight: string;
    completed: boolean;
}

export interface WorkoutLog {
    id: number;
    exerciseId: string;
    exerciseName: string;
    sets: WorkoutSet[];
}

export interface TemplateExercise {
  exerciseId: string;
  exerciseName: string;
  setCount: number;
  reps: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: TemplateExercise[];
}

// Diet Tracking Types
export interface MacroNutrients {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface Meal extends MacroNutrients {
    id: string;
    name: string;
    type: MealType;
}

export interface DailyDietLog {
    date: string; // YYYY-MM-DD
    meals: Meal[];
    totals: MacroNutrients;
    goals: MacroNutrients;
}

export interface FoodItem extends MacroNutrients {
    id: string;
    name: string;
}

export interface MealTemplate {
    id: string;
    name: string;
    type: MealType;
    // We store the core meal data, not the instance-specific ID
    items: Omit<Meal, 'id' | 'type'>[];
}


// Progress Tracking Types
export interface HistoricalDataPoint {
    date: string; // YYYY-MM-DD
    value: number;
}

export interface WorkoutHistorySummary {
    date: string; // Week start date: YYYY-MM-DD
    volume: number;
}

export interface ActivityDataPoint {
    date: string; // YYYY-MM-DD
    level: number; // 0: no activity, 1: low, 2: medium, 3: high
}

// Auth Types
export interface User {
    email: string;
    password?: string; // Only stored on signup, not retrieved
}