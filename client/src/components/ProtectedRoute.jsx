import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { getMe } from '../store/authSlice';

/**
 * Protected Route Component
 * Redirects to login if not authenticated
 * @param {Object} props - Component props
 * @param {React.Component} props.children - Child components to render
 * @param {Array} props.roles - Allowed roles (optional)
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user && !loading) {
      dispatch(getMe());
    }
  }, [dispatch, user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 h-12 w-12 border-4 border-transparent border-t-purple-400 dark:border-t-purple-500 rounded-full animate-spin" style={{ animation: 'spin 0.5s linear infinite reverse', opacity: 0.5 }}></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
