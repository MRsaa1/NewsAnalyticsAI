#!/usr/bin/env python3
"""
Анализ новостей через DeepSeek (быстрее и дешевле чем OpenAI)
"""
import asyncio
import os
os.environ['OPENAI_API_KEY'] = ''  # Отключаем OpenAI
from app import run_pipeline, db

async def main():
    print("🚀 Запуск анализа через DeepSeek...")
    print("=" * 60)
    
    # Проверяем текущее состояние
    conn = db()
    ingested = conn.execute("SELECT COUNT(*) FROM ingested").fetchone()[0]
    signals = conn.execute("SELECT COUNT(*) FROM signals").fetchone()[0]
    conn.close()
    
    print(f"📊 Собрано новостей: {ingested}")
    print(f"📊 Проанализировано: {signals}")
    print(f"📊 Нужно проанализировать: {ingested - signals}")
    print("=" * 60)
    
    result = await run_pipeline()
    
    print("\n" + "=" * 60)
    print(f"✅ ГОТОВО! Новых сигналов: {result}")
    print("=" * 60)
    
    # Финальная статистика
    conn = db()
    signals_final = conn.execute("SELECT COUNT(*) FROM signals").fetchone()[0]
    conn.close()
    
    print(f"\n📊 Всего сигналов в базе: {signals_final}")
    print("\n💡 Откройте http://localhost:8080 и нажмите 'ЗАГРУЗИТЬ СИГНАЛЫ'")

if __name__ == "__main__":
    asyncio.run(main())






