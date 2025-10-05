import { GoogleGenAI } from "@google/genai";
import type { YesterdaysPerformance, UserProfile, DailyFocus } from '../types';

interface UserDataContext {
  workoutProgress: number;
  breakfast: string;
  lunch: string;
}

const getApiKey = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API_KEY environment variable not set. Using placeholder data.");
        return null;
    }
    return apiKey;
}

// --- Caching for AI Coach Tip ---
const tipCache = new Map<string, { tip: string; timestamp: number }>();
const TIP_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getAiCoachTip = async (context?: UserDataContext): Promise<string> => {
  const now = Date.now();
  const cacheKey = JSON.stringify(context || {});
  const cachedEntry = tipCache.get(cacheKey);

  // Return cached tip if it's not expired
  if (cachedEntry && (now - cachedEntry.timestamp < TIP_CACHE_DURATION)) {
    return cachedEntry.tip;
  }

  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return "Remember to stay hydrated throughout the day. It's key for performance and recovery!";
    }

    let prompt: string;
    if (context) {
      prompt = `Given my activity today (Workout: ${context.workoutProgress}% complete, Breakfast: "${context.breakfast}", Lunch: "${context.lunch}"), provide a short, personalized, and encouraging fitness or diet tip. Keep it under 25 words. Be positive and motivating.`;
    } else {
      prompt = "Give me a short, encouraging fitness or hydration tip for the day. Keep it under 20 words. Be positive and motivating.";
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
    });

    const newTip = response.text;
    // Cache the new tip
    tipCache.set(cacheKey, { tip: newTip, timestamp: now });
    return newTip;

  } catch (error) {
    console.error("Error fetching AI coach tip:", error);
    return "Consistency is your superpower. Keep showing up for yourself!";
  }
};

export const getAiDailyBriefing = async (name: string, performance: YesterdaysPerformance, focus: DailyFocus): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
             return `Consistency is the key to unlocking your full potential, ${name}. You've got this!`;
        }

        const prompt = `Act as a friendly, motivational fitness coach. My user's name is ${name}.
        
        Here's their context:
        - Yesterday's workout: ${performance.workout_completed ? 'Completed' : 'Not completed'}.
        - Yesterday's protein goal: ${performance.protein_goal_met ? 'Met' : 'Not met'}.
        - Today's workout progress: ${focus.workout_progress}%.

        Generate a short (1-2 sentence) personalized daily briefing for their dashboard.
        - Acknowledge yesterday's performance (good or bad).
        - Provide a forward-looking, actionable tip for today based on their current workout progress.
        - Be encouraging and positive.
        
        Example for good yesterday, 0% today: "Great job completing your workout yesterday, ${name}! A new day is a new opportunity. Let's get that workout started!"
        Example for missed yesterday, 60% today: "Yesterday is in the past, ${name}. You're already crushing it today at 60%—let's finish strong!"`;
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error fetching AI daily briefing:", error);
        return `Let's make today a great day, ${name}!`;
    }
};

export const getAiGoalPlan = async (profile: UserProfile, targetWeight: number, targetDate: string): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            return `### Diet Plan\n- Focus on whole foods.\n- Drink plenty of water.\n\n### Exercise Plan\n- Stay consistent with your workouts.\n- Ensure you get adequate rest.`;
        }
        const weightGoal = targetWeight > profile.weight ? 'gain' : 'lose';
        const prompt = `Act as an expert fitness and nutrition coach. My user wants to ${weightGoal} weight.

        Here is my profile:
        - Current Weight: ${profile.weight} kg
        - Height: ${profile.height} cm
        - 1-Rep Maxes: Bench: ${profile.prs.bench}kg, Squat: ${profile.prs.squat}kg, Deadlift: ${profile.prs.deadlift}kg
        
        My goal is to reach ${targetWeight} kg by ${targetDate}.

        Please generate a concise, actionable diet and exercise plan for me.
        - Use markdown for formatting.
        - Use ### for headers (e.g., ### Diet Plan).
        - Use bullet points for recommendations.
        - The plan should be simple and easy to follow.
        - Provide 3-4 key points for diet and 3-4 for exercise.
        - Keep the entire response under 150 words.`;
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating AI goal plan:", error);
        return "Could not generate a plan. Please check your inputs and try again.";
    }
};

export const getAiWeeklyWorkoutPlan = async (profile: UserProfile): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            return `### Weekly Split\n- **Day 1:** Full Body Strength\n- **Day 2:** Rest\n- **Day 3:** Full Body Strength\n- **Day 4:** Rest\n- **Day 5:** Full Body Strength\n- **Day 6 & 7:** Active Recovery / Rest`;
        }
        const prompt = `Act as an expert fitness coach. Based on my profile below, create a concise 3-day per week workout split for me.

        Profile:
        - Weight: ${profile.weight} kg
        - Height: ${profile.height} cm
        - 1-Rep Maxes: Bench: ${profile.prs.bench}kg, Squat: ${profile.prs.squat}kg, Deadlift: ${profile.prs.deadlift}kg

        Requirements:
        - Use markdown for formatting.
        - Use ### for the main header.
        - Use **- Day X:** for each day's title.
        - List 2-3 key exercises for each day.
        - Keep the entire response under 100 words.`;
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating AI workout plan:", error);
        return "Could not generate a weekly workout plan at this time.";
    }
}

export const getAiMealSuggestion = async (): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            return "A grilled chicken salad with a light vinaigrette.";
        }
        const prompt = "Suggest a simple, healthy, high-protein meal idea. Keep it under 15 words.";
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.9,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error fetching AI meal suggestion:", error);
        return "Try something with lean protein and plenty of vegetables!";
    }
};

export const getAiWorkoutSuggestion = async (): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            return "Try 3 sets of 12 bodyweight squats.";
        }
        const prompt = "Suggest a quick, effective workout idea or a single exercise to try. Keep it under 15 words.";
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.9,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error fetching AI workout suggestion:", error);
        return "A brisk 20-minute walk is always a great choice!";
    }
};