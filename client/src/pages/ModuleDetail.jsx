import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { 
  moduleService, 
  lessonService, 
  quizService, 
  progressService,
  gradeService,
  discussionService,
  approvalService
} from '../services/api';
import ProgressBar from '../components/ProgressBar';
import GradeDisplay from '../components/GradeDisplay';
import Breadcrumbs from '../components/Breadcrumbs';
import BackButton from '../components/BackButton';
import EmbeddedQuiz from '../components/EmbeddedQuiz';

/**
 * Module Detail Page
 * Enhanced page with full lesson view, quizzes, grades, and discussions
 */
const ModuleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [progress, setProgress] = useState([]);
  const [grades, setGrades] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [embeddedQuizzes, setEmbeddedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons', 'quiz', 'discussion', 'projects'
  const [previousModule, setPreviousModule] = useState(null);
  const [nextModule, setNextModule] = useState(null);
  const [isApproved, setIsApproved] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    fetchModuleData();
  }, [id]);

  const fetchModuleData = async () => {
    try {
      const [moduleRes, progressRes] = await Promise.all([
        moduleService.getById(id),
        progressService.getMy()
      ]);
      
      setModule(moduleRes.data.module);
      const lessonsData = moduleRes.data.lessons || [];
      setLessons(lessonsData);
      setProgress(progressRes.data);
      
      // Fetch embedded quizzes for lessons
      const embeddedQuizzesData = [];
      for (const lesson of lessonsData) {
        if (lesson.embeddedQuizzes && lesson.embeddedQuizzes.length > 0) {
          for (const embeddedQuiz of lesson.embeddedQuizzes) {
            if (embeddedQuiz.quiz && embeddedQuiz.quiz._id) {
              try {
                const quizRes = await quizService.getById(embeddedQuiz.quiz._id);
                embeddedQuizzesData.push({
                  lessonId: lesson._id,
                  quiz: quizRes.data,
                  position: embeddedQuiz.position || 0,
                  displayAfter: embeddedQuiz.displayAfter || false
                });
              } catch (error) {
                console.error(`Failed to fetch embedded quiz ${embeddedQuiz.quiz._id}:`, error);
              }
            }
          }
        }
      }
      setEmbeddedQuizzes(embeddedQuizzesData);
      setPreviousModule(moduleRes.data.previousModule);
      setNextModule(moduleRes.data.nextModule);
      setIsApproved(moduleRes.data.isApproved);
      setApprovalStatus(moduleRes.data.approvalStatus);

      // Fetch quizzes
      try {
        const quizzesRes = await quizService.getByModule(id);
        setQuizzes(quizzesRes.data);
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
      }

      // Fetch grades for student
      if (user?.role === 'student') {
        try {
          const gradesRes = await gradeService.getStudentGrades(user._id);
          setGrades(gradesRes.data.grades.filter(g => 
            g.module === id || g.lesson?.module === id
          ));
        } catch (error) {
          console.error('Failed to fetch grades:', error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch module:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLessonProgress = (lessonId) => {
    const lessonProgress = progress.find(p => p.lesson?._id === lessonId || p.lesson === lessonId);
    return lessonProgress?.isCompleted || false;
  };

  const getModuleProgress = () => {
    if (lessons.length === 0) return 0;
    const completed = lessons.filter(lesson => getLessonProgress(lesson._id)).length;
    return Math.round((completed / lessons.length) * 100);
  };

  const getLessonGrade = (lessonId) => {
    const grade = grades.find(g => g.lesson?._id === lessonId || g.lesson === lessonId);
    return grade?.grade || null;
  };

  const markLessonComplete = async (lessonId, isComplete) => {
    try {
      if (isComplete) {
        await progressService.markComplete(lessonId);
      } else {
        // Mark as incomplete - would need a new endpoint or update existing
        // For now, we'll just refresh
      }
      await fetchModuleData();
    } catch (error) {
      console.error('Failed to update lesson status:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const submitQuiz = async (quizId) => {
    try {
      const answers = Object.values(quizAnswers);
      const response = await quizService.submit(quizId, answers);
      setQuizResult(response.data);
      await fetchModuleData();
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Erreur lors de la soumission du quiz');
    }
  };

  const openLesson = (lesson) => {
    setCurrentLesson(lesson);
    setActiveTab('lessons');
  };

  const openQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setQuizAnswers({});
    setQuizResult(null);
    setActiveTab('quiz');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Module non trouvé</h1>
      </div>
    );
  }

  const handleRequestApproval = async () => {
    try {
      await approvalService.request(id);
      alert('Demande d\'approbation envoyée');
      setShowApprovalModal(false);
      fetchModuleData();
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container-custom py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Modules', to: '/modules' },
          { label: module?.title || 'Module' }
        ]}
      />

      {/* Module Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <BackButton to="/modules" />
              <h1 className="section-header mb-0">
                {module.title}
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {module.description}
            </p>
            <div className="flex items-center gap-4">
              {module.caseStudyType !== 'none' && (
                <span className="badge-primary">
                  {module.caseStudyType}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {lessons.length} leçon(s)
                </span>
                {quizzes.length > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                  • {quizzes.length} quiz
                </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Approval Status */}
        {!isApproved && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-300">
                  {approvalStatus === 'pending' 
                    ? 'Demande d\'approbation en attente'
                    : approvalStatus === 'rejected'
                    ? 'Demande d\'approbation rejetée'
                    : 'Ce module nécessite une approbation'}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  Vous pouvez prévisualiser le contenu mais ne pouvez pas le compléter sans approbation.
                </p>
              </div>
              {approvalStatus !== 'pending' && (
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="btn-primary text-sm"
                >
                  Demander Approbation
                </button>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-4">
          <ProgressBar progress={getModuleProgress()} />
        </div>

        {/* Navigation Modules */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          {previousModule ? (
            <Link
              to={`/modules/${previousModule._id}`}
              className="btn-outline flex items-center gap-2"
            >
              ← Module Précédent
              <span className="text-sm opacity-75">{previousModule.title}</span>
            </Link>
          ) : (
            <div></div>
          )}
          {nextModule ? (
            <Link
              to={`/modules/${nextModule._id}`}
              className={`flex items-center gap-2 ${
                nextModule.accessible ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'
              }`}
              onClick={(e) => {
                if (!nextModule.accessible) {
                  e.preventDefault();
                  alert('Vous devez compléter ce module et obtenir une approbation pour accéder au module suivant');
                }
              }}
            >
              <span className="text-sm opacity-75">{nextModule.title}</span>
              Module Suivant →
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar - Lessons & Quizzes List */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Contenu du Module
            </h3>

            {/* Lessons */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Leçons ({lessons.length})
              </h4>
              <div className="space-y-2">
                {lessons.map((lesson, index) => {
                  const isCompleted = getLessonProgress(lesson._id);
                  const grade = getLessonGrade(lesson._id);
                  return (
                    <button
                      key={lesson._id}
                      onClick={() => openLesson(lesson)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        currentLesson?._id === lesson._id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {index + 1}.
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {lesson.title}
                          </span>
                        </div>
                        {isCompleted && (
                          <span className="text-green-500">✓</span>
                        )}
                      </div>
                      {grade !== null && (
                        <div className="mt-1">
                          <GradeDisplay grade={grade} showLabel={false} size="sm" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quizzes */}
            {quizzes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quiz ({quizzes.length})
                </h4>
                <div className="space-y-2">
                  {quizzes.map((quiz) => (
                    <button
                      key={quiz._id}
                      onClick={() => openQuiz(quiz)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        currentQuiz?._id === quiz._id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {quiz.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('lessons')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'lessons'
                  ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Leçons
            </button>
            {quizzes.length > 0 && (
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'quiz'
                    ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Quiz
              </button>
            )}
            <button
              onClick={() => setActiveTab('discussion')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'discussion'
                  ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Discussion
            </button>
            {module.projectRequired && (
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'projects'
                    ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Projets
              </button>
            )}
          </div>

          {/* Lessons Tab */}
          {activeTab === 'lessons' && (
            <div className="space-y-6">
              {currentLesson ? (
                <div className="card">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="section-subheader mb-0">
                      {currentLesson.title}
                    </h2>
                    <div className="flex gap-2">
                      {getLessonProgress(currentLesson._id) ? (
                        <button
                          onClick={() => markLessonComplete(currentLesson._id, false)}
                          className="btn-secondary text-sm"
                        >
                          Marquer incomplet
                        </button>
                      ) : (
                        <button
                          onClick={() => markLessonComplete(currentLesson._id, true)}
                          className="btn-primary text-sm"
                        >
                          Marquer complet
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lesson Content with Embedded Quizzes */}
                  <div className="prose dark:prose-invert max-w-none mb-6">
                    {(() => {
                      // Get embedded quizzes for this lesson
                      const lessonEmbeddedQuizzes = embeddedQuizzes.filter(
                        eq => eq.lessonId === currentLesson._id
                      );
                      
                      // Separate quizzes by position (during vs after)
                      const duringQuizzes = lessonEmbeddedQuizzes
                        .filter(eq => !eq.displayAfter)
                        .sort((a, b) => a.position - b.position);
                      const afterQuizzes = lessonEmbeddedQuizzes
                        .filter(eq => eq.displayAfter);
                      
                      // Split content by position markers if needed
                      let contentParts = [currentLesson.content];
                      
                      // Render content with embedded quizzes
                      return (
                        <div className="space-y-6">
                          {/* Content before quizzes */}
                          <div 
                            className="markdown-content"
                            dangerouslySetInnerHTML={{ 
                              __html: currentLesson.content
                                .replace(/#{3}\s(.+)/g, '<h3>$1</h3>')
                                .replace(/#{2}\s(.+)/g, '<h2>$1</h2>')
                                .replace(/#{1}\s(.+)/g, '<h1>$1</h1>')
                                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                                .replace(/\n/g, '<br />')
                            }}
                          />
                          
                          {/* Embedded quizzes during lesson */}
                          {duringQuizzes.map((eq, index) => (
                            <EmbeddedQuiz
                              key={`during-${eq.quiz._id}-${index}`}
                              quiz={eq.quiz}
                              onComplete={(score) => {
                                console.log(`Quiz completed with score: ${score}%`);
                                // Refresh progress if needed
                                fetchModuleData();
                              }}
                            />
                          ))}
                          
                          {/* Embedded quizzes after lesson */}
                          {afterQuizzes.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                                Quiz d'approfondissement
                              </h3>
                              {afterQuizzes.map((eq, index) => (
                                <EmbeddedQuiz
                                  key={`after-${eq.quiz._id}-${index}`}
                                  quiz={eq.quiz}
                                  onComplete={(score) => {
                                    console.log(`Quiz completed with score: ${score}%`);
                                    fetchModuleData();
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* PDF Download */}
                  {currentLesson.pdfUrl && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <a
                        href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${currentLesson.pdfUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline inline-flex items-center gap-2"
                      >
                        📄 Télécharger le PDF
                      </a>
                    </div>
                  )}

                  {/* Grade Display */}
                  {getLessonGrade(currentLesson._id) !== null && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Note du professeur:
                      </h4>
                      <GradeDisplay grade={getLessonGrade(currentLesson._id)} />
                      {grades.find(g => g.lesson?._id === currentLesson._id || g.lesson === currentLesson._id)?.comment && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {grades.find(g => g.lesson?._id === currentLesson._id || g.lesson === currentLesson._id).comment}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    {lessons.findIndex(l => l._id === currentLesson._id) > 0 && (
                      <button
                        onClick={() => {
                          const prevIndex = lessons.findIndex(l => l._id === currentLesson._id) - 1;
                          openLesson(lessons[prevIndex]);
                        }}
                        className="btn-secondary"
                      >
                        ← Précédent
                      </button>
                    )}
                    {lessons.findIndex(l => l._id === currentLesson._id) < lessons.length - 1 && (
                      <button
                        onClick={() => {
                          const nextIndex = lessons.findIndex(l => l._id === currentLesson._id) + 1;
                          openLesson(lessons[nextIndex]);
                        }}
                        className="btn-primary ml-auto"
                      >
                        Suivant →
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    Sélectionnez une leçon dans la liste pour commencer
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quiz Tab */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              {currentQuiz ? (
                <div className="card">
                  <h2 className="section-subheader mb-6">
                    {currentQuiz.title}
                  </h2>

                  {quizResult ? (
                    <div className="space-y-4">
                      <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Résultats</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {quizResult.score}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Réponses correctes</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {quizResult.correctAnswers}/{quizResult.totalQuestions}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {quizResult.totalQuestions}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setQuizResult(null);
                          setQuizAnswers({});
                        }}
                        className="btn-primary"
                      >
                        Réessayer
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {currentQuiz.questions.map((question, qIndex) => (
                        <div key={qIndex} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <h4 className="font-medium mb-3 text-gray-900 dark:text-white">
                            {qIndex + 1}. {question.questionText}
                          </h4>
                          <div className="space-y-2">
                            {question.options.map((option, oIndex) => (
                              <label
                                key={oIndex}
                                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                                  quizAnswers[qIndex] === oIndex
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${qIndex}`}
                                  checked={quizAnswers[qIndex] === oIndex}
                                  onChange={() => handleQuizAnswer(qIndex, oIndex)}
                                  className="text-purple-600"
                                />
                                <span className="text-gray-900 dark:text-white">
                                  {option.text}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => submitQuiz(currentQuiz._id)}
                        disabled={Object.keys(quizAnswers).length !== currentQuiz.questions.length}
                        className="btn-primary w-full"
                      >
                        Soumettre le Quiz
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    Sélectionnez un quiz dans la liste pour commencer
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Discussion Tab */}
          {activeTab === 'discussion' && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="section-subheader mb-0">Discussion</h2>
                <button
                  onClick={() => navigate('/discussions')}
                  className="btn-primary text-sm"
                >
                  + Nouveau Message
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Utilisez la page Discussions pour communiquer avec votre professeur ou l'administrateur à propos de ce module.
              </p>
              <Link
                to="/discussions"
                className="btn-outline inline-block"
              >
                Voir toutes les discussions
              </Link>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="section-subheader mb-0">Projets</h2>
                <Link
                  to="/projects"
                  className="btn-primary text-sm"
                >
                  Voir tous les projets
                </Link>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Les projets et études de cas pour ce module sont disponibles dans la section Projets.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Demander l'approbation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vous souhaitez accéder au module "{module.title}". Votre demande sera envoyée à votre professeur ou à l'administrateur.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRequestApproval}
                className="btn-primary"
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleDetail;
