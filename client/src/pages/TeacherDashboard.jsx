import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { moduleService, lessonService } from '../services/api';

/**
 * Teacher Dashboard
 * Create and manage modules and lessons
 */
const TeacherDashboard = () => {
  const { t } = useTranslation();
  const [modules, setModules] = useState([]);
  const [showCreateModule, setShowCreateModule] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await moduleService.getAll();
      setModules(response.data);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        {t('dashboard.teacher')}
      </h1>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => setShowCreateModule(!showCreateModule)}
          className="dashboard-card text-left group hover:border-primary-500"
        >
          <div className="text-4xl mb-2">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
            {t('dashboard.createModule')}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Create a new learning module
          </p>
        </button>

        <div className="dashboard-card">
          <div className="text-4xl mb-2">✏️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('dashboard.createLesson')}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Add lessons to existing modules
          </p>
        </div>
      </div>

      {/* Modules List */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Your Modules
        </h2>
        <div className="space-y-4">
          {modules.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              No modules yet. Create your first module to get started!
            </p>
          ) : (
            modules.map((module) => (
              <div key={module._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {module.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                      {module.description}
                    </p>
                  </div>
                  <button className="btn-secondary text-sm">
                    {t('common.edit')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
