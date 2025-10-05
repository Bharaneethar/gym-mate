
import React, { useState, useEffect } from 'react';
import { getActivityHistory } from '../services/api';
import type { ActivityDataPoint } from '../types';

const ActivityHeatmap: React.FC = () => {
    const [data, setData] = useState<Map<string, number>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const history = await getActivityHistory();
            const dataMap = new Map<string, number>();
            history.forEach(item => {
                dataMap.set(item.date, item.level);
            });
            setData(dataMap);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const today = new Date();
    const yearAgo = new Date();
    yearAgo.setDate(today.getDate() - 365);

    const days = [];
    let currentDate = new Date(yearAgo);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // Start from the beginning of the week

    for (let i = 0; i < 53 * 7; i++) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const getColorClass = (level: number | undefined) => {
        switch (level) {
            case 1: return 'bg-emerald-200';
            case 2: return 'bg-emerald-400';
            case 3: return 'bg-emerald-600';
            default: return 'bg-gray-200';
        }
    };

    if (isLoading) {
        return (
             <div className="grid grid-cols-[repeat(53,minmax(0,1fr))] gap-1 animate-pulse">
                {Array.from({ length: 371 }).map((_, index) => (
                    <div key={index} className="w-full aspect-square bg-gray-200 rounded-sm"></div>
                ))}
            </div>
        )
    }

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStarts = days.reduce((acc, day, i) => {
        const month = day.getMonth();
        if (i > 0 && month !== days[i - 1].getMonth()) {
            acc.push({ monthIndex: month, weekIndex: Math.floor(i / 7) });
        }
        return acc;
    }, [{ monthIndex: days[0].getMonth(), weekIndex: 0 }]);


    return (
        <div>
            <div className="grid grid-flow-col grid-rows-7 gap-1">
                {days.map(day => {
                    const dateString = day.toISOString().split('T')[0];
                    const level = data.get(dateString);
                    const isFuture = day > today;
                    return (
                        <div
                            key={dateString}
                            className={`w-full aspect-square rounded-sm ${isFuture ? 'bg-gray-100' : getColorClass(level)}`}
                            title={`${dateString}: Level ${level || 0}`}
                        ></div>
                    );
                })}
            </div>
             <div className="flex justify-between text-xs text-gray-500 mt-1 px-1" style={{ paddingLeft: `${(monthStarts[0].weekIndex / 53) * 100}%` }}>
                {monthStarts.map(({ monthIndex, weekIndex }, i) => {
                    const nextWeekIndex = monthStarts[i + 1] ? monthStarts[i + 1].weekIndex : 53;
                    const widthPercent = ((nextWeekIndex - weekIndex) / 53) * 100;
                    return (
                        <div key={monthIndex} style={{ minWidth: `${widthPercent}%` }}>
                            {monthLabels[monthIndex]}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivityHeatmap;
