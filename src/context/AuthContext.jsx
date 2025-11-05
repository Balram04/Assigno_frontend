import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          // Verify token is still valid
          const response = await api.get('/auth/verify');
          if (response.data.success) {
            setUser(JSON.parse(storedUser));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Token verification failed, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setAuthError(null);
      const response = await api.post('/auth/login', { email, password });
      
      // Handle both response formats
      const userData = response.data.user;
      const token = response.data.token;
      
      if (!userData || !token) {
        throw new Error('Invalid response from server');
      }
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { 
        success: true,
        user: userData 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Login failed. Please try again.';
      setAuthError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        field: error.response?.data?.field || null
      };
    }
  };

  const register = async (data) => {
    try {
      setAuthError(null);
      const response = await api.post('/auth/register', data);
      
      // Handle both response formats
      const userData = response.data.user;
      const token = response.data.token;
      
      if (!userData || !token) {
        throw new Error('Invalid response from server');
      }
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { 
        success: true,
        user: userData 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Registration failed. Please try again.';
      setAuthError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        field: error.response?.data?.field || null
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthError(null);
  };

  const clearError = () => {
    setAuthError(null);
  };

  const value = {
    user,
    loading,
    authError,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isProfessor: user?.role === 'professor' || user?.role === 'admin',
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
