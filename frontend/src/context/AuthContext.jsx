import React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
const TOKEN_KEY = 'entre-creditos-token'; const AuthContext = createContext(null);
export function AuthProvider({ children }) { const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY)); const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { const restore = async () => { if (!token) { setLoading(false); return; } try { const { data } = await api.get('/auth/me'); setUser(data.usuario); } catch { sessionStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); } finally { setLoading(false); } }; restore(); }, [token]);
  const login = async (credentials) => { const { data } = await api.post('/auth/login', credentials); sessionStorage.setItem(TOKEN_KEY, data.token); setToken(data.token); setUser(data.usuario); return data.usuario; };
  const logout = () => { sessionStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); };
  const value = useMemo(() => ({ token, user, loading, login, logout, isAdmin: user?.es_admin === 1 }), [token, user, loading]); return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>; }
export const useAuth = () => useContext(AuthContext);
