import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  userService, 
  prospectService, 
  adminService,
  groupService,
  moduleService,
  gradeService,
  quizServiceExtended,
  notificationService
} from '../services/api';

/**
 * Admin Dashboard
 * Manage users and prospects
 */
const AdminDashboard = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [modules, setModules] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, prospectsRes, groupsRes, modulesRes, notificationsRes] = await Promise.all([
        userService.getAll().catch(err => {
          console.error('Error fetching users:', err);
          return { data: [] };
        }),
        prospectService.getAll().catch(err => {
          console.error('Error fetching prospects:', err);
          return { data: [] };
        }),
        groupService.getAll().catch(err => {
          console.error('Error fetching groups:', err);
          return { data: [] };
        }),
        moduleService.getAll().catch(err => {
          console.error('Error fetching modules:', err);
          return { data: [] };
        }),
        notificationService.getAll({ limit: 10 }).catch(err => {
          console.error('Error fetching notifications:', err);
          return { data: [] };
        })
      ]);
      setUsers(usersRes.data || []);
      setProspects(prospectsRes.data || []);
      setGroups(groupsRes.data || []);
      setModules(modulesRes.data || []);
      setNotifications(notificationsRes.data || []);

      // Fetch analytics (with error handling)
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
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedProfessional = async () => {
    if (!window.confirm('Voulez-vous charger le contenu professionnel complet ? Cela créera 10 modules avec leurs leçons.')) {
      return;
    }

    setSeeding(true);
    setSeedMessage('');
    
    try {
      const response = await adminService.seedProfessional();
      setSeedMessage(`✅ ${response.data.message}. ${response.data.modules} modules et ${response.data.lessons} leçons créés.`);
      // Refresh modules after seeding
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setSeedMessage(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 h-12 w-12 border-4 border-transparent border-t-purple-400 dark:border-t-purple-500 rounded-full animate-spin" style={{ animation: 'spin 0.5s linear infinite reverse', opacity: 0.5 }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="section-header mb-8">
        {t('dashboard.admin')}
      </h1>

      {/* Content Management */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Gestion du Contenu
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Chargez le contenu professionnel complet (10 modules avec leurs leçons) pour les apprentis.
            </p>
            <button
              onClick={handleSeedProfessional}
              disabled={seeding}
              className="btn-primary"
            >
              {seeding ? 'Chargement...' : 'Charger le Contenu Professionnel'}
            </button>
            {seedMessage && (
              <div className={`mt-4 p-3 rounded-lg ${
                seedMessage.includes('✅') 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {seedMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-6 gap-4 mb-8">
        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Total Users
          </h3>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {users.length}
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Students
          </h3>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {users.filter(u => u.role === 'student').length}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Teachers
          </h3>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {users.filter(u => u.role === 'teacher').length}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Groups
          </h3>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {groups.length}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Modules
          </h3>
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
            {modules.length}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Prospects
          </h3>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {prospects.length}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Link to="/groups" className="card-hover">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Gérer les Groupes</h3>
        </Link>
        <Link to="/content-creator" className="card-hover">
          <div className="text-3xl mb-2">✏️</div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Créer et gérer les modules, leçons, quizs et projets/études de cas</h3>
        </Link>
        <Link to="/notifications" className="card-hover">
          <div className="text-3xl mb-2">🔔</div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="badge-primary mt-2">
              {notifications.filter(n => !n.read).length} non lues
            </span>
          )}
        </Link>
        <Link to="/analytics" className="card-hover">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Analytics</h3>
          {analytics && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Score moyen: {Math.round(analytics.grades?.average || 0)}%
            </p>
          )}
        </Link>
      </div>

      {/* Groups Section */}
      <div className="card mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-subheader mb-0">
            Groupes ({groups.length})
          </h2>
          <Link to="/groups" className="btn-primary">
            Créer un Groupe
          </Link>
        </div>
        {groups.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">
            Aucun groupe créé
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {groups.slice(0, 6).map((group) => (
              <Link
                key={group._id}
                to={`/groups/${group._id}`}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {group.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {group.students?.length || 0} étudiant(s) • {group.modules?.length || 0} module(s)
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="card mb-8">
        <h2 className="section-subheader mb-4">
          Gestion des Utilisateurs
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      user.role === 'teacher' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button className="text-primary-600 dark:text-primary-400 hover:underline mr-2">
                      {t('common.edit')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prospects Table */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Prospect Submissions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {prospects.map((prospect) => (
                <tr key={prospect._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{prospect.fullName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{prospect.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{prospect.phone || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {prospect.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
