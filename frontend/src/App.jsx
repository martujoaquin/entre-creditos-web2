import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicOnly, RequireAdmin, RequireAuth } from './components/RouteGuards';
import LandingLayout from './layouts/LandingLayout';
import AuthLayout from './layouts/AuthLayout';
import ClubLayout from './layouts/ClubLayout';
import AdminLayout from './layouts/AdminLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Placeholder from './pages/Placeholder';

function App() {
  const page = (title) => <Placeholder title={title} />;
  return <AuthProvider><BrowserRouter><Routes>
    <Route element={<LandingLayout />}><Route path="/" element={<LandingPage />} /></Route>
    <Route element={<PublicOnly />}><Route element={<AuthLayout />}><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /></Route></Route>
    <Route element={<RequireAuth />}><Route path="/club" element={<ClubLayout />}><Route index element={<Navigate to="home" replace />} /><Route path="home" element={page('Inicio del Club')} /><Route path="peliculas" element={page('Películas')} /><Route path="peliculas/:id" element={page('Detalle de película')} /><Route path="resenas/nueva/:idPelicula" element={page('Nueva reseña')} /><Route path="resenas/editar/:idResena" element={page('Editar reseña')} /><Route path="mis-resenas" element={page('Mis reseñas')} /><Route path="compartidas" element={page('Compartidas conmigo')} /><Route path="perfil" element={page('Perfil')} /></Route></Route>
    <Route element={<RequireAdmin />}><Route path="/admin" element={<AdminLayout />}><Route index element={<Placeholder title="Administración" description="Elegí una sección administrativa para continuar." />} /><Route path="usuarios" element={page('Administrar usuarios')} /><Route path="peliculas" element={page('Administrar películas')} /><Route path="generos" element={page('Administrar géneros')} /><Route path="resenas" element={page('Administrar reseñas')} /></Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter></AuthProvider>;
}

/*
  The previous 7B landing markup is intentionally replaced by route components above.
*/
/*
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Entre Créditos, inicio">
          <img src="/images/LogoCompletoPNG.png" alt="Entre Créditos" />
        </a>
        <button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}>
          <span /><span /><span />
        </button>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Navegación principal">
          <a href="#como-funciona" onClick={() => setMenuOpen(false)}>Cómo funciona</a>
          <a href="#idea" onClick={() => setMenuOpen(false)}>La conversación</a>
        </nav>
      </header>

      <main id="inicio">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-image" aria-hidden="true" />
          <div className="hero-content">
            <p className="eyebrow">Club privado de cine</p>
            <h1 id="hero-title">Entre <em>Créditos</em></h1>
            <p className="hero-slogan">Las mejores historias empiezan cuando termina la película.</p>
            <a className="button" href="#idea">Conocé el club</a>
          </div>
        </section>

        <section className="manifesto" id="idea">
          <p className="eyebrow">La película inicia la conversación</p>
          <h2>La reseña es el verdadero producto.</h2>
          <p>Entre Créditos es un espacio íntimo para mirar, escribir y compartir ideas sobre cine con personas elegidas.</p>
        </section>

        <section className="steps" id="como-funciona" aria-labelledby="steps-title">
          <div className="section-heading"><p className="eyebrow">Cómo funciona</p><h2 id="steps-title">Un espacio íntimo para cinéfilos.</h2></div>
          <div className="step-grid">
            {['Mirá', 'Escribí', 'Compartí'].map((title, index) => <article className="step" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{['Explorá el catálogo de tu círculo.', 'Escribí reseñas elaboradas, no estrellitas.', 'Compartí con quienes elegís.'][index]}</p></article>)}
          </div>
        </section>
      </main>

      <footer className="site-footer"><img src="/images/LogoCompletoPNG.png" alt="Entre Créditos" /><p>Un club privado donde las películas continúan en conversación.</p><small>© 2026 Entre Créditos</small></footer>
    </div>
  ); */

export default App;
