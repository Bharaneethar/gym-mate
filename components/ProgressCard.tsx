import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ProgressData } from '../types';

const defaultData: ProgressData[] = [
  { day: '1', weight: 185 },
  { day: '5', weight: 184.5 },
  { day: '10', weight: 184 },
  { day: '15', weight: 183 },
  { day: '20', weight: 183.5 },
  { day: '25', weight: 182.8 },
  { day: '30', weight: 182.5 },
];

interface ProgressCardProps {
  data: ProgressData[] | null;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ data }) => {
  const chartData = data && data.length > 0 ? data : defaultData;
  const lbsLost = (chartData[0]?.weight - chartData[chartData.length - 1]?.weight).toFixed(1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-2">Your Progress</h2>
      <div className="w-full h-40 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
             <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
              }}
              labelFormatter={(label) => `Day ${label}`}
              formatter={(value: number) => [`${value} lbs`, 'Weight']}
            />
            <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
        <span>Weight Trend (Last 30 Days)</span>
        <span className="font-semibold text-gray-700">{lbsLost} lbs lost</span>
      </div>
    </div>
  );
};

export default ProgressCard;
