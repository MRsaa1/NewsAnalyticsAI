/**
 * Компоненты для отображения бейджей с локализацией
 */

import React from 'react';
import { useLocale } from '../context/LocaleProvider';
import { formatNumber } from '../utils/text';

interface ImpactBadgeProps {
  value: number;
  className?: string;
}

export function ImpactBadge({ value, className = '' }: ImpactBadgeProps) {
  const { t } = useLocale();
  
  const getImpactClass = (impact: number) => {
    if (impact >= 70) return 'meta-impact-high';
    if (impact >= 40) return 'meta-impact-medium';
    return 'meta-impact-low';
  };
  
  return (
    <span className={`meta-item ${getImpactClass(value)} ${className}`}>
      {t('impact')}: {formatNumber(value)}
    </span>
  );
}

interface ConfidenceBadgeProps {
  value: number;
  className?: string;
}

export function ConfidenceBadge({ value, className = '' }: ConfidenceBadgeProps) {
  const { t } = useLocale();
  
  const getConfidenceClass = (confidence: number) => {
    if (confidence >= 80) return 'meta-confidence-high';
    if (confidence >= 60) return 'meta-confidence-medium';
    return 'meta-confidence-low';
  };
  
  return (
    <span className={`meta-item ${getConfidenceClass(value)} ${className}`}>
      {t('confidence')}: {formatNumber(value)}%
    </span>
  );
}

interface SentimentBadgeProps {
  sentiment: number;
  className?: string;
}

export function SentimentBadge({ sentiment, className = '' }: SentimentBadgeProps) {
  const { t } = useLocale();
  
  const getSentimentInfo = (sentiment: number) => {
    if (sentiment > 0) return { emoji: '📈', text: t('bullish'), class: 'sentiment-bull' };
    if (sentiment < 0) return { emoji: '📉', text: t('bearish'), class: 'sentiment-bear' };
    return { emoji: '➡️', text: t('neutral'), class: 'sentiment-neutral' };
  };
  
  const { emoji, text, class: sentimentClass } = getSentimentInfo(sentiment);
  
  return (
    <span className={`meta-item ${sentimentClass} ${className}`}>
      {emoji} {text}
    </span>
  );
}

interface TickerBadgeProps {
  ticker: string;
  className?: string;
}

export function TickerBadge({ ticker, className = '' }: TickerBadgeProps) {
  return (
    <span 
      className={`ticker-badge ${className}`}
      style={{
        background: '#FFD700',
        color: '#000',
        padding: '2px 6px',
        borderRadius: '10px',
        marginRight: '5px',
        fontSize: '0.8em',
        fontWeight: 'bold'
      }}
    >
      {ticker}
    </span>
  );
}

interface SectorBadgeProps {
  sector: string;
  className?: string;
}

export function SectorBadge({ sector, className = '' }: SectorBadgeProps) {
  const { t } = useLocale();
  
  // Маппинг секторов на локализованные названия
  const getSectorName = (sector: string) => {
    const sectorMap: Record<string, string> = {
      'CRYPTO': t('crypto'),
      'FINTECH': t('fintech'),
      'BIOTECH': t('biotech'),
      'SEMIS': t('semis'),
      'ENERGY': t('energy'),
      'COMMODITIES': t('commodities'),
      'EMERGING_MARKETS': t('emergingMarkets'),
      'TECHNOLOGY': t('technology'),
      'TREASURY': t('treasury')
    };
    
    return sectorMap[sector] || sector;
  };
  
  return (
    <span className={`meta-item sector-badge ${className}`}>
      {getSectorName(sector)}
    </span>
  );
}

interface RegionBadgeProps {
  region: string;
  className?: string;
}

export function RegionBadge({ region, className = '' }: RegionBadgeProps) {
  const { t } = useLocale();
  
  // Маппинг регионов на локализованные названия
  const getRegionName = (region: string) => {
    const regionMap: Record<string, string> = {
      'US': t('us'),
      'EU': t('eu'),
      'ASIA': t('asia'),
      'GLOBAL': t('global')
    };
    
    return regionMap[region] || region;
  };
  
  return (
    <span className={`meta-item region-badge ${className}`}>
      {getRegionName(region)}
    </span>
  );
}








