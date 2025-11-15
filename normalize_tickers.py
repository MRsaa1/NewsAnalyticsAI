#!/usr/bin/env python3
"""
Скрипт для нормализации тикеров
"""

import sqlite3
import re

def normalize_tickers():
    """Нормализуем тикеры в базе данных"""
    print("🚀 Нормализация тикеров...")
    
    conn = sqlite3.connect('signals.db')
    cursor = conn.cursor()
    
    # Находим записи с некорректными тикерами
    cursor.execute("""
        SELECT id, tickers_json 
        FROM signals 
        WHERE tickers_json IS NOT NULL 
        AND tickers_json != ''
        AND tickers_json != '[]'
        ORDER BY id DESC
        LIMIT 100
    """)
    
    records = cursor.fetchall()
    print(f"📊 Найдено {len(records)} записей для нормализации")
    
    # Список известных тикеров
    known_tickers = {
        'BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOGE', 'DOT', 'AVAX', 'MATIC',
        'LTC', 'UNI', 'LINK', 'ATOM', 'FIL', 'TRX', 'XLM', 'ALGO', 'VET', 'ICP',
        'MARA', 'RIOT', 'COIN', 'MSTR', 'HOOD', 'SOFI', 'SQ', 'PYPL', 'V', 'MA',
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD', 'INTC',
        'SPY', 'QQQ', 'IWM', 'TLT', 'GLD', 'SLV', 'USO', 'UNG', 'DBA', 'DBC'
    }
    
    updated_count = 0
    
    for signal_id, tickers_str in records:
        if not tickers_str:
            continue
            
        # Парсим тикеры
        try:
            # Убираем скобки и кавычки
            clean_tickers = tickers_str.strip('[]"\'')
            
            # Разделяем по запятым и убираем пробелы
            ticker_list = [t.strip().upper() for t in clean_tickers.split(',') if t.strip()]
            
            # Объединяем слипшиеся тикеры (например MARARIOTBTC -> MARA, RIOT, BTC)
            normalized_tickers = []
            for ticker in ticker_list:
                if len(ticker) > 6:  # Слишком длинный тикер - вероятно слипшийся
                    # Пытаемся разделить по известным тикерам
                    found_tickers = []
                    remaining = ticker
                    
                    for known in sorted(known_tickers, key=len, reverse=True):
                        if known in remaining:
                            found_tickers.append(known)
                            remaining = remaining.replace(known, '')
                    
                    if found_tickers:
                        normalized_tickers.extend(found_tickers)
                    else:
                        # Если не удалось разделить, оставляем как есть
                        normalized_tickers.append(ticker)
                else:
                    normalized_tickers.append(ticker)
            
            # Убираем дубликаты и сортируем
            final_tickers = sorted(list(set(normalized_tickers)))
            
            # Обновляем базу данных
            cursor.execute("""
                UPDATE signals 
                SET tickers_json = ?
                WHERE id = ?
            """, (','.join(final_tickers), signal_id))
            
            if final_tickers != ticker_list:
                print(f"✅ Нормализовано: {tickers_str} → {','.join(final_tickers)}")
                updated_count += 1
                
        except Exception as e:
            print(f"❌ Ошибка обработки {tickers_str}: {e}")
    
    conn.commit()
    conn.close()
    
    print(f"\n🎉 Нормализовано {updated_count} записей из {len(records)}")

if __name__ == "__main__":
    normalize_tickers()
