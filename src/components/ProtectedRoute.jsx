import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow both admin and professor roles for admin routes
  if (role === 'admin' && user.role !== 'admin' && user.role !== 'professor') {
    return <Navigate to="/student" replace />;
  }

  // Student route protection
  if (role === 'student' && user.role !== 'student') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
