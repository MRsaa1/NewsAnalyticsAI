/**
 * Утилиты для работы с текстом
 */

/**
 * Обрезает текст по словам с добавлением многоточия
 * @param text - исходный текст
 * @param maxWords - максимальное количество слов
 * @returns обрезанный текст
 */
export function truncateByWords(text: string, maxWords = 22): string {
  if (!text) return '';
  
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  
  return words.slice(0, maxWords).join(' ') + '…';
}

/**
 * Нормализует тикеры - разделяет слипшиеся символы
 * @param raw - исходная строка с тикерами
 * @returns нормализованная строка
 */
export function normalizeTickers(raw: string): string {
  if (!raw) return '';
  
  // Белый список известных тикеров
  const whitelist = new Set([
    'BTC', 'ETH', 'MARA', 'RIOT', 'BCH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOT',
    'AVAX', 'MATIC', 'LTC', 'UNI', 'LINK', 'ATOM', 'FIL', 'TRX', 'XLM', 'ALGO',
    'VET', 'ICP', 'COIN', 'MSTR', 'HOOD', 'SOFI', 'SQ', 'PYPL', 'V', 'MA',
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD', 'INTC',
    'SPY', 'QQQ', 'IWM', 'TLT', 'GLD', 'SLV', 'USO', 'UNG', 'DBA', 'DBC'
  ]);
  
  // Разделяем по разделителям
  const arr = raw.split(/[,\s/|]+/)
    .map(s => s.trim().toUpperCase())
    .filter(Boolean);
  
  const merged: string[] = [];
  
  // Разбиваем слипшиеся токены типа "MARARIOTBTC"
  for (const token of arr) {
    if (token.length > 4 && !whitelist.has(token)) {
      let buf = token;
      // Заменяем каждое известное слово на отдельный токен
      for (const word of Array.from(whitelist)) {
        buf = buf.replace(new RegExp(word, 'g'), ` ${word} `);
      }
      merged.push(...buf.split(/\s+/).filter(Boolean));
    } else {
      merged.push(token);
    }
  }
  
  // Фильтруем только известные тикеры и убираем дубликаты
  const unique = Array.from(new Set(merged.filter(t => whitelist.has(t))));
  
  return unique.join(', ');
}

/**
 * Определяет язык текста
 * @param text - текст для анализа
 * @returns язык текста
 */
export function detectLanguage(text: string): 'ru' | 'en' | 'unknown' {
  if (!text) return 'unknown';
  
  // Проверяем наличие кириллицы
  if (/[А-Яа-яЁё]/.test(text)) return 'ru';
  
  // Проверяем наличие латиницы
  if (/[A-Za-z]/.test(text)) return 'en';
  
  return 'unknown';
}

/**
 * Заглушка для перевода текста
 * TODO: подключить реальный перевод
 * @param text - текст для перевода
 * @param lang - целевой язык
 * @returns переведенный текст
 */
export async function translate(text: string, lang: 'ru' | 'en'): Promise<string> {
  // TODO: подключить реальный перевод
  return text;
}

/**
 * Нормализует заголовок для дедупликации
 * @param title - исходный заголовок
 * @returns нормализованный заголовок
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[$,\d,]+/g, '') // убираем числа и цены
    .replace(/[^\w\s]/g, '') // убираем знаки препинания
    .replace(/\s+/g, ' ') // нормализуем пробелы
    .trim();
}

/**
 * Извлекает домен из URL
 * @param url - URL
 * @returns домен
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * Локализует текст в зависимости от выбранного языка
 * @param text - исходный текст
 * @param lang - выбранный язык
 * @param fallbackText - текст-заглушка
 * @returns локализованный текст
 */
export function localizeText(
  text: string | undefined, 
  lang: 'ru' | 'en', 
  fallbackText?: string
): string {
  if (!text) return fallbackText || '';
  
  const detectedLang = detectLanguage(text);
  
  // Если язык текста совпадает с выбранным, возвращаем как есть
  if (detectedLang === lang) return text;
  
  // TODO: здесь можно добавить машинный перевод
  // Пока возвращаем оригинальный текст
  return text;
}

/**
 * Форматирует процентное значение
 * @param value - числовое значение (0-1)
 * @param locale - локаль для форматирования
 * @returns отформатированная строка
 */
export function formatPercentage(value: number, locale: 'ru' | 'en' = 'en'): string {
  return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(value);
}

/**
 * Форматирует число
 * @param value - числовое значение
 * @param locale - локаль для форматирования
 * @returns отформатированная строка
 */
export function formatNumber(value: number, locale: 'ru' | 'en' = 'en'): string {
  return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US').format(value);
}








