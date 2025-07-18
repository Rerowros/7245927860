#!/bin/bash

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}"
}

# Проверка прав root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Этот скрипт должен быть запущен от имени root"
        print_status "Запустите: sudo bash $0"
        exit 1
    fi
}

# Быстрая установка Docker
install_docker() {
    print_header "УСТАНОВКА DOCKER"
    
    # Проверяем, не установлен ли Docker уже
    if command -v docker >/dev/null 2>&1; then
        print_status "Docker уже установлен: $(docker --version)"
        return 0
    fi
    
    print_status "Обновление системы..."
    apt update -y
    
    print_status "Установка Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    print_status "Установка Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    print_status "Запуск Docker..."
    systemctl start docker
    systemctl enable docker
    
    print_status "Docker успешно установлен!"
}

# Создание пользователя app
create_user() {
    print_header "СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ"
    
    if ! id "app" &>/dev/null; then
        print_status "Создание пользователя 'app'..."
        useradd -m -s /bin/bash app
        usermod -aG docker app
        print_status "Пользователь 'app' создан"
    else
        print_status "Пользователь 'app' уже существует"
        usermod -aG docker app
    fi
}

# Интерактивная настройка конфигурации
configure_app() {
    print_header "НАСТРОЙКА ПРИЛОЖЕНИЯ"
    
    PROJECT_DIR="/home/app/starstg"
    mkdir -p $PROJECT_DIR
    cd $PROJECT_DIR
    
    # Создаем базовые файлы
    print_status "Создание файлов конфигурации..."
    
    # Создаем docker-compose.yml
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - ./prisma/dev.db:/app/prisma/dev.db
      - ./prisma/migrations:/app/prisma/migrations
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF
    
    # Создаем .env файл интерактивно
    print_status "Настройка переменных окружения..."
    
    echo "DATABASE_URL=\"file:./prisma/dev.db\"" > .env
    echo "" >> .env
    
    # Запрашиваем настройки у пользователя
    echo "Введите настройки Telegram бота:"
    echo ""
    
    read -p "Токен бота от @BotFather: " BOT_TOKEN
    read -p "Username бота (без @): " BOT_USERNAME
    read -p "Chat ID для уведомлений: " CHAT_ID
    read -p "Пароль администратора: " ADMIN_PASSWORD
    
    echo "TELEGRAM_BOT_TOKEN=\"$BOT_TOKEN\"" >> .env
    echo "NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=\"$BOT_USERNAME\"" >> .env
    echo "TELEGRAM_CHAT_ID=\"$CHAT_ID\"" >> .env
    echo "ADMIN_PASSWORD=\"$ADMIN_PASSWORD\"" >> .env
    echo "" >> .env
    
    # Опциональные настройки
    echo "Опциональные настройки (можно пропустить, нажав Enter):"
    echo ""
    
    read -p "Telegram API ID (с https://my.telegram.org): " API_ID
    read -p "Telegram API Hash: " API_HASH
    read -p "CryptoBot API Token: " CRYPTOBOT_TOKEN
    
    if [[ -n "$API_ID" ]]; then
        echo "NEXT_PUBLIC_TELEGRAM_API_ID=\"$API_ID\"" >> .env
    fi
    
    if [[ -n "$API_HASH" ]]; then
        echo "NEXT_PUBLIC_TELEGRAM_API_HASH=\"$API_HASH\"" >> .env
    fi
    
    if [[ -n "$CRYPTOBOT_TOKEN" ]]; then
        echo "CRYPTOBOT_API_TOKEN=\"$CRYPTOBOT_TOKEN\"" >> .env
    fi
    
    # Создаем скрипт управления
    cat > manage.sh << 'EOF'
#!/bin/bash
PROJECT_DIR="/home/app/starstg"
cd $PROJECT_DIR

case "$1" in
    start)
        echo "Запуск приложения..."
        docker-compose up -d
        ;;
    stop)
        echo "Остановка приложения..."
        docker-compose down
        ;;
    restart)
        echo "Перезапуск приложения..."
        docker-compose down
        docker-compose up -d
        ;;
    logs)
        echo "Просмотр логов..."
        docker-compose logs -f
        ;;
    status)
        echo "Статус приложения..."
        docker-compose ps
        ;;
    *)
        echo "Использование: $0 {start|stop|restart|logs|status}"
        exit 1
        ;;
