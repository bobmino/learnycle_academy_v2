import { useMemo } from 'react';

/**
 * ProgressChart Component
 * Displays a progress chart with multiple data points
 */
const ProgressChart = ({ data, title, height = 200, color = '#9333ea' }) => {
  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 100;
    return Math.max(...data.map(item => item.value || 0), 100);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        {title && <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h3>}
        <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  const barWidth = 100 / data.length;
  const barMaxHeight = height - 60; // Reserve space for labels

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      {title && <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h3>}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg width="100%" height={height} className="overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const y = barMaxHeight - (percent / 100) * barMaxHeight;
            return (
              <g key={percent}>
                <line
                  x1="0"
                  y1={y}
                  x2="100%"
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  className="text-gray-200 dark:text-gray-700"
                />
                <text
                  x="0"
                  y={y + 4}
                  className="text-xs fill-gray-500 dark:fill-gray-400"
                >
                  {percent}%
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * barMaxHeight;
            const x = (index * barWidth) + (barWidth * 0.1);
            const width = barWidth * 0.8;
            const y = barMaxHeight - barHeight;

            return (
              <g key={index}>
                <rect
                  x={`${x}%`}
                  y={y}
                  width={`${width}%`}
                  height={barHeight}
                  fill={item.color || color}
                  className="transition-all duration-300 hover:opacity-80"
                  rx="4"
                />
                <text
                  x={`${x + width / 2}%`}
                  y={barMaxHeight + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                >
                  {item.label || item.name || `Item ${index + 1}`}
                </text>
                <text
                  x={`${x + width / 2}%`}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-gray-700 dark:fill-gray-300"
                >
                  {Math.round(item.value)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default ProgressChart;

