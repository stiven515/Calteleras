import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';
import { pngSize, readDownload } from './helpers';

/** PNG sólido de color, para subirlo como foto. */
function solidPng(width: number, height: number, [r, g, b]: [number, number, number]): Buffer {
  const png = new PNG({ width, height });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = r;
    png.data[i + 1] = g;
    png.data[i + 2] = b;
    png.data[i + 3] = 255;
  }
  return PNG.sync.write(png);
}

function pixel(buf: Buffer, x: number, y: number): [number, number, number] {
  const p = PNG.sync.read(buf);
  const i = (y * p.width + x) * 4;
  return [p.data[i]!, p.data[i + 1]!, p.data[i + 2]!];
}

test.describe('QA: regresiones y casos límite', () => {
  test('una foto subida aparece en la imagen exportada', async ({ page }) => {
    await page.goto('/editor/yt-impacto');
    await page.locator('input[type=file]').first().setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: solidPng(600, 400, [220, 20, 40]) });
    await expect(page.getByText('Guardado en este dispositivo')).toBeVisible();

    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Descargar PNG/ }).click()]);
    const buf = await readDownload(download);
    expect(pngSize(buf)).toEqual({ width: 1280, height: 720 });
    // La foto ocupa el lado derecho de la miniatura.
    const [r, g, b] = pixel(buf, 1100, 400);
    expect(r).toBeGreaterThan(190);
    expect(g).toBeLessThan(70);
    expect(b).toBeLessThan(90);
  });

  test('el foco no se pierde al seguir escribiendo después del primer autoguardado', async ({ page }) => {
    await page.goto('/editor/ig-cita');
    const quote = page.getByLabel('Frase', { exact: true });
    await quote.fill('');
    await quote.click();
    // keyboard.type escribe donde esté el foco (pressSequentially lo volvería a poner y ocultaría el error).
    await page.keyboard.type('Hola');
    // El primer guardado cambia la URL (reemplazo del historial).
    await expect(page).toHaveURL(/\/editor\/ig-cita\/[0-9a-f-]{36}$/);
    await page.keyboard.type(' mundo');
    await expect(quote).toHaveValue('Hola mundo');
  });

  test('si el navegador no tiene IndexedDB, el editor sigue funcionando', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'indexedDB', { value: undefined, configurable: true });
    });
    await page.goto('/editor/yt-impacto');
    // La vista previa debe mostrar el contenido de la plantilla aunque no haya dónde guardar.
    await expect(page.locator('[role=img]').getByText('Fe que mueve montañas')).toBeVisible();
    await expect(page.getByText(/no permite guardar/i)).toBeVisible();
  });

  test('abrir un diseño con la plantilla equivocada en la URL redirige a la correcta', async ({ page }) => {
    await page.goto('/editor/ig-cita');
    await page.getByLabel('Autor', { exact: true }).fill('Prueba de ruta');
    await expect(page).toHaveURL(/\/editor\/ig-cita\/([0-9a-f-]{36})$/);
    const id = page.url().split('/').pop()!;

    await page.goto(`/editor/yt-impacto/${id}`);
    await expect(page).toHaveURL(new RegExp(`/editor/ig-cita/${id}$`));
    await expect(page.getByLabel('Autor', { exact: true })).toHaveValue('Prueba de ruta');
  });

  test('navegar justo después de editar no pierde el cambio', async ({ page }) => {
    await page.goto('/editor/ig-evento');
    await page.getByLabel('Título del evento').fill('Cambio al vuelo');
    await page.getByRole('link', { name: 'Mis diseños', exact: true }).first().click();
    await expect(page.getByRole('heading', { name: 'Cambio al vuelo' })).toBeVisible({ timeout: 8000 });
  });

  test('un diseño inexistente muestra un mensaje claro', async ({ page }) => {
    await page.goto('/editor/yt-impacto/00000000-0000-4000-8000-000000000000');
    await expect(page.getByText('No encontramos este diseño en este dispositivo.')).toBeVisible();
  });

  test('la plantilla inexistente y el formato inexistente no rompen la app', async ({ page }) => {
    await page.goto('/editor/no-existe');
    await expect(page.getByText('Esa plantilla no existe.')).toBeVisible();
    await page.goto('/crear/no-existe');
    await expect(page.getByText('Ese formato no existe.')).toBeVisible();
    await page.goto('/ruta/que/no/existe');
    await expect(page.getByRole('link', { name: 'Cartelera' })).toBeVisible(); // al menos la cabecera sigue
  });

  test('el archivo exportado de una plantilla sin título usa su texto principal', async ({ page }) => {
    await page.goto('/editor/yt-versiculo');
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Descargar PNG/ }).click()]);
    expect(download.suggestedFilename()).toBe('todo-lo-puedo-en-cristo-que-me-fortalece.png');
  });

  test('textos muy largos y sin espacios no desbordan la pieza', async ({ page }) => {
    await page.goto('/editor/yt-impacto');
    await page.getByLabel('Título', { exact: true }).fill('Supercalifragilisticoespialidosoextraordinariamente');
    const text = page.locator('[role=img]').getByText('Supercalifragilisticoespialidosoextraordinariamente');
    // El cuadro del texto no debe quedar más ancho ni más alto que su caja (el autoajuste lo reduce).
    const fits = await text.evaluate((el) => el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1);
    expect(fits).toBe(true);
  });
});
