import React, { useState } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface CalendarProps {
    markedDates: Set<string>;
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ markedDates, selectedDate, onDateSelect }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(<div key={`empty-start-${i}`} className="w-full aspect-square"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateString = date.toISOString().split('T')[0];
        const isToday = date.getTime() === today.getTime();
        const isSelected = date.getTime() === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
        const isMarked = markedDates.has(dateString);

        let buttonClass = "w-full aspect-square flex items-center justify-center rounded-full transition-colors text-sm font-semibold ";
        if (isSelected) {
            buttonClass += "bg-emerald-500 text-white";
        } else if (isToday) {
            buttonClass += "bg-emerald-100 text-emerald-700";
        } else {
            buttonClass += "text-gray-700 hover:bg-gray-100";
        }
        
        days.push(
            <div key={day} className="relative w-full aspect-square">
                <button onClick={() => onDateSelect(date)} className={buttonClass}>
                    {day}
                </button>
                {isMarked && !isSelected && <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
            </div>
        );
    }

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    return (
        <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="font-bold text-gray-800">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
                    <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-medium mb-2">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days}
            </div>
        </div>
    );
};

export default Calendar;