import React, { useState, useEffect, useCallback } from 'react';
import { logMeal, searchFoods, getFrequentFoods } from '../services/api';
import type { Meal, MealType, FoodItem } from '../types';
import { XIcon } from './icons/XIcon';

interface LogMealModalProps {
    onClose: () => void;
    onMealLogged: () => void;
    selectedDate: string;
}

// Custom hook for debouncing
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const LogMealModal: React.FC<LogMealModalProps> = ({ onClose, onMealLogged, selectedDate }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'Breakfast' as MealType,
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [frequentFoods, setFrequentFoods] = useState<FoodItem[]>([]);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        const fetchFrequent = async () => {
            const foods = await getFrequentFoods();
            setFrequentFoods(foods);
        };
        fetchFrequent();
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchQuery.trim() === '') {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            const results = await searchFoods(debouncedSearchQuery);
            setSearchResults(results);
            setIsSearching(false);
        };
        performSearch();
    }, [debouncedSearchQuery]);

    const handleSelectFood = (food: FoodItem) => {
        setFormData(prev => ({
            ...prev,
            name: food.name,
            calories: food.calories.toString(),
            protein: food.protein.toString(),
            carbs: food.carbs.toString(),
            fat: food.fat.toString(),
        }));
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'name') {
            setSearchQuery(value);
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { name, type, calories, protein, carbs, fat } = formData;
        if (!name || !calories) {
            setError('Food name and calories are required.');
            return;
        }

        setError('');
        setIsSaving(true);
        try {
            const newMealData = {
                name,
                type,
                calories: parseInt(calories) || 0,
                protein: parseInt(protein) || 0,
                carbs: parseInt(carbs) || 0,
                fat: parseInt(fat) || 0,
            };
            await logMeal(selectedDate, newMealData);
            onMealLogged();
            onClose();
        } catch (err) {
            console.error("Failed to log meal:", err);
            setError('Could not save meal. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Log a Meal</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div className="relative">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Food Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" required autoComplete="off" />
                            { (isSearching || searchResults.length > 0 || searchQuery.length === 0) && (
                                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-b-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                                    {isSearching && <div className="p-2 text-gray-500">Searching...</div>}
                                    {!isSearching && debouncedSearchQuery.length > 0 && searchResults.map(food => (
                                        <div key={food.id} onClick={() => handleSelectFood(food)} className="p-2 hover:bg-emerald-50 cursor-pointer">
                                            {food.name}
                                        </div>
                                    ))}
                                    {searchResults.length === 0 && debouncedSearchQuery.length > 0 && !isSearching && <div className="p-2 text-gray-500">No results. Enter details manually.</div>}

                                    {!searchQuery && (
                                        <div className="p-2">
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Frequently Logged</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {frequentFoods.map(food => (
                                                    <button type="button" key={food.id} onClick={() => handleSelectFood(food)} className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                                                        {food.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Meal Type</label>
                            <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
                                <option>Breakfast</option>
                                <option>Lunch</option>
                                <option>Dinner</option>
                                <option>Snack</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="calories" className="block text-sm font-medium text-gray-700">Calories</label>
                                <input type="number" name="calories" id="calories" value={formData.calories} onChange={handleChange} placeholder="kcal" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" required />
                            </div>
                            <div>
                                <label htmlFor="protein" className="block text-sm font-medium text-gray-700">Protein</label>
                                <input type="number" name="protein" id="protein" value={formData.protein} onChange={handleChange} placeholder="grams" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                            </div>
                            <div>
                                <label htmlFor="carbs" className="block text-sm font-medium text-gray-700">Carbs</label>
                                <input type="number" name="carbs" id="carbs" value={formData.carbs} onChange={handleChange} placeholder="grams" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                            </div>
                            <div>
                                <label htmlFor="fat" className="block text-sm font-medium text-gray-700">Fat</label>
                                <input type="number" name="fat" id="fat" value={formData.fat} onChange={handleChange} placeholder="grams" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                            </div>
                        </div>
                        <div className="pt-2">
                            <button type="submit" disabled={isSaving} className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300">
                            {isSaving ? 'Saving...' : 'Add Meal'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LogMealModal;