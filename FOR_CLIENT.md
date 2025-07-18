# 🎯 Инструкция для заказчика

## Что вы получили

✅ **Готовый Telegram Bot** для продажи звёзд  
✅ **Docker-конфигурация** для простого развертывания  
✅ **Автоматические скрипты** установки на сервер  
✅ **Панель администратора** для управления  
✅ **Интеграция с CryptoBot** для приема платежей  

## 📦 Файлы проекта

```
├── quick_install.sh      # 🚀 Быстрая установка на сервер
├── install_server.sh     # 📋 Полная установка Docker
├── deploy.sh            # 🔄 Развертывание проекта
├── manage.sh            # ⚙️ Управление ботом
├── docker-compose.yml   # 🐳 Docker конфигурация
├── Dockerfile          # 📦 Docker образ
├── .env.example        # 🔧 Шаблон настроек
├── SIMPLE_GUIDE.md     # 📖 Простое руководство
├── COMMANDS.md         # 💻 Все команды
└── src/                # 📁 Исходный код
```

## 🚀 Быстрый старт (1 команда)

### 1. Подключитесь к серверу
```bash
ssh root@YOUR_SERVER_IP
```

### 2. Запустите установку
```bash
wget https://raw.githubusercontent.com/your-repo/quick_install.sh
chmod +x quick_install.sh
sudo ./quick_install.sh
```

### 3. Следуйте инструкциям
Скрипт спросит:
- Токен бота (от @BotFather)
- Username бота
- Chat ID (от @userinfobot)  
- Пароль администратора

### 4. Готово!
Бот доступен по адресу: `http://your-server-ip:3000`

## 📋 Что нужно подготовить

### Обязательно:
1. **Сервер Ubuntu/Debian** с SSH доступом
2. **Токен Telegram бота** - получите у @BotFather
3. **Ваш Chat ID** - получите у @userinfobot
4. **Пароль для админки** - любой надежный пароль

### Опционально:
5. **Домен** - для красивого URL и SSL
6. **CryptoBot токен** - для приема крипто-платежей

## 🔧 Получение токенов

### Токен бота:
1. Найдите @BotFather в Telegram
2. Отправьте `/newbot`
3. Придумайте имя и username для бота
4. Скопируйте токен

### Chat ID:
1. Найдите @userinfobot в Telegram
2. Отправьте `/start`
3. Скопируйте ваш ID

### CryptoBot токен (для платежей):
1. Найдите @CryptoBot в Telegram
2. Отправьте `/token`
3. Скопируйте токен

## 💻 Управление ботом

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

## 🌐 Настройка домена

### Если у вас есть домен:

1. **Настройте DNS**: Укажите A-запись на IP сервера
2. **Установите Nginx**:
   ```bash
   apt install nginx certbot python3-certbot-nginx -y
   ```
3. **Настройте SSL**:
   ```bash
   certbot --nginx -d yourdomain.com
   ```
4. **Настройте webhook**:
   ```bash
   sudo -u app /home/app/telegram-bot/manage.sh setup-webhook https://yourdomain.com
   ```

## 📊 Панель администратора

После запуска бота:
- **Сайт**: `http://your-server-ip:3000`
- **Админка**: `http://your-server-ip:3000/admin`
- **Логин**: используйте пароль из .env файла

В админке вы можете:
- Просматривать все заказы
- Управлять настройками
- Отслеживать статистику

## 🆘 Если что-то не работает

### 1. Проверьте логи:
```bash
sudo -u app /home/app/telegram-bot/manage.sh logs
```

### 2. Проверьте статус:
```bash
sudo -u app /home/app/telegram-bot/manage.sh status
```

### 3. Перезапустите:
```bash
sudo -u app /home/app/telegram-bot/manage.sh restart
```

### 4. Проверьте конфигурацию:
```bash
sudo -u app nano /home/app/telegram-bot/.env
```

## 📞 Поддержка

**Что делать если:**

❌ **Бот не отвечает** → Проверьте токен бота и webhook  
❌ **Нет доступа к сайту** → Проверьте файрвол (порт 3000)  
❌ **Ошибки в логах** → Проверьте конфигурацию .env  
❌ **Платежи не работают** → Проверьте CryptoBot токен  

## 🎉 Поздравляем!

Ваш Telegram Bot готов к работе!

### Что дальше:
1. Протестируйте бота в Telegram
2. Настройте домен (если есть)
3. Добавьте необходимые настройки
4. Начинайте принимать заказы!

---

**Нужна помощь? Свяжитесь с разработчиком.**
