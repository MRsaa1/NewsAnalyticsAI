#!/usr/bin/env python3
"""
Скрипт для исправления настроения крипто новостей
"""

import sqlite3
import re

def fix_crypto_sentiment():
    """Исправляем настроение для крипто новостей"""
    print("🚀 Исправление настроения крипто новостей...")
    
    conn = sqlite3.connect('signals.db')
    cursor = conn.cursor()
    
    # Находим крипто новости с нейтральным настроением
    cursor.execute("""
        SELECT id, title, sentiment 
        FROM signals 
        WHERE sector = 'CRYPTO' 
        AND sentiment = 0
        ORDER BY impact DESC
    """)
    
    crypto_news = cursor.fetchall()
    print(f"📊 Найдено {len(crypto_news)} крипто новостей с нейтральным настроением")
    
    # Ключевые слова для определения bullish настроения
    bullish_keywords = [
        'surge', 'rise', 'rally', 'gain', 'increase', 'up', 'high', 'record', 'breakthrough',
        'bullish', 'positive', 'growth', 'momentum', 'break', 'surpass', 'exceed',
        'bitcoin price hits', 'ethereum gains', 'crypto rally', 'digital assets rise',
        'market cap', 'trading volume', 'investor confidence', 'adoption'
    ]
    
    bearish_keywords = [
        'fall', 'drop', 'decline', 'crash', 'plunge', 'down', 'low', 'bearish', 'negative',
        'sell-off', 'correction', 'volatility', 'uncertainty', 'risk', 'concern'
    ]
    
    updated_count = 0
    
    for signal_id, title, current_sentiment in crypto_news:
        title_lower = title.lower()
        
        # Подсчитываем bullish и bearish слова
        bullish_score = sum(1 for keyword in bullish_keywords if keyword in title_lower)
        bearish_score = sum(1 for keyword in bearish_keywords if keyword in title_lower)
        
        new_sentiment = 0  # по умолчанию нейтральный
        
        if bullish_score > bearish_score:
            new_sentiment = 1  # bullish
        elif bearish_score > bullish_score:
            new_sentiment = -1  # bearish
        
        # Если есть специфичные крипто паттерны
        if any(pattern in title_lower for pattern in ['price hits', 'reaches new', 'all-time high', 'ath']):
            new_sentiment = 1  # bullish
        elif any(pattern in title_lower for pattern in ['plunge', 'crash', 'dip']):
            new_sentiment = -1  # bearish
        
        # Обновляем если настроение изменилось
        if new_sentiment != current_sentiment:
            cursor.execute("""
                UPDATE signals 
                SET sentiment = ?
                WHERE id = ?
            """, (new_sentiment, signal_id))
            
            sentiment_text = {1: 'Bullish', -1: 'Bearish', 0: 'Neutral'}[new_sentiment]
            print(f"✅ Обновлено: {title[:50]}... → {sentiment_text}")
            updated_count += 1
    
    conn.commit()
    conn.close()
    
    print(f"\n🎉 Обновлено {updated_count} новостей из {len(crypto_news)}")

if __name__ == "__main__":
    fix_crypto_sentiment()





