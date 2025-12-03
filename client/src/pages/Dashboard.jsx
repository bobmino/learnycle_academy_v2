import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { getMe } from '../store/authSlice';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';

/**
 * Dashboard Router
 * Routes to appropriate dashboard based on user role
 */
const Dashboard = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Ensure user is loaded
    if (!user && !loading) {
      dispatch(getMe());
    }
  }, [dispatch, user, loading]);

  // Show loading state
  if (loading || (!user && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 h-12 w-12 border-4 border-transparent border-t-purple-400 dark:border-t-purple-500 rounded-full animate-spin" style={{ animation: 'spin 0.5s linear infinite reverse', opacity: 0.5 }}></div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Route based on role
  try {
    switch (user.role) {
      case 'student':
        return <StudentDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        console.warn('Unknown user role:', user.role);
        return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="card text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
            Erreur lors du chargement du dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }
};

export default Dashboard;
