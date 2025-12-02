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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
