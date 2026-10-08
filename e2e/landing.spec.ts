import { expect, test, type Page } from '@playwright/test';

/** Rotación (rad) del cilindro, leída del estilo que escribe el carrusel. */
async function rotation(page: Page): Promise<number> {
  return page.evaluate(() => {
    const stage = document.querySelector('[aria-roledescription="carrusel"] [aria-hidden="true"]') as HTMLElement;
    const m = /rotateY\((-?[\d.e-]+)rad\)/.exec(stage.style.transform);
    return m ? Number(m[1]) : NaN;
  });
}

test.describe('landing: carrusel 3D', () => {
  test('se arrastra con el puntero y el cilindro gira', async ({ page }) => {
    await page.goto('/');
    const group = page.getByRole('group', { name: /Arrastra/ });
    const before = await rotation(page);
    const box = (await group.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 300, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(800);
    // Arrastrar a la izquierda mueve el contenido a la izquierda: el desplazamiento aumenta (rotación más negativa).
    expect(await rotation(page)).toBeLessThan(before);
  });

  test('los botones y las flechas del teclado avanzan y retroceden', async ({ page }) => {
    await page.goto('/');
    const start = await rotation(page);

    await page.getByRole('button', { name: 'Ver plantillas siguientes' }).click();
    await page.waitForTimeout(900);
    const next = await rotation(page);
    expect(next).toBeLessThan(start);

    await page.getByRole('group', { name: /Arrastra/ }).focus();
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(900);
    expect(await rotation(page)).toBeGreaterThan(next);
  });

  test('con movimiento reducido salta sin animación', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    const start = await rotation(page);
    await page.getByRole('button', { name: 'Ver plantillas siguientes' }).click();
    // Sin espera: el cambio es inmediato.
    expect(await rotation(page)).toBeLessThan(start);
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
