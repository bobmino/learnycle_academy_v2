/**
 * Progress Bar Component
 * Enhanced progress bar with percentage display
 */
const ProgressBar = ({ progress = 0, showLabel = true, size = 'md' }) => {
  const heightClass = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }[size];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progression
          </span>
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

