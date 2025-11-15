#!/usr/bin/env python3
"""
Скрипт для очистки дублированных summary
"""

import sqlite3
import re

def clean_duplicate_summaries():
    """Очищаем дублированные summary"""
    print("🚀 Очистка дублированных summary...")
    
    conn = sqlite3.connect('signals.db')
    cursor = conn.cursor()
    
    # Находим записи с дублированными summary
    cursor.execute("""
        SELECT id, summary 
        FROM signals 
        WHERE summary IS NOT NULL 
        AND summary != ''
        AND (summary LIKE '%|%' OR summary LIKE '%...%')
        ORDER BY id DESC
        LIMIT 100
    """)
    
    records = cursor.fetchall()
    print(f"📊 Найдено {len(records)} записей для очистки")
    
    updated_count = 0
    
    for signal_id, summary in records:
        if not summary:
            continue
            
        # Убираем дублирование (русский | английский)
        if '|' in summary:
            # Берем только первую часть до |
            cleaned = summary.split('|')[0].strip()
        else:
            cleaned = summary
        
        # Убираем обрезанные слова в конце
        cleaned = re.sub(r'\s+[а-яё]{1,3}$', '', cleaned)  # убираем обрезанные русские слова
        cleaned = re.sub(r'\s+[a-z]{1,3}$', '', cleaned)   # убираем обрезанные английские слова
        
        # Убираем многоточие в конце
        cleaned = cleaned.rstrip('...')
        
        # Если summary стал слишком коротким, оставляем оригинал
        if len(cleaned) < 20:
            continue
        
        # Обновляем базу данных
        cursor.execute("""
            UPDATE signals 
            SET summary = ?
            WHERE id = ?
        """, (cleaned, signal_id))
        
        print(f"✅ Очищено: {summary[:50]}... → {cleaned[:50]}...")
        updated_count += 1
    
    conn.commit()
    conn.close()
    
    print(f"\n🎉 Очищено {updated_count} записей из {len(records)}")

if __name__ == "__main__":
    clean_duplicate_summaries()





