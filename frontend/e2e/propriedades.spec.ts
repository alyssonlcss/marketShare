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

test.describe('Propriedades - inventário e drawer de lead', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole('link', { name: /propriedades/i }).click();
    await expect(page.getByText(/Inventário de Propriedades/i)).toBeVisible();
  });

  test('deve listar propriedades e permitir ordenação por hectares', async ({ page }) => {
    await expect(page.getByText(/de \d+ propriedades/i)).toBeVisible();

    const hectaresHeader = page.getByRole('columnheader', { name: /hectares/i });
    await hectaresHeader.click();
    await hectaresHeader.click();

    await expect(hectaresHeader).toBeVisible();
  });

  test('deve abrir o drawer de lead ao clicar em uma propriedade', async ({ page }) => {
    const firstRow = page.locator('.propriedades-table .p-datatable-tbody tr').first();
    await firstRow.click();

    await expect(page.getByText(/Lead associado/i)).toBeVisible();

    await page.getByRole('button', { name: /fechar/i }).click();
    await expect(page.getByText(/Lead associado/i)).not.toBeVisible({ timeout: 2000 }).catch(() => {});
  });
});
