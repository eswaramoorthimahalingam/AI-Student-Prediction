import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';
import { setAuthToken } from '../services/apiClient';
import { getDefaultRoute, isAdminLikeRole } from '../utils/roles';

const AuthContext = createContext();
const TOKEN_KEY = 'student-ai-token';
const USER_KEY = 'student-ai-user';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (!storedToken) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      setAuthToken(storedToken);

      try {
        const response = await authService.getProfile();

        if (!isMounted) {
          return;
        }

        setToken(storedToken);
        setUser(response.user || JSON.parse(storedUser || 'null'));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setAuthToken(null);
        setUser(null);
        setToken('');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistAuth = (authPayload) => {
    localStorage.setItem(TOKEN_KEY, authPayload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authPayload.user));
    setAuthToken(authPayload.token);
    setToken(authPayload.token);
    setUser(authPayload.user);
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    persistAuth(response);
    return response;
  };

  const register = async (registrationData) => {
    const response = await authService.register(registrationData);
    persistAuth(response);
    return response;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthToken(null);
    setUser(null);
    setToken('');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user),
    isAdminLike: isAdminLikeRole(user?.role),
    defaultRoute: getDefaultRoute(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
