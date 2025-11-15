#!/usr/bin/env python3
"""
Скрипт для добавления дедупликации новостей
"""

import sqlite3
from difflib import SequenceMatcher
import re

def similarity(a, b):
    """Вычисляем схожесть двух строк"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def extract_keywords(text):
    """Извлекаем ключевые слова из текста"""
    # Убираем стоп-слова и извлекаем важные слова
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'}
    
    # Извлекаем слова длиннее 3 символов
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    keywords = [word for word in words if word not in stop_words]
    
    return set(keywords)

def find_duplicates():
    """Находим дубликаты новостей"""
    print("🚀 Поиск дубликатов новостей...")
    
    conn = sqlite3.connect('signals.db')
    cursor = conn.cursor()
    
    # Получаем все новости
    cursor.execute("""
        SELECT id, title, sector, impact
        FROM signals 
        ORDER BY impact DESC
    """)
    
    all_news = cursor.fetchall()
    print(f"📊 Всего новостей: {len(all_news)}")
    
    duplicates_to_remove = []
    processed = set()
    
    for i, (id1, title1, sector1, impact1) in enumerate(all_news):
        if id1 in processed:
            continue
            
        # Извлекаем ключевые слова из заголовка
        keywords1 = extract_keywords(title1)
        
        # Ищем похожие новости
        for j, (id2, title2, sector2, impact2) in enumerate(all_news[i+1:], i+1):
            if id2 in processed:
                continue
                
            # Проверяем схожесть заголовков
            title_similarity = similarity(title1, title2)
            
            # Проверяем схожесть ключевых слов
            keywords2 = extract_keywords(title2)
            keyword_overlap = len(keywords1 & keywords2) / len(keywords1 | keywords2) if keywords1 | keywords2 else 0
            
            # Если очень похожи (по заголовку или ключевым словам)
            if title_similarity > 0.7 or keyword_overlap > 0.6:
                # Выбираем новость с меньшим impact
                if impact1 < impact2:
                    duplicates_to_remove.append(id1)
                    processed.add(id1)
                    print(f"🗑️ Удаляем: {title1[:50]}... (impact: {impact1})")
                    break
                else:
                    duplicates_to_remove.append(id2)
                    processed.add(id2)
                    print(f"🗑️ Удаляем: {title2[:50]}... (impact: {impact2})")
    
    # Удаляем дубликаты
    if duplicates_to_remove:
        cursor.execute(f"""
            DELETE FROM signals 
            WHERE id IN ({','.join(['?' for _ in duplicates_to_remove])})
        """, duplicates_to_remove)
        
        conn.commit()
        print(f"\n🎉 Удалено {len(duplicates_to_remove)} дубликатов")
    else:
        print("\n✅ Дубликаты не найдены")
    
    conn.close()

if __name__ == "__main__":
    find_duplicates()
