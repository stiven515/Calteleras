import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './app/Home';
import { EditorPage } from './features/editor/EditorPage';
import { FormatPicker } from './features/gallery/FormatPicker';
import { TemplateGallery } from './features/gallery/TemplateGallery';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crear" element={<FormatPicker />} />
        <Route path="/crear/:formatId" element={<TemplateGallery />} />
        <Route path="/editor/:templateId" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
