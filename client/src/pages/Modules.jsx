import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { moduleService, quizService, projectService } from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import BackButton from '../components/BackButton';

/**
 * Modules Page
 * Lists all available modules
 */
const Modules = () => {
  const { t } = useTranslation();
  const [modules, setModules] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('training'); // 'training', 'quiz', 'projects'

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [modulesRes] = await Promise.all([
        moduleService.getAll()
      ]);
      setModules(modulesRes.data);

      if (activeTab === 'quiz') {
        // Fetch all quizzes grouped by module
        const allQuizzes = [];
        for (const module of modulesRes.data) {
          try {
            const quizzesRes = await quizService.getByModule(module._id);
            allQuizzes.push(...quizzesRes.data.map(q => ({ ...q, moduleTitle: module.title, moduleId: module._id })));
          } catch (error) {
            console.error(`Failed to fetch quizzes for module ${module._id}:`, error);
          }
        }
        setQuizzes(allQuizzes);
      }

      if (activeTab === 'projects') {
        try {
          const projectsRes = await projectService.getMy();
          setProjects(projectsRes.data);
        } catch (error) {
          console.error('Failed to fetch projects:', error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
    <div className="container-custom py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Modules' }
        ]}
      />

      <div className="flex items-center gap-4 mb-8">
        <BackButton to="/dashboard" />
        <h1 className="section-header mb-0">
          {t('modules.title')}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('training')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'training'
              ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📚 Formations
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'quiz'
              ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          🧪 Quiz/Tests
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'projects'
              ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📋 Études de Cas/Projets
        </button>
      </div>

      {/* Training Tab */}
      {activeTab === 'training' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.length === 0 ? (
            <div className="col-span-full card text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Aucun module disponible</p>
            </div>
          ) : (
            modules.map((module) => (
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
      )}

      {/* Quiz Tab */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          {quizzes.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Aucun quiz disponible</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz._id}
                  to={`/modules/${quiz.moduleId}`}
                  className="card-hover block"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Module: {quiz.moduleTitle}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        {quiz.questions?.length || 0} question(s)
                      </p>
                    </div>
                    <span className="text-2xl">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full card text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Aucun projet disponible</p>
            </div>
          ) : (
            projects.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="card-hover"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">
                      {project.type === 'case-study' ? '📊' : project.type === 'exam' ? '📝' : '📋'}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {project.type}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {project.description}
                </p>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Module: {project.module?.title || 'N/A'}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Modules;
