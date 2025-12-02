import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { moduleService, lessonService, quizService, progressService } from '../services/api';

/**
 * Module Detail Page
 * Shows lessons, quizzes, and allows marking progress
 */
const ModuleDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModuleData();
  }, [id]);

  const fetchModuleData = async () => {
    try {
      const response = await moduleService.getById(id);
      setModule(response.data.module);
      setLessons(response.data.lessons);
    } catch (error) {
      console.error('Failed to fetch module:', error);
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId) => {
    try {
      await progressService.markComplete(lessonId);
      alert('Lesson marked as complete!');
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Module not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          {module.title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          {module.description}
        </p>
        {module.caseStudyType !== 'none' && (
          <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
            {t('modules.caseStudies')}: {module.caseStudyType}
          </span>
        )}
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Lessons
        </h2>
        <div className="space-y-4">
          {lessons.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No lessons available yet.</p>
          ) : (
            lessons.map((lesson, index) => (
              <div key={lesson._id} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {index + 1}
                      </span>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {lesson.title}
                      </h3>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-600 dark:text-gray-300">
                        {lesson.content.substring(0, 200)}...
                      </p>
                    </div>
                    {lesson.pdfUrl && (
                      <a
                        href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${lesson.pdfUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        📄 {t('modules.downloadPDF')}
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => markLessonComplete(lesson._id)}
                    className="btn-primary ml-4"
                  >
                    Mark Complete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;
