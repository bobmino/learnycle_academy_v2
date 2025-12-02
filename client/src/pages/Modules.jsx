import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { moduleService } from '../services/api';

/**
 * Modules Page
 * Lists all available modules
 */
const Modules = () => {
  const { t } = useTranslation();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await moduleService.getAll();
      setModules(response.data);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setLoading(false);
    }
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
        {t('modules.title')}
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Link
            key={module._id}
            to={`/modules/${module._id}`}
            className="dashboard-card group"
          >
            <div className="mb-4">
              {module.caseStudyType === 'cafe' && <span className="text-5xl">☕</span>}
              {module.caseStudyType === 'restaurant' && <span className="text-5xl">🍽️</span>}
              {module.caseStudyType === 'hotel' && <span className="text-5xl">🏨</span>}
              {module.caseStudyType === 'none' && <span className="text-5xl">📚</span>}
            </div>
            
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {module.title}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {module.description}
            </p>

            {module.caseStudyType !== 'none' && (
              <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                {t('modules.caseStudies')} - {module.caseStudyType}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Modules;
