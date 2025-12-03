import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  gradeService, 
  progressService, 
  lessonService,
  moduleService,
  userService,
  groupService
} from '../services/api';
import GradeDisplay from '../components/GradeDisplay';

/**
 * Grading Page
 * Grade student work (lessons, quizzes, projects)
 */
const Grading = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [modules, setModules] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [gradingForm, setGradingForm] = useState({
    grade: '',
    comment: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const studentId = searchParams.get('student');
    if (studentId) {
      setSelectedStudent(studentId);
    }
  }, []);

  const fetchData = async () => {
    try {
      const [modulesRes, usersRes] = await Promise.all([
        moduleService.getAll(),
        userService.getAll()
      ]);

      setModules(modulesRes.data);
      setStudents(usersRes.data.filter(u => u.role === 'student'));

      // If teacher, get students from their groups
      if (user?.role === 'teacher') {
        try {
          const groupsRes = await groupService.getMy();
          const groupStudents = [];
          groupsRes.data.forEach(group => {
            if (group.students) {
              groupStudents.push(...group.students);
            }
          });
          setStudents(groupStudents);
        } catch (error) {
          console.error('Failed to fetch groups:', error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedModule) {
      fetchLessons();
    }
  }, [selectedModule]);

  useEffect(() => {
    if (selectedStudent && selectedLesson) {
      fetchGrades();
    }
  }, [selectedStudent, selectedLesson]);

  const fetchLessons = async () => {
    try {
      const response = await moduleService.getById(selectedModule);
      setLessons(response.data.lessons);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await gradeService.getStudentGrades(selectedStudent);
      setGrades(response.data.grades);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    }
  };

  const getStudentProgress = async (studentId, lessonId) => {
    try {
      const response = await progressService.getStudent(studentId);
      return response.data.find(p => p.lesson?._id === lessonId || p.lesson === lessonId);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      return null;
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedLesson) {
      alert('Veuillez sélectionner un étudiant et une leçon');
      return;
    }

    try {
      await gradeService.create({
        userId: selectedStudent,
        lessonId: selectedLesson,
        grade: parseFloat(gradingForm.grade),
        comment: gradingForm.comment
      });
      setGradingForm({ grade: '', comment: '' });
      fetchGrades();
      alert('Note enregistrée avec succès');
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

  const getLessonGrade = (lessonId) => {
    return grades.find(g => g.lesson?._id === lessonId || g.lesson === lessonId);
  };

  return (
    <div className="container-custom py-8">
      <h1 className="section-header mb-8">Notation</h1>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar - Students & Modules */}
        <div className="lg:col-span-1 space-y-6">
          {/* Students List */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Étudiants
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {students.map((student) => (
                <button
                  key={student._id}
                  onClick={() => setSelectedStudent(student._id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedStudent === student._id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {student.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {student.email}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Modules List */}
          {selectedStudent && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Modules
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {modules.map((module) => (
                  <button
                    key={module._id}
                    onClick={() => setSelectedModule(module._id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedModule === module._id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {module.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {!selectedStudent ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Sélectionnez un étudiant pour commencer
              </p>
            </div>
          ) : !selectedModule ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Sélectionnez un module
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Grading Form */}
              <div className="card">
                <h2 className="section-subheader mb-4">
                  Noter une Leçon
                </h2>
                <form onSubmit={handleGrade} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Leçon</label>
                    <select
                      value={selectedLesson || ''}
                      onChange={(e) => setSelectedLesson(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Sélectionner une leçon</option>
                      {lessons.map(lesson => (
                        <option key={lesson._id} value={lesson._id}>
                          {lesson.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Note (0-100) *</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gradingForm.grade}
                      onChange={(e) => setGradingForm({ ...gradingForm, grade: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Commentaire *</label>
                    <textarea
                      value={gradingForm.comment}
                      onChange={(e) => setGradingForm({ ...gradingForm, comment: e.target.value })}
                      className="input-field"
                      rows="4"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary">
                    Enregistrer la Note
                  </button>
                </form>
              </div>

              {/* Lessons with Grades */}
              {selectedModule && (
                <div className="card">
                  <h2 className="section-subheader mb-4">
                    Leçons du Module
                  </h2>
                  <div className="space-y-4">
                    {lessons.map((lesson) => {
                      const grade = getLessonGrade(lesson._id);
                      return (
                        <div
                          key={lesson._id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {lesson.title}
                            </h3>
                            {grade && (
                              <GradeDisplay grade={grade.grade} />
                            )}
                          </div>
                          {grade && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              {grade.comment}
                            </p>
                          )}
                          {!grade && (
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              Non noté
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Grading;

