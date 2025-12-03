import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  moduleService, 
  progressService, 
  notificationService, 
  discussionService,
  groupService,
  moduleServiceExtended,
  projectService
} from '../services/api';
import ModuleCard from '../components/ModuleCard';
import ProgressBar from '../components/ProgressBar';

/**
 * Student Dashboard
 * Enhanced dashboard with progress, modules, notifications, and discussions
 */
const StudentDashboard = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState('list'); // 'list' or 'assigned'

  useEffect(() => {
    fetchData();
  }, [displayMode]);

  const fetchData = async () => {
    try {
      const [modulesRes, progressRes, notificationsRes, discussionsRes, projectsRes] = await Promise.all([
        displayMode === 'assigned' 
          ? moduleServiceExtended.getAssigned()
          : moduleService.getAll(),
        progressService.getMy(),
        notificationService.getAll({ limit: 5 }),
        discussionService.getAll(),
        projectService.getMy()
      ]);
      
      setModules(modulesRes.data);
      setProgress(progressRes.data);
      setNotifications(notificationsRes.data);
      setDiscussions(discussionsRes.data);
      setProjects(projectsRes.data);

      // Fetch group if user has one
      if (user?.groupId) {
        try {
          const groupRes = await groupService.getById(user.groupId);
          setGroup(groupRes.data);
        } catch (error) {
          console.error('Failed to fetch group:', error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallProgress = () => {
    if (progress.length === 0) return 0;
    const completed = progress.filter(p => p.isCompleted).length;
    return Math.round((completed / progress.length) * 100);
  };

  const getModuleProgress = (moduleId) => {
    const moduleProgress = progress.filter(p => p.module?._id === moduleId || p.module === moduleId);
    if (moduleProgress.length === 0) return 0;
    const completed = moduleProgress.filter(p => p.isCompleted).length;
    return Math.round((completed / moduleProgress.length) * 100);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="section-header mb-0">
          {t('dashboard.student')}
        </h1>
        {group && (
          <div className="badge-primary">
            Groupe: {group.name}
          </div>
        )}
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Progression Globale
          </h3>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {calculateOverallProgress()}%
          </div>
          <ProgressBar progress={calculateOverallProgress()} showLabel={false} size="sm" />
        </div>
        
        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Modules
          </h3>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {modules.length}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Leçons Complétées
          </h3>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {progress.filter(p => p.isCompleted).length}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Notifications
          </h3>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {notifications.filter(n => !n.read).length}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Modules Section */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="section-subheader mb-0">
                {displayMode === 'assigned' ? 'Modules Assignés' : 'Tous les Modules'}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setDisplayMode('list')}
                  className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
                    displayMode === 'list'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setDisplayMode('assigned')}
                  className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
                    displayMode === 'assigned'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Assignés
                </button>
              </div>
            </div>

            {modules.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                {displayMode === 'assigned' 
                  ? 'Aucun module assigné pour le moment'
                  : 'Aucun module disponible'}
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {modules.map((module) => (
                  <ModuleCard
                    key={module._id}
                    module={module}
                    progress={getModuleProgress(module._id)}
                    showProgress={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Notifications */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications Récentes
              </h3>
              <Link
                to="/notifications"
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                Voir tout
              </Link>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aucune notification
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 rounded-lg border ${
                      notification.read
                        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                        : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Discussions */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Discussions Actives
              </h3>
              <Link
                to="/discussions"
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                Voir tout
              </Link>
            </div>
            {discussions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aucune discussion active
              </p>
            ) : (
              <div className="space-y-3">
                {discussions.slice(0, 3).map((discussion) => (
                  <Link
                    key={discussion._id}
                    to={`/discussions/${discussion._id}`}
                    className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {discussion.subject}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {discussion.messages.length} message(s)
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* My Projects */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Mes Projets
              </h3>
              <Link
                to="/projects"
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                Voir tout
              </Link>
            </div>
            {projects.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aucun projet assigné
              </p>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 3).map((project) => (
                  <Link
                    key={project._id}
                    to={`/projects/${project._id}`}
                    className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {project.type === 'case-study' ? '📊' : project.type === 'exam' ? '📝' : '📋'}
                      </span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {project.module?.title || 'Module'}
                    </p>
                    {project.submission && (
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        {project.submission.status === 'approved' ? '✓ Approuvé' :
                         project.submission.status === 'needs-revision' ? '⚠ Révision requise' :
                         project.submission.status === 'submitted' ? '📤 Soumis' : 'Draft'}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
