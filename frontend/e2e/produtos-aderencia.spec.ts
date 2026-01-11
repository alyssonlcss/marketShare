import { test, expect } from '@playwright/test';

const EMAIL = 'alyssonlcss@gmail.com';
const PASSWORD = 'minhaSenha123';

async function login(page: any) {
  await page.goto('/login');
  await page.locator('#username').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.getByRole('button', { name: /acessar painel/i }).click();
  await page.waitForURL('**/');
}

test.describe('Produtos - catálogo e aderência', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole('link', { name: /produtos/i }).click();
    await expect(page.getByText(/Catálogo de Produtos/i)).toBeVisible();
  });

  test('deve listar produtos com filtros básicos', async ({ page }) => {
    const searchNome = page.getByPlaceholder('Filtrar nome');
    await searchNome.fill('Soja');

    const cell = page
      .locator('.produtos-table .p-datatable-tbody td')
      .filter({ hasText: 'Herbicida Soja Premium' })
      .first();

    await expect(cell).toBeVisible();
  });

  test('deve exibir tabela de propriedades com match de cultura', async ({ page }) => {
    await expect(page.getByText(/Propriedades com match de cultura/i)).toBeVisible();

    const firstMatchRow = page.locator('.matches-table .p-datatable-tbody tr').first();
    await expect(firstMatchRow).toBeVisible();
  });

  test('deve abrir drawer de lead ao clicar em uma propriedade com match', async ({ page }) => {
    const firstMatchRow = page.locator('.matches-table .p-datatable-tbody tr').first();
    await firstMatchRow.click();

    await expect(page.getByText(/Lead associado/i)).toBeVisible();

    await page.getByRole('button', { name: /fechar/i }).click();
  });
});
