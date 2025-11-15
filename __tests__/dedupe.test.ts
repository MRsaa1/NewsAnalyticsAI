/**
 * Unit тесты для дедупликации
 */

import { dedupeArticles, groupArticlesByTopic, filterTemporalDuplicates } from '../src/utils/dedupe';

interface MockArticle {
  id: string;
  title: string;
  sourceUrl: string;
  sourceDomain?: string;
  ts_published?: string;
}

describe('Deduplication Utils', () => {
  describe('dedupeArticles', () => {
    it('should remove duplicate articles by title and domain', () => {
      const articles: MockArticle[] = [
        {
          id: '1',
          title: 'Bitcoin Hits $124,000 All-Time High',
          sourceUrl: 'https://example.com/news1',
          sourceDomain: 'example.com'
        },
        {
          id: '2',
          title: 'Bitcoin Hits $124,000 All-Time High',
          sourceUrl: 'https://example.com/news2',
          sourceDomain: 'example.com'
        },
        {
          id: '3',
          title: 'Bitcoin Hits $125,000 All-Time High',
          sourceUrl: 'https://example.com/news3',
          sourceDomain: 'example.com'
        }
      ];

      const result = dedupeArticles(articles);
      expect(result).toHaveLength(2);
      expect(result.map(a => a.id)).toEqual(['1', '3']);
    });

    it('should keep articles from different domains', () => {
      const articles: MockArticle[] = [
        {
          id: '1',
          title: 'Bitcoin Hits $124,000 All-Time High',
          sourceUrl: 'https://example1.com/news1',
          sourceDomain: 'example1.com'
        },
        {
          id: '2',
          title: 'Bitcoin Hits $124,000 All-Time High',
          sourceUrl: 'https://example2.com/news2',
          sourceDomain: 'example2.com'
        }
      ];

      const result = dedupeArticles(articles);
      expect(result).toHaveLength(2);
    });

    it('should normalize titles for comparison', () => {
      const articles: MockArticle[] = [
        {
          id: '1',
          title: 'Bitcoin Hits $124,000 All-Time High',
          sourceUrl: 'https://example.com/news1',
          sourceDomain: 'example.com'
        },
        {
          id: '2',
          title: 'Bitcoin Hits $125,000 All-Time High',
          sourceUrl: 'https://example.com/news2',
          sourceDomain: 'example.com'
        }
      ];

      const result = dedupeArticles(articles);
      expect(result).toHaveLength(1);
    });

    it('should handle empty array', () => {
      expect(dedupeArticles([])).toEqual([]);
    });
  });

  describe('groupArticlesByTopic', () => {
    it('should group articles by topic keywords', () => {
      const articles: MockArticle[] = [
        {
          id: '1',
          title: 'Bitcoin Price Surges to New High',
          sourceUrl: 'https://example.com/news1'
        },
        {
          id: '2',
          title: 'Bitcoin Market Analysis Shows Bullish Trend',
          sourceUrl: 'https://example.com/news2'
        },
        {
          id: '3',
          title: 'Ethereum Development Update',
          sourceUrl: 'https://example.com/news3'
        }
      ];

      const result = groupArticlesByTopic(articles);
      expect(result).toHaveLength(3); // Different topics
    });

    it('should handle articles with short titles', () => {
      const articles: MockArticle[] = [
        {
          id: '1',
          title: 'BTC',
          sourceUrl: 'https://example.com/news1'
        },
        {
          id: '2',
          title: 'ETH',
          sourceUrl: 'https://example.com/news2'
        }
      ];

      const result = groupArticlesByTopic(articles);
      expect(result).toHaveLength(2);
    });
  });

  describe('filterTemporalDuplicates', () => {
    it('should filter duplicates within time window', () => {
      const baseTime = new Date('2025-01-01T12:00:00Z').getTime();
      const articles: MockArticle[] = [
        {
          id: '1',
          title: 'Bitcoin Hits $124,000',
          sourceUrl: 'https://example.com/news1',
          ts_published: new Date(baseTime).toISOString()
        },
        {
          id: '2',
          title: 'Bitcoin Hits $124,000',
          sourceUrl: 'https://example.com/news2',
          ts_published: new Date(baseTime + 30 * 60 * 1000).toISOString() // 30 minutes later
        },
        {
          id: '3',
          title: 'Bitcoin Hits $124,000',
          sourceUrl: 'https://example.com/news3',
          ts_published: new Date(baseTime + 2 * 60 * 60 * 1000).toISOString() // 2 hours later
        }
      ];

      const result = filterTemporalDuplicates(articles, 60 * 60 * 1000); // 1 hour window
      expect(result).toHaveLength(2); // First and third articles
    });

    it('should keep articles outside time window', () => {
      const baseTime = new Date('2025-01-01T12:00:00Z').getTime();
      const articles: MockArticle[] = [
        {
          id: '1',
          title: 'Bitcoin Hits $124,000',
          sourceUrl: 'https://example.com/news1',
          ts_published: new Date(baseTime).toISOString()
        },
        {
          id: '2',
          title: 'Bitcoin Hits $124,000',
          sourceUrl: 'https://example.com/news2',
          ts_published: new Date(baseTime + 2 * 60 * 60 * 1000).toISOString() // 2 hours later
        }
      ];

      const result = filterTemporalDuplicates(articles, 60 * 60 * 1000); // 1 hour window
      expect(result).toHaveLength(2); // Both articles kept
    });
  });
});








