import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  gradeService, 
  quizServiceExtended, 
  moduleService, 
  groupService,
  userService 
} from '../services/api';
import ProgressChart from '../components/ProgressChart';
import ScoreDistribution from '../components/ScoreDistribution';
import Breadcrumbs from '../components/Breadcrumbs';
import BackButton from '../components/BackButton';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Analytics Page
 * Displays analytics for admin and teacher roles
 */
const Analytics = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    groupId: '',
    moduleId: '',
    dateFrom: '',
    dateTo: ''
  });
  const [modules, setModules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [gradeAnalytics, setGradeAnalytics] = useState(null);
  const [quizAnalytics, setQuizAnalytics] = useState(null);
  const [overview, setOverview] = useState({
    totalStudents: 0,
    totalModules: 0,
    totalQuizzes: 0,
    averageGrade: 0,
    averageQuizScore: 0
  });

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch modules and groups for filters
      const [modulesRes, groupsRes] = await Promise.all([
        moduleService.getAll(),
        user.role === 'admin' ? userService.getAll() : Promise.resolve({ data: [] })
      ]);
      
      setModules(modulesRes.data || []);
      
      // For teacher, get their groups
      if (user.role === 'teacher') {
        const groupsRes = await groupService.getAll();
        setGroups(groupsRes.data || []);
      } else {
        // For admin, get all groups
        const groupsRes = await groupService.getAll();
        setGroups(groupsRes.data || []);
      }

      // Fetch analytics
      const [gradeRes, quizRes] = await Promise.all([
        gradeService.getAnalytics({
          groupId: filters.groupId || undefined,
          moduleId: filters.moduleId || undefined
        }).catch(() => ({ data: null })),
        quizServiceExtended.getAnalytics({
          groupId: filters.groupId || undefined
        }).catch(() => ({ data: null }))
      ]);

      setGradeAnalytics(gradeRes.data);
      setQuizAnalytics(quizRes.data);

      // Calculate overview
      if (user.role === 'admin') {
        const usersRes = await userService.getAll().catch(() => ({ data: [] }));
        const students = (usersRes.data || []).filter(u => u.role === 'student');
        setOverview({
          totalStudents: students.length,
          totalModules: modulesRes.data?.length || 0,
          totalQuizzes: 0, // Would need separate endpoint
          averageGrade: gradeRes.data?.average || 0,
          averageQuizScore: quizRes.data?.average || 0
        });
      }

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Prepare chart data
  const gradeProgressData = gradeAnalytics?.studentStats?.slice(0, 10).map((stat, index) => ({
    name: stat.user?.name || `Étudiant ${index + 1}`,
    value: Math.round(stat.average),
    label: stat.user?.name || `Étudiant ${index + 1}`
  })) || [];

  const quizProgressData = quizAnalytics?.studentStats?.slice(0, 10).map((stat, index) => ({
    name: stat.user?.name || `Étudiant ${index + 1}`,
    value: Math.round(stat.average),
    label: stat.user?.name || `Étudiant ${index + 1}`
  })) || [];

  const gradeDistributionData = gradeAnalytics?.studentStats?.map(stat => stat.average) || [];
  const quizDistributionData = quizAnalytics?.studentStats?.map(stat => stat.average) || [];

  return (
    <div className="container-custom py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Analytics' }
        ]}
      />

      <div className="flex items-center gap-4 mb-8">
        <BackButton to="/dashboard" />
        <h1 className="section-header mb-0">
          Analytics {user.role === 'admin' ? 'Administrateur' : 'Professeur'}
        </h1>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <h2 className="section-subheader mb-4">Filtres</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {user.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium mb-2">Groupe</label>
              <select
                name="groupId"
                value={filters.groupId}
                onChange={handleFilterChange}
                className="input-field"
              >
                <option value="">Tous les groupes</option>
                {groups.map(group => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Module</label>
            <select
              name="moduleId"
              value={filters.moduleId}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">Tous les modules</option>
              {modules.map(module => (
                <option key={module._id} value={module._id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date de début</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date de fin</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      {user.role === 'admin' && (
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
              Étudiants
            </h3>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {overview.totalStudents}
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
              Modules
            </h3>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {overview.totalModules}
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
              Note Moyenne
            </h3>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(overview.averageGrade)}%
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
              Score Quiz Moyen
            </h3>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {Math.round(overview.averageQuizScore)}%
            </div>
          </div>
        </div>
      )}

      {/* Grade Analytics */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="section-subheader mb-4">Statistiques des Notes</h2>
          {gradeAnalytics ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Note moyenne:</span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(gradeAnalytics.average)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total de notes:</span>
                <span className="text-lg font-semibold">{gradeAnalytics.totalGrades}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="text-center p-2 bg-green-100 dark:bg-green-900/30 rounded">
                  <div className="text-lg font-bold text-green-700 dark:text-green-400">
                    {gradeAnalytics.gradeDistribution?.excellent || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Excellent (80-100%)</div>
                </div>
                <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                    {gradeAnalytics.gradeDistribution?.good || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Bon (60-79%)</div>
                </div>
                <div className="text-center p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                  <div className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                    {gradeAnalytics.gradeDistribution?.average || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Moyen (40-59%)</div>
                </div>
                <div className="text-center p-2 bg-red-100 dark:bg-red-900/30 rounded">
                  <div className="text-lg font-bold text-red-700 dark:text-red-400">
                    {gradeAnalytics.gradeDistribution?.poor || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Faible (&lt;40%)</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-600 text-center py-8">
              Aucune donnée disponible
            </p>
          )}
        </div>

        <div className="card">
          <h2 className="section-subheader mb-4">Statistiques des Quiz</h2>
          {quizAnalytics ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Score moyen:</span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(quizAnalytics.average)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total de tentatives:</span>
                <span className="text-lg font-semibold">{quizAnalytics.totalAttempts}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="text-center p-2 bg-green-100 dark:bg-green-900/30 rounded">
                  <div className="text-lg font-bold text-green-700 dark:text-green-400">
                    {quizAnalytics.scoreDistribution?.excellent || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Excellent (80-100%)</div>
                </div>
                <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                    {quizAnalytics.scoreDistribution?.good || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Bon (60-79%)</div>
                </div>
                <div className="text-center p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                  <div className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                    {quizAnalytics.scoreDistribution?.average || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Moyen (40-59%)</div>
                </div>
                <div className="text-center p-2 bg-red-100 dark:bg-red-900/30 rounded">
                  <div className="text-lg font-bold text-red-700 dark:text-red-400">
                    {quizAnalytics.scoreDistribution?.poor || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Faible (&lt;40%)</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-600 text-center py-8">
              Aucune donnée disponible
            </p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {gradeProgressData.length > 0 && (
          <ProgressChart
            data={gradeProgressData}
            title="Progression des Notes par Étudiant (Top 10)"
            height={250}
            color="#9333ea"
          />
        )}
        {quizProgressData.length > 0 && (
          <ProgressChart
            data={quizProgressData}
            title="Progression des Quiz par Étudiant (Top 10)"
            height={250}
            color="#3b82f6"
          />
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {gradeDistributionData.length > 0 && (
          <ScoreDistribution
            data={gradeDistributionData}
            title="Distribution des Notes"
            height={250}
          />
        )}
        {quizDistributionData.length > 0 && (
          <ScoreDistribution
            data={quizDistributionData}
            title="Distribution des Scores de Quiz"
            height={250}
          />
        )}
      </div>
    </div>
  );
};

export default Analytics;