esac
EOF
    
    chmod +x manage.sh
    chown -R app:app $PROJECT_DIR
    
    print_status "Конфигурация завершена!"
}

# Развертывание приложения
deploy_app() {
    print_header "РАЗВЕРТЫВАНИЕ ПРИЛОЖЕНИЯ"
    
    PROJECT_DIR="/home/app/starstg"
    
    # Проверяем, загружены ли файлы проекта
    if [[ ! -f "$PROJECT_DIR/Dockerfile" ]]; then
        print_warning "Файлы проекта не найдены!"
        print_status "Загрузите файлы проекта в $PROJECT_DIR"
        print_status "Или укажите ссылку на репозиторий Git:"
        read -p "Git репозиторий (или пропустите): " GIT_REPO
        
        if [[ -n "$GIT_REPO" ]]; then
            print_status "Клонирование репозитория..."
            sudo -u app git clone "$GIT_REPO" "$PROJECT_DIR/source"
            sudo -u app cp -r "$PROJECT_DIR/source/"* "$PROJECT_DIR/"
            sudo -u app rm -rf "$PROJECT_DIR/source"
        else
            print_status "Пропускаем развертывание. Загрузите файлы вручную."
            return 0
        fi
    fi
    
    print_status "Запуск приложения..."
    cd $PROJECT_DIR
    sudo -u app docker-compose up -d
    
    print_status "Ожидание запуска..."
    sleep 15
    
    # Проверяем статус
    if sudo -u app docker-compose ps | grep -q "Up"; then
        print_status "Приложение успешно запущено!"
    else
        print_error "Ошибка при запуске. Проверьте логи: sudo -u app docker-compose logs"
    fi
}

# Настройка webhook
setup_webhook() {
    print_header "НАСТРОЙКА WEBHOOK"
    
    read -p "Введите ваш домен (например: https://yourdomain.com): " DOMAIN
    
    if [[ -z "$DOMAIN" ]]; then
        print_warning "Домен не указан, пропускаем настройку webhook"
        return 0
    fi
    
    # Получаем токен из .env
    BOT_TOKEN=$(grep TELEGRAM_BOT_TOKEN /home/app/starstg/.env | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
    
    if [[ -z "$BOT_TOKEN" ]]; then
        print_error "Не удалось получить токен бота"
        return 1
    fi
    
    print_status "Настройка webhook для $DOMAIN..."
    WEBHOOK_URL="$DOMAIN/api/telegram-webhook"
    RESPONSE=$(curl -s -F "url=$WEBHOOK_URL" "https://api.telegram.org/bot$BOT_TOKEN/setWebhook")
    
    if echo "$RESPONSE" | grep -q '"ok":true'; then
        print_status "Webhook успешно настроен!"
    else
        print_error "Ошибка при настройке webhook: $RESPONSE"
    fi
}

# Главная функция
main() {
    print_header "БЫСТРАЯ УСТАНОВКА TELEGRAM BOT"
    
    check_root
    install_docker
    create_user
    configure_app
    
    # Спрашиваем о развертывании
    echo ""
    read -p "Развернуть приложение сейчас? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_app
    fi
    
    # Спрашиваем о webhook
    echo ""
    read -p "Настроить webhook? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_webhook
    fi
    
    print_header "УСТАНОВКА ЗАВЕРШЕНА"
    echo ""
    print_status "Проект установлен в: /home/app/starstg"
    print_status "Управление: sudo -u app /home/app/starstg/manage.sh {start|stop|restart|logs|status}"
    print_status "Приложение доступно по адресу: http://your-server-ip:3000"
    print_status "Панель администратора: http://your-server-ip:3000/admin"
    echo ""
    print_warning "Не забудьте настроить SSL сертификат для продакшена!"
}

# Запуск скрипта
main "$@"
