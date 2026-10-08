import { expect, test, type Page } from '@playwright/test';

/** Rotación (rad) del cilindro, leída del estilo que escribe el carrusel. */
async function rotation(page: Page): Promise<number> {
  return page.evaluate(() => {
    const stage = document.querySelector('[aria-roledescription="carrusel"] [aria-hidden="true"]') as HTMLElement;
    const m = /rotateY\((-?[\d.e-]+)rad\)/.exec(stage.style.transform);
    return m ? Number(m[1]) : NaN;
  });
}

/** Cuánto se mueve el carrusel en `ms` milisegundos sin que nadie lo toque. */
async function drift(page: Page, ms: number): Promise<number> {
  const a = await rotation(page);
  await page.waitForTimeout(ms);
  return Math.abs((await rotation(page)) - a);
}

const group = (page: Page) => page.getByRole('group', { name: /Arrastra/ });

test.describe('landing: carrusel 3D', () => {
  test('se mueve solo, sin tocarlo', async ({ page }) => {
    await page.goto('/');
    await page.mouse.move(5, 5); // cursor fuera del carrusel
    await page.waitForTimeout(800); // el movimiento arranca suave
    expect(await drift(page, 1500)).toBeGreaterThan(0.003);
  });

  test('el botón de pausa lo detiene y lo reanuda', async ({ page }) => {
    await page.goto('/');
    await page.mouse.move(5, 5);
    const pause = page.getByRole('button', { name: 'Pausar el movimiento' });
    await pause.click();
    await page.mouse.move(5, 5);
    await page.waitForTimeout(1500); // se frena con suavidad
    expect(await drift(page, 1000)).toBeLessThan(0.002);

    await page.getByRole('button', { name: 'Reanudar el movimiento' }).click();
    await page.mouse.move(5, 5);
    await page.waitForTimeout(800);
    expect(await drift(page, 1500)).toBeGreaterThan(0.003);
  });

  test('se detiene mientras el cursor está encima', async ({ page }) => {
    await page.goto('/');
    const box = (await group(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(1500);
    expect(await drift(page, 1000)).toBeLessThan(0.002);
  });

  test('se arrastra con el puntero y el cilindro gira', async ({ page }) => {
    await page.goto('/');
    const box = (await group(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const before = await rotation(page);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 300, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(800);
    // Arrastrar a la izquierda mueve el contenido a la izquierda: el desplazamiento aumenta (rotación más negativa).
    expect(await rotation(page)).toBeLessThan(before - 0.1);
  });

  test('las flechas del teclado avanzan y retroceden y detienen el movimiento automático', async ({ page }) => {
    await page.goto('/');
    await group(page).focus();
    const start = await rotation(page);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(900);
    const next = await rotation(page);
    expect(next).toBeLessThan(start - 0.1);
    await expect(page.getByRole('button', { name: 'Reanudar el movimiento' })).toBeVisible();

    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(900);
    expect(await rotation(page)).toBeGreaterThan(next + 0.1);
  });

  test('con movimiento reducido no se mueve solo y las flechas saltan sin animación', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    await page.mouse.move(5, 5);
    await page.waitForTimeout(500);
    expect(await drift(page, 1500)).toBeLessThan(0.0005);
    await expect(page.getByRole('button', { name: /movimiento/ })).toHaveCount(0);

    const start = await rotation(page);
    await group(page).focus();
    await page.keyboard.press('ArrowRight');
    expect(await rotation(page)).toBeLessThan(start); // inmediato, sin esperar
    await ctx.close();
  });

  test('no hay desbordamiento horizontal en celular', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();
    await page.goto('/');
    await page.waitForTimeout(500);
    const [vw, sw] = await page.evaluate(() => [innerWidth, document.documentElement.scrollWidth]);
    expect(sw).toBeLessThanOrEqual(vw);
    await ctx.close();
  });
});
