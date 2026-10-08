import { expect, test } from '@playwright/test';
import { nonBackgroundRatio, pngSize, readDownload, seamMetrics, unzip } from './helpers';

test.describe('exportación', () => {
  test('miniatura: PNG de 1280×720 con contenido', async ({ page }) => {
    await page.goto('/editor/yt-impacto');
    await page.getByLabel('Título', { exact: true }).fill('Prueba de exportación');
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Descargar PNG/ }).click()]);

    expect(download.suggestedFilename()).toBe('prueba-de-exportacion.png');
    const buf = await readDownload(download);
    expect(pngSize(buf)).toEqual({ width: 1280, height: 720 });
    // Una imagen sin texto ni degradado sería casi un solo color.
    expect(nonBackgroundRatio(buf)).toBeGreaterThan(0.05);
  });

  test('miniatura: JPG', async ({ page }) => {
    await page.goto('/editor/yt-versiculo');
    await page.getByRole('radio', { name: 'JPG' }).click();
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Descargar JPG/ }).click()]);
    const buf = await readDownload(download);
    expect(download.suggestedFilename()).toMatch(/\.jpg$/);
    expect(buf.subarray(0, 3).toString('hex')).toBe('ffd8ff'); // firma JPEG
  });

  test('carrusel: ZIP con imágenes numeradas y sin costuras', async ({ page }) => {
    await page.goto('/editor/ig-ruta');
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Descargar ZIP/ }).click()]);

    const files = unzip(await readDownload(download));
    expect(Object.keys(files)).toEqual(['01.png', '02.png', '03.png', '04.png']);
    for (const f of Object.values(files)) expect(pngSize(f)).toEqual({ width: 1080, height: 1350 });

    // En cada corte, el borde entre imágenes no debe cambiar más de lo que cambian dos columnas vecinas.
    const names = Object.keys(files);
    for (let i = 0; i < names.length - 1; i++) {
      const { across, within } = seamMetrics(files[names[i]!]!, files[names[i + 1]!]!);
      expect(across, `corte ${i + 1}|${i + 2}`).toBeLessThan(Math.max(within * 3, 2));
    }
  });
});
