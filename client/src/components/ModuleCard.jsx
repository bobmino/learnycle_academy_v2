import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';

/**
 * Module Card Component
 * Displays module with progression
 */
const ModuleCard = ({ module, progress = 0, showProgress = true }) => {
  return (
    <Link
      to={`/modules/${module._id}`}
      className="course-card group"
    >
      <div className="course-card-content">
        <h3 className="course-card-title">
          {module.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {module.description}
        </p>
        
        {showProgress && (
          <div className="mt-4">
            <ProgressBar progress={progress} showLabel={false} size="sm" />
          </div>
        )}

        {module.caseStudyType !== 'none' && (
          <span className="inline-block mt-3 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
            {module.caseStudyType}
          </span>
        )}
      </div>
    </Link>
  );
};

export default ModuleCard;

