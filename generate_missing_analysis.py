#!/usr/bin/env python3
"""
Скрипт для генерации недостающей аналитики для существующих новостей
"""

import sqlite3
import json
import os
from datetime import datetime
import asyncio
import httpx
from typing import Dict, Any

# Настройки
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("❌ OPENAI_API_KEY не найден в переменных окружения")
    exit(1)

PROMPT_TMPL = """
Analyze this news item and provide professional Bloomberg-style analysis.

News: {title}

Provide analysis in this exact JSON format:
{{
    "title_ru": "Russian translation of the title",
    "analysis": "Professional Bloomberg-style analysis including: market impact, sector implications, key risks/opportunities, and actionable insights. Write in Russian."
}}

Return ONLY valid JSON, no other text.
"""

async def call_openai(title: str) -> Dict[str, Any]:
    """Вызов OpenAI API для анализа"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "user", "content": PROMPT_TMPL.format(title=title)}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1000
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"].strip()
                
                # Парсим JSON
                try:
                    parsed = json.loads(content)
                    return {
                        "title_ru": parsed.get("title_ru", ""),
                        "analysis": parsed.get("analysis", "")
                    }
                except json.JSONDecodeError:
                    print(f"❌ Ошибка парсинга JSON для: {title[:50]}...")
                    return {"title_ru": "", "analysis": ""}
            else:
                print(f"❌ OpenAI API ошибка {response.status_code}: {response.text}")
                return {"title_ru": "", "analysis": ""}
                
    except Exception as e:
        print(f"❌ Ошибка вызова OpenAI: {e}")
        return {"title_ru": "", "analysis": ""}

async def main():
    """Основная функция"""
    print("🚀 Генерация недостающей аналитики...")
    
    # Подключаемся к базе данных
    conn = sqlite3.connect('signals.db')
    cursor = conn.cursor()
    
    # Находим новости без аналитики
    cursor.execute("""
        SELECT id, title 
        FROM signals 
        WHERE (title_ru = '' OR title_ru IS NULL OR analysis = '' OR analysis IS NULL)
        AND impact >= 70
        ORDER BY impact DESC
        LIMIT 20
    """)
    
    signals = cursor.fetchall()
    print(f"📊 Найдено {len(signals)} новостей для анализа")
    
    if not signals:
        print("✅ Все новости уже имеют аналитику!")
        return
    
    # Обрабатываем каждую новость
    for i, (signal_id, title) in enumerate(signals, 1):
        print(f"\n📰 [{i}/{len(signals)}] Анализируем: {title[:60]}...")
        
        # Получаем анализ от OpenAI
        result = await call_openai(title)
        
        if result["title_ru"] or result["analysis"]:
            # Обновляем базу данных
            cursor.execute("""
                UPDATE signals 
                SET title_ru = ?, analysis = ?
                WHERE id = ?
            """, (result["title_ru"], result["analysis"], signal_id))
            
            conn.commit()
            print(f"✅ Обновлено: {result['title_ru'][:40]}..." if result['title_ru'] else "✅ Аналитика добавлена")
        else:
            print(f"❌ Не удалось получить анализ")
        
        # Небольшая пауза между запросами
        await asyncio.sleep(1)
    
    conn.close()
    print(f"\n🎉 Генерация завершена!")

if __name__ == "__main__":
    asyncio.run(main())
