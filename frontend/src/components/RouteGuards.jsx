import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom'; import { useAuth } from '../context/AuthContext';
export function RequireAuth() { const { user, loading } = useAuth(); const location = useLocation(); if (loading) return <div className="state-screen">Restaurando sesión…</div>; return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />; }
export function RequireAdmin() { const { user, loading, isAdmin } = useAuth(); if (loading) return <div className="state-screen">Verificando permisos…</div>; if (!user) return <Navigate to="/login" replace />; return isAdmin ? <Outlet /> : <Navigate to="/club/home" replace />; }
export function PublicOnly() { const { user, loading } = useAuth(); if (loading) return <div className="state-screen">Cargando…</div>; return user ? <Navigate to={user.es_admin === 1 ? '/admin' : '/club/home'} replace /> : <Outlet />; }
