export const es = {
  appName: 'Cartelera',
  home: {
    title: 'Miniaturas, portadas y carruseles que parecen hechos por un diseñador.',
    subtitle: 'Elige una plantilla, cambia el texto, sube tu logo y descarga. Gratis y en español.',
    cta: 'Crear mi diseño',
  },
  editor: {
    fields: 'Contenido',
    palette: 'Colores',
    notFound: 'Esa plantilla no existe.',
    back: 'Volver',
    otherTemplate: '← Elegir otra plantilla',
    removeImage: 'Quitar',
    colors: { bg: 'Fondo', fg: 'Texto', accent: 'Acento', muted: 'Secundario' },
    contrastTitle: 'Atención: algunos colores se leerán mal',
    contrastIssue: (slot: 'fg' | 'muted' | 'accent', ratio: number) =>
      `${{ fg: 'El texto', muted: 'El texto secundario', accent: 'El acento' }[slot]} casi no se distingue del fondo (contraste ${ratio.toFixed(1)}:1).`,
  },
  create: {
    title: '¿Qué quieres crear?',
    subtitle: 'Elige el formato y te mostramos plantillas listas para personalizar.',
    carouselNote: 'varias imágenes',
    comingSoon: 'Próximamente',
    templatesCount: (n: number) => (n === 1 ? '1 plantilla' : `${n} plantillas`),
    unknownFormat: 'Ese formato no existe.',
    changeFormat: '← Cambiar formato',
  },
  gallery: {
    subtitle: 'Elige una plantilla. Después podrás cambiar textos, imágenes y colores.',
    empty: 'Estamos preparando plantillas para este formato. Vuelve pronto.',
    use: (name: string) => `Usar la plantilla ${name}`,
  },
  export: {
    title: 'Descargar',
    formatLabel: 'Formato de archivo',
    download: 'Descargar',
    working: 'Generando…',
    error: 'No se pudo generar la imagen. Intenta de nuevo.',
  },
} as const;
