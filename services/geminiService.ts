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

export const getAiCoachTip = async (context?: UserDataContext): Promise<string> => {
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

    return response.text;
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
        const prompt = `Act as an expert fitness and nutrition coach. A user needs a plan to achieve a fitness goal.
        
        **User's Data:**
        - Current Weight: ${profile.weight} kg
        - Height: ${profile.height} cm
        - Goal: Reach ${targetWeight} kg by ${targetDate} (a weight ${weightGoal}).
        
        **Task:**
        Generate a high-level, safe, and encouraging diet and exercise plan.
        
        **Output Format (use Markdown):**
        - Start with a positive, one-sentence motivational statement.
        - Use a "### Diet Plan" heading. Provide 3-4 bullet points with actionable dietary advice (e.g., calorie targets, macro suggestions, food types to focus on).
        - Use a "### Exercise Pattern" heading. Provide 3-4 bullet points on workout structure (e.g., recommended weekly frequency of strength vs. cardio, exercises to prioritize based on their goal).
        - Conclude with a short disclaimer that this is a general suggestion and not medical advice.
        
        Keep the entire response concise and easy to understand.`;

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.7 }
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error generating goal plan:", error);
        return "Could not generate a plan at this time. Focus on consistent workouts and a balanced diet.";
    }
}

export const getAiMealSuggestion = async (): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            return "A balanced meal of grilled chicken, brown rice, and steamed vegetables is a great option.";
        }
        const prompt = `I'm looking for a healthy and simple meal idea. Suggest one specific meal (e.g., for lunch or dinner). Keep the description to two sentences. Mention the key ingredients.`;
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.9 }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error fetching meal suggestion:", error);
        return "Try a protein-packed salad with your favorite greens and veggies.";
    }
}

export const getAiWorkoutSuggestion = async (): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            return "How about a 30-minute brisk walk or a full-body strength routine focusing on compound movements?";
        }
        const prompt = `I need a workout idea for today. Suggest a specific type of workout (e.g., upper body strength, HIIT, active recovery). Provide a brief, one-sentence rationale for why it's a good choice.`;
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.9 }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error fetching workout suggestion:", error);
        return "Consider some active recovery today, like stretching or foam rolling, to help your muscles repair.";
    }
}


export const getAiWeeklyWorkoutPlan = async (profile: UserProfile): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            return `### Plan for the Week\n- Monday: Upper Body\n- Tuesday: Lower Body\n- Wednesday: Rest\n- Thursday: Upper Body\n- Friday: Lower Body\n- Saturday: Active Recovery\n- Sunday: Rest`;
        }
        const prompt = `Act as an expert personal trainer creating a weekly workout schedule for a user.

        **User Profile:**
        - Current Weight: ${profile.weight} kg
        - Bench Press 1RM: ${profile.prs.bench} kg
        - Squat 1RM: ${profile.prs.squat} kg
        
        **Task:**
        Generate a balanced 7-day workout schedule.
        - Specify which days are for training and which are rest days.
        - For training days, suggest a clear focus (e.g., 'Push Day - Chest/Shoulders/Triceps', 'Leg Day', 'Full Body Strength', 'Active Recovery').
        - The plan should be effective and sustainable.
        
        **Output Format (use Markdown):**
        - Start with a motivational title like "### Your AI-Generated Weekly Plan".
        - Use a bulleted list for each day of the week (e.g., "- **Monday:** Push Day (Chest, Shoulders, Triceps)").
        - Do not list specific exercises, only the high-level training focus for each day.`;

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.6 }
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error generating weekly plan:", error);
        return "Could not generate a plan. A good starting point is alternating between upper and lower body workouts with rest days in between.";
    }
};