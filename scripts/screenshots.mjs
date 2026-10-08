// Genera capturas de la app en docs/screenshots (para el README y para revisar el diseño).
// Uso: con la app corriendo,  node scripts/screenshots.mjs [urlBase]
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:5180';
const out = 'docs/screenshots';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: process.env.CI ? undefined : 'msedge' });

async function shot(name, path, { width = 1360, height = 900, fullPage = false, before } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(base + path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(900); // fuentes y autoajuste de texto
  if (before) await before(page);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage });
  await ctx.close();
  console.log('ok', name);
}

await shot('landing', '/');
await shot('landing-completa', '/', { fullPage: true });
await shot('landing-movil', '/', { width: 390, height: 844 });
await shot('landing-arrastrada', '/', {
  before: async (page) => {
    const box = await page.getByRole('group', { name: /Arrastra/ }).boundingBox();
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.5 - 520, box.y + box.height * 0.5, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(1200);
  },
});
await shot('editor', '/editor/yt-impacto');
await shot('editor-carrusel', '/editor/ig-ruta');
await shot('galeria', '/crear/yt-thumb');

await browser.close();
