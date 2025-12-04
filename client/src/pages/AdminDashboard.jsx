import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  userService, 
  prospectService, 
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="section-header">
          {t('dashboard.admin')}
        </h1>
        <div className="flex gap-2">
          <Link to="/content-management" className="btn-primary flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Gérer le contenu
          </Link>
          <Link to="/category-management" className="btn-secondary flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Catégories
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-6 gap-4 mb-8">
        <Link to="/admin?section=users" className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Total Users
          </h3>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {users.length}
          </div>
        </Link>
        
        <Link to="/admin?section=users&role=student" className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Students
          </h3>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {users.filter(u => u.role === 'student').length}
          </div>
        </Link>

        <Link to="/admin?section=users&role=teacher" className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Teachers
          </h3>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {users.filter(u => u.role === 'teacher').length}
          </div>
        </Link>

        <Link to="/groups" className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Groups
          </h3>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {groups.length}
          </div>
        </Link>

        <Link to="/content-management?tab=modules" className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Modules
          </h3>
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
            {modules.length}
          </div>
        </Link>

        <Link to="/admin?section=prospects" className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Prospects
          </h3>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {prospects.length}
          </div>
        </Link>
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
              {users.map((userItem) => (
                <tr key={userItem._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {userItem.name}
                    {userItem.isActive === false && (
                      <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">(Suspendu)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{userItem.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      userItem.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      userItem.role === 'teacher' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {userItem.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2 flex-wrap">
                      {userItem.role !== 'admin' && (
                        <>
                          {userItem.isActive !== false ? (
                            <button
                              onClick={async () => {
                                if (window.confirm(`Voulez-vous suspendre l'utilisateur ${userItem.name} ?`)) {
                                  try {
                                    await userService.suspend(userItem._id, { reason: 'Suspendu par admin' });
                                    fetchData();
                                    alert('Utilisateur suspendu');
                                  } catch (error) {
                                    alert('Erreur: ' + (error.response?.data?.message || error.message));
                                  }
                                }
                              }}
                              className="text-amber-600 dark:text-amber-400 hover:underline text-xs"
                            >
                              Suspendre
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                if (window.confirm(`Voulez-vous activer l'utilisateur ${userItem.name} ?`)) {
                                  try {
                                    await userService.activate(userItem._id);
                                    fetchData();
                                    alert('Utilisateur activé');
                                  } catch (error) {
                                    alert('Erreur: ' + (error.response?.data?.message || error.message));
                                  }
                                }
                              }}
                              className="text-green-600 dark:text-green-400 hover:underline text-xs"
                            >
                              Activer
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => {
                          const newRole = prompt(`Changer le rôle de ${userItem.name} (actuel: ${userItem.role})\nNouveau rôle (student/teacher/admin):`, userItem.role);
                          if (newRole && ['student', 'teacher', 'admin'].includes(newRole.toLowerCase()) && newRole.toLowerCase() !== userItem.role) {
                            userService.update(userItem._id, { role: newRole.toLowerCase() })
                              .then(() => {
                                fetchData();
                                alert('Rôle mis à jour');
                              })
                              .catch(error => {
                                alert('Erreur: ' + (error.response?.data?.message || error.message));
                              });
                          }
                        }}
                        className="text-purple-600 dark:text-purple-400 hover:underline text-xs"
                      >
                        Modifier
                      </button>
                      {userItem.role !== 'admin' && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`⚠️ ATTENTION: Voulez-vous vraiment supprimer l'utilisateur ${userItem.name} ?\nCette action est irréversible.`)) {
                              try {
                                await userService.delete(userItem._id);
                                fetchData();
                                alert('Utilisateur supprimé');
                              } catch (error) {
                                alert('Erreur: ' + (error.response?.data?.message || error.message));
                              }
                            }
                          }}
                          className="text-red-600 dark:text-red-400 hover:underline text-xs"
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
