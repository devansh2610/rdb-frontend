import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const LatencyChart = ({ data, themeColors }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 h-full min-h-[400px] flex flex-col items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No latency data available</p>
      </div>
    );
  }
  
  // Prepare data for display - ensure consistent y-axis scale
  let maxLatencyValue = 0;
  data.forEach(item => {
    if (item.maxLatency > maxLatencyValue) {
      maxLatencyValue = item.maxLatency;
    }
  });
  
  // Round up to nearest 100 for better visualization
  const yAxisMax = Math.ceil(maxLatencyValue / 100) * 100;

  // Format decimal values to 2 decimal places and map API names
  const formattedData = data.map(item => ({
    ...item,
    endpoint: item.endpoint === 'recipe2-api' ? 'RecipeDB' : 
              item.endpoint === 'api' ? 'FlavorDB' : 
              item.endpoint,
    avgLatency: parseFloat(item.avgLatency.toFixed(2)),
    minLatency: parseFloat(item.minLatency.toFixed(2)),
    maxLatency: parseFloat(item.maxLatency.toFixed(2))
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 h-full min-h-[400px] flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        API Latency Overview
      </h2>
      <div className="flex-grow api-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 25 }}
            barSize={data.length > 3 ? 15 : 30} // Adjust bar size based on number of endpoints
            cursor="pointer"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
            <XAxis 
              dataKey="endpoint" 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              interval={0} // Show all labels
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value) => `${value}ms`}
              domain={[0, yAxisMax]}
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
                      <div className="space-y-2 mt-2 pt-2 border-t border-gray-700/50 dark:border-gray-600">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: themeColors.primary }} />
                          <span className="text-gray-300 dark:text-gray-300">Minimum:</span>
                          <span className="font-medium text-gray-200 dark:text-gray-100">
                            {data.minLatency}ms
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: themeColors.warning }} />
                          <span className="text-gray-300 dark:text-gray-300">Average:</span>
                          <span className="font-medium text-gray-200 dark:text-gray-100">
                            {data.avgLatency}ms
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: themeColors.accent }} />
                          <span className="text-gray-300 dark:text-gray-300">Maximum:</span>
                          <span className="font-medium text-gray-200 dark:text-gray-100">
                            {data.maxLatency}ms
                          </span>
                        </div>
                        {/* <div className="pt-2 mt-1 border-t border-gray-700/50 dark:border-gray-600">
                          <span className="text-gray-300 dark:text-gray-300">Total Requests:</span>
                          <span className="ml-1 font-medium text-gray-200 dark:text-gray-100">
                            {data.count}
                          </span>
                        </div> */}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="minLatency" 
              name="Min"
              fill={themeColors.primary}
              radius={[2, 2, 0, 0]}
              className="hover:opacity-65 transition-all duration-300 hover:shadow-[0_0_15px_2px_rgba(0,0,0,0.7)]"
              animationDuration={800}
            />
            <Bar 
              dataKey="avgLatency" 
              name="Avg"
              fill={themeColors.warning}
              radius={[2, 2, 0, 0]}
              className="hover:opacity-65 transition-all duration-300 hover:shadow-[0_0_15px_2px_rgba(0,0,0,0.7)]"
              animationDuration={1000}
            />
            <Bar 
              dataKey="maxLatency" 
              name="Max"
              fill={themeColors.accent}
              radius={[2, 2, 0, 0]}
              className="hover:opacity-65 transition-all duration-300 hover:shadow-[0_0_15px_2px_rgba(0,0,0,0.7)]"
              animationDuration={1200}
            />
            <Legend 
              verticalAlign="bottom"
              height={36}
              align="center"
              wrapperStyle={{ 
                paddingTop: "10px", 
                bottom: 0, 
                left: "50%", 
                transform: "translateX(-50%)" 
              }}
              formatter={(value) => <span className="text-sm text-gray-700 dark:text-gray-300">{value} Latency</span>}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LatencyChart; 