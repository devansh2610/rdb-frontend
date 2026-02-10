import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { colorScale } from '../Utilities/helpers';

const ErrorsChart = ({ data, themeColors }) => {
  // Generate a distinct color for each status code
  const getStatusCodeColor = (code, index) => {
    // Base colors for different status code types
    const baseColors = {
      '2': ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'],  // Success - green variants
      '3': ['#3b82f6', '#2563eb', '#60a5fa', '#93c5fd', '#bfdbfe'],  // Redirection - blue variants
      '4': ['#f59e0b', '#d97706', '#fbbf24', '#fcd34d', '#fef3c7'],  // Client Error - yellow/orange variants
      '5': ['#ef4444', '#dc2626', '#f87171', '#fca5a5', '#fee2e2']   // Server Error - red variants
    };
    
    // Get the first digit of the status code to determine the category
    const category = code.charAt(0);
    
    // If we have a predefined color for this exact code, use it
    if (baseColors[category]) {
      // Use the index to pick a different variant within the same color family
      const colorIndex = index % baseColors[category].length;
      return baseColors[category][colorIndex];
    }
    
    // Fallback to a generic color if we don't have a match
    return colorScale(index, data.length);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 h-[400px] flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Status Code Distribution
      </h2>
      <div className="flex-grow relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              innerRadius={60}
              dataKey="count"
              nameKey="code"
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`} 
              stroke="transparent"
              className="[&_.recharts-sector]:stroke-white dark:[&_.recharts-sector]:stroke-gray-800"
            >
              {data?.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getStatusCodeColor(entry.code, index)}
                  className="transition-transform duration-300 hover:scale-105 origin-center"
                  strokeWidth={2}
                  stroke={themeColors.primary}
                  style={{
                    transition: 'transform 0.3s, filter 0.3s',
                    filter: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.filter = 'brightness(1.1)';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.filter = 'none';
                    e.target.style.transform = 'scale(1)';
                  }}
                />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  // Get unique color for this status code
                  const statusColor = getStatusCodeColor(data.code, payload[0].index);
                  
                  return (
                    <div className="backdrop-blur-md bg-gray-800/95 dark:bg-gray-800/95 p-3 rounded-lg shadow-xl border border-gray-700 dark:border-gray-600 transform transition-all">
                      <div className="w-full h-1 rounded-full mb-2" style={{ 
                        backgroundColor: statusColor,
                        boxShadow: `0 0 8px ${statusColor}33`
                      }}></div>
                      <div className="space-y-2">
                        <p className="font-bold text-gray-100 dark:text-gray-100">
                          HTTP {data.code}
                          <span className="font-normal text-gray-300 dark:text-gray-300">
                            {' '}({data.description})
                          </span>
                        </p>
                        <div className="pt-2 border-t border-gray-700/50 dark:border-gray-600">
                          <p className="text-lg font-bold text-gray-100 dark:text-gray-100">
                            {data.count}
                            <span className="text-sm font-normal text-gray-400 dark:text-gray-400">
                              {' '}occurrences
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ErrorsChart; 