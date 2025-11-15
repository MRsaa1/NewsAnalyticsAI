/**
 * Утилиты для дедупликации новостей
 */

import { normalizeTitle, extractDomain } from './text';

export interface Article {
  id: string;
  title: string;
  sourceUrl: string;
  sourceDomain?: string;
  [key: string]: any;
}

/**
 * Дедуплицирует массив статей по заголовку и источнику
 * @param articles - массив статей
 * @returns дедуплицированный массив
 */
export function dedupeArticles(articles: Article[]): Article[] {
  const seen = new Map<string, Article>();
  
  for (const article of articles) {
    const key = generateDedupeKey(article);
    
    // Если статья с таким ключом уже есть, оставляем ту, что была раньше
    if (!seen.has(key)) {
      seen.set(key, article);
    }
  }
  
  return Array.from(seen.values());
}

/**
 * Генерирует ключ для дедупликации
 * @param article - статья
 * @returns ключ для дедупликации
 */
function generateDedupeKey(article: Article): string {
  const normalizedTitle = normalizeTitle(article.title);
  const domain = article.sourceDomain || extractDomain(article.sourceUrl);
  
  return `${normalizedTitle}|${domain}`;
}

/**
 * Группирует статьи по темам для дополнительной фильтрации
 * @param articles - массив статей
 * @returns сгруппированные статьи
 */
export function groupArticlesByTopic(articles: Article[]): Article[][] {
  const groups = new Map<string, Article[]>();
  
  for (const article of articles) {
    // Создаем ключ группы на основе ключевых слов в заголовке
    const topicKey = extractTopicKey(article.title);
    
    if (!groups.has(topicKey)) {
      groups.set(topicKey, []);
    }
    
    groups.get(topicKey)!.push(article);
  }
  
  return Array.from(groups.values());
}

/**
 * Извлекает ключ темы из заголовка
 * @param title - заголовок статьи
 * @returns ключ темы
 */
function extractTopicKey(title: string): string {
  const words = normalizeTitle(title)
    .split(' ')
    .filter(word => word.length > 3) // берем только длинные слова
    .slice(0, 3) // максимум 3 слова
    .sort()
    .join(' ');
  
  return words || 'other';
}

/**
 * Фильтрует дубликаты по временной близости
 * @param articles - массив статей
 * @param timeWindowMs - временное окно в миллисекундах (по умолчанию 1 час)
 * @returns отфильтрованные статьи
 */
export function filterTemporalDuplicates(
  articles: Article[], 
  timeWindowMs: number = 60 * 60 * 1000
): Article[] {
  const filtered: Article[] = [];
  const seen = new Map<string, number>(); // ключ -> timestamp
  
  for (const article of articles) {
    const key = generateDedupeKey(article);
    const articleTime = new Date(article.ts_published || 0).getTime();
    
    const lastSeen = seen.get(key);
    
    if (!lastSeen || (articleTime - lastSeen) > timeWindowMs) {
      filtered.push(article);
      seen.set(key, articleTime);
    }
  }
  
  return filtered;
}








