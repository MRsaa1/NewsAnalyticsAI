import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Словари локализации
const resources = {
  en: {
    translation: {
      // Общие элементы
      impact: 'Impact',
      confidence: 'Confidence',
      bullish: 'Bullish',
      bearish: 'Bearish',
      neutral: 'Neutral',
      tickers: 'Tickers',
      
      // Статистика
      totalSignals: 'TOTAL SIGNALS',
      highImpact: 'HIGH IMPACT (70+)',
      mediumImpact: 'MEDIUM IMPACT',
      avgReliability: 'AVG. RELIABILITY',
      bullishSignals: 'BULLISH SIGNALS',
      bearishSignals: 'BEARISH SIGNALS',
      activeSectors: 'ACTIVE SECTORS',
      regions: 'REGIONS',
      
      // Кнопки и действия
      loadSignals: 'LOAD SIGNALS',
      telegramDigest: 'TELEGRAM DIGEST',
      exportData: 'EXPORT DATA',
      
      // Аналитика
      analytics: 'Analytics',
      analysisHeader: 'SAA Alliance Analytics',
      analysisPlaceholder: 'Analysis for this news is not yet generated. Click the generate button above.',
      
      // Интерфейс
      investmentSignals: 'Investment Signals',
      selectFilters: 'Select filter parameters above and click LOAD SIGNALS button',
      search: 'Search news...',
      
      // Фильтры
      sector: 'Sector',
      marketSentiment: 'Market Sentiment',
      region: 'Region',
      minImpact: 'Min. Impact',
      minConfidence: 'Min. Confidence',
      newsDate: 'News Date',
      
      // Секторы
      allSectors: 'All Sectors',
      crypto: 'CRYPTO',
      fintech: 'FINTECH',
      biotech: 'BIOTECH',
      semis: 'SEMIS',
      energy: 'ENERGY',
      commodities: 'COMMODITIES',
      emergingMarkets: 'EMERGING MARKETS',
      technology: 'TECHNOLOGY',
      treasury: 'TREASURY',
      
      // Регионы
      allRegions: 'All Regions',
      us: 'US',
      eu: 'EU',
      asia: 'Asia',
      global: 'Global',
      
      // Настроение
      allSentiments: 'All Sentiments',
      
      // Языки
      language: 'Language',
      english: 'English',
      russian: 'Russian'
    }
  },
  ru: {
    translation: {
      // Общие элементы
      impact: 'Влияние',
      confidence: 'Достоверность',
      bullish: 'Бычий',
      bearish: 'Медвежий',
      neutral: 'Нейтральный',
      tickers: 'Тикеры',
      
      // Статистика
      totalSignals: 'ВСЕГО СИГНАЛОВ',
      highImpact: 'ВЫСОКОЕ ВЛИЯНИЕ (70+)',
      mediumImpact: 'СРЕДНЕЕ ВЛИЯНИЕ',
      avgReliability: 'СР. ДОСТОВЕРНОСТЬ',
      bullishSignals: 'БЫЧЬИ СИГНАЛЫ',
      bearishSignals: 'МЕДВЕЖЬИ СИГНАЛЫ',
      activeSectors: 'АКТИВНЫХ СЕКТОРОВ',
      regions: 'РЕГИОНОВ',
      
      // Кнопки и действия
      loadSignals: 'ЗАГРУЗИТЬ СИГНАЛЫ',
      telegramDigest: 'TELEGRAM ДАЙДЖЕСТ',
      exportData: 'ЭКСПОРТ ДАННЫХ',
      
      // Аналитика
      analytics: 'Аналитика',
      analysisHeader: 'SAA Alliance Аналитика',
      analysisPlaceholder: 'Аналитика для этой новости еще не сгенерирована. Нажмите на кнопку генерации выше.',
      
      // Интерфейс
      investmentSignals: 'Инвестиционные сигналы',
      selectFilters: 'Выберите параметры фильтрации выше и нажмите кнопку ЗАГРУЗИТЬ СИГНАЛЫ',
      search: 'Поиск новостей...',
      
      // Фильтры
      sector: 'Сектор',
      marketSentiment: 'Настроение рынка',
      region: 'Регион',
      minImpact: 'Мин. влияние',
      minConfidence: 'Мин. достоверность',
      newsDate: 'Дата новостей',
      
      // Секторы
      allSectors: 'Все секторы',
      crypto: 'КРИПТО',
      fintech: 'ФИНТЕХ',
      biotech: 'БИОТЕХ',
      semis: 'ПОЛУПРОВОДНИКИ',
      energy: 'ЭНЕРГЕТИКА',
      commodities: 'СЫРЬЕ',
      emergingMarkets: 'РАЗВИВАЮЩИЕСЯ РЫНКИ',
      technology: 'ТЕХНОЛОГИИ',
      treasury: 'КАЗНАЧЕЙСТВО',
      
      // Регионы
      allRegions: 'Все регионы',
      us: 'США',
      eu: 'ЕС',
      asia: 'Азия',
      global: 'Глобально',
      
      // Настроение
      allSentiments: 'Все настроения',
      
      // Языки
      language: 'Язык',
      english: 'Английский',
      russian: 'Русский'
    }
  }
};

// Инициализация i18next
i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // язык по умолчанию
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18next;
export const t = i18next.t.bind(i18next);








