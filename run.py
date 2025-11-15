#!/usr/bin/env python3
"""
Скрипт запуска приложения
"""
import os
import sys
import subprocess
from pathlib import Path

def main():
    # Проверяем что мы в правильной директории
    if not Path("app.py").exists():
        print("❌ Файл app.py не найден. Запустите из директории проекта.")
        sys.exit(1)
    
    # Проверяем .env файл
    if not Path(".env").exists():
        print("⚠️  Файл .env не найден. Создайте его на основе env.example")
        print("   cp env.example .env")
        print("   Затем отредактируйте .env и добавьте ваши API ключи")
        return
    
    # Проверяем зависимости
    try:
        import fastapi
        import uvicorn
        import httpx
        import feedparser
        print("✅ Все зависимости установлены")
    except ImportError as e:
        print(f"❌ Отсутствует зависимость: {e}")
        print("Установите зависимости: pip install -r requirements.txt")
        return
    
    # Запускаем приложение
    port = os.getenv("PORT", "8080")
    print(f"🚀 Запуск приложения на http://localhost:{port}")
    print("�� Откройте браузер и перейдите по адресу выше")
    print("🛑 Для остановки нажмите Ctrl+C")
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app:app", 
            "--host", "127.0.0.1", 
            "--port", port,
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n👋 Приложение остановлено")

if __name__ == "__main__":
    main()
