import React from 'react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    let formattedTime = label;
    
    if (label && label.includes(':')) {
      const [hours, minutes] = label.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      formattedTime = `${hour12}:${minutes} ${ampm}`;
    } 
    else if (label && (label.includes(',') || label.includes(' '))) {
      formattedTime = label;
    } 
    else if (label) {
      try {
        const date = new Date(label);
        if (!isNaN(date)) {
          formattedTime = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
        }
      } catch (e) {
        formattedTime = label;
      }
    }
    
    return (
      <div className="bg-white dark:bg-slate-700 rounded-lg shadow-xl p-4 border border-gray-100 dark:border-slate-600 backdrop-blur-sm">
        <p className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {payload[0].payload.isLive ? 
            <span className="flex items-center gap-2">
              {formattedTime} 
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-green-500 font-semibold">LIVE</span>
            </span> : 
            formattedTime
          }
        </p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            entry.value !== null && (
              <div 
                key={`tooltip-${index}`}
                className="flex items-center gap-2 text-sm"
                style={{ color: entry.color }}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600 dark:text-gray-300">
                  {entry.name}:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                </span>
              </div>
            )
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default CustomTooltip; 