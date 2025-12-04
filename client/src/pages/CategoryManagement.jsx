import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { categoryService } from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import BackButton from '../components/BackButton';

/**
 * Category Management Page
 * Complete CRUD interface for categories
 */
const CategoryManagement = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState(''); // 'formation', 'module', 'lesson', 'quiz', 'project'
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'module'
  });

  useEffect(() => {
    fetchCategories();
  }, [filterType]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = filterType ? { type: filterType } : {};
      const response = await categoryService.getAll(params);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
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

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await categoryService.create(formData);
      alert('Catégorie créée avec succès');
      setFormData({ name: '', description: '', type: 'module' });
      fetchCategories();
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      await categoryService.update(editingCategory._id, formData);
      alert('Catégorie modifiée avec succès');
      setEditingCategory(null);
      setFormData({ name: '', description: '', type: 'module' });
      fetchCategories();
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await categoryService.delete(showDeleteModal._id);
      setShowDeleteModal(null);
      fetchCategories();
      alert('Catégorie supprimée avec succès');
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      type: category.type
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', type: 'module' });
  };

  const categoryTypes = [
    { value: 'formation', label: 'Formation' },
    { value: 'module', label: 'Module' },
    { value: 'lesson', label: 'Leçon' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'project', label: 'Projet' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <Breadcrumbs items={[
        { label: user?.role === 'admin' ? 'Admin' : 'Teacher', path: user?.role === 'admin' ? '/admin' : '/teacher' },
        { label: 'Gestion des Catégories' }
      ]} />
      <BackButton />

      <div className="mb-6">
        <h1 className="section-header mb-4">Gestion des Catégories</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Créez, modifiez et supprimez les catégories pour organiser votre contenu
        </p>
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <label className="block text-sm font-medium mb-2">Filtrer par type</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input-field"
        >
          <option value="">Tous les types</option>
          {categoryTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Create/Edit Form */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">
          {editingCategory ? 'Modifier la Catégorie' : 'Créer une Nouvelle Catégorie'}
        </h2>
        <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nom *</label>
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
          <div>
            <label className="block text-sm font-medium mb-2">Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="input-field"
              required
              disabled={!!editingCategory} // Can't change type when editing
            >
              {categoryTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {editingCategory && (
              <p className="text-xs text-gray-500 mt-1">Le type ne peut pas être modifié</p>
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              {editingCategory ? 'Modifier' : 'Créer'}
            </button>
            {editingCategory && (
              <button type="button" onClick={cancelEdit} className="btn-secondary">
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Catégories ({categories.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Par défaut</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map(category => (
                <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {categoryTypes.find(t => t.value === category.type)?.label || category.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {category.description || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {category.isDefault ? (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Oui
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        Non
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(category)}
                        className="btn-secondary text-sm px-3 py-1"
                        disabled={category.isDefault && user?.role !== 'admin'}
                      >
                        Modifier
                      </button>
                      {user?.role === 'admin' && !category.isDefault && (
                        <button
                          onClick={() => setShowDeleteModal(category)}
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
          {categories.length === 0 && (
            <p className="text-center py-8 text-gray-500">Aucune catégorie trouvée</p>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer la catégorie "{showDeleteModal.name}" ? 
              Cette action est irréversible.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteCategory}
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

export default CategoryManagement;

