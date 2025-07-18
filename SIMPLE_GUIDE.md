# 🚀 Быстрая установка Telegram Bot на сервер

## Для заказчика (простая инструкция)

### 1. Подключение к серверу

Подключитесь к вашему серверу по SSH:
```bash
ssh root@ВАШ_IP_СЕРВЕРА
```

### 2. Автоматическая установка (один скрипт)

Скопируйте и выполните эту команду:
```bash
wget -qO- https://github.com/ваш-репозиторий/raw/main/quick_install.sh | bash
```

**Или скачайте файл и запустите:**
```bash
wget https://github.com/ваш-репозиторий/raw/main/quick_install.sh
chmod +x quick_install.sh
sudo ./quick_install.sh
```

### 3. Следуйте инструкциям скрипта

Скрипт спросит у вас:
- **Токен бота** (получите у @BotFather в Telegram)
- **Username бота** (без символа @)
- **Chat ID** (ваш ID для уведомлений)
- **Пароль администратора** (любой надежный пароль)

### 4. Готово!

После установки ваш бот будет доступен по адресу:
- **Сайт**: `http://ваш-ip:3000`
- **Админка**: `http://ваш-ip:3000/admin`

## Управление ботом

### Основные команды:
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
```

## Что нужно для работы

### Обязательно:
1. **Сервер Ubuntu/Debian** с доступом по SSH
2. **Токен бота** от @BotFather
3. **Ваш Chat ID** (напишите @userinfobot в Telegram)

### Опционально:
4. **Домен** для webhook (для продакшена)
5. **CryptoBot токен** для приема платежей
6. **Telegram API** для расширенных функций

## Получение токенов

### 1. Токен бота:
1. Найдите @BotFather в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте токен

### 2. Chat ID:
1. Найдите @userinfobot в Telegram  
2. Отправьте `/start`
3. Скопируйте ваш ID

### 3. CryptoBot токен:
1. Найдите @CryptoBot в Telegram
2. Отправьте `/token`
3. Скопируйте токен

## Настройка домена (для продакшена)

### 1. Настройка DNS
Укажите A-запись вашего домена на IP сервера

### 2. Настройка Nginx + SSL
```bash
# Установка Nginx
apt install nginx certbot python3-certbot-nginx -y

# Создание конфигурации
nano /etc/nginx/sites-available/telegram-bot
```

Добавьте:
```nginx
server {
    listen 80;
    server_name ваш-домен.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Активация сайта
ln -s /etc/nginx/sites-available/telegram-bot /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Получение SSL сертификата
certbot --nginx -d ваш-домен.com
```

### 3. Настройка webhook
```bash
sudo -u app /home/app/telegram-bot/manage.sh setup-webhook https://ваш-домен.com
```

## Решение проблем

### Бот не запускается:
```bash
# Проверьте логи
sudo -u app /home/app/telegram-bot/manage.sh logs

# Проверьте статус
sudo -u app /home/app/telegram-bot/manage.sh status
```

### Проблемы с портами:
```bash
# Проверьте открытые порты
netstat -tlnp | grep 3000

# Настройте файрвол
ufw allow 3000/tcp
```

### Проблемы с доменом:
```bash
# Проверьте DNS
nslookup ваш-домен.com

# Проверьте Nginx
nginx -t
systemctl status nginx
```

## Поддержка

Если что-то не работает:
1. Проверьте логи: `sudo -u app /home/app/telegram-bot/manage.sh logs`
2. Перезапустите бота: `sudo -u app /home/app/telegram-bot/manage.sh restart`
3. Свяжитесь с разработчиком

---

**Готово! Ваш Telegram Bot должен работать.**
