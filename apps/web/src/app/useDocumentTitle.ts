import { useEffect } from 'react';
import { es } from '../i18n/es';

/** Título de la pestaña por página: ayuda a lectores de pantalla y a quien tiene varias pestañas abiertas. */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${es.appName}` : es.appName;
  }, [title]);
}
