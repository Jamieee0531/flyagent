import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import * as gateway from '../api/gateway';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('nomie_token'));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    gateway.getProfile(token)
      .then((data) => setProfile(data.profile || {}))
      .catch(() => {
        localStorage.removeItem('nomie_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await gateway.loginUser(email, password);
    localStorage.setItem('nomie_token', data.token);
    setToken(data.token);
    return data;
  }, []);

  const register = useCallback(async (email, password, displayName) => {
    const data = await gateway.registerUser(email, password, displayName);
    localStorage.setItem('nomie_token', data.token);
    setToken(data.token);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nomie_token');
    setToken(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    const data = await gateway.getProfile(token);
    setProfile(data.profile || {});
  }, [token]);

  const saveProfile = useCallback(async (updates) => {
    if (!token) return;
    const data = await gateway.updateProfile(token, updates);
    setProfile(data.profile || {});
  }, [token]);

  const isAuthenticated = !!token;
  const hasCompletedMbti = !!(profile && profile.mbtiType);

  const value = useMemo(() => ({
    token, profile, loading, isAuthenticated, hasCompletedMbti,
    login, register, logout, refreshProfile, saveProfile, setProfile,
  }), [token, profile, loading, isAuthenticated, hasCompletedMbti,
       login, register, logout, refreshProfile, saveProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
