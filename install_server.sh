#!/bin/bash

# Скрипт автоматической установки и настройки Docker для проекта Telegram Bot
# Автор: GitHub Copilot
# Дата: 18 июля 2025 г.

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода цветного текста
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
        print_status "Запустите: sudo $0"
        exit 1
    fi
}

# Определение дистрибутива Linux
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VERSION=$VERSION_ID
    else
        print_error "Не удалось определить операционную систему"
        exit 1
    fi
}

# Установка Docker
install_docker() {
    print_header "УСТАНОВКА DOCKER"
    
    # Удаляем старые версии Docker
    print_status "Удаление старых версий Docker..."
    apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Обновляем список пакетов
    print_status "Обновление списка пакетов..."
    apt-get update
    
    # Устанавливаем необходимые пакеты
    print_status "Установка зависимостей..."
    apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Добавляем GPG ключ Docker
    print_status "Добавление GPG ключа Docker..."
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Добавляем репозиторий Docker
    print_status "Добавление репозитория Docker..."
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Обновляем список пакетов
    apt-get update
    
    # Устанавливаем Docker
    print_status "Установка Docker..."
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Запускаем Docker
    print_status "Запуск Docker..."
    systemctl start docker
    systemctl enable docker
    
    # Проверяем установку
    if docker --version >/dev/null 2>&1; then
        print_status "Docker успешно установлен: $(docker --version)"
    else
        print_error "Ошибка при установке Docker"
        exit 1
    fi
}

# Установка Docker Compose
install_docker_compose() {
    print_header "УСТАНОВКА DOCKER COMPOSE"
    
    # Получаем последнюю версию Docker Compose
    print_status "Получение последней версии Docker Compose..."
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    
    # Скачиваем Docker Compose
    print_status "Скачивание Docker Compose версии $COMPOSE_VERSION..."
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Делаем исполняемым
    chmod +x /usr/local/bin/docker-compose
    
    # Создаем символическую ссылку
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    # Проверяем установку
    if docker-compose --version >/dev/null 2>&1; then
        print_status "Docker Compose успешно установлен: $(docker-compose --version)"
    else
        print_error "Ошибка при установке Docker Compose"
        exit 1
    fi
}

# Создание пользователя для приложения
create_app_user() {
    print_header "СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ ПРИЛОЖЕНИЯ"
    
    # Создаем пользователя app
    if ! id "app" &>/dev/null; then
        print_status "Создание пользователя 'app'..."
        useradd -m -s /bin/bash app
        usermod -aG docker app
        print_status "Пользователь 'app' создан и добавлен в группу docker"
    else
        print_status "Пользователь 'app' уже существует"
        usermod -aG docker app
    fi
}

# Создание директории проекта
setup_project_directory() {
    print_header "НАСТРОЙКА ДИРЕКТОРИИ ПРОЕКТА"
    
    PROJECT_DIR="/home/app/telegram-bot"
    
    # Создаем директорию проекта
    print_status "Создание директории проекта: $PROJECT_DIR"
    mkdir -p $PROJECT_DIR
    chown -R app:app $PROJECT_DIR
    
    # Создаем директорию для данных
    mkdir -p $PROJECT_DIR/data
    chown -R app:app $PROJECT_DIR/data
    
    print_status "Директория проекта готова: $PROJECT_DIR"
}

# Создание примера .env файла
create_env_template() {
    print_header "СОЗДАНИЕ ШАБЛОНА КОНФИГУРАЦИИ"
    
    PROJECT_DIR="/home/app/telegram-bot"
    
    cat > $PROJECT_DIR/.env.example << 'EOF'
# Настройки базы данных
DATABASE_URL="file:./prisma/dev.db"

# Пароль администратора (ОБЯЗАТЕЛЬНО ЗАМЕНИТЕ!)
ADMIN_PASSWORD="your_super_secret_password"

# Настройки Telegram бота
TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN_FROM_BOTFATHER"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="your_bot_username"
TELEGRAM_CHAT_ID="YOUR_CHAT_ID"

# Настройки Telegram API (получите на https://my.telegram.org)
NEXT_PUBLIC_TELEGRAM_API_ID="YOUR_API_ID"
NEXT_PUBLIC_TELEGRAM_API_HASH="YOUR_API_HASH"
TELEGRAM_SESSION="YOUR_SESSION_STRING"

# Настройки CryptoBot (получите на https://t.me/CryptoBot)
CRYPTOBOT_API_TOKEN="YOUR_CRYPTOBOT_TOKEN"
EOF

    chown app:app $PROJECT_DIR/.env.example
    
    print_status "Создан шаблон конфигурации: $PROJECT_DIR/.env.example"
    print_warning "ВАЖНО: Скопируйте .env.example в .env и заполните все настройки!"
}

