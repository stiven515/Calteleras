import { NavLink, Outlet } from 'react-router-dom';
import { es } from '../i18n/es';

const tab = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 px-1 py-2 text-sm font-medium ${isActive ? 'border-black text-black' : 'border-transparent text-black/60 hover:text-black'}`;

export function AccountLayout() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="mb-4 text-3xl font-bold tracking-tight">{es.account.title}</h1>
      <nav aria-label={es.account.sections} className="mb-6 flex gap-6 border-b border-black/10">
        <NavLink to="/cuenta" end className={tab}>{es.nav.myDesigns}</NavLink>
        <NavLink to="/cuenta/marca" className={tab}>{es.nav.brand}</NavLink>
        <NavLink to="/cuenta/perfil" className={tab}>{es.nav.profile}</NavLink>
      </nav>
      <Outlet />
    </main>
  );
}
