import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { projectService } from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import BackButton from '../components/BackButton';
import GradeDisplay from '../components/GradeDisplay';

/**
 * Projects Page
 * List all projects/exams/case studies
 */
const Projects = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'project', 'case-study', 'exam'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'draft', 'active', 'completed'

  useEffect(() => {
    fetchProjects();
  }, [filter, statusFilter]);

  const fetchProjects = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.type = filter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await projectService.getMy();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProjectIcon = (type) => {
    const icons = {
      'project': '📋',
      'case-study': '📊',
      'exam': '📝'
    };
    return icons[type] || '📋';
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      'active': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'completed': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'archived': 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Projets & Examens' }
        ]}
      />

      <div className="flex items-center gap-4 mb-8">
        <BackButton to="/dashboard" />
        <h1 className="section-header mb-0">
          Projets & Examens
        </h1>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">Tous</option>
              <option value="project">Projets</option>
              <option value="case-study">Études de Cas</option>
              <option value="exam">Examens</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="completed">Complétés</option>
              <option value="draft">Brouillons</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Aucun projet disponible
            </p>
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
                  <span className="text-3xl">{getProjectIcon(project.type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {project.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {project.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Module: {project.module?.title || 'N/A'}</span>
                {project.dueDate && (
                  <span>
                    Échéance: {new Date(project.dueDate).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
              {project.submission && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Soumis</span>
                    {project.submission.grade !== null && (
                      <GradeDisplay grade={project.submission.grade} showLabel={false} size="sm" />
                    )}
                  </div>
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;

