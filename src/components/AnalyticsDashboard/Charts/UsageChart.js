import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line
} from 'recharts';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import CustomTooltip from './CustomTooltip';

const UsageChart = ({ data, timeRange, themeColors, showComparison, includeAnomalies }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 md:mb-0">
          API Usage Over Time
        </h2>
        {data?.usage.some(day => day.isAnomaly) && includeAnomalies && (
          <div className="flex items-center text-amber-600 dark:text-amber-500 text-sm font-medium">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            Anomalies detected
          </div>
        )}
      </div>
        
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data?.usage}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={themeColors.primary} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={themeColors.primary} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={themeColors.error} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={themeColors.error} stopOpacity={0.1}/>
              </linearGradient>
              <radialGradient 
                id="liveGlowGradient" 
                cx="50%" 
                cy="50%" 
                r="50%" 
                fx="50%" 
                fy="50%"
              >
                <stop offset="0%" stopColor="#FF3B30" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#FF3B30" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FF3B30" stopOpacity="0" />
              </radialGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(tick) => {
                // For 24h view, the format is already "HH:MM"
                if (tick.includes(':')) {
                  // Convert 24-hour format to 12-hour format with AM/PM
                  const [hours, minutes] = tick.split(':');
                  const hour = parseInt(hours, 10);
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  const hour12 = hour % 12 || 12;
                  return `${hour12}:${minutes} ${ampm}`;
                } 
                // For date formats like "Mon, 21 Mar" or "21 Mar", keep as is
                else if (tick.includes(',') || tick.includes(' ')) {
                  return tick;
                } 
                // Format date as DD/MM for 30-day view
                else {
                  try {
                    const date = new Date(tick);
                    if (!isNaN(date)) {
                      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    }
                  } catch (e) {
                    // If parsing fails, return the original tick
                  }
                  return tick;
                }
              }} 
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="requests" 
              stroke={themeColors.primary} 
              fillOpacity={1}
              fill="url(#colorRequests)"
              // Handle interactive dots when hovering
              activeDot={({ cx, cy, payload }) => {
                // Live point indicator (takes priority)
                if (payload.isLive) {
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={5} fill="#FF3B30" />
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={9} 
                        fill="transparent" 
                        stroke="#FF3B30" 
                        strokeWidth={2}
                      />
                      {/* Add subtle glow behind active dot */}
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={7} 
                        className="active-glow"
                        fill="url(#liveGlowGradient)" 
                      />
                    </g>
                  );
                } 
                // Anomaly indicator
                else if (payload.isAnomaly && includeAnomalies) {
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={5} fill={themeColors.primary} />
                      <circle cx={cx} cy={cy} r={9} fill="transparent" stroke={themeColors.warning} strokeWidth={2} />
                    </g>
                  );
                } 
                // Standard dot
                else {
                  return <circle cx={cx} cy={cy} r={5} fill={themeColors.primary} />;
                }
              }}
              // Static dots shown without interaction
              dot={({ cx, cy, payload, index }) => {
                // Show live indicator for today's date in any view
                if (payload.isLive) {
                  return (
                    <g className="live-indicator">
                      {/* Glow effect underneath */}
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={6} 
                        className="glow-effect"
                        fill="url(#liveGlowGradient)" 
                      />
                      
                      {/* Center dot */}
                      <circle cx={cx} cy={cy} r={4} fill="#FF3B30" />
                      
                      {/* Pulse ring */}
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={8} 
                        fill="transparent" 
                        stroke="#FF3B30" 
                        strokeWidth={1.5}
                        className="live-pulse"
                      />
                      
                      {/* Outer ping ring */}
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={12} 
                        fill="transparent" 
                        stroke="rgba(255, 59, 48, 0.8)"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        className="live-ping"
                      />
                      
                      {/* Extra outer ring for enhanced effect */}
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={16} 
                        fill="transparent" 
                        stroke="rgba(255, 59, 48, 0.4)"
                        strokeWidth={0.5}
                        className="live-ping-outer"
                      />
                    </g>
                  );
                }
                
                // Don't show dots for other points
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="errors" 
              stroke={themeColors.error} 
              fillOpacity={1}
              fill="url(#colorErrors)" 
            />
            {showComparison && (
              <Line
                type="monotone"
                data={data?.prevPeriodUsage}
                dataKey="requests"
                name="Previous Period"
                stroke={themeColors.accent}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UsageChart; 