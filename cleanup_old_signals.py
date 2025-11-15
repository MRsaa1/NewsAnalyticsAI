#!/usr/bin/env python3
"""
Скрипт для очистки старых сигналов из базы данных
"""
import sqlite3
import sys
from datetime import datetime, timedelta
from app import DB_PATH

def cleanup_old_signals(days_to_keep: int = 30, dry_run: bool = True):
    """
    Удаляет сигналы старше указанного количества дней
    
    Args:
        days_to_keep: Сколько дней хранить (по умолчанию 30)
        dry_run: Если True - только показывает что будет удалено (безопасно)
    """
    conn = sqlite3.connect(DB_PATH)
    
    # Проверяем текущее состояние
    total_count = conn.execute("SELECT COUNT(*) FROM signals").fetchone()[0]
    
    # Считаем сколько удалится
    cutoff_date = (datetime.now() - timedelta(days=days_to_keep)).strftime('%Y-%m-%d')
    
    old_count = conn.execute(
        "SELECT COUNT(*) FROM signals WHERE DATE(ts_published) < ?",
        (cutoff_date,)
    ).fetchone()[0]
    
    will_remain = total_count - old_count
    
    print("=" * 70)
    print("🗑️  ОЧИСТКА СТАРЫХ СИГНАЛОВ")
    print("=" * 70)
    print(f"\n📊 Текущая статистика:")
    print(f"   • Всего сигналов: {total_count:,}")
    print(f"   • Будет удалено (старше {days_to_keep} дней): {old_count:,}")
    print(f"   • Останется: {will_remain:,}")
    print(f"   • Дата отсечения: {cutoff_date}")
    
    if old_count == 0:
        print(f"\n✅ Нет сигналов старше {days_to_keep} дней. Очистка не требуется.")
        conn.close()
        return
    
    # Показываем примеры удаляемых записей
    print(f"\n📋 Примеры удаляемых записей:")
    old_samples = conn.execute("""
        SELECT DATE(ts_published), sector, title 
        FROM signals 
        WHERE DATE(ts_published) < ?
        ORDER BY ts_published
        LIMIT 5
    """, (cutoff_date,)).fetchall()
    
    for date, sector, title in old_samples:
        print(f"   • {date} | {sector:15s} | {title[:60]}...")
    
    if dry_run:
        print(f"\n⚠️  РЕЖИМ ТЕСТИРОВАНИЯ (dry run)")
        print(f"   Данные НЕ будут удалены.")
        print(f"\n💡 Для реального удаления запустите:")
        print(f"   python cleanup_old_signals.py --execute --days {days_to_keep}")
    else:
        print(f"\n⚠️  ВНИМАНИЕ! Это действие НЕОБРАТИМО!")
        response = input(f"\nВы уверены что хотите удалить {old_count:,} сигналов? (yes/no): ")
        
        if response.lower() != 'yes':
            print("\n❌ Отменено пользователем.")
            conn.close()
            return
        
        print(f"\n🗑️  Удаляю {old_count:,} старых сигналов...")
        
        conn.execute(
            "DELETE FROM signals WHERE DATE(ts_published) < ?",
            (cutoff_date,)
        )
        conn.commit()
        
        # Оптимизируем базу после удаления
        print("📦 Оптимизирую базу данных...")
        conn.execute("VACUUM")
        
        new_count = conn.execute("SELECT COUNT(*) FROM signals").fetchone()[0]
        
        print(f"\n✅ ГОТОВО!")
        print(f"   • Удалено: {old_count:,} сигналов")
        print(f"   • Осталось: {new_count:,} сигналов")
        
        # Размер базы
        import os
        db_size_mb = os.path.getsize(DB_PATH) / 1024 / 1024
        print(f"   • Размер базы: {db_size_mb:.1f} MB")
    
    conn.close()
    print("\n" + "=" * 70)

def show_statistics():
    """Показывает детальную статистику по датам"""
    conn = sqlite3.connect(DB_PATH)
    
    print("=" * 70)
    print("📊 СТАТИСТИКА СИГНАЛОВ ПО ДАТАМ")
    print("=" * 70)
    
    # Общая статистика
    total = conn.execute("SELECT COUNT(*) FROM signals").fetchone()[0]
    
    # По периодам
    periods = [
        ("Последние 7 дней", 7),
        ("Последние 30 дней", 30),
        ("Последние 90 дней", 90),
        ("Последние 180 дней", 180),
        ("Последний год", 365),
        ("Старше года", None)
    ]
    
    print(f"\n📈 Всего сигналов: {total:,}\n")
    
    for period_name, days in periods:
        if days:
            cutoff = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            count = conn.execute(
                "SELECT COUNT(*) FROM signals WHERE DATE(ts_published) >= ?",
                (cutoff,)
            ).fetchone()[0]
        else:
            # Старше года
            cutoff = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
            count = conn.execute(
                "SELECT COUNT(*) FROM signals WHERE DATE(ts_published) < ?",
                (cutoff,)
            ).fetchone()[0]
        
        percentage = (count / total * 100) if total > 0 else 0
        bar = "█" * int(percentage / 2)
        print(f"   {period_name:20s} : {count:6,} ({percentage:5.1f}%) {bar}")
    
    # Самые старые
    oldest = conn.execute(
        "SELECT DATE(ts_published), sector, title FROM signals ORDER BY ts_published LIMIT 1"
    ).fetchone()
    
    if oldest:
        print(f"\n📅 Самая старая новость:")
        print(f"   • Дата: {oldest[0]}")
        print(f"   • Сектор: {oldest[1]}")
        print(f"   • Заголовок: {oldest[2][:70]}...")
    
    conn.close()
    print("\n" + "=" * 70)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Очистка старых сигналов из базы данных")
    parser.add_argument(
        '--days',
        type=int,
        default=30,
        help='Количество дней для хранения (по умолчанию: 30)'
    )
    parser.add_argument(
        '--execute',
        action='store_true',
        help='Реально удалить данные (без этого флага - только показ)'
    )
    parser.add_argument(
        '--stats',
        action='store_true',
        help='Показать только статистику без удаления'
    )
    
    args = parser.parse_args()
    
    if args.stats:
        show_statistics()
    else:
        cleanup_old_signals(days_to_keep=args.days, dry_run=not args.execute)

