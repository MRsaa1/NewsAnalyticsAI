#!/usr/bin/env python3
"""
Скрипт диагностики проблем с пайплайном
"""
import sqlite3
import asyncio
import httpx
import feedparser
from datetime import datetime, timezone

DB_PATH = "signals.db"

def check_database():
    """Проверяем состояние БД"""
    print("=" * 60)
    print("📊 СТАТУС БАЗЫ ДАННЫХ")
    print("=" * 60)
    
    try:
        conn = sqlite3.connect(DB_PATH)
        
        # Количество записей
        ingested_count = conn.execute("SELECT COUNT(*) FROM ingested").fetchone()[0]
        signals_count = conn.execute("SELECT COUNT(*) FROM signals").fetchone()[0]
        
        print(f"✅ Записей в ingested: {ingested_count}")
        print(f"✅ Записей в signals: {signals_count}")
        
        # Последние записи в ingested
        print("\n📥 Последние 5 записей в ingested:")
        rows = conn.execute("""
            SELECT ts_utc, sector, title, source 
            FROM ingested 
            ORDER BY ts_utc DESC 
            LIMIT 5
        """).fetchall()
        
        for i, (ts, sector, title, source) in enumerate(rows, 1):
            print(f"{i}. [{sector}] {title[:60]}...")
            print(f"   Источник: {source}")
            print(f"   Время: {ts}")
        
        # Последние записи в signals
        print("\n�� Последние 5 записей в signals:")
        rows = conn.execute("""
            SELECT ts_published, sector, title, source_domain 
            FROM signals 
            ORDER BY ts_published DESC 
            LIMIT 5
        """).fetchall()
        
        if rows:
            for i, (ts, sector, title, source) in enumerate(rows, 1):
                print(f"{i}. [{sector}] {title[:60]}...")
                print(f"   Источник: {source}")
                print(f"   Время: {ts}")
        else:
            print("⚠️  Нет записей в signals!")
        
        # Проверяем orphan records (в ingested но НЕ в signals)
        print("\n🔍 Записи в ingested, которых НЕТ в signals:")
        orphans = conn.execute("""
            SELECT i.id, i.sector, i.title
            FROM ingested i
            LEFT JOIN signals s ON i.id = s.id
            WHERE s.id IS NULL
            LIMIT 10
        """).fetchall()
        
        if orphans:
            print(f"⚠️  Найдено {len(orphans)} записей без анализа:")
            for i, (id, sector, title) in enumerate(orphans[:5], 1):
                print(f"{i}. [{sector}] {title[:60]}...")
        else:
            print("✅ Все записи из ingested есть в signals")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Ошибка БД: {e}")

async def check_rss_feeds():
    """Проверяем доступность RSS фидов"""
    print("\n" + "=" * 60)
    print("🌐 ПРОВЕРКА RSS ФИДОВ")
    print("=" * 60)
    
    # Берем несколько фидов для проверки
    test_feeds = {
        "CRYPTO": "https://cointelegraph.com/rss",
        "TREASURY": "https://home.treasury.gov/rss/news",
        "BIOTECH": "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml",
    }
    
    async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
        for sector, url in test_feeds.items():
            try:
                print(f"\n🔍 Проверяем {sector}: {url}")
                r = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
                
                if r.status_code != 200:
                    print(f"❌ HTTP {r.status_code}")
                    continue
                
                feed = feedparser.parse(r.text)
                entries_count = len(feed.entries)
                
                print(f"✅ Доступен! Найдено {entries_count} записей")
                
                if entries_count > 0:
                    latest = feed.entries[0]
                    print(f"   Последняя новость: {latest.get('title', 'N/A')[:60]}...")
                    print(f"   Ссылка: {latest.get('link', 'N/A')}")
                    print(f"   Дата: {latest.get('published', 'N/A')}")
                
            except Exception as e:
                print(f"❌ Ошибка: {e}")

async def check_api_keys():
    """Проверяем API ключи"""
    print("\n" + "=" * 60)
    print("🔑 ПРОВЕРКА API КЛЮЧЕЙ")
    print("=" * 60)
    
    import os
    
    openai_key = os.getenv("OPENAI_API_KEY")
    deepseek_key = os.getenv("DEEPSEEK_API_KEY")
    
    print(f"OpenAI API Key: {'✅ Установлен' if openai_key else '❌ НЕ УСТАНОВЛЕН'}")
    print(f"DeepSeek API Key: {'✅ Установлен' if deepseek_key else '❌ НЕ УСТАНОВЛЕН'}")
    
    if not openai_key and not deepseek_key:
        print("\n⚠️  ВНИМАНИЕ: Ни один API ключ не установлен!")
        print("   Без API ключей LLM анализ не будет работать")
        print("   Установите хотя бы один ключ в файле .env")
    
    telegram_token = os.getenv("TELEGRAM_TOKEN")
    print(f"Telegram Token: {'✅ Установлен' if telegram_token else '❌ НЕ УСТАНОВЛЕН (опционально)'}")

async def main():
    """Запускаем все проверки"""
    print("\n🔍 ДИАГНОСТИКА ПАЙПЛАЙНА")
    print("Дата: " + datetime.now(timezone.utc).isoformat())
    print()
    
    # 1. Проверяем БД
    check_database()
    
    # 2. Проверяем API ключи
    await check_api_keys()
    
    # 3. Проверяем RSS фиды
    await check_rss_feeds()
    
    print("\n" + "=" * 60)
    print("✅ ДИАГНОСТИКА ЗАВЕРШЕНА")
    print("=" * 60)
    print()

if __name__ == "__main__":
    asyncio.run(main())
