import React, { useState } from 'react';
import { logMeal } from '../services/api';
import { XIcon } from './icons/XIcon';

interface CheatMealModalProps {
    onClose: () => void;
    onMealLogged: () => void;
}

const CheatMealModal: React.FC<CheatMealModalProps> = ({ onClose, onMealLogged }) => {
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !calories) {
            setError('Please fill in both fields.');
            return;
        }
        
        setError('');
        setIsSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            await logMeal(today, {
                name,
                calories: parseInt(calories, 10),
                type: 'Snack', // Log cheat meals as snacks
                protein: 0,
                carbs: 0,
                fat: 0,
            });
            onMealLogged();
            onClose();
        } catch (err) {
            console.error('Failed to log cheat meal', err);
            setError('Could not save your meal. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Log Cheat Meal</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <label htmlFor="cheat-name" className="block text-sm font-medium text-gray-700">Meal Name</label>
                        <input
                            type="text"
                            id="cheat-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="e.g., Pizza Slice"
                        />
                    </div>
                     <div>
                        <label htmlFor="cheat-calories" className="block text-sm font-medium text-gray-700">Approx. Calories</label>
                        <input
                            type="number"
                            id="cheat-calories"
                            value={calories}
                            onChange={(e) => setCalories(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="e.g., 300"
                        />
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={isSaving} className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300">
                            {isSaving ? 'Saving...' : 'Log Meal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheatMealModal;