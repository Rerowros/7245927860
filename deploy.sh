#!/bin/bash

# Скрипт развертывания проекта для заказчика
# Используется после установки Docker на сервер

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка, что мы работаем под пользователем app
check_user() {
    if [[ $USER != "app" ]]; then
        print_error "Этот скрипт должен быть запущен от имени пользователя 'app'"
        print_status "Запустите: sudo -u app $0"
        exit 1
    fi
}

# Проверка наличия .env файла
check_env() {
    if [[ ! -f .env ]]; then
        print_error "Файл .env не найден!"
        print_status "Скопируйте .env.example в .env и заполните настройки:"
        print_status "cp .env.example .env"
        print_status "nano .env"
        exit 1
    fi
}

# Проверка заполнения основных настроек
validate_env() {
    print_status "Проверка конфигурации..."
    
    # Проверяем основные переменные
    if grep -q "YOUR_BOT_TOKEN_FROM_BOTFATHER" .env; then
        print_error "Не заполнен TELEGRAM_BOT_TOKEN в .env файле"
        exit 1
    fi
    
    if grep -q "YOUR_CHAT_ID" .env; then
        print_error "Не заполнен TELEGRAM_CHAT_ID в .env файле"
        exit 1
    fi
    
    if grep -q "your_super_secret_password" .env; then
        print_warning "Рекомендуется изменить ADMIN_PASSWORD в .env файле"
    fi
    
    print_status "Конфигурация выглядит корректно"
}

# Создание резервной копии базы данных
backup_database() {
    if [[ -f prisma/dev.db ]]; then
        print_status "Создание резервной копии базы данных..."
        mkdir -p backups
        cp prisma/dev.db backups/dev.db.$(date +%Y%m%d_%H%M%S)
        print_status "Резервная копия создана"
    fi
}

# Сборка и запуск приложения
deploy_app() {
    print_status "Остановка предыдущей версии..."
    docker-compose down 2>/dev/null || true
    
    print_status "Сборка нового образа..."
    docker-compose build --no-cache
    
    print_status "Запуск приложения..."
    docker-compose up -d
    
    print_status "Ожидание запуска приложения..."
    sleep 10
    
    # Проверка статуса
    if docker-compose ps | grep -q "Up"; then
        print_status "Приложение успешно запущено!"
    else
        print_error "Ошибка при запуске приложения"
        print_status "Проверьте логи: docker-compose logs"
        exit 1
    fi
}

# Настройка webhook
setup_webhook() {
    print_status "Настройка webhook..."
    
    # Получаем домен из пользовательского ввода
    read -p "Введите ваш домен (например: https://yourdomain.com): " DOMAIN
    
    if [[ -z "$DOMAIN" ]]; then
        print_error "Домен не может быть пустым"
        exit 1
    fi
    
    # Получаем токен бота из .env
    BOT_TOKEN=$(grep TELEGRAM_BOT_TOKEN .env | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
    
    if [[ -z "$BOT_TOKEN" ]]; then
        print_error "Не удалось получить токен бота из .env файла"
        exit 1
    fi
    
    # Настраиваем webhook
    WEBHOOK_URL="$DOMAIN/api/telegram-webhook"
    RESPONSE=$(curl -s -F "url=$WEBHOOK_URL" "https://api.telegram.org/bot$BOT_TOKEN/setWebhook")
    
    if echo "$RESPONSE" | grep -q '"ok":true'; then
        print_status "Webhook успешно настроен: $WEBHOOK_URL"
    else
        print_error "Ошибка при настройке webhook: $RESPONSE"
        exit 1
    fi
}

# Главная функция
main() {
    echo "================================================"
    echo "       РАЗВЕРТЫВАНИЕ TELEGRAM BOT"
    echo "================================================"
    
    check_user
    check_env
    validate_env
    backup_database
    deploy_app
    
    # Спрашиваем о настройке webhook
    echo ""
    read -p "Хотите настроить webhook? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_webhook
    fi
    
    echo ""
    echo "================================================"
    echo "       РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО"
    echo "================================================"
    print_status "Приложение доступно по адресу: http://your-server-ip:3000"
    print_status "Панель администратора: http://your-server-ip:3000/admin"
    
    echo ""
    print_status "Полезные команды:"
    echo "  ./manage.sh status  - проверить статус"
    echo "  ./manage.sh logs    - просмотреть логи"
    echo "  ./manage.sh restart - перезапустить"
    echo "  ./manage.sh stop    - остановить"
}

# Запуск скрипта
main "$@"
