import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';

/**
 * Dashboard Router
 * Routes to appropriate dashboard based on user role
 */
const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default Dashboard;
