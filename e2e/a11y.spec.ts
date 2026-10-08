import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = ['/', '/crear', '/crear/yt-thumb', '/crear/ig-carousel', '/editor/yt-impacto', '/editor/ig-ruta', '/cuenta', '/cuenta/marca', '/cuenta/perfil', '/entrar'];

test.describe('accesibilidad (axe, WCAG 2.1 A y AA)', () => {
  for (const path of pages) {
    test(`sin violaciones en ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
      expect(summary).toEqual([]);
    });
  }
});
