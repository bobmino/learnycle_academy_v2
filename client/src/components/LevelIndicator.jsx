import { useMemo } from 'react';

/**
 * LevelIndicator Component
 * Displays a level indicator with progress ring
 */
const LevelIndicator = ({ 
  level, 
  progress, 
  title = 'Niveau',
  size = 120,
  showProgress = true 
}) => {
  const circumference = useMemo(() => 2 * Math.PI * (size / 2 - 10), [size]);
  const progressOffset = useMemo(() => {
    const progressValue = Math.min(Math.max(progress || 0, 0), 100);
    return circumference - (progressValue / 100) * circumference;
  }, [progress, circumference]);

  const levelColors = {
    1: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', ring: '#9ca3af' },
    2: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', ring: '#3b82f6' },
    3: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', ring: '#10b981' },
    4: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', ring: '#eab308' },
    5: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', ring: '#9333ea' },
    6: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', ring: '#ef4444' }
  };

  const currentLevel = Math.min(Math.max(Math.floor(level || 1), 1), 6);
  const colors = levelColors[currentLevel] || levelColors[1];

  const levelLabels = {
    1: 'Débutant',
    2: 'Intermédiaire',
    3: 'Avancé',
    4: 'Expert',
    5: 'Maître',
    6: 'Légende'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {title}
        </h3>
      )}
      
      <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
        {/* Background circle */}
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 10}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          {showProgress && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 10}
              fill="none"
              stroke={colors.ring}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              className="transition-all duration-500"
              style={{
                filter: 'drop-shadow(0 0 3px rgba(147, 51, 234, 0.3))'
              }}
            />
          )}
        </svg>

        {/* Level number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-3xl font-bold ${colors.text}`}>
            {currentLevel}
          </div>
          {showProgress && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {Math.round(progress || 0)}%
            </div>
          )}
        </div>
      </div>

      {/* Level label */}
      <div className={`mt-4 px-4 py-2 rounded-full ${colors.bg} ${colors.text} text-sm font-medium`}>
        {levelLabels[currentLevel]}
      </div>

      {/* Progress to next level */}
      {showProgress && progress < 100 && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {Math.round(100 - progress)}% jusqu'au niveau {currentLevel + 1}
        </div>
      )}
    </div>
  );
};

export default LevelIndicator;

