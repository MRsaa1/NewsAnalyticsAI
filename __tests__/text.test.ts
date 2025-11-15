/**
 * Unit тесты для утилит работы с текстом
 */

import {
  truncateByWords,
  normalizeTickers,
  detectLanguage,
  normalizeTitle,
  extractDomain,
  formatPercentage,
  formatNumber
} from '../src/utils/text';

describe('Text Utils', () => {
  describe('truncateByWords', () => {
    it('should return original text if within word limit', () => {
      const text = 'This is a short text';
      expect(truncateByWords(text, 10)).toBe(text);
    });

    it('should truncate text at word boundary', () => {
      const text = 'This is a very long text that should be truncated at word boundary';
      const result = truncateByWords(text, 5);
      expect(result).toBe('This is a very long…');
    });

    it('should handle empty string', () => {
      expect(truncateByWords('', 5)).toBe('');
    });

    it('should handle undefined', () => {
      expect(truncateByWords(undefined as any, 5)).toBe('');
    });
  });

  describe('normalizeTickers', () => {
    it('should separate concatenated tickers', () => {
      const input = 'MARARIOTBTC';
      const result = normalizeTickers(input);
      expect(result).toBe('BTC, MARA, RIOT');
    });

    it('should handle comma-separated tickers', () => {
      const input = 'BTC, ETH, MARA';
      const result = normalizeTickers(input);
      expect(result).toBe('BTC, ETH, MARA');
    });

    it('should filter out unknown tickers', () => {
      const input = 'BTC, UNKNOWN, ETH, FAKE';
      const result = normalizeTickers(input);
      expect(result).toBe('BTC, ETH');
    });

    it('should handle empty string', () => {
      expect(normalizeTickers('')).toBe('');
    });

    it('should handle mixed separators', () => {
      const input = 'BTC/ETH|MARA RIOT';
      const result = normalizeTickers(input);
      expect(result).toBe('BTC, ETH, MARA, RIOT');
    });

    it('should remove duplicates', () => {
      const input = 'BTC, ETH, BTC, MARA, ETH';
      const result = normalizeTickers(input);
      expect(result).toBe('BTC, ETH, MARA');
    });
  });

  describe('detectLanguage', () => {
    it('should detect Russian text', () => {
      expect(detectLanguage('Привет мир')).toBe('ru');
      expect(detectLanguage('Биткойн растет')).toBe('ru');
      expect(detectLanguage('САА Альянс')).toBe('ru');
    });

    it('should detect English text', () => {
      expect(detectLanguage('Hello world')).toBe('en');
      expect(detectLanguage('Bitcoin is rising')).toBe('en');
      expect(detectLanguage('SAA Alliance')).toBe('en');
    });

    it('should return unknown for mixed or other languages', () => {
      expect(detectLanguage('123456')).toBe('unknown');
      expect(detectLanguage('!@#$%')).toBe('unknown');
      expect(detectLanguage('')).toBe('unknown');
    });
  });

  describe('normalizeTitle', () => {
    it('should normalize title for deduplication', () => {
      const title = 'Bitcoin Hits $124,000 All-Time High';
      const result = normalizeTitle(title);
      expect(result).toBe('bitcoin hits alltime high');
    });

    it('should remove special characters and numbers', () => {
      const title = 'Test: Article #1 (2025) - $100M Deal!';
      const result = normalizeTitle(title);
      expect(result).toBe('test article m deal');
    });

    it('should handle empty string', () => {
      expect(normalizeTitle('')).toBe('');
    });
  });

  describe('extractDomain', () => {
    it('should extract domain from valid URL', () => {
      const url = 'https://example.com/path?query=1';
      expect(extractDomain(url)).toBe('example.com');
    });

    it('should return original string for invalid URL', () => {
      const invalid = 'not-a-url';
      expect(extractDomain(invalid)).toBe('not-a-url');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage for English locale', () => {
      expect(formatPercentage(0.751, 'en')).toBe('75%');
      expect(formatPercentage(0.75123, 'en')).toBe('75.1%');
    });

    it('should format percentage for Russian locale', () => {
      expect(formatPercentage(0.751, 'ru')).toBe('75%');
      expect(formatPercentage(0.75123, 'ru')).toBe('75,1%');
    });
  });

  describe('formatNumber', () => {
    it('should format number for English locale', () => {
      expect(formatNumber(1234567, 'en')).toBe('1,234,567');
    });

    it('should format number for Russian locale', () => {
      expect(formatNumber(1234567, 'ru')).toBe('1 234 567');
    });
  });
});








