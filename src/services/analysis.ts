/**
 * Сервис для работы с аналитикой
 */

import { apiPost } from '../api/client';
import { detectLanguage, translate } from '../utils/text';

export interface AnalysisRequest {
  articleId: string;
  title: string;
  content?: string;
  lang: 'ru' | 'en';
}

export interface AnalysisResponse {
  title_ru?: string;
  analysis: string;
  language_detected: 'ru' | 'en' | 'unknown';
}

/**
 * Генерирует аналитику для статьи
 */
export async function generateAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
  try {
    // Отправляем запрос на генерацию аналитики
    const response = await apiPost<AnalysisResponse>(
      `/analysis/${request.articleId}`,
      {
        title: request.title,
        content: request.content,
        lang: request.lang
      },
      { lang: request.lang }
    );

    // Проверяем язык сгенерированной аналитики
    const detectedLang = detectLanguage(response.analysis);
    response.language_detected = detectedLang;

    // Если язык не совпадает с запрошенным, пытаемся перевести
    if (detectedLang !== request.lang && detectedLang !== 'unknown') {
      try {
        response.analysis = await translate(response.analysis, request.lang);
        response.language_detected = request.lang;
      } catch (translationError) {
        console.warn('Translation failed:', translationError);
        // Оставляем оригинальную аналитику
      }
    }

    return response;
  } catch (error) {
    console.error('Analysis generation failed:', error);
    throw new Error('Failed to generate analysis');
  }
}

/**
 * Валидирует качество аналитики
 */
export function validateAnalysis(analysis: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Проверяем длину
  if (analysis.length < 50) {
    issues.push('Analysis too short');
  }

  if (analysis.length > 2000) {
    issues.push('Analysis too long');
  }

  // Проверяем наличие ключевых элементов
  const hasImpactAnalysis = /\b(impact|влияние|effect|эффект)\b/i.test(analysis);
  const hasMarketAnalysis = /\b(market|рынок|sector|сектор)\b/i.test(analysis);
  const hasActionableInsights = /\b(should|следует|recommend|рекомендуем|buy|sell|покупать|продавать)\b/i.test(analysis);

  if (!hasImpactAnalysis) {
    issues.push('Missing impact analysis');
  }

  if (!hasMarketAnalysis) {
    issues.push('Missing market analysis');
  }

  if (!hasActionableInsights) {
    issues.push('Missing actionable insights');
  }

  // Проверяем на спам или низкое качество
  const spamIndicators = [
    /lorem ipsum/i,
    /test content/i,
    /placeholder/i,
    /заглушка/i,
    /тестовый контент/i
  ];

  const hasSpam = spamIndicators.some(pattern => pattern.test(analysis));
  if (hasSpam) {
    issues.push('Contains spam or placeholder content');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Кеширует аналитику с учетом языка
 */
class AnalysisCache {
  private cache = new Map<string, AnalysisResponse>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа

  getKey(articleId: string, lang: 'ru' | 'en'): string {
    return `${articleId}:${lang}`;
  }

  get(articleId: string, lang: 'ru' | 'en'): AnalysisResponse | null {
    const key = this.getKey(articleId, lang);
    const cached = this.cache.get(key);
    
    if (!cached) return null;

    // Проверяем TTL (в реальном приложении нужно хранить timestamp)
    return cached;
  }

  set(articleId: string, lang: 'ru' | 'en', analysis: AnalysisResponse): void {
    const key = this.getKey(articleId, lang);
    this.cache.set(key, analysis);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const analysisCache = new AnalysisCache();

/**
 * Получает аналитику с кешированием
 */
export async function getAnalysis(
  articleId: string,
  lang: 'ru' | 'en',
  title: string,
  content?: string
): Promise<AnalysisResponse> {
  // Проверяем кеш
  const cached = analysisCache.get(articleId, lang);
  if (cached) {
    return cached;
  }

  // Генерируем новую аналитику
  const analysis = await generateAnalysis({
    articleId,
    title,
    content,
    lang
  });

  // Валидируем качество
  const validation = validateAnalysis(analysis.analysis);
  if (!validation.isValid) {
    console.warn('Analysis validation failed:', validation.issues);
  }

  // Кешируем результат
  analysisCache.set(articleId, lang, analysis);

  return analysis;
}








