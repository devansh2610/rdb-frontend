import React from "react";

// Helper functions for token percentage colors
const getTokenPercentageColor = (percentage) => {
  if (percentage <= 10)
    return {
      text: "text-red-500 dark:text-red-400",
      ring: "stroke-red-500 dark:stroke-red-400",
      gradientStart: "#ff5757",
      gradientEnd: "#ff0000",
    };
  if (percentage <= 40)
    return {
      text: "text-orange-500 dark:text-orange-400",
      ring: "stroke-orange-500 dark:stroke-orange-400",
      gradientStart: "#ffb347",
      gradientEnd: "#ff8c00",
    };
  if (percentage <= 80)
    return {
      text: "text-yellow-400 dark:text-yellow-300",
      ring: "stroke-yellow-400 dark:stroke-yellow-300",
      gradientStart: "#ffd700",
      gradientEnd: "#ffb700",
    };
  return {
    text: "text-emerald-500 dark:text-emerald-400",
    ring: "stroke-emerald-500 dark:stroke-emerald-400",
    gradientStart: "#BDE958",
    gradientEnd: "#9BC93D",
  };
};

const getTokenRingColor = (percentage) => {
  if (percentage <= 10) return "stroke-red-500 dark:stroke-red-400";
  if (percentage <= 40) return "stroke-orange-500 dark:stroke-orange-400";
  if (percentage <= 80) return "stroke-yellow-500 dark:stroke-yellow-400";
  return "stroke-green-500 dark:stroke-green-400";
};

const TokenRing = ({ percentage, size = 200, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dashoffset = circumference - (percentage / 100) * circumference;
  const colors = getTokenPercentageColor(percentage);

  // Calculate viewBox to prevent clipping (add extra space for glow)
  const viewBoxSize = size + 40;
  const viewBoxOffset = -20; // negative offset to create padding

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient
            id={`gradient-${percentage}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={colors.gradientStart} />
            <stop offset="100%" stopColor={colors.gradientEnd} />
          </linearGradient>

          {/* Glow filter */}
          <filter
            id={`glow-${percentage}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Stronger outer glow for the main progress ring */}
          <filter id={`outerGlow-${percentage}`}>
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feFlood
              floodColor={colors.gradientStart}
              floodOpacity="0.5"
              result="color"
            />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />

        {/* Shadow effect for depth */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#00000015"
          strokeWidth={strokeWidth + 2}
          className="dark:opacity-30"
          style={{
            transform: "translate(1px, 1px)",
          }}
        />

        {/* Subtle background glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={`url(#gradient-${percentage})`}
          strokeWidth={strokeWidth + 8}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          filter={`url(#glow-${percentage})`}
          className="opacity-20"
          style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
        />

        {/* Main progress circle with glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={`url(#gradient-${percentage})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          filter={`url(#outerGlow-${percentage})`}
          style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
        />
      </svg>
    </div>
  );
};

export { getTokenPercentageColor, getTokenRingColor };
export default TokenRing;
