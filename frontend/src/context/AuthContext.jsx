/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import ApiService from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncUserFromStorage = () => {
      const savedUser = localStorage.getItem('behold_auth_user');
      const savedToken = localStorage.getItem('behold_token');
      if (savedUser && savedToken) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Failed to parse saved user", e);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    syncUserFromStorage();

    // Listen for cross-tab or programmatic storage changes to sync session instantly
    window.addEventListener('storage', syncUserFromStorage);
    return () => window.removeEventListener('storage', syncUserFromStorage);
  }, []);

  const login = async (email, password) => {
    const res = await ApiService.login(email, password);
    if (res.success && res.data && res.data.user) {
      if (res.data.user.status === 'REJECTED' || (res.data.user.status === 'PENDING' && res.data.user.role?.toUpperCase() !== 'COUNSELLOR' && res.data.user.role?.toUpperCase() !== 'PSYCHOLOGIST')) {
        ApiService.logout();
        throw new Error('REJECTED_USER:' + (res.data.user.rejectionReason || 'Credentials did not meet verification standards. Please contact the administrator.'));
      }
      setUser(res.data.user);
      return res.data.user;
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const register = async (name, email, password, role = 'USER', extraData = {}) => {
    // Convert UI role values to matching backend format
    const backendRole = role.toLowerCase() === 'psychologist' || role === 'counsellor'
      ? 'counsellor'
      : 'user';

    const res = await ApiService.register(name, email, password, backendRole, extraData);
    if (res.success && res.data) {
      const userData = res.data.user || res.data.counsellor;
      setUser(userData);
      return userData;
    } else {
      throw new Error(res.message || 'Registration failed');
    }
  };

  const updateUser = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('behold_auth_user', JSON.stringify(updatedData));
  };

  const logout = () => {
    ApiService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
