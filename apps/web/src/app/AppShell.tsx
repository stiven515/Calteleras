import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { es } from '../i18n/es';
import { useAuth } from '../features/auth/authStore';

const link = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-neutral-100 text-black' : 'text-neutral-600 hover:text-black'}`;

/** Marca: círculo negro con un cartel dentro. */
function LogoMark() {
  return (
    <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
        <rect x="3" y="5" width="18" height="11" rx="2" />
        <path d="M12 16v4M8 20h8" />
      </svg>
    </span>
  );
}

export function AppShell() {
  const { enabled, ready, user } = useAuth();

  // Arranque: decide si hay sesión guardada y abre el almacenamiento local que corresponde.
  useEffect(() => {
    useAuth.getState().init();
  }, []);

  // Al navegar, el foco pasa al contenido: así quien usa teclado o lector de pantalla no se queda en el menú.
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    document.getElementById('contenido')?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        {es.nav.skip}
      </a>
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/90 backdrop-blur">
        <nav aria-label={es.nav.main} className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-1 gap-y-1 px-4 py-3 md:px-8">
          <Link to="/" className="mr-3 flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <LogoMark />
            {es.appName}
          </Link>
          <NavLink to="/crear" className={link}>{es.nav.create}</NavLink>
          <NavLink to="/cuenta" end className={link}>{es.nav.myDesigns}</NavLink>
          <NavLink to="/cuenta/marca" className={link}>{es.nav.brand}</NavLink>
          <span className="flex-1" />
          {enabled && ready &&
            (user ? (
              <NavLink to="/cuenta/perfil" className={link} aria-label={es.nav.profileOf(user.email)}>
                <span className="inline-block max-w-[10rem] truncate align-bottom">{user.email}</span>
              </NavLink>
            ) : (
              <NavLink to="/entrar" className={link}>{es.nav.signIn}</NavLink>
            ))}
          <Link
            to="/crear"
            className="ml-1 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            {es.nav.newDesign}
          </Link>
        </nav>
      </header>
      <div id="contenido" tabIndex={-1} className="outline-none">
        <Outlet />
      </div>
    </>
  );
}
