#!/usr/bin/env python3
"""
Скрипт для исправления дат в аналитике
"""

import sqlite3
import re
from datetime import datetime

def fix_dates_in_analysis():
    """Исправляем даты в аналитике"""
    print("🚀 Исправление дат в аналитике...")
    
    conn = sqlite3.connect('signals.db')
    cursor = conn.cursor()
    
    # Находим аналитику с неправильными датами
    cursor.execute("""
        SELECT id, analysis, title 
        FROM signals 
        WHERE analysis IS NOT NULL 
        AND analysis != ''
        AND (analysis LIKE '%2023%' OR analysis LIKE '%2024%')
        ORDER BY id DESC
        LIMIT 50
    """)
    
    records = cursor.fetchall()
    print(f"📊 Найдено {len(records)} записей с устаревшими датами")
    
    updated_count = 0
    current_year = 2025
    
    for signal_id, analysis, title in records:
        if not analysis:
            continue
            
        # Заменяем старые годы на 2025
        fixed_analysis = analysis
        fixed_analysis = re.sub(r'\b2023\b', '2025', fixed_analysis)
        fixed_analysis = re.sub(r'\b2024\b', '2025', fixed_analysis)
        
        # Если что-то изменилось, обновляем
        if fixed_analysis != analysis:
            cursor.execute("""
                UPDATE signals 
                SET analysis = ?
                WHERE id = ?
            """, (fixed_analysis, signal_id))
            
            print(f"✅ Обновлено: {title[:50]}...")
            updated_count += 1
    
    conn.commit()
    conn.close()
    
    print(f"\n🎉 Обновлено {updated_count} записей из {len(records)}")

if __name__ == "__main__":
    fix_dates_in_analysis()








