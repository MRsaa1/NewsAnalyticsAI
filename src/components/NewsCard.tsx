/**
 * Компонент карточки новости с полной локализацией
 */

import React, { useState, useMemo } from 'react';
import { useLocale } from '../context/LocaleProvider';
import { truncateByWords, normalizeTickers, localizeText, detectLanguage, translate } from '../utils/text';
import { 
  ImpactBadge, 
  ConfidenceBadge, 
  SentimentBadge, 
  TickerBadge, 
  SectorBadge, 
  RegionBadge 
} from './Badges';

interface NewsCardProps {
  article: {
    id: string;
    title: string;
    title_ru?: string;
    summary?: string;
    summary_ru?: string;
    analysis?: string;
    sector: string;
    label: string;
    region: string;
    impact: number;
    confidence: number;
    sentiment: number;
    tickers_json?: string;
    source_domain: string;
    url?: string;
  };
}

export function NewsCard({ article }: NewsCardProps) {
  const { locale, t } = useLocale();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showTitleTranslation, setShowTitleTranslation] = useState(false);

  // Локализованный заголовок
  const localizedTitle = useMemo(() => {
    if (locale === 'ru' && article.title_ru) {
      return article.title_ru;
    }
    return article.title;
  }, [article.title, article.title_ru, locale]);

  // Локализованное описание
  const localizedSummary = useMemo(() => {
    return localizeText(
      locale === 'ru' ? article.summary_ru : article.summary,
      locale,
      article.summary
    );
  }, [article.summary, article.summary_ru, locale]);

  // Локализованная аналитика
  const localizedAnalysis = useMemo(() => {
    if (!article.analysis) return null;
    
    const detectedLang = detectLanguage(article.analysis);
    
    // Если аналитика на нужном языке, возвращаем как есть
    if (detectedLang === locale) {
      return article.analysis;
    }
    
    // TODO: здесь можно добавить машинный перевод
    // Пока возвращаем оригинальную аналитику
    return article.analysis;
  }, [article.analysis, locale]);

  // Нормализованные тикеры
  const normalizedTickers = useMemo(() => {
    if (!article.tickers_json) return [];
    
    const normalized = normalizeTickers(article.tickers_json);
    return normalized ? normalized.split(', ') : [];
  }, [article.tickers_json]);

  // Проверяем, есть ли перевод заголовка
  const hasTitleTranslation = article.title_ru && article.title_ru !== article.title;

  // Проверяем, есть ли аналитика
  const hasAnalysis = article.analysis && article.analysis.trim().length > 0;

  const toggleAnalysis = () => {
    setShowAnalysis(!showAnalysis);
  };

  const toggleTitleTranslation = () => {
    setShowTitleTranslation(!showTitleTranslation);
  };

  return (
    <div className="signal-item" style={{
      background: '#333',
      border: '1px solid #555',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '15px',
      transition: 'all 0.3s ease',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      maxWidth: '100%'
    }}>
      {/* Заголовок */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div 
          className="signal-title" 
          style={{
            color: '#fff',
            fontSize: '1.1em',
            marginBottom: '10px',
            fontWeight: 'bold',
            flex: 1
          }}
        >
          {showTitleTranslation && hasTitleTranslation ? article.title : localizedTitle}
        </div>
        
        {/* Кнопка переключения языка заголовка */}
        {hasTitleTranslation && (
          <button
            onClick={toggleTitleTranslation}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              marginLeft: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            🌐 {showTitleTranslation ? locale.toUpperCase() : (locale === 'ru' ? 'EN' : 'RU')}
          </button>
        )}
      </div>

      {/* Мета-информация */}
      <div className="signal-meta" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '10px'
      }}>
        <SectorBadge sector={article.sector} />
        <span className="meta-item">{article.label}</span>
        <RegionBadge region={article.region} />
        <ImpactBadge value={article.impact} />
        <ConfidenceBadge value={article.confidence} />
        <SentimentBadge sentiment={article.sentiment} />
        <span className="meta-item">{article.source_domain}</span>
      </div>

      {/* Описание */}
      {localizedSummary && (
        <div style={{
          color: '#ccc',
          marginTop: '10px',
          wordWrap: 'break-word',
          lineHeight: '1.5',
          maxWidth: '100%',
          overflowWrap: 'break-word'
        }}>
          {truncateByWords(localizedSummary, 22)}
        </div>
      )}

      {/* Тикеры */}
      {normalizedTickers.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>{t('tickers')}: </strong>
          {normalizedTickers.map((ticker, index) => (
            <TickerBadge key={index} ticker={ticker} />
          ))}
        </div>
      )}

      {/* Кнопка аналитики */}
      <div style={{ marginTop: '15px' }}>
        <button
          onClick={toggleAnalysis}
          style={{
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            color: '#000',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📊 SAA Alliance {t('analytics')}
        </button>

        {/* Аналитика */}
        {showAnalysis && (
          <div style={{
            marginTop: '10px',
            padding: '15px',
            background: '#2a2a2a',
            borderLeft: '4px solid #FFD700',
            borderRadius: '4px'
          }}>
            <div style={{
              color: '#ddd',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}>
              {hasAnalysis ? localizedAnalysis : t('analysisPlaceholder')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}








