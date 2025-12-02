import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { userService, prospectService } from '../services/api';

/**
 * Admin Dashboard
 * Manage users and prospects
 */
const AdminDashboard = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, prospectsRes] = await Promise.all([
        userService.getAll(),
        prospectService.getAll()
      ]);
      setUsers(usersRes.data);
      setProspects(prospectsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        {t('dashboard.admin')}
      </h1>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Total Users
          </h3>
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {users.length}
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Students
          </h3>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {users.filter(u => u.role === 'student').length}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Teachers
          </h3>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {users.filter(u => u.role === 'teacher').length}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Prospects
          </h3>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {prospects.length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Users Management
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
