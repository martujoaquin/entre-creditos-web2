import React from 'react';
import { Link, Outlet } from 'react-router-dom';
export default function AuthLayout() { return <main className="auth-shell"><Link className="auth-logo" to="/"><img src="/images/LogoCompletoPNG.png" alt="Entre Créditos" /></Link><section className="auth-card"><Outlet /></section></main>; }
