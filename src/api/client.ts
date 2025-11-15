/**
 * API клиент с поддержкой локализации
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export interface ApiOptions {
  lang?: 'ru' | 'en';
  headers?: Record<string, string>;
  [key: string]: any;
}

/**
 * Базовый GET запрос с поддержкой локали
 */
export async function apiGet<T>(
  endpoint: string, 
  options: ApiOptions = {}
): Promise<T> {
  const { lang, headers = {}, ...fetchOptions } = options;
  
  const url = new URL(endpoint, API_BASE_URL);
  
  // Добавляем параметр lang в URL
  if (lang) {
    url.searchParams.set('lang', lang);
  }
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept-Language': lang || 'en',
      'Content-Type': 'application/json',
      ...headers
    },
    ...fetchOptions
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Базовый POST запрос с поддержкой локали
 */
export async function apiPost<T>(
  endpoint: string, 
  data: any = {},
  options: ApiOptions = {}
): Promise<T> {
  const { lang, headers = {}, ...fetchOptions } = options;
  
  const url = new URL(endpoint, API_BASE_URL);
  
  // Добавляем параметр lang в URL
  if (lang) {
    url.searchParams.set('lang', lang);
  }
  
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Accept-Language': lang || 'en',
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify({
      ...data,
      lang // Добавляем lang в тело запроса для бэкенда
    }),
    ...fetchOptions
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Загружает сигналы с фильтрами
 */
export async function fetchSignals(
  filters: {
    min_impact?: number;
    min_confidence?: number;
    limit?: number;
    sector?: string;
    region?: string;
    sentiment?: string;
    date_from?: string;
    search?: string;
  } = {},
  lang: 'ru' | 'en' = 'en'
) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  return apiGet<any[]>(`/signals?${params.toString()}`, { lang });
}

/**
 * Загружает статистику
 */
export async function fetchStats(lang: 'ru' | 'en' = 'en') {
  return apiGet<any>('/stats', { lang });
}

/**
 * Генерирует аналитику для статьи
 */
export async function generateAnalysis(
  articleId: string,
  lang: 'ru' | 'en' = 'en'
) {
  return apiPost<any>(`/analysis/${articleId}`, { lang }, { lang });
}

/**
 * Генерирует Telegram дайджест
 */
export async function generateTelegramDigest(
  filters: {
    language?: 'ru' | 'en';
    sector?: string;
    min_impact?: number;
    min_confidence?: number;
  } = {},
  lang: 'ru' | 'en' = 'en'
) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  return apiGet<any>(`/telegram-digest?${params.toString()}`, { lang });
}

/**
 * Отправляет дайджест в Telegram
 */
export async function sendToTelegram(
  content: string,
  lang: 'ru' | 'en' = 'en'
) {
  return apiPost<any>('/telegram-send', { content }, { lang });
}

/**
 * Экспортирует данные в HTML
 */
export async function exportData(
  filters: {
    sector?: string;
    region?: string;
    min_impact?: number;
    min_confidence?: number;
  } = {},
  lang: 'ru' | 'en' = 'en'
) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  return apiGet<string>(`/export/html?${params.toString()}`, { lang });
}

/**
 * Запускает инжест новых данных
 */
export async function runIngest(
  sectors?: string[],
  lang: 'ru' | 'en' = 'en'
) {
  const params = new URLSearchParams();
  
  if (sectors && sectors.length > 0) {
    params.append('sectors', sectors.join(','));
  }
  
  return apiPost<any>(`/ingest-run?${params.toString()}`, {}, { lang });
}








