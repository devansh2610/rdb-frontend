import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

function MetricCard({ icon, title, value, trend, color, previousValue }) {
  // Commented out trend color and icon as no previous data is available to compare
  // const trendColor = trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
  // const trendIcon = trend >= 0 ? faArrowUp : faArrowDown;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 transition-all duration-300 hover:shadow-xl relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-10 h-10 rounded-md flex items-center justify-center" 
              style={{ backgroundColor: `${color}20` }}
            >
              <FontAwesomeIcon icon={icon} style={{ color }} size="lg" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          </div>
          
          <div className="flex items-end gap-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {/* Commented out trend indicators as there's no previous data for comparison
            {trend !== 0 && (
              <div className={`flex items-center ${trendColor} text-sm font-medium`}>
                <FontAwesomeIcon icon={trendIcon} className="mr-1" />
                {Math.abs(trend)}%
              </div>
            )}
            */}
          </div>
          
          {/* Commented out previous value display
          {previousValue && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Previous: {previousValue}
            </p>
          )}
          */}
        </div>
      </div>
      
      <div 
        className="absolute bottom-0 left-0 w-full h-1"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

export default MetricCard; 