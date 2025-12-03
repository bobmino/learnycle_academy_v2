import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  groupService, 
  userService, 
  moduleService 
} from '../services/api';
import ProgressBar from '../components/ProgressBar';

/**
 * Groups Management Page
 * Create, edit, and manage groups
 */
const Groups = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teacherId: '',
    studentIds: [],
    moduleIds: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groupsRes, usersRes, modulesRes] = await Promise.all([
        user.role === 'admin' ? groupService.getAll() : groupService.getMy(),
        userService.getAll(),
        moduleService.getAll()
      ]);

      setGroups(groupsRes.data);
      setStudents(usersRes.data.filter(u => u.role === 'student'));
      setTeachers(usersRes.data.filter(u => u.role === 'teacher'));
      setModules(modulesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentToggle = (studentId) => {
    setFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...prev.studentIds, studentId]
    }));
  };

  const handleModuleToggle = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      moduleIds: prev.moduleIds.includes(moduleId)
        ? prev.moduleIds.filter(id => id !== moduleId)
        : [...prev.moduleIds, moduleId]
    }));
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await groupService.create(formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        teacherId: '',
        studentIds: [],
        moduleIds: []
      });
      fetchData();
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    try {
      await groupService.update(editingGroup._id, formData);
      setEditingGroup(null);
      setFormData({
        name: '',
        description: '',
        teacherId: '',
        studentIds: [],
        moduleIds: []
      });
      fetchData();
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      return;
    }
    try {
      await groupService.delete(groupId);
      fetchData();
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      teacherId: group.teacher?._id || group.teacher || '',
      studentIds: group.students?.map(s => s._id || s) || [],
      moduleIds: group.modules?.map(m => m._id || m) || []
    });
    setShowCreateModal(true);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="section-header mb-0">
          Gestion des Groupes
        </h1>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button
            onClick={() => {
              setEditingGroup(null);
              setFormData({
                name: '',
                description: '',
                teacherId: '',
                studentIds: [],
                moduleIds: []
              });
              setShowCreateModal(true);
            }}
            className="btn-primary"
          >
            + Créer un Groupe
          </button>
        )}
      </div>

      {/* Groups List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group._id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {group.description}
                  </p>
                )}
              </div>
              {(user?.role === 'admin' || (user?.role === 'teacher' && group.teacher?._id === user._id)) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(group)}
                    className="text-purple-600 dark:text-purple-400 hover:underline text-sm"
                  >
                    Modifier
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteGroup(group._id)}
                      className="text-red-600 dark:text-red-400 hover:underline text-sm"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {group.teacher && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Professeur:</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {group.teacher.name || group.teacher.email}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Étudiants: {group.students?.length || 0}
                </p>
                <div className="flex flex-wrap gap-1">
                  {group.students?.slice(0, 3).map((student) => (
                    <span
                      key={student._id || student}
                      className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded"
                    >
                      {student.name || student.email}
                    </span>
                  ))}
                  {group.students?.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      +{group.students.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Modules: {group.modules?.length || 0}
                </p>
              </div>

              <Link
                to={`/groups/${group._id}`}
                className="block text-center btn-outline text-sm mt-4"
              >
                Voir Détails
              </Link>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Aucun groupe créé
          </p>
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Créer le Premier Groupe
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="section-subheader mb-0">
                  {editingGroup ? 'Modifier le Groupe' : 'Créer un Groupe'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingGroup(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom du groupe *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input-field"
                    rows="3"
                  />
                </div>

                {user?.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Professeur (optionnel)</label>
                    <select
                      name="teacherId"
                      value={formData.teacherId}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Aucun professeur</option>
                      {teachers.map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} ({teacher.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Étudiants</label>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {students.length === 0 ? (
                      <p className="text-sm text-gray-500">Aucun étudiant disponible</p>
                    ) : (
                      <div className="space-y-2">
                        {students.map(student => (
                          <label
                            key={student._id}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.studentIds.includes(student._id)}
                              onChange={() => handleStudentToggle(student._id)}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {student.name} ({student.email})
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Modules Assignés</label>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {modules.length === 0 ? (
                      <p className="text-sm text-gray-500">Aucun module disponible</p>
                    ) : (
                      <div className="space-y-2">
                        {modules.map(module => (
                          <label
                            key={module._id}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.moduleIds.includes(module._id)}
                              onChange={() => handleModuleToggle(module._id)}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {module.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="btn-primary">
                    {editingGroup ? 'Enregistrer' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingGroup(null);
                    }}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;

