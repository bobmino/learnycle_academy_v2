/**
 * Grade Display Component
 * Shows grade with color coding
 */
const GradeDisplay = ({ grade, showLabel = true, size = 'md' }) => {
  if (grade === null || grade === undefined) {
    return (
      <span className="text-gray-400 dark:text-gray-500 text-sm">
        Non noté
      </span>
    );
  }

  const getGradeColor = (grade) => {
    if (grade >= 80) return 'text-green-600 dark:text-green-400';
    if (grade >= 60) return 'text-blue-600 dark:text-blue-400';
    if (grade >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeLabel = (grade) => {
    if (grade >= 80) return 'Excellent';
    if (grade >= 60) return 'Bien';
    if (grade >= 40) return 'Moyen';
    return 'Insuffisant';
  };

  const sizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }[size];

  return (
    <div className="flex items-center gap-2">
      <span className={`font-bold ${getGradeColor(grade)} ${sizeClass}`}>
        {Math.round(grade)}/100
      </span>
      {showLabel && (
        <span className={`text-xs ${getGradeColor(grade)}`}>
          ({getGradeLabel(grade)})
        </span>
      )}
    </div>
  );
};

export default GradeDisplay;

