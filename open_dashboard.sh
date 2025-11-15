#!/bin/bash

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Проверка сервисов...${NC}"

# Проверка Go Dashboard
if lsof -i :8090 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Go Dashboard работает${NC}"
    echo -e "${YELLOW}🌐 Открываю http://localhost:8090/dashboard${NC}"
    open http://localhost:8090/dashboard
else
    echo -e "${RED}❌ Go Dashboard не запущен${NC}"
    echo -e "${YELLOW}🚀 Запускаю сервисы...${NC}"
    ./manage_services.sh start
    echo ""
    echo -e "${YELLOW}🌐 Открываю http://localhost:8090/dashboard${NC}"
    sleep 2
    open http://localhost:8090/dashboard
fi

echo ""
echo -e "${GREEN}✅ Готово!${NC}"