# Создание скрипта управления
create_management_script() {
    print_header "СОЗДАНИЕ СКРИПТА УПРАВЛЕНИЯ"
    
    PROJECT_DIR="/home/app/telegram-bot"
    
    cat > $PROJECT_DIR/manage.sh << 'EOF'
#!/bin/bash

# Скрипт управления Telegram Bot

PROJECT_DIR="/home/app/telegram-bot"
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
    update)
        echo "Обновление приложения..."
        git pull
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        ;;
    backup)
        echo "Создание резервной копии..."
        mkdir -p backups
        cp prisma/dev.db backups/dev.db.$(date +%Y%m%d_%H%M%S)
        echo "Резервная копия создана в папке backups/"
        ;;
    setup-webhook)
        echo "Настройка webhook..."
        if [ -z "$2" ]; then
            echo "Использование: $0 setup-webhook https://your-domain.com"
            exit 1
        fi
        curl -F "url=$2/api/telegram-webhook" https://api.telegram.org/bot$(grep TELEGRAM_BOT_TOKEN .env | cut -d'=' -f2 | tr -d '"')/setWebhook
        ;;
    *)
        echo "Использование: $0 {start|stop|restart|logs|status|update|backup|setup-webhook}"
        exit 1
        ;;
esac
EOF

    chmod +x $PROJECT_DIR/manage.sh
    chown app:app $PROJECT_DIR/manage.sh
    
    print_status "Создан скрипт управления: $PROJECT_DIR/manage.sh"
}

# Создание systemd сервиса
create_systemd_service() {
    print_header "СОЗДАНИЕ SYSTEMD СЕРВИСА"
    
    cat > /etc/systemd/system/telegram-bot.service << 'EOF'
[Unit]
Description=Telegram Bot Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
User=app
Group=app
WorkingDirectory=/home/app/telegram-bot
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable telegram-bot.service
    
    print_status "Создан systemd сервис: telegram-bot.service"
}

# Настройка файрвола
setup_firewall() {
    print_header "НАСТРОЙКА ФАЙРВОЛА"
    
    # Проверяем, установлен ли UFW
    if command -v ufw >/dev/null 2>&1; then
        print_status "Настройка UFW..."
        ufw allow 22/tcp
        ufw allow 3000/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
        print_status "Файрвол настроен"
    else
        print_warning "UFW не установлен, пропускаем настройку файрвола"
    fi
}

# Главная функция
main() {
    print_header "УСТАНОВКА TELEGRAM BOT НА СЕРВЕР"
    
    check_root
    detect_os
    
    print_status "Операционная система: $OS $VERSION"
    
    install_docker
    install_docker_compose
    create_app_user
    setup_project_directory
    create_env_template
    create_management_script
    create_systemd_service
    setup_firewall
    
    print_header "УСТАНОВКА ЗАВЕРШЕНА"
    print_status "Проект установлен в: /home/app/telegram-bot"
    print_status "Пользователь для управления: app"
    
    echo ""
    print_warning "СЛЕДУЮЩИЕ ШАГИ:"
    echo "1. Загрузите файлы проекта в /home/app/telegram-bot"
    echo "2. Скопируйте .env.example в .env и заполните настройки:"
    echo "   sudo -u app cp /home/app/telegram-bot/.env.example /home/app/telegram-bot/.env"
    echo "   sudo -u app nano /home/app/telegram-bot/.env"
    echo "3. Запустите приложение:"
    echo "   sudo -u app /home/app/telegram-bot/manage.sh start"
    echo "4. Настройте webhook (замените YOUR_DOMAIN на ваш домен):"
    echo "   sudo -u app /home/app/telegram-bot/manage.sh setup-webhook https://YOUR_DOMAIN"
    echo ""
    print_status "Для управления используйте: sudo -u app /home/app/telegram-bot/manage.sh {start|stop|restart|logs|status}"
}

# Запуск скрипта
main "$@"
