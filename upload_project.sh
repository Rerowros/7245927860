#!/bin/bash

# Скрипт для загрузки проекта на сервер
# Используется для передачи файлов проекта заказчику

set -e

PROJECT_DIR="/home/app/telegram-bot"
BACKUP_DIR="/home/app/backups"

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

# Проверка прав пользователя
check_user() {
    if [[ $USER != "app" ]]; then
        print_error "Запустите скрипт от имени пользователя app: sudo -u app $0"
        exit 1
    fi
}

# Создание резервной копии
create_backup() {
    if [[ -d "$PROJECT_DIR" ]]; then
        print_status "Создание резервной копии..."
        mkdir -p "$BACKUP_DIR"
        
        if [[ -f "$PROJECT_DIR/prisma/dev.db" ]]; then
            cp "$PROJECT_DIR/prisma/dev.db" "$BACKUP_DIR/dev.db.$(date +%Y%m%d_%H%M%S)"
            print_status "База данных скопирована в резервную копию"
        fi
        
        if [[ -f "$PROJECT_DIR/.env" ]]; then
            cp "$PROJECT_DIR/.env" "$BACKUP_DIR/.env.$(date +%Y%m%d_%H%M%S)"
            print_status "Конфигурация скопирована в резервную копию"
        fi
    fi
}

# Функция для загрузки из архива
install_from_archive() {
    local archive_path="$1"
    
    print_status "Установка из архива: $archive_path"
    
    # Создаем временную директорию
    local temp_dir=$(mktemp -d)
    
    # Распаковываем архив
    if [[ "$archive_path" == *.zip ]]; then
        unzip -q "$archive_path" -d "$temp_dir"
    elif [[ "$archive_path" == *.tar.gz ]] || [[ "$archive_path" == *.tgz ]]; then
        tar -xzf "$archive_path" -C "$temp_dir"
    else
        print_error "Неподдерживаемый формат архива. Используйте .zip или .tar.gz"
        return 1
    fi
    
    # Находим директорию с проектом
    local source_dir=$(find "$temp_dir" -name "package.json" -type f | head -1 | xargs dirname)
    
    if [[ -z "$source_dir" ]]; then
        print_error "Не найден файл package.json в архиве"
        return 1
    fi
    
    # Копируем файлы
    print_status "Копирование файлов проекта..."
    mkdir -p "$PROJECT_DIR"
    cp -r "$source_dir/"* "$PROJECT_DIR/"
    
    # Удаляем временную директорию
    rm -rf "$temp_dir"
    
    print_status "Файлы успешно установлены из архива"
}

# Функция для загрузки из Git
install_from_git() {
    local git_url="$1"
    
    print_status "Клонирование репозитория: $git_url"
    
    # Создаем директорию проекта
    mkdir -p "$PROJECT_DIR"
    
    # Клонируем репозиторий
    if [[ -d "$PROJECT_DIR/.git" ]]; then
        print_status "Обновление существующего репозитория..."
        cd "$PROJECT_DIR"
        git pull
    else
        print_status "Клонирование нового репозитория..."
        git clone "$git_url" "$PROJECT_DIR"
    fi
    
    print_status "Репозиторий успешно клонирован"
}

# Функция для загрузки по URL
install_from_url() {
    local url="$1"
    
    print_status "Загрузка из URL: $url"
    
    # Определяем имя файла
    local filename=$(basename "$url")
    local temp_file="/tmp/$filename"
    
    # Скачиваем файл
    wget -O "$temp_file" "$url"
    
    # Устанавливаем из архива
    install_from_archive "$temp_file"
    
    # Удаляем временный файл
    rm -f "$temp_file"
}

# Настройка прав доступа
fix_permissions() {
    print_status "Настройка прав доступа..."
    
    # Устанавливаем права на файлы
    chmod 644 "$PROJECT_DIR"/*.md 2>/dev/null || true
    chmod 644 "$PROJECT_DIR"/*.json 2>/dev/null || true
    chmod 644 "$PROJECT_DIR"/*.js 2>/dev/null || true
    chmod 644 "$PROJECT_DIR"/*.ts 2>/dev/null || true
    chmod 644 "$PROJECT_DIR"/*.yml 2>/dev/null || true
    chmod 644 "$PROJECT_DIR"/*.yaml 2>/dev/null || true
    
    # Устанавливаем права на исполняемые файлы
    chmod +x "$PROJECT_DIR"/*.sh 2>/dev/null || true
    
    # Создаем директорию для базы данных
    mkdir -p "$PROJECT_DIR/prisma"
    
    print_status "Права доступа настроены"
}

# Установка зависимостей
install_dependencies() {
    print_status "Установка зависимостей..."
    
    cd "$PROJECT_DIR"
    
    if [[ -f "package.json" ]]; then
        npm install
        print_status "Зависимости Node.js установлены"
    fi
    
    if [[ -f "prisma/schema.prisma" ]]; then
        npx prisma generate
        print_status "Prisma Client сгенерирован"
    fi
}

# Главная функция
main() {
    echo "================================================"
    echo "       ЗАГРУЗКА ПРОЕКТА НА СЕРВЕР"
    echo "================================================"
    echo ""
    
    check_user
    create_backup
    
    echo "Выберите способ установки:"
    echo "1. Из Git репозитория"
    echo "2. Из архива (локальный файл)"
    echo "3. Из URL (скачать архив)"
    echo "4. Пропустить (файлы уже загружены)"
    echo ""
    
    read -p "Введите номер опции (1-4): " choice
    
    case $choice in
        1)
            read -p "Введите URL Git репозитория: " git_url
            install_from_git "$git_url"
            ;;
        2)
            read -p "Введите путь к архиву: " archive_path
            install_from_archive "$archive_path"
            ;;
        3)
            read -p "Введите URL для скачивания: " url
            install_from_url "$url"
            ;;
        4)
            print_status "Пропуск загрузки файлов"
            ;;
        *)
            print_error "Неверный выбор"
            exit 1
            ;;
    esac
    
    if [[ $choice != 4 ]]; then
        fix_permissions
        install_dependencies
    fi
    
    echo ""
    echo "================================================"
    echo "       ЗАГРУЗКА ЗАВЕРШЕНА"
    echo "================================================"
    
    print_status "Проект загружен в: $PROJECT_DIR"
    
    # Проверяем наличие конфигурации
    if [[ ! -f "$PROJECT_DIR/.env" ]]; then
        print_warning "Не найден файл .env"
        print_status "Создайте конфигурацию:"
        print_status "cp $PROJECT_DIR/.env.example $PROJECT_DIR/.env"
        print_status "nano $PROJECT_DIR/.env"
    fi
    
    print_status "Следующие шаги:"
    print_status "1. Проверьте конфигурацию: nano $PROJECT_DIR/.env"
    print_status "2. Запустите приложение: $PROJECT_DIR/manage.sh start"
    print_status "3. Проверьте логи: $PROJECT_DIR/manage.sh logs"
}

# Запуск скрипта
main "$@"
