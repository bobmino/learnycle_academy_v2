import { useMemo } from 'react';

/**
 * ScoreDistribution Component
 * Displays a score distribution chart (histogram)
 */
const ScoreDistribution = ({ data, title, height = 200 }) => {
  const distribution = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Group scores into ranges: 0-20, 21-40, 41-60, 61-80, 81-100
    const ranges = [
      { label: '0-20%', min: 0, max: 20, count: 0, color: '#ef4444' },
      { label: '21-40%', min: 21, max: 40, count: 0, color: '#f97316' },
      { label: '41-60%', min: 41, max: 60, count: 0, color: '#eab308' },
      { label: '61-80%', min: 61, max: 80, count: 0, color: '#22c55e' },
      { label: '81-100%', min: 81, max: 100, count: 0, color: '#10b981' }
    ];

    data.forEach(score => {
      const value = typeof score === 'number' ? score : (score.value || score.score || 0);
      ranges.forEach(range => {
        if (value >= range.min && value <= range.max) {
          range.count++;
        }
      });
    });

    return ranges;
  }, [data]);

  const maxCount = useMemo(() => {
    if (distribution.length === 0) return 1;
    return Math.max(...distribution.map(r => r.count), 1);
  }, [distribution]);

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

  const barMaxHeight = height - 60;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      {title && <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h3>}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg width="100%" height={height} className="overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const y = barMaxHeight - (percent / 100) * barMaxHeight;
            return (
              <line
                key={percent}
                x1="0"
                y1={y}
                x2="100%"
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="2,2"
                className="text-gray-200 dark:text-gray-700"
              />
            );
          })}

          {/* Bars */}
          {distribution.map((range, index) => {
            const barHeight = (range.count / maxCount) * barMaxHeight;
            const barWidth = 100 / distribution.length;
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
                  fill={range.color}
                  className="transition-all duration-300 hover:opacity-80"
                  rx="4"
                />
                <text
                  x={`${x + width / 2}%`}
                  y={barMaxHeight + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                >
                  {range.label}
                </text>
                <text
                  x={`${x + width / 2}%`}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-gray-700 dark:fill-gray-300"
                >
                  {range.count}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-4 flex justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>Total: {data.length} scores</span>
        <span>Moyenne: {Math.round(data.reduce((sum, s) => sum + (typeof s === 'number' ? s : (s.value || s.score || 0)), 0) / data.length)}%</span>
      </div>
    </div>
  );
};

export default ScoreDistribution;

