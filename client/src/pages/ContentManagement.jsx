import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  moduleService,
  lessonService,
  quizService,
  projectService,
  categoryService
} from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import BackButton from '../components/BackButton';

/**
 * Content Management Page
 * Complete CRUD interface for modules, lessons, quizzes, and projects
 */
const ContentManagement = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('modules'); // 'modules', 'lessons', 'quizzes', 'projects'
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('order'); // 'order', 'title', 'createdAt'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedCategory, sortBy, sortOrder]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'modules') {
        const response = await moduleService.getAll();
        let data = response.data || [];
        // Filter by category
        if (selectedCategory) {
          data = data.filter(m => 
            m.category?._id === selectedCategory || m.category === selectedCategory
          );
        }
        // Filter by search term
        if (searchTerm) {
          data = data.filter(m => 
            m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        // Sort
        data = sortData(data, sortBy, sortOrder);
        setModules(data);
      } else if (activeTab === 'lessons') {
        // Fetch all lessons by getting all modules first
        const modulesRes = await moduleService.getAll();
        const allLessons = [];
        for (const module of modulesRes.data || []) {
          try {
            const lessonsRes = await lessonService.getByModule(module._id);
            const moduleLessons = (lessonsRes.data || []).map(l => ({
              ...l,
              moduleTitle: module.title,
              moduleId: module._id
            }));
            allLessons.push(...moduleLessons);
          } catch (error) {
            console.error(`Failed to fetch lessons for module ${module._id}:`, error);
          }
        }
        let data = allLessons;
        if (selectedCategory) {
          data = data.filter(l => 
            l.category?._id === selectedCategory || l.category === selectedCategory
          );
        }
        if (searchTerm) {
          data = data.filter(l => 
            l.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        data = sortData(data, sortBy, sortOrder);
        setLessons(data);
      } else if (activeTab === 'quizzes') {
        const response = await quizService.getAll(selectedCategory ? { category: selectedCategory } : {});
        let data = response.data || [];
        if (searchTerm) {
          data = data.filter(q => 
            q.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        data = sortData(data, sortBy, sortOrder);
        setQuizzes(data);
      } else if (activeTab === 'projects') {
        const response = await projectService.getAll();
        let data = response.data || [];
        if (selectedCategory) {
          data = data.filter(p => 
            p.category?._id === selectedCategory || p.category === selectedCategory
          );
        }
        if (searchTerm) {
          data = data.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        data = sortData(data, sortBy, sortOrder);
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortData = (data, sortBy, sortOrder) => {
    return [...data].sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'order') {
        aVal = a.order || 0;
        bVal = b.order || 0;
      } else if (sortBy === 'title') {
        aVal = (a.title || a.name || '').toLowerCase();
        bVal = (b.title || b.name || '').toLowerCase();
      } else if (sortBy === 'createdAt') {
        aVal = new Date(a.createdAt || 0);
        bVal = new Date(b.createdAt || 0);
      } else {
        return 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  };

  const handleDelete = async (type, id) => {
    try {
      if (type === 'module') {
        await moduleService.delete(id);
        setModules(modules.filter(m => m._id !== id));
      } else if (type === 'lesson') {
        await lessonService.delete(id);
        setLessons(lessons.filter(l => l._id !== id));
      } else if (type === 'quiz') {
        await quizService.delete(id);
        setQuizzes(quizzes.filter(q => q._id !== id));
      } else if (type === 'project') {
        await projectService.delete(id);
        setProjects(projects.filter(p => p._id !== id));
      }
      setShowDeleteModal(null);
      alert('Supprimé avec succès');
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleActive = async (type, item) => {
    try {
      if (type === 'module') {
        await moduleService.update(item._id, { isActive: !item.isActive });
        setModules(modules.map(m => m._id === item._id ? { ...m, isActive: !m.isActive } : m));
      } else if (type === 'project') {
        const newStatus = item.status === 'active' ? 'archived' : 'active';
        await projectService.update(item._id, { status: newStatus });
        setProjects(projects.map(p => p._id === item._id ? { ...p, status: newStatus } : p));
      }
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading && modules.length === 0 && lessons.length === 0 && quizzes.length === 0 && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <Breadcrumbs items={[{ label: t('dashboard.admin'), path: '/admin' }, { label: 'Gestion du Contenu' }]} />
      <BackButton />

      <div className="mb-6">
        <h1 className="section-header mb-4">Gestion du Contenu</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Créez, modifiez, triez et supprimez vos modules, leçons, quiz et projets
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          {['modules', 'lessons', 'quizzes', 'projects'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              {tab === 'modules' && 'Modules'}
              {tab === 'lessons' && 'Leçons'}
              {tab === 'quizzes' && 'Quiz'}
              {tab === 'projects' && 'Projets'}
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Recherche</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">Toutes les catégories</option>
              {categories
                .filter(c => {
                  if (activeTab === 'modules') return c.type === 'module';
                  if (activeTab === 'lessons') return c.type === 'lesson';
                  if (activeTab === 'quizzes') return c.type === 'quiz';
                  if (activeTab === 'projects') return c.type === 'project';
                  return true;
                })
                .map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Trier par</label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field flex-1"
              >
                <option value="order">Ordre</option>
                <option value="title">Titre</option>
                <option value="createdAt">Date de création</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="btn-secondary px-4"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tables */}
      {activeTab === 'modules' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Modules ({modules.length})</h2>
            <Link to="/content-creator" className="btn-primary">
              + Créer un Module
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Titre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Catégorie</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Ordre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {modules.map(module => (
                  <tr key={module._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <Link to={`/modules/${module._id}`} className="text-purple-600 dark:text-purple-400 hover:underline">
                        {module.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {module.category?.name || 'Aucune'}
                    </td>
                    <td className="px-4 py-3 text-sm">{module.order || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        module.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {module.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/content-creator?edit=module&id=${module._id}`} className="btn-secondary text-sm px-3 py-1">
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleToggleActive('module', module)}
                          className="btn-secondary text-sm px-3 py-1"
                        >
                          {module.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                        {(user?.role === 'admin' || module.createdBy === user?._id) && (
                          <button
                            onClick={() => setShowDeleteModal({ type: 'module', id: module._id, name: module.title })}
                            className="btn-danger text-sm px-3 py-1"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {modules.length === 0 && (
              <p className="text-center py-8 text-gray-500">Aucun module trouvé</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'lessons' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Leçons ({lessons.length})</h2>
            <Link to="/content-creator" className="btn-primary">
              + Créer une Leçon
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Titre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Module</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Ordre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {lessons.map(lesson => (
                  <tr key={lesson._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">{lesson.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {lesson.moduleTitle || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">{lesson.order || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/content-creator?edit=lesson&id=${lesson._id}`} className="btn-secondary text-sm px-3 py-1">
                          Modifier
                        </Link>
                        {(user?.role === 'admin' || lesson.createdBy === user?._id) && (
                          <button
                            onClick={() => setShowDeleteModal({ type: 'lesson', id: lesson._id, name: lesson.title })}
                            className="btn-danger text-sm px-3 py-1"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lessons.length === 0 && (
              <p className="text-center py-8 text-gray-500">Aucune leçon trouvée</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Quiz ({quizzes.length})</h2>
            <Link to="/content-creator" className="btn-primary">
              + Créer un Quiz
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Titre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Module</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Questions</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {quizzes.map(quiz => (
                  <tr key={quiz._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">{quiz.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {quiz.module?.title || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">{quiz.questions?.length || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/content-creator?edit=quiz&id=${quiz._id}`} className="btn-secondary text-sm px-3 py-1">
                          Modifier
                        </Link>
                        {(user?.role === 'admin' || quiz.createdBy === user?._id) && (
                          <button
                            onClick={() => setShowDeleteModal({ type: 'quiz', id: quiz._id, name: quiz.title })}
                            className="btn-danger text-sm px-3 py-1"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {quizzes.length === 0 && (
              <p className="text-center py-8 text-gray-500">Aucun quiz trouvé</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Projets ({projects.length})</h2>
            <Link to="/content-creator" className="btn-primary">
              + Créer un Projet
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {projects.map(project => (
                  <tr key={project._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <Link to={`/projects/${project._id}`} className="text-purple-600 dark:text-purple-400 hover:underline">
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {project.type === 'case-study' ? 'Étude de Cas' : 'Projet'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        project.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {project.status || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/content-creator?edit=project&id=${project._id}`} className="btn-secondary text-sm px-3 py-1">
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleToggleActive('project', project)}
                          className="btn-secondary text-sm px-3 py-1"
                        >
                          {project.status === 'active' ? 'Archiver' : 'Activer'}
                        </button>
                        {(user?.role === 'admin' || project.createdBy === user?._id) && (
                          <button
                            onClick={() => setShowDeleteModal({ type: 'project', id: project._id, name: project.name })}
                            className="btn-danger text-sm px-3 py-1"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {projects.length === 0 && (
              <p className="text-center py-8 text-gray-500">Aucun projet trouvé</p>
            )}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer "{showDeleteModal.name}" ? Cette action est irréversible.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal.type, showDeleteModal.id)}
                className="btn-danger"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;

