/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const FORM_STORAGE_KEY = 'code_therapist_diagnose_draft';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ct_access_token'));
  const [isLoading, setIsLoading] = useState(() => {
    return !!localStorage.getItem('ct_access_token');
  });

  // ── Bootstrap: verify stored token on mount ──────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('ct_access_token');
    if (!storedToken) {
      return;
    }
    axios
      .get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
      .then((res) => {
        setUser(res.data);
        setToken(storedToken);
      })
      .catch(() => {
        // Token invalid/expired — try refresh cookie
        axios
          .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
          .then((res) => {
            const newToken = res.data.access_token;
            localStorage.setItem('ct_access_token', newToken);
            setToken(newToken);
            setUser(res.data.user);
          })
          .catch(() => {
            localStorage.removeItem('ct_access_token');
            setToken(null);
            setUser(null);
          })
          .finally(() => setIsLoading(false));
        return;
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await axios.post(
      `${API_BASE_URL}/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    const { access_token, user: userData } = res.data;
    localStorage.setItem('ct_access_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  }, []);

  // ── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async (username, email, password) => {
    const res = await axios.post(
      `${API_BASE_URL}/auth/register`,
      { username, email, password },
      { withCredentials: true }
    );
    const { access_token, user: userData } = res.data;
    localStorage.setItem('ct_access_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
    } catch {
      // ignore errors
    }
    localStorage.removeItem('ct_access_token');
    localStorage.removeItem(FORM_STORAGE_KEY); // clear form draft per-user
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
