import { expect, test } from '@playwright/test';

test.describe('guardado local', () => {
  test('un diseño editado se guarda, se lista y se recupera tras recargar', async ({ page }) => {
    await page.goto('/editor/ig-evento');
    await page.getByLabel('Título del evento').fill('Retiro de jóvenes');
    await expect(page.getByText('Guardado en este dispositivo')).toBeVisible();

    // Tras el primer guardado la URL pasa a incluir el id del diseño.
    await expect(page).toHaveURL(/\/editor\/ig-evento\/[0-9a-f-]{36}$/);
    const url = page.url();

    await page.reload();
    await expect(page.getByLabel('Título del evento')).toHaveValue('Retiro de jóvenes');

    await page.goto('/cuenta');
    await expect(page.getByRole('heading', { name: 'Retiro de jóvenes' })).toBeVisible();

    await page.goto(url);
    await expect(page.getByLabel('Título del evento')).toHaveValue('Retiro de jóvenes');
  });

  test('un diseño abierto sin editar no se guarda', async ({ page }) => {
    await page.goto('/editor/yt-impacto');
    await page.waitForTimeout(1500);
    await page.goto('/cuenta');
    await expect(page.getByText('Aún no tienes diseños')).toBeVisible();
  });

  test('se puede duplicar y eliminar con confirmación', async ({ page }) => {
    await page.goto('/editor/ig-cita');
    await page.getByLabel('Autor', { exact: true }).fill('Autora de prueba');
    await expect(page.getByText('Guardado en este dispositivo')).toBeVisible();
    await page.goto('/cuenta');

    await page.getByRole('button', { name: 'Duplicar' }).click();
    await expect(page.getByRole('listitem').filter({ hasText: '(copia)' })).toHaveCount(1);

    await page.getByRole('button', { name: 'Eliminar' }).first().click();
    await page.getByRole('button', { name: 'Sí, eliminar' }).click();
    await expect(page.getByRole('listitem').filter({ has: page.getByRole('heading') })).toHaveCount(1);
  });

  test('la marca guardada se aplica a una plantilla', async ({ page }) => {
    await page.goto('/cuenta/marca');
    await page.getByLabel('Usar mis colores').check();
    await page.locator('input[type=color]').first().fill('#14532d');
    await page.getByRole('button', { name: 'Guardar mi marca' }).click();
    await expect(page.getByText('Marca guardada')).toBeVisible();

    await page.goto('/editor/yt-versiculo');
    await page.getByRole('button', { name: 'Aplicar mi marca' }).click();
    await expect(page.getByText('Marca aplicada')).toBeVisible();
    await expect(page.locator('input[type=color]').first()).toHaveValue('#14532d');
  });
});
