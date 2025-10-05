import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getWeeklyActivity } from '../services/api';

interface WeeklyData {
    date: string;
    day: string;
    workedOut: boolean;
}

const WeeklyActivityCard: React.FC = () => {
    const [data, setData] = useState<WeeklyData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const weeklyData = await getWeeklyActivity();
            setData(weeklyData);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-4 shadow-sm h-full animate-pulse flex flex-col">
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-4"></div>
                <div className="flex-grow flex justify-around items-end">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="w-4 h-12 bg-gray-200 rounded-t-md"></div>
                    ))}
                </div>
            </div>
        );
    }
    
    const chartData = data.map(d => ({ ...d, value: d.workedOut ? 1 : 0.1 }));
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm h-full flex flex-col">
            <h2 className="text-base font-bold text-gray-800 mb-2">This Week's Activity</h2>
            <div className="w-full flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <XAxis dataKey="day" tickLine={false} axisLine={false} tickFormatter={(value) => value} 
                         tick={(props) => {
                             const { x, y, payload } = props;
                             const isToday = payload.value === today;
                             return (
                                <g transform={`translate(${x},${y})`}>
                                    <text x={0} y={0} dy={16} textAnchor="middle" fill={isToday ? '#10b981' : '#6b7280'} fontSize={12} fontWeight={isToday ? 'bold' : 'normal'}>
                                        {payload.value}
                                    </text>
                                </g>
                             );
                         }}
                        />
                        <YAxis hide domain={[0, 1.1]} />
                        <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} contentStyle={{ display: 'none' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {
                                chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.workedOut ? '#10b981' : '#e5e7eb'} />
                                ))
                            }
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WeeklyActivityCard;