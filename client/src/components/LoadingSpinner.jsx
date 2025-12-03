/**
 * Enhanced Loading Spinner Component
 * Professional loading indicator with smooth animations
 */
const LoadingSpinner = ({ size = 'md', text = 'Chargement...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const containerClass = fullScreen
    ? 'flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin`}
          style={{
            animation: 'spin 1s linear infinite'
          }}
        />
        <div
          className={`absolute top-0 left-0 ${sizeClasses[size]} border-4 border-transparent border-t-purple-400 dark:border-t-purple-500 rounded-full animate-spin`}
          style={{
            animation: 'spin 0.5s linear infinite reverse',
            opacity: 0.5
          }}
        />
      </div>
      {text && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;

