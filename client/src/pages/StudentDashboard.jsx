import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { moduleService, progressService } from '../services/api';

/**
 * Student Dashboard
 * Shows progress, modules, and lessons
 */
const StudentDashboard = () => {
  const { t } = useTranslation();
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modulesRes, progressRes] = await Promise.all([
        moduleService.getAll(),
        progressService.getMy()
      ]);
      setModules(modulesRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (progress.length === 0) return 0;
    const completed = progress.filter(p => p.isCompleted).length;
    return Math.round((completed / progress.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        {t('dashboard.student')}
      </h1>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {t('dashboard.myProgress')}
          </h3>
          <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
            {calculateProgress()}%
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Total Modules
          </h3>
          <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
            {modules.length}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Completed Lessons
          </h3>
          <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
            {progress.filter(p => p.isCompleted).length}
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {t('dashboard.modules')}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <Link
              key={module._id}
              to={`/modules/${module._id}`}
              className="dashboard-card group"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {module.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {module.description.substring(0, 100)}...
              </p>
              {module.caseStudyType !== 'none' && (
                <span className="inline-block mt-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                  {module.caseStudyType}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
