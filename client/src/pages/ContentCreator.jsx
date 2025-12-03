import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  moduleService, 
  lessonService, 
  quizService,
  projectService,
  userService
} from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import BackButton from '../components/BackButton';
import CategorySelector from '../components/CategorySelector';

/**
 * Content Creator Page
 * Hub for creating modules, lessons, quizzes, and projects
 */
const ContentCreator = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('module'); // 'module', 'lesson', 'quiz', 'project'
  const [modules, setModules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Module
    title: '',
    description: '',
    caseStudyType: 'none',
    order: 0,
    unlockMode: 'auto',
    approvalRequired: false,
    projectRequired: false,
    isActive: true,
    moduleCategory: null,
    autoUnlockOnProjectValidation: false,
    // Lesson
    lessonTitle: '',
    lessonContent: '',
    lessonOrder: 1,
    selectedModule: '',
    lessonCategory: null,
    // Quiz
    quizTitle: '',
    quizModule: '',
    questions: [{ questionText: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] }],
    quizCategory: null,
    // Project
    projectName: '',
    projectDescription: '',
    projectModules: [],
    projectType: 'project',
    deliverables: [],
    dueDate: '',
    instructions: '',
    projectCategory: null,
    autoUnlockNextOnValidation: false,
    // Teacher assignment (for admin)
    assignToTeacher: ''
  });

  useEffect(() => {
    fetchModules();
    if (user?.role === 'admin') {
      fetchTeachers();
    }
  }, [user]);

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

  const fetchTeachers = async () => {
    try {
      const response = await userService.getAll();
      const teachersList = (response.data || []).filter(u => u.role === 'teacher');
      setTeachers(teachersList);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (categoryId, fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: categoryId
    }));
  };

  const handleModuleToggle = (moduleId) => {
    setFormData(prev => {
      const currentModules = prev.projectModules || [];
      const isSelected = currentModules.includes(moduleId);
      return {
        ...prev,
        projectModules: isSelected
          ? currentModules.filter(id => id !== moduleId)
          : [...currentModules, moduleId]
      };
    });
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      const response = await moduleService.create({
        title: formData.title,
        description: formData.description,
        caseStudyType: formData.caseStudyType,
        order: parseInt(formData.order),
        unlockMode: formData.unlockMode,
        approvalRequired: formData.approvalRequired,
        projectRequired: formData.projectRequired,
        isActive: formData.isActive,
        category: formData.moduleCategory,
        autoUnlockOnProjectValidation: formData.autoUnlockOnProjectValidation
      });
      alert('Module créé avec succès');
      setFormData(prev => ({ ...prev, title: '', description: '', selectedModule: response.data._id }));
      fetchModules();
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    try {
      const lessonData = {
        module: formData.selectedModule,
        title: formData.lessonTitle,
        content: formData.lessonContent,
        order: parseInt(formData.lessonOrder),
        category: formData.lessonCategory
      };
      
      if (user?.role === 'admin' && formData.assignToTeacher) {
        lessonData.assignToTeacher = formData.assignToTeacher;
      }
      
      await lessonService.create(lessonData);
      alert('Leçon créée avec succès');
      setFormData(prev => ({ ...prev, lessonTitle: '', lessonContent: '', lessonOrder: parseInt(prev.lessonOrder) + 1 }));
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddQuizQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { questionText: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] }]
    }));
  };

  const handleQuizQuestionChange = (index, field, value) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      return { ...prev, questions: newQuestions };
    });
  };

  const handleQuizOptionChange = (questionIndex, optionIndex, field, value) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].options[optionIndex] = {
        ...newQuestions[questionIndex].options[optionIndex],
        [field]: field === 'isCorrect' ? value : value
      };
      return { ...prev, questions: newQuestions };
    });
  };

  const handleAddQuizOption = (questionIndex) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].options.push({ text: '', isCorrect: false });
      return { ...prev, questions: newQuestions };
    });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const quizData = {
        module: formData.quizModule,
        title: formData.quizTitle,
        questions: formData.questions,
        category: formData.quizCategory
      };
      
      if (user?.role === 'admin' && formData.assignToTeacher) {
        quizData.assignToTeacher = formData.assignToTeacher;
      }
      
      await quizService.create(quizData);
      alert('Quiz créé avec succès');
      setFormData(prev => ({
        ...prev,
        quizTitle: '',
        questions: [{ questionText: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] }]
      }));
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        name: formData.projectName,
        description: formData.projectDescription,
        moduleIds: formData.projectModules.length > 0 ? formData.projectModules : undefined,
        moduleId: formData.projectModules.length === 1 ? formData.projectModules[0] : undefined,
        type: formData.projectType,
        deliverables: formData.deliverables,
        dueDate: formData.dueDate || null,
        instructions: formData.instructions,
        category: formData.projectCategory,
        autoUnlockNextOnValidation: formData.autoUnlockNextOnValidation
      };
      
      if (user?.role === 'admin' && formData.assignToTeacher) {
        projectData.assignToTeacher = formData.assignToTeacher;
      }
      
      await projectService.create(projectData);
      alert('Projet créé avec succès');
      setFormData(prev => ({
        ...prev,
        projectName: '',
        projectDescription: '',
        instructions: '',
        deliverables: [],
        dueDate: ''
      }));
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
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
          { label: 'Création de Contenu' }
        ]}
      />

      <div className="flex items-center gap-4 mb-8">
        <BackButton to="/dashboard" />
        <h1 className="section-header mb-0">
          Création de Contenu
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('module')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'module'
              ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📚 Module/Formation
        </button>
        <button
          onClick={() => setActiveTab('lesson')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'lesson'
              ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📖 Leçon
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'quiz'
              ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          🧪 Quiz/Test
        </button>
        <button
          onClick={() => setActiveTab('project')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'project'
              ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📋 Étude de Cas/Projet
        </button>
      </div>

      {/* Module Form */}
      {activeTab === 'module' && (
        <div className="card">
          <h2 className="section-subheader mb-4">Créer un Module/Formation</h2>
          <form onSubmit={handleCreateModule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titre *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input-field"
                rows="4"
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type d'étude de cas</label>
                <select
                  name="caseStudyType"
                  value={formData.caseStudyType}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="none">Aucun</option>
                  <option value="cafe">Café</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="hotel">Hôtel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ordre</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mode de déblocage</label>
                <select
                  name="unlockMode"
                  value={formData.unlockMode}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="auto">Auto (accessible immédiatement)</option>
                  <option value="approval">Approbation requise</option>
                </select>
              </div>
              <div className="flex items-center gap-4 pt-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="approvalRequired"
                    checked={formData.approvalRequired}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span>Approbation requise</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="projectRequired"
                    checked={formData.projectRequired}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span>Projet requis</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span>Actif</span>
                </label>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  name="autoUnlockOnProjectValidation"
                  checked={formData.autoUnlockOnProjectValidation}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <span>Débloquer automatiquement le module suivant après validation du projet</span>
              </label>
            </div>
            <CategorySelector
              value={formData.moduleCategory}
              onChange={(categoryId) => handleCategoryChange(categoryId, 'moduleCategory')}
              type="module"
              label="Catégorie"
              className="mb-4"
            />
            {user?.role === 'admin' && teachers.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Assigner à un Teacher (optionnel)
                </label>
                <select
                  name="assignToTeacher"
                  value={formData.assignToTeacher}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Aucun (créé par admin)</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" className="btn-primary">
              Créer le Module
            </button>
          </form>
        </div>
      )}

      {/* Lesson Form */}
      {activeTab === 'lesson' && (
        <div className="card">
          <h2 className="section-subheader mb-4">Créer une Leçon</h2>
          <form onSubmit={handleCreateLesson} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Module *</label>
              <select
                name="selectedModule"
                value={formData.selectedModule}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Sélectionner un module</option>
                {modules.map(module => (
                  <option key={module._id} value={module._id}>
                    {module.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Titre *</label>
              <input
                type="text"
                name="lessonTitle"
                value={formData.lessonTitle}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contenu *</label>
              <textarea
                name="lessonContent"
                value={formData.lessonContent}
                onChange={handleInputChange}
                className="input-field"
                rows="10"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ordre</label>
              <input
                type="number"
                name="lessonOrder"
                value={formData.lessonOrder}
                onChange={handleInputChange}
                className="input-field"
                min="1"
              />
            </div>
            <button type="submit" className="btn-primary">
              Créer la Leçon
            </button>
          </form>
        </div>
      )}

      {/* Quiz Form */}
      {activeTab === 'quiz' && (
        <div className="card">
          <h2 className="section-subheader mb-4">Créer un Quiz/Test</h2>
          <form onSubmit={handleCreateQuiz} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Module *</label>
              <select
                name="quizModule"
                value={formData.quizModule}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Sélectionner un module</option>
                {modules.map(module => (
                  <option key={module._id} value={module._id}>
                    {module.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Titre du Quiz *</label>
              <input
                type="text"
                name="quizTitle"
                value={formData.quizTitle}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium">Questions</label>
                <button
                  type="button"
                  onClick={handleAddQuizQuestion}
                  className="btn-outline text-sm"
                >
                  + Ajouter Question
                </button>
              </div>
              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-2">Question {qIndex + 1} *</label>
                    <input
                      type="text"
                      value={question.questionText}
                      onChange={(e) => handleQuizQuestionChange(qIndex, 'questionText', e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Options</label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => handleQuizOptionChange(qIndex, oIndex, 'text', e.target.value)}
                          className="input-field flex-1"
                          placeholder={`Option ${oIndex + 1}`}
                          required
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={option.isCorrect}
                            onChange={() => {
                              const newOptions = question.options.map((opt, idx) => ({
                                ...opt,
                                isCorrect: idx === oIndex
                              }));
                              handleQuizQuestionChange(qIndex, 'options', newOptions);
                            }}
                          />
                          <span className="text-sm">Correcte</span>
                        </label>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddQuizOption(qIndex)}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      + Ajouter Option
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <CategorySelector
              value={formData.quizCategory}
              onChange={(categoryId) => handleCategoryChange(categoryId, 'quizCategory')}
              type="quiz"
              label="Catégorie"
              className="mb-4"
            />
            <button type="submit" className="btn-primary">
              Créer le Quiz
            </button>
          </form>
        </div>
      )}

      {/* Project Form */}
      {activeTab === 'project' && (
        <div className="card">
          <h2 className="section-subheader mb-4">Créer une Étude de Cas/Projet</h2>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Modules * (peut être transversal)</label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 dark:border-gray-600">
                {modules.map(module => (
                  <label key={module._id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <input
                      type="checkbox"
                      checked={formData.projectModules.includes(module._id)}
                      onChange={() => handleModuleToggle(module._id)}
                      className="rounded"
                    />
                    <span className="text-gray-900 dark:text-white">{module.title}</span>
                  </label>
                ))}
              </div>
              {formData.projectModules.length === 0 && (
                <p className="text-sm text-red-500 mt-1">Veuillez sélectionner au moins un module</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nom du Projet *</label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                name="projectDescription"
                value={formData.projectDescription}
                onChange={handleInputChange}
                className="input-field"
                rows="4"
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="project">Projet</option>
                  <option value="case-study">Étude de Cas</option>
                  <option value="exam">Examen</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date limite (optionnel)</label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Instructions</label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                className="input-field"
                rows="4"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  name="autoUnlockNextOnValidation"
                  checked={formData.autoUnlockNextOnValidation}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <span>Débloquer automatiquement le module suivant après validation de ce projet</span>
              </label>
            </div>
            <CategorySelector
              value={formData.projectCategory}
              onChange={(categoryId) => handleCategoryChange(categoryId, 'projectCategory')}
              type="project"
              label="Catégorie"
              className="mb-4"
            />
            <button type="submit" className="btn-primary" disabled={formData.projectModules.length === 0}>
              Créer le Projet
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ContentCreator;

