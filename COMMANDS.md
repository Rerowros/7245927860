# 📋 Команды для заказчика

## Быстрая установка на сервер

### 1. Подключение к серверу
```bash
ssh root@YOUR_SERVER_IP
```

### 2. Автоматическая установка
```bash
# Скачать и запустить скрипт
wget https://raw.githubusercontent.com/your-repo/quick_install.sh
chmod +x quick_install.sh
sudo ./quick_install.sh
```

### 3. Загрузка проекта (если нужно)
```bash
# Переключиться на пользователя app
sudo -u app bash

# Перейти в директорию проекта
cd /home/app/telegram-bot

# Загрузить проект из Git
git clone https://github.com/your-repo/telegram-bot.git .

# Или скачать архив
wget https://github.com/your-repo/archive/main.zip
unzip main.zip
mv telegram-bot-main/* .
```

## Управление ботом

### Основные команды
```bash
# Запуск бота
sudo -u app /home/app/telegram-bot/manage.sh start

# Остановка бота
sudo -u app /home/app/telegram-bot/manage.sh stop

# Перезапуск бота
sudo -u app /home/app/telegram-bot/manage.sh restart

# Просмотр логов
sudo -u app /home/app/telegram-bot/manage.sh logs

# Проверка статуса
sudo -u app /home/app/telegram-bot/manage.sh status

# Обновление бота
sudo -u app /home/app/telegram-bot/manage.sh update

# Резервное копирование
sudo -u app /home/app/telegram-bot/manage.sh backup
```

## Настройка конфигурации

### Редактирование настроек
```bash
# Открыть файл конфигурации
sudo -u app nano /home/app/telegram-bot/.env
```

### Обязательные настройки
```bash
# Скопировать шаблон (если нужно)
sudo -u app cp /home/app/telegram-bot/.env.example /home/app/telegram-bot/.env

# Заполнить настройки:
TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN"           # от @BotFather
TELEGRAM_CHAT_ID="YOUR_CHAT_ID"               # ваш ID от @userinfobot
ADMIN_PASSWORD="your_secure_password"         # любой надежный пароль
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="bot_name"  # имя бота без @
```

## Настройка webhook

### Для домена
```bash
# Настроить webhook на домен
sudo -u app /home/app/telegram-bot/manage.sh setup-webhook https://yourdomain.com
```

### Ручная настройка
```bash
# Замените YOUR_BOT_TOKEN и YOUR_DOMAIN
curl -F "url=https://YOUR_DOMAIN/api/telegram-webhook" \
  https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook
```

## Проверка работы

### Проверка статуса
```bash
# Статус контейнеров
sudo -u app docker ps

# Статус приложения
sudo -u app /home/app/telegram-bot/manage.sh status

# Проверка портов
netstat -tlnp | grep 3000
```

### Просмотр логов
```bash
# Логи приложения
sudo -u app /home/app/telegram-bot/manage.sh logs

# Логи Docker
sudo -u app docker-compose -f /home/app/telegram-bot/docker-compose.yml logs -f
```

## Решение проблем

### Если бот не запускается
```bash
# 1. Проверить логи
sudo -u app /home/app/telegram-bot/manage.sh logs

# 2. Проверить конфигурацию
sudo -u app cat /home/app/telegram-bot/.env

# 3. Перезапустить
sudo -u app /home/app/telegram-bot/manage.sh restart

# 4. Проверить Docker
sudo -u app docker ps -a
```

### Если нет доступа к сайту
```bash
# Проверить файрвол
ufw status

# Открыть порт 3000
ufw allow 3000/tcp

# Проверить nginx (если используется)
systemctl status nginx
nginx -t
```

### Если webhook не работает
```bash
# Проверить настройки webhook
curl https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo

# Удалить webhook
curl https://api.telegram.org/botYOUR_BOT_TOKEN/deleteWebhook

# Установить заново
curl -F "url=https://YOUR_DOMAIN/api/telegram-webhook" \
  https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook
```

## Обновление бота

### Автоматическое обновление
```bash
sudo -u app /home/app/telegram-bot/manage.sh update
```

### Ручное обновление
```bash
# Перейти в директорию
cd /home/app/telegram-bot

# Остановить бота
sudo -u app ./manage.sh stop

# Обновить код
sudo -u app git pull

# Пересобрать контейнер
sudo -u app docker-compose build --no-cache

# Запустить бота
sudo -u app ./manage.sh start
```

## Резервное копирование

### Создание резервной копии
```bash
# Автоматическое резервное копирование
sudo -u app /home/app/telegram-bot/manage.sh backup

# Ручное копирование базы данных
sudo -u app cp /home/app/telegram-bot/prisma/dev.db \
  /home/app/backups/dev.db.$(date +%Y%m%d_%H%M%S)
```

### Восстановление из резервной копии
```bash
# Остановить бота
sudo -u app /home/app/telegram-bot/manage.sh stop

# Восстановить базу данных
sudo -u app cp /home/app/backups/dev.db.20250118_120000 \
  /home/app/telegram-bot/prisma/dev.db

# Запустить бота
sudo -u app /home/app/telegram-bot/manage.sh start
```

## Мониторинг

### Проверка ресурсов
```bash
# Использование CPU и памяти
sudo -u app docker stats

# Место на диске
df -h

# Размер логов
du -sh /home/app/telegram-bot/
```

### Настройка автоматического мониторинга
```bash
# Добавить в cron проверку каждые 5 минут
crontab -e

# Добавить строку:
*/5 * * * * /home/app/telegram-bot/monitor.sh
```

## Полезные адреса

После запуска бота:
- **Сайт**: `http://your-server-ip:3000`
- **Админка**: `http://your-server-ip:3000/admin`
- **API**: `http://your-server-ip:3000/api`

## Получение токенов

### Telegram Bot Token
1. Найти @BotFather в Telegram
2. Отправить `/newbot`
3. Следовать инструкциям
4. Скопировать токен

### Chat ID
1. Найти @userinfobot в Telegram
2. Отправить `/start`
3. Скопировать ID

### CryptoBot Token
1. Найти @CryptoBot в Telegram
2. Отправить `/token`
3. Скопировать токен

---

**Все команды готовы к копированию и выполнению!**
