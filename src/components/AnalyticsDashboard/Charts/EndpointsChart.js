import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const EndpointsChart = ({ data, themeColors }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 h-[400px] flex flex-col items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No API data available</p>
      </div>
    );
  }

  // Map API names to their display names
  const mappedData = data.map(item => ({
    ...item,
    endpoint: item.endpoint === 'recipe2-api' ? 'RecipeDB' : 
              item.endpoint === 'api' ? 'FlavorDB' : 
              item.endpoint
  }));

  // Calculate dynamic bar size based on number of APIs - ensure visually balanced even with few APIs
  const barSize = Math.max(25, Math.min(50, 200 / Math.max(data.length, 2)));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 h-[400px] flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        API Request Traffic
      </h2>
      <div className="flex-grow api-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={mappedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
            barSize={barSize}
            barGap={8}
            cursor="pointer"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
            <XAxis 
              type="number" 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis 
              dataKey="endpoint" 
              type="category" 
              width={100}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 13 }} 
              interval={0} // Show all labels
            />
            <Tooltip 
              cursor={{fill: 'rgba(0, 0, 0, 0.7)', opacity: 0.4}}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="backdrop-blur-md bg-gray-800/95 dark:bg-gray-800/95 p-3 rounded-lg shadow-xl border border-gray-700 dark:border-gray-600 transform transition-all">
                      <h4 className="font-semibold text-gray-100 dark:text-white">
                        {data.endpoint}
                      </h4>
                      <div className="mt-2 pt-2 border-t border-gray-700/50 dark:border-gray-600">
                        <p className="text-gray-200 dark:text-gray-200 flex items-center">
                          <span 
                            className="inline-block w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: themeColors.secondary }}
                          ></span>
                          <span className="font-medium">{data.count.toLocaleString()}</span>
                          &nbsp;requests
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="count" 
              name="Requests" 
              fill={themeColors.secondary} 
              radius={[0, 6, 6, 0]}
              className="hover:opacity-65 transition-all duration-300 hover:shadow-[0_0_15px_2px_rgba(0,0,0,0.7)]"
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EndpointsChart; 