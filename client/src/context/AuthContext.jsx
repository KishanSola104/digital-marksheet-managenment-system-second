import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [school, setSchool] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session verification on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        // Check school session
        const schoolRes = await authService.getSchoolSession().catch(() => null);
        if (schoolRes && schoolRes.success) {
          setSchool(schoolRes.data);

          // If school exists, check user session
          const userRes = await authService.getUserSession().catch(() => null);
          if (userRes && userRes.success) {
            setUser(userRes.data);
          }
        } else {
          // If cookies expired or invalid, check localStorage for fallback info
          const storedSchool = localStorage.getItem('dmms_school_info');
          if (storedSchool) {
            try {
              setSchool(JSON.parse(storedSchool));
            } catch (e) {
              localStorage.removeItem('dmms_school_info');
            }
          }
        }
      } catch (err) {
        // sessions not active
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const loginSchool = async (schoolId, password) => {
    const res = await authService.loginSchool(schoolId, password);
    if (res.success && res.data) {
      setSchool(res.data);
      if (res.data.token) {
        localStorage.setItem('dmms_school_token', res.data.token);
      }
      localStorage.setItem('dmms_school_info', JSON.stringify(res.data));
    }
    return res;
  };

  const logoutSchool = async () => {
    try {
      await authService.logoutSchool().catch(() => null);
    } finally {
      setSchool(null);
      setUser(null);
      localStorage.removeItem('dmms_school_token');
      localStorage.removeItem('dmms_user_token');
      localStorage.removeItem('dmms_school_info');
    }
  };

  const loginUser = async ({ userId, password, role }) => {
    const res = await authService.loginUser({
      userId,
      password,
      role,
      schoolId: school?.schoolId
    });
    if (res.success && res.data) {
      setUser(res.data);
      if (res.data.token) {
        localStorage.setItem('dmms_user_token', res.data.token);
      }
    }
    return res;
  };

  const logoutUser = async () => {
    try {
      await authService.logoutUser().catch(() => null);
    } finally {
      setUser(null);
      localStorage.removeItem('dmms_user_token');
    }
  };

  const updateSchoolState = (updated) => {
    setSchool((prev) => ({ ...prev, ...updated }));
  };

  const updateUserState = (updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  return (
    <AuthContext.Provider
      value={{
        school,
        user,
        isLoading,
        loginSchool,
        logoutSchool,
        loginUser,
        logoutUser,
        updateSchoolState,
        updateUserState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
