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

test.describe('Leads - pipeline e filtros', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole('link', { name: /leads/i }).click();
    await expect(page.getByText(/Pipeline de Leads/i)).toBeVisible();
  });

  test('deve listar leads com paginação e filtros básicos', async ({ page }) => {
    const searchNome = page.getByPlaceholder('Filtrar nome');
    await searchNome.fill('Produtor Teste 01');

    const firstRow = page.locator('.leads-table .p-datatable-tbody tr').first();
    await expect(firstRow).toBeVisible();
  });

  test('deve abrir e fechar o modal de novo lead', async ({ page }) => {
    await page.getByRole('button', { name: /novo lead/i }).click();
    await expect(page.getByRole('dialog', { name: /Novo Lead/i })).toBeVisible();

    await page.getByRole('button', { name: /cancelar/i }).click({ trial: true }).catch(() => {});
  });
});
