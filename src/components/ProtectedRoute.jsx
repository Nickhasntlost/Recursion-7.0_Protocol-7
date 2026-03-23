import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth';

const ProtectedRoute = ({ children, organizerOnly = false }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if route requires organizer role
  if (organizerOnly && user?.role !== 'organizer') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
