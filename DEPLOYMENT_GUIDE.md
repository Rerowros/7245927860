# Руководство по установке Telegram Bot на сервер

## Автоматическая установка (рекомендуется)

### 1. Подготовка сервера

Подключитесь к серверу по SSH:
```bash
ssh root@your-server-ip
```

### 2. Скачивание и запуск скрипта установки

```bash
# Скачиваем скрипт установки
wget https://raw.githubusercontent.com/your-repo/install_server.sh
# или
curl -O https://raw.githubusercontent.com/your-repo/install_server.sh

# Делаем исполняемым
chmod +x install_server.sh

# Запускаем установку
sudo ./install_server.sh
```

### 3. Загрузка проекта на сервер

После установки Docker загрузите файлы проекта:

```bash
# Переходим в директорию проекта
cd /home/app/telegram-bot

# Клонируем репозиторий (если используете Git)
sudo -u app git clone https://github.com/your-repo/telegram-bot.git .

# Или загружаем архив
sudo -u app wget https://github.com/your-repo/archive/main.zip
sudo -u app unzip main.zip
sudo -u app mv telegram-bot-main/* .
```

### 4. Настройка конфигурации

```bash
# Копируем шаблон конфигурации
sudo -u app cp .env.example .env

# Редактируем настройки
sudo -u app nano .env
```

**Обязательные настройки в .env:**
- `TELEGRAM_BOT_TOKEN` - токен бота от @BotFather
- `TELEGRAM_CHAT_ID` - ID чата для уведомлений
- `ADMIN_PASSWORD` - пароль администратора
- `CRYPTOBOT_API_TOKEN` - токен от @CryptoBot

### 5. Запуск приложения

```bash
# Запускаем приложение
sudo -u app ./manage.sh start

# Проверяем статус
sudo -u app ./manage.sh status

# Просматриваем логи
sudo -u app ./manage.sh logs
```

### 6. Настройка домена и webhook

```bash
# Настраиваем webhook (замените на ваш домен)
sudo -u app ./manage.sh setup-webhook https://yourdomain.com
```

## Ручная установка

### 1. Установка Docker

```bash
# Обновляем систему
apt update && apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Добавляем пользователя в группу docker
usermod -aG docker $USER

# Перезапускаем сессию
newgrp docker
```

### 2. Установка Docker Compose

```bash
# Скачиваем последнюю версию
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Делаем исполняемым
chmod +x /usr/local/bin/docker-compose
```

### 3. Настройка проекта

```bash
# Создаем директорию
mkdir -p /home/app/telegram-bot
cd /home/app/telegram-bot

# Создаем .env файл
cp .env.example .env
nano .env

# Запускаем приложение
docker-compose up -d
```

## Управление приложением

### Основные команды

```bash
# Запуск
sudo -u app ./manage.sh start

# Остановка
sudo -u app ./manage.sh stop

# Перезапуск
sudo -u app ./manage.sh restart

# Просмотр логов
sudo -u app ./manage.sh logs

# Проверка статуса
sudo -u app ./manage.sh status

# Обновление
sudo -u app ./manage.sh update

# Резервное копирование
sudo -u app ./manage.sh backup
```

### Системный сервис

Приложение автоматически запускается при загрузке системы через systemd:

```bash
# Управление сервисом
systemctl start telegram-bot
systemctl stop telegram-bot
systemctl restart telegram-bot
systemctl status telegram-bot

# Отключение автозапуска
systemctl disable telegram-bot
```

## Настройка SSL и домена

### 1. Установка Nginx

```bash
apt install nginx -y
```

### 2. Настройка Nginx

Создайте конфигурацию для вашего домена:

```bash
nano /etc/nginx/sites-available/telegram-bot
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активируем сайт
ln -s /etc/nginx/sites-available/telegram-bot /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 3. Установка SSL сертификата

```bash
# Устанавливаем Certbot
apt install certbot python3-certbot-nginx -y

# Получаем сертификат
certbot --nginx -d yourdomain.com
```

## Мониторинг и отладка

### Просмотр логов

```bash
# Логи приложения
sudo -u app docker-compose logs -f

# Логи системы
journalctl -u telegram-bot -f

# Логи Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Проверка работы

```bash
# Проверка портов
netstat -tlnp | grep 3000

# Проверка контейнеров
sudo -u app docker ps

# Проверка ресурсов
sudo -u app docker stats
```

## Безопасность

### Файрвол

```bash
# Настройка UFW
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### Резервное копирование

```bash
# Создание резервной копии
sudo -u app ./manage.sh backup

# Настройка автоматического бэкапа
crontab -e
# Добавить: 0 2 * * * /home/app/telegram-bot/manage.sh backup
```

## Обновление

```bash
# Автоматическое обновление
sudo -u app ./manage.sh update

# Ручное обновление
cd /home/app/telegram-bot
sudo -u app git pull
sudo -u app docker-compose down
sudo -u app docker-compose build --no-cache
sudo -u app docker-compose up -d
```

## Поддержка

При возникновении проблем:

1. Проверьте логи: `sudo -u app ./manage.sh logs`
2. Проверьте статус: `sudo -u app ./manage.sh status`
3. Перезапустите приложение: `sudo -u app ./manage.sh restart`

### Частые проблемы

**Проблема:** Контейнер не запускается
**Решение:** Проверьте .env файл и логи

**Проблема:** Webhook не работает
**Решение:** Убедитесь, что домен доступен извне и SSL настроен

**Проблема:** База данных не создается
**Решение:** Проверьте права доступа к файлу базы данных
