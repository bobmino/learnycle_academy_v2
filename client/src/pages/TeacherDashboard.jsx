import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  groupService, 
  notificationService, 
  progressService,
  gradeService,
  quizServiceExtended,
  moduleService,
  approvalService
} from '../services/api';
import ProgressBar from '../components/ProgressBar';
import GradeDisplay from '../components/GradeDisplay';

/**
 * Teacher Dashboard
 * Enhanced dashboard with groups, student progress, analytics, and notifications
 */
const TeacherDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [groups, setGroups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Poll for notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [groupsRes, notificationsRes, approvalsRes] = await Promise.all([
        groupService.getMy(),
        notificationService.getAll({ limit: 10 }),
        approvalService.getPending()
      ]);

      setGroups(groupsRes.data);
      setNotifications(notificationsRes.data);
      setPendingApprovals(approvalsRes.data);

      // Get all students from groups
      const allStudents = [];
      groupsRes.data.forEach(group => {
        if (group.students) {
          allStudents.push(...group.students);
        }
      });
      setStudents(allStudents);

      // Fetch analytics
      await fetchAnalytics();
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getAll({ limit: 10 });
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [gradesRes, quizRes] = await Promise.all([
        gradeService.getAnalytics({}),
        quizServiceExtended.getAnalytics({})
      ]);

      setAnalytics({
        grades: gradesRes.data,
        quizzes: quizRes.data
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const getStudentProgress = async (studentId) => {
    try {
      const response = await progressService.getStudent(studentId);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch student progress:', error);
      return [];
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="section-header mb-0">
          {t('dashboard.teacher')}
        </h1>
        <div className="flex gap-2">
          <Link to="/groups" className="btn-outline">
            Gérer les Groupes
          </Link>
          <Link to="/grading" className="btn-primary">
            Noter
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Groupes Assignés
          </h3>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {groups.length}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Étudiants
          </h3>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {students.length}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Notifications
          </h3>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {notifications.filter(n => !n.read).length}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Approbations en Attente
          </h3>
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {pendingApprovals.length}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Score Moyen
          </h3>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {analytics?.grades?.average ? Math.round(analytics.grades.average) : 0}%
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Groups Section */}
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="section-subheader mb-0">
                Mes Groupes ({groups.length})
              </h2>
              <Link to="/groups" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                Voir tout
              </Link>
            </div>

            {groups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Aucun groupe assigné
                </p>
                <Link to="/groups" className="btn-primary">
                  Créer un Groupe
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {groups.map((group) => (
                  <div
                    key={group._id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {group.name}
                        </h3>
                        {group.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {group.description}
                          </p>
                        )}
                      </div>
                      <Link
                        to={`/groups/${group._id}`}
                        className="btn-outline text-sm"
                      >
                        Voir détails
                      </Link>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{group.students?.length || 0} étudiant(s)</span>
                      <span>•</span>
                      <span>{group.modules?.length || 0} module(s)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Students Progress Table */}
          <div className="card">
            <h2 className="section-subheader mb-6">
              Progression des Étudiants
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Étudiant
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Groupe
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Progression
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Note Moyenne
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        Aucun étudiant assigné
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <StudentRow key={student._id} student={student} groups={groups} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Approvals */}
          {pendingApprovals.length > 0 && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Approbations en Attente
                </h3>
                <Link
                  to="/approvals"
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Voir tout ({pendingApprovals.length})
                </Link>
              </div>
              <div className="space-y-3">
                {pendingApprovals.slice(0, 3).map((approval) => (
                  <Link
                    key={approval._id}
                    to="/approvals"
                    className="block p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 hover:border-yellow-400 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {approval.module.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Par: {approval.user.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions Rapides
            </h3>
            <div className="space-y-2">
              <Link
                to="/content-creator"
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ✏️ Créer et gérer les modules, leçons, quizs et projets/études de cas
                </span>
              </Link>
              <Link
                to="/grading"
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  📝 Noter des Travaux
                </span>
              </Link>
              <Link
                to="/groups"
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  👥 Gérer les Groupes
                </span>
              </Link>
              {pendingApprovals.length > 0 && (
                <Link
                  to="/approvals"
                  className="block p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 hover:border-yellow-400 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ✅ Approbations ({pendingApprovals.length})
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Analytics Summary */}
          {analytics && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Statistiques
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Notes Moyennes</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(analytics.grades?.average || 0)}/100
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tentatives Quiz</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {analytics.quizzes?.totalAttempts || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Student Row Component
const StudentRow = ({ student, groups }) => {
  const [progress, setProgress] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [student._id]);

  const fetchStudentData = async () => {
    try {
      const [progressRes, gradesRes] = await Promise.all([
        progressService.getStudent(student._id),
        gradeService.getStudentGrades(student._id)
      ]);
      setProgress(progressRes.data);
      setGrades(gradesRes.data.grades);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch student data:', error);
      setLoading(false);
    }
  };

  const getStudentGroup = () => {
    return groups.find(g => g.students?.some(s => s._id === student._id));
  };

  const calculateProgress = () => {
    if (progress.length === 0) return 0;
    const completed = progress.filter(p => p.isCompleted).length;
    return Math.round((completed / progress.length) * 100);
  };

  const getAverageGrade = () => {
    if (grades.length === 0) return null;
    const sum = grades.reduce((acc, g) => acc + g.grade, 0);
    return Math.round(sum / grades.length);
  };

  if (loading) {
    return (
      <tr>
        <td colSpan="5" className="px-4 py-3">
          <div className="animate-pulse">Chargement...</div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {student.avatar ? (
            <img
              src={student.avatar}
              alt={student.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-semibold">
              {student.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {student.name}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {getStudentGroup()?.name || '-'}
      </td>
      <td className="px-4 py-3">
        <div className="w-32">
          <ProgressBar progress={calculateProgress()} showLabel={false} size="sm" />
        </div>
      </td>
      <td className="px-4 py-3">
        {getAverageGrade() !== null ? (
          <GradeDisplay grade={getAverageGrade()} showLabel={false} size="sm" />
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>
      <td className="px-4 py-3">
        <Link
          to={`/grading?student=${student._id}`}
          className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
        >
          Noter
        </Link>
      </td>
    </tr>
  );
};

export default TeacherDashboard;
