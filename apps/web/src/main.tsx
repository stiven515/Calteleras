import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AccountLayout } from './app/AccountLayout';
import { AppShell } from './app/AppShell';
import { Home } from './app/Home';
import { MyDesigns } from './features/account/MyDesigns';
import { FormatPicker } from './features/gallery/FormatPicker';
import { TemplateGallery } from './features/gallery/TemplateGallery';
import { es } from './i18n/es';
import './index.css';

// Pantallas pesadas o poco frecuentes: se descargan solo cuando se visitan.
const EditorPage = lazy(() => import('./features/editor/EditorPage').then((m) => ({ default: m.EditorPage })));
const BrandKitPage = lazy(() => import('./features/brand/BrandKitPage').then((m) => ({ default: m.BrandKitPage })));
const LoginPage = lazy(() => import('./features/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const ProfilePage = lazy(() => import('./features/account/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const PublicDesignPage = lazy(() => import('./features/share/PublicDesignPage').then((m) => ({ default: m.PublicDesignPage })));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<p role="status" className="p-8 text-black/60">{es.account.loading}</p>}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/crear" element={<FormatPicker />} />
            <Route path="/crear/:formatId" element={<TemplateGallery />} />
            <Route path="/editor/:templateId/:designId?" element={<EditorPage />} />
            <Route path="/d/:designId" element={<PublicDesignPage />} />
            <Route path="/entrar" element={<LoginPage />} />
            <Route path="/cuenta" element={<AccountLayout />}>
              <Route index element={<MyDesigns />} />
              <Route path="marca" element={<BrandKitPage />} />
              <Route path="perfil" element={<ProfilePage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
