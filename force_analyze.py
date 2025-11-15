#!/usr/bin/env python3
"""
Принудительный запуск анализа всех новостей
"""
import asyncio
import sys
import os
from app import run_pipeline, db

async def main():
    print("=" * 60)
    print("🔍 ПРИНУДИТЕЛЬНЫЙ АНАЛИЗ НОВОСТЕЙ")
    print("=" * 60)
    
    # Проверяем сколько уже есть
    conn = db()
    ingested_count = conn.execute("SELECT COUNT(*) FROM ingested").fetchone()[0]
    signals_count = conn.execute("SELECT COUNT(*) FROM signals").fetchone()[0]
    conn.close()
    
    print(f"\n📊 Текущее состояние:")
    print(f"   Собрано новостей: {ingested_count}")
    print(f"   Проанализировано: {signals_count}")
    
    if ingested_count == 0:
        print("\n⚠️  Нет собранных новостей. Сначала запустится сбор...")
    
    print("\n🚀 Запускаю анализ...\n")
    
    result = await run_pipeline()
    
    print("\n" + "=" * 60)
    print(f"✅ ГОТОВО! Проанализировано новых сигналов: {result}")
    print("=" * 60)
    
    # Проверяем финальное состояние
    conn = db()
    signals_count = conn.execute("SELECT COUNT(*) FROM signals").fetchone()[0]
    conn.close()
    
    print(f"\n📊 Итого в базе сигналов: {signals_count}")
    print("\n💡 Обновите страницу в браузере и нажмите 'ЗАГРУЗИТЬ СИГНАЛЫ'")

if __name__ == "__main__":
    asyncio.run(main())






