import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { moduleService, quizService, projectService, categoryService } from '../services/api';
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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('training'); // 'training', 'quiz', 'projects'

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchData = async () => {
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const [modulesRes] = await Promise.all([
        moduleService.getAll()
      ]);
      let filteredModules = modulesRes.data;
      
      // Filter by category if selected
      if (selectedCategory) {
        filteredModules = filteredModules.filter(m => 
          m.category?._id === selectedCategory || m.category === selectedCategory
        );
      }
      
      setModules(filteredModules);

      if (activeTab === 'quiz') {
        // Fetch all quizzes
        try {
          const params = selectedCategory ? { category: selectedCategory } : {};
          const quizzesRes = await quizService.getAll(params);
          const allQuizzes = quizzesRes.data.map(q => ({
            ...q,
            moduleTitle: q.module?.title || 'N/A',
            moduleId: q.module?._id || q.module
          }));
          setQuizzes(allQuizzes);
        } catch (error) {
          console.error('Failed to fetch quizzes:', error);
          setQuizzes([]);
        }
      }

      if (activeTab === 'projects') {
        try {
          const params = selectedCategory ? { category: selectedCategory } : {};
          const projectsRes = await projectService.getMy();
          let filteredProjects = projectsRes.data || [];
          
          // Filter by category if selected
          if (selectedCategory) {
            filteredProjects = filteredProjects.filter(p => 
              p.category?._id === selectedCategory || p.category === selectedCategory
            );
          }
          
          setProjects(filteredProjects);
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
        <div className="relative">
          <div className="h-12 w-12 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 h-12 w-12 border-4 border-transparent border-t-purple-400 dark:border-t-purple-500 rounded-full animate-spin" style={{ animation: 'spin 0.5s linear infinite reverse', opacity: 0.5 }}></div>
        </div>
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

      {/* Category Filter */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filtrer par catégorie:
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 hover:border-purple-400"
        >
          <option value="">Toutes les catégories</option>
          {categories
            .filter(cat => {
              if (activeTab === 'training') return cat.type === 'module' || cat.type === 'formation';
              if (activeTab === 'quiz') return cat.type === 'quiz';
              if (activeTab === 'projects') return cat.type === 'project';
              return true;
            })
            .map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
        </select>
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory('')}
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline transition-colors"
          >
            Effacer le filtre
          </button>
        )}
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
            <div className="col-span-full card text-center py-12 animate-fade-in">
              <p className="text-gray-600 dark:text-gray-400">Aucun module disponible</p>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="mt-4 text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Effacer le filtre
                </button>
              )}
            </div>
          ) : (
            modules.map((module, index) => (
              <Link
                key={module._id}
                to={`/modules/${module._id}`}
                className="dashboard-card group hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
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
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {module.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {module.caseStudyType !== 'none' && (
                    <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                      {t('modules.caseStudies')} - {module.caseStudyType}
                    </span>
                  )}
                  {module.category && (
                    <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                      {module.category.name || module.category}
                    </span>
                  )}
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Commencer →
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Quiz Tab */}
      {activeTab === 'quiz' && (
        <div className="space-y-6 animate-fade-in">
          {quizzes.length === 0 ? (
            <div className="card text-center py-12 animate-fade-in">
              <p className="text-gray-600 dark:text-gray-400">Aucun quiz disponible</p>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="mt-4 text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Effacer le filtre
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz, index) => (
                <Link
                  key={quiz._id}
                  to={`/modules/${quiz.moduleId}`}
                  className="card-hover block hover-lift animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
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
            <div className="col-span-full card text-center py-12 animate-fade-in">
              <p className="text-gray-600 dark:text-gray-400">Aucun projet disponible</p>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="mt-4 text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Effacer le filtre
                </button>
              )}
            </div>
          ) : (
            projects.map((project, index) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="card-hover hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
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
