/**
 * E2E тесты для проверки локализации
 */

import { test, expect } from '@playwright/test';

test.describe('Localization Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should switch language from English to Russian', async ({ page }) => {
    // Проверяем начальное состояние (английский)
    await expect(page.locator('[data-testid="load-signals-btn"]')).toContainText('LOAD SIGNALS');
    await expect(page.locator('[data-testid="telegram-digest-btn"]')).toContainText('TELEGRAM DIGEST');
    await expect(page.locator('[data-testid="export-data-btn"]')).toContainText('EXPORT DATA');

    // Переключаем на русский
    await page.click('[data-testid="lang-toggle-btn"]');

    // Проверяем, что интерфейс переключился на русский
    await expect(page.locator('[data-testid="load-signals-btn"]')).toContainText('ЗАГРУЗИТЬ СИГНАЛЫ');
    await expect(page.locator('[data-testid="telegram-digest-btn"]')).toContainText('TELEGRAM ДАЙДЖЕСТ');
    await expect(page.locator('[data-testid="export-data-btn"]')).toContainText('ЭКСПОРТ ДАННЫХ');
  });

  test('should switch language from Russian to English', async ({ page }) => {
    // Переключаем на русский
    await page.click('[data-testid="lang-toggle-btn"]');
    await page.waitForTimeout(500);

    // Переключаем обратно на английский
    await page.click('[data-testid="lang-toggle-btn"]');

    // Проверяем, что интерфейс переключился на английский
    await expect(page.locator('[data-testid="load-signals-btn"]')).toContainText('LOAD SIGNALS');
    await expect(page.locator('[data-testid="telegram-digest-btn"]')).toContainText('TELEGRAM DIGEST');
    await expect(page.locator('[data-testid="export-data-btn"]')).toContainText('EXPORT DATA');
  });

  test('should show consistent language in news cards', async ({ page }) => {
    // Загружаем новости
    await page.selectOption('[data-testid="sector-select"]', 'CRYPTO');
    await page.fill('[data-testid="impact-input"]', '80');
    await page.click('[data-testid="load-signals-btn"]');
    
    await page.waitForSelector('[data-testid="news-card"]', { timeout: 10000 });

    // Проверяем, что в карточках нет смешения языков на английском
    const englishCards = page.locator('[data-testid="news-card"]');
    const cardCount = await englishCards.count();

    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      const card = englishCards.nth(i);
      
      // Проверяем, что метки на английском
      await expect(card.locator('[data-testid="impact-badge"]')).toContainText('Impact:');
      await expect(card.locator('[data-testid="confidence-badge"]')).toContainText('Confidence:');
      await expect(card.locator('[data-testid="tickers-label"]')).toContainText('Tickers:');
      await expect(card.locator('[data-testid="analytics-btn"]')).toContainText('Analytics');
    }
  });

  test('should show consistent language in news cards in Russian', async ({ page }) => {
    // Переключаем на русский
    await page.click('[data-testid="lang-toggle-btn"]');
    await page.waitForTimeout(500);

    // Загружаем новости
    await page.selectOption('[data-testid="sector-select"]', 'CRYPTO');
    await page.fill('[data-testid="impact-input"]', '80');
    await page.click('[data-testid="load-signals-btn"]');
    
    await page.waitForSelector('[data-testid="news-card"]', { timeout: 10000 });

    // Проверяем, что в карточках нет смешения языков на русском
    const russianCards = page.locator('[data-testid="news-card"]');
    const cardCount = await russianCards.count();

    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      const card = russianCards.nth(i);
      
      // Проверяем, что метки на русском
      await expect(card.locator('[data-testid="impact-badge"]')).toContainText('Влияние:');
      await expect(card.locator('[data-testid="confidence-badge"]')).toContainText('Достоверность:');
      await expect(card.locator('[data-testid="tickers-label"]')).toContainText('Тикеры:');
      await expect(card.locator('[data-testid="analytics-btn"]')).toContainText('Аналитика');
    }
  });

  test('should not show duplicate analytics headers', async ({ page }) => {
    // Загружаем новости
    await page.selectOption('[data-testid="sector-select"]', 'CRYPTO');
    await page.fill('[data-testid="impact-input"]', '80');
    await page.click('[data-testid="load-signals-btn"]');
    
    await page.waitForSelector('[data-testid="news-card"]', { timeout: 10000 });

    // Открываем аналитику в первой карточке
    const firstCard = page.locator('[data-testid="news-card"]').first();
    await firstCard.locator('[data-testid="analytics-btn"]').click();

    // Проверяем, что заголовок аналитики не дублируется
    const analysisSection = firstCard.locator('[data-testid="analysis-section"]');
    const headers = analysisSection.locator('h1, h2, h3, h4, h5, h6, .analysis-header');
    
    // Должен быть только один заголовок
    await expect(headers).toHaveCount(1);
  });

  test('should normalize tickers correctly', async ({ page }) => {
    // Загружаем новости
    await page.selectOption('[data-testid="sector-select"]', 'CRYPTO');
    await page.fill('[data-testid="impact-input"]', '80');
    await page.click('[data-testid="load-signals-btn"]');
    
    await page.waitForSelector('[data-testid="news-card"]', { timeout: 10000 });

    // Проверяем нормализацию тикеров в карточках
    const cards = page.locator('[data-testid="news-card"]');
    const cardCount = await cards.count();

    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      const card = cards.nth(i);
      const tickers = card.locator('[data-testid="ticker-badge"]');
      const tickerCount = await tickers.count();

      if (tickerCount > 0) {
        // Проверяем, что тикеры разделены запятыми
        const tickerText = await card.locator('[data-testid="tickers-section"]').textContent();
        
        // Не должно быть слипшихся тикеров типа "MARARIOTBTC"
        expect(tickerText).not.toMatch(/[A-Z]{8,}/);
        
        // Должны быть только известные тикеры
        const tickerValues = await tickers.allTextContents();
        for (const ticker of tickerValues) {
          expect(ticker).toMatch(/^[A-Z]{2,5}$/);
        }
      }
    }
  });

  test('should truncate text at word boundaries', async ({ page }) => {
    // Загружаем новости
    await page.selectOption('[data-testid="sector-select"]', 'CRYPTO');
    await page.fill('[data-testid="impact-input"]', '80');
    await page.click('[data-testid="load-signals-btn"]');
    
    await page.waitForSelector('[data-testid="news-card"]', { timeout: 10000 });

    // Проверяем, что текст не обрывается посреди слова
    const cards = page.locator('[data-testid="news-card"]');
    const firstCard = cards.first();
    
    const summaryText = await firstCard.locator('[data-testid="summary-text"]').textContent();
    
    if (summaryText && summaryText.endsWith('…')) {
      // Если текст обрезан, проверяем, что обрезка произошла после пробела
      const beforeEllipsis = summaryText.slice(0, -1);
      expect(beforeEllipsis).not.toMatch(/\w$/); // Не должно заканчиваться буквой
    }
  });

  test('should persist language selection in localStorage', async ({ page }) => {
    // Переключаем на русский
    await page.click('[data-testid="lang-toggle-btn"]');
    await page.waitForTimeout(500);

    // Проверяем, что язык сохранился в localStorage
    const storedLocale = await page.evaluate(() => localStorage.getItem('locale'));
    expect(storedLocale).toBe('ru');

    // Перезагружаем страницу
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Проверяем, что язык сохранился
    await expect(page.locator('[data-testid="load-signals-btn"]')).toContainText('ЗАГРУЗИТЬ СИГНАЛЫ');
  });

  test('should update URL with language parameter', async ({ page }) => {
    // Переключаем на русский
    await page.click('[data-testid="lang-toggle-btn"]');
    await page.waitForTimeout(500);

    // Проверяем, что URL обновился
    const url = page.url();
    expect(url).toContain('lang=ru');

    // Переключаем на английский
    await page.click('[data-testid="lang-toggle-btn"]');
    await page.waitForTimeout(500);

    // Проверяем, что URL обновился
    const updatedUrl = page.url();
    expect(updatedUrl).toContain('lang=en');
  });
});








