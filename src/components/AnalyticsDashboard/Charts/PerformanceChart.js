import React from 'react';
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const PerformanceChart = ({ data, themeColors }) => {
  // Ensure all values are formatted with at most 2 decimal places
  const formattedData = data?.map(item => ({
    ...item,
    value: typeof item.value === 'number' ? parseFloat(item.value.toFixed(2)) : item.value
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 h-[420px]">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5">
        Performance Metrics
      </h2>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart outerRadius={110} data={formattedData}>
            <PolarGrid 
              stroke="#e2e8f0" 
              strokeOpacity={0.5}
              className="dark:stroke-gray-600"
            />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{
                fill: '#7f8a99',
                fontSize: 12,
                className: 'dark:fill-gray-300'
              }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 'auto']}
              tick={{
                fill: '#475569',
                fontSize: 10,
                className: 'dark:fill-gray-300'
              }}
              className="stroke-slate-300 dark:stroke-gray-500"
            />
            <Radar
              name="Current"
              dataKey="value"
              stroke={themeColors.primary}
              fill={themeColors.primary}
              fillOpacity={0.3}
              className="dark:fill-opacity-60"
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="backdrop-blur-md bg-gray-800/95 dark:bg-gray-800/95 p-3 rounded-lg shadow-xl border border-gray-700 dark:border-gray-600 transform transition-all">
                      <p className="font-semibold text-gray-100 dark:text-gray-200">
                        {payload[0].payload.metric}
                      </p>
                      <div className="mt-2 text-sm border-t border-gray-700/50 dark:border-gray-600 pt-2">
                        <p className="text-gray-300 dark:text-gray-300">
                          Value: <span className="font-medium text-gray-200">{payload[0].value}</span>
                        </p>
                        <p className="text-gray-300 dark:text-gray-300">
                          Max: <span className="font-medium text-gray-200">{payload[0].payload.maxValue}</span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart; 