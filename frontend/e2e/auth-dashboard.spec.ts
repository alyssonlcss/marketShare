import { test, expect } from '@playwright/test';

// Ajuste as credenciais se necessário para bater com o seed de test-data.sql
const EMAIL = 'alyssonlcss@gmail.com';
const PASSWORD = 'minhaSenha123';

test.describe('Autenticação e dashboard', () => {
  test('deve bloquear rota protegida e redirecionar para login', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/login');
    await expect(page.locator('.login-panel')).toBeVisible();
  });

  test('deve exibir mensagem de erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#username').fill('wrong@example.com');
    await page.locator('#password').fill('senhaerrada');
    await page.getByRole('button', { name: /acessar painel/i }).click();

    await expect(page.locator('.login-alert')).toBeVisible();
  });

  test('deve fazer login e exibir o dashboard com filtros e cards principais', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#username').fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.getByRole('button', { name: /acessar painel/i }).click();

    await page.waitForURL('**/');

    await expect(page.getByText(/Pulso operacional/i)).toBeVisible();
    await expect(page.getByText(/Resumo de leads/i)).toBeVisible();
    await expect(page.getByText(/Rotas prioritárias/i)).toBeVisible();

    const atribSelect = page.locator('.dashboard__filters-section .dashboard__filter-select').first();
    const areaSelect = page.locator('.panel__filters .dashboard__filter-select');

    await expect(atribSelect).toBeVisible();
    await expect(areaSelect).toBeVisible();
  });

  test('deve alterar filtro de atribuição e recarregar dados', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#username').fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.getByRole('button', { name: /acessar painel/i }).click();
    await page.waitForURL('**/');

    const select = page.locator('.dashboard__filters-section .dashboard__filter-select').first();
    await select.click();
    await page.getByRole('option', { name: /Atribuído/i }).first().click();

    await expect(page.getByText(/leads ativos/i)).toBeVisible();
  });
});
