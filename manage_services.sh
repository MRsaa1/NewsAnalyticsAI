#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PYTHON_PLIST="$HOME/Library/LaunchAgents/com.signalanalysis.python.plist"
GO_PLIST="$HOME/Library/LaunchAgents/com.signalanalysis.go.plist"

# Функция проверки статуса
status() {
    echo -e "${YELLOW}📊 Статус сервисов:${NC}"
    echo ""
    
    # Проверка Python сервиса
    if launchctl list | grep -q "com.signalanalysis.python"; then
        python_status=$(launchctl list | grep "com.signalanalysis.python" | awk '{print $1}')
        if [ "$python_status" != "-" ]; then
            echo -e "${GREEN}✅ Python FastAPI (PID: $python_status)${NC}"
            if lsof -i :8080 > /dev/null 2>&1; then
                echo -e "   🌐 http://localhost:8080"
            fi
        else
            echo -e "${RED}❌ Python FastAPI - не запущен${NC}"
        fi
    else
        echo -e "${RED}❌ Python FastAPI - не установлен${NC}"
    fi
    
    echo ""
    
    # Проверка Go сервиса
    if launchctl list | grep -q "com.signalanalysis.go"; then
        go_status=$(launchctl list | grep "com.signalanalysis.go" | awk '{print $1}')
        if [ "$go_status" != "-" ]; then
            echo -e "${GREEN}✅ Go Dashboard (PID: $go_status)${NC}"
            if lsof -i :8090 > /dev/null 2>&1; then
                echo -e "   🌐 http://localhost:8090/dashboard"
            fi
        else
            echo -e "${RED}❌ Go Dashboard - не запущен${NC}"
        fi
    else
        echo -e "${RED}❌ Go Dashboard - не установлен${NC}"
    fi
    
    echo ""
}

# Функция запуска
start() {
    echo -e "${GREEN}🚀 Запуск сервисов...${NC}"
    
    if [ ! -f "$PYTHON_PLIST" ]; then
        echo -e "${RED}❌ Файл $PYTHON_PLIST не найден${NC}"
        exit 1
    fi
    
    if [ ! -f "$GO_PLIST" ]; then
        echo -e "${RED}❌ Файл $GO_PLIST не найден${NC}"
        exit 1
    fi
    
    launchctl load "$PYTHON_PLIST" 2>/dev/null
    launchctl load "$GO_PLIST" 2>/dev/null
    
    sleep 2
    status
}

# Функция остановки
stop() {
    echo -e "${YELLOW}🛑 Остановка сервисов...${NC}"
    
    launchctl unload "$PYTHON_PLIST" 2>/dev/null
    launchctl unload "$GO_PLIST" 2>/dev/null
    
    echo -e "${GREEN}✅ Сервисы остановлены${NC}"
}

# Функция перезапуска
restart() {
    echo -e "${YELLOW}🔄 Перезапуск сервисов...${NC}"
    stop
    sleep 1
    start
}

# Функция просмотра логов
logs() {
    service=$1
    
    if [ "$service" == "python" ]; then
        echo -e "${YELLOW}📋 Логи Python сервиса:${NC}"
        tail -f "$HOME/signal-analysis/app.log"
    elif [ "$service" == "go" ]; then
        echo -e "${YELLOW}📋 Логи Go сервиса:${NC}"
        tail -f "$HOME/signal-analysis/server.log"
    else
        echo -e "${RED}❌ Укажите сервис: python или go${NC}"
        echo "Пример: $0 logs python"
        exit 1
    fi
}

# Функция пересборки Go сервера
rebuild() {
    echo -e "${YELLOW}🔨 Пересборка Go сервера...${NC}"
    
    cd "$HOME/signal-analysis/go-signal-analysis" || exit 1
    
    # Останавливаем сервис
    launchctl unload "$GO_PLIST" 2>/dev/null
    
    # Собираем
    go build -o signal-analysis-server main.go
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Сборка успешна${NC}"
        
        # Запускаем
        launchctl load "$GO_PLIST" 2>/dev/null
        
        sleep 2
        status
    else
        echo -e "${RED}❌ Ошибка сборки${NC}"
        exit 1
    fi
}

# Главное меню
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs "$2"
        ;;
    rebuild)
        rebuild
        ;;
    *)
        echo "Управление сервисами Signal Analysis"
        echo ""
        echo "Использование: $0 {start|stop|restart|status|logs|rebuild}"
        echo ""
        echo "Команды:"
        echo "  start    - Запустить все сервисы"
        echo "  stop     - Остановить все сервисы"
        echo "  restart  - Перезапустить все сервисы"
        echo "  status   - Показать статус сервисов"
        echo "  logs     - Показать логи (logs python|go)"
        echo "  rebuild  - Пересобрать Go сервер"
        echo ""
        exit 1
        ;;
esac

exit 0



