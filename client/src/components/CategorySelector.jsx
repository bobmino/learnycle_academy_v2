import { useState, useEffect } from 'react';
import { categoryService } from '../services/api';

/**
 * CategorySelector Component
 * Allows selection of existing categories or creation of a new one
 */
const CategorySelector = ({ 
  value, 
  onChange, 
  type, 
  label = 'Catégorie',
  required = false,
  className = ''
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const fetchCategories = async () => {
    try {
      const params = type ? { type } : {};
      const response = await categoryService.getAll(params);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedValue = e.target.value;
    
    if (selectedValue === '__new__') {
      setShowNewCategoryInput(true);
      onChange(null); // Clear selection when creating new
    } else {
      setShowNewCategoryInput(false);
      setNewCategoryName('');
      onChange(selectedValue);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      return;
    }

    try {
      const response = await categoryService.create({
        name: newCategoryName.trim(),
        type: type || 'module',
        description: ''
      });
      
      // Add new category to list
      setCategories([...categories, response.data.data]);
      
      // Select the new category
      onChange(response.data.data._id);
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    } catch (error) {
      console.error('Error creating category:', error);
      alert(error.response?.data?.message || 'Erreur lors de la création de la catégorie');
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {!showNewCategoryInput ? (
        <select
          value={value || ''}
          onChange={handleCategoryChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
          <option value="__new__">+ Créer une nouvelle catégorie</option>
        </select>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nom de la nouvelle catégorie"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateCategory();
              }
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreateCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Créer
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewCategoryInput(false);
                setNewCategoryName('');
                onChange(value); // Restore previous value
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;

