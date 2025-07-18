# Telegram Bot для продажи звёзд

Это Next.js приложение для создания Telegram бота, который продает звёзды с интеграцией платежей через CryptoBot.

## 🚀 Быстрая установка на сервер

### Автоматическая установка (рекомендуется)
```bash
# Подключитесь к серверу
ssh root@your-server-ip

# Запустите скрипт быстрой установки
wget -qO- https://raw.githubusercontent.com/your-repo/quick_install.sh | bash
```

### Ручная установка
См. подробную инструкцию в [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📋 Требования

- Ubuntu/Debian сервер
- Docker и Docker Compose
- Токен Telegram бота от @BotFather
- Chat ID для уведомлений

## 🛠 Локальная разработка

### Установка зависимостей
```bash
npm install
```

### Настройка окружения
```bash
# Скопируйте шаблон конфигурации
cp .env.example .env

# Заполните необходимые переменные
nano .env
```

### Запуск в режиме разработки
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 🐳 Docker

### Локальный запуск через Docker
```bash
# Сборка и запуск
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Управление на сервере
```bash
# Запуск
sudo -u app /home/app/telegram-bot/manage.sh start

# Остановка
sudo -u app /home/app/telegram-bot/manage.sh stop

# Перезапуск
sudo -u app /home/app/telegram-bot/manage.sh restart

# Логи
sudo -u app /home/app/telegram-bot/manage.sh logs

# Статус
sudo -u app /home/app/telegram-bot/manage.sh status
```

## ⚙️ Настройка

### Переменные окружения

| Переменная | Описание | Обязательно |
|------------|----------|-------------|
| `DATABASE_URL` | URL базы данных SQLite | ✅ |
| `TELEGRAM_BOT_TOKEN` | Токен бота от @BotFather | ✅ |
| `TELEGRAM_CHAT_ID` | ID чата для уведомлений | ✅ |
| `ADMIN_PASSWORD` | Пароль администратора | ✅ |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Username бота | ✅ |
| `CRYPTOBOT_API_TOKEN` | Токен CryptoBot API | ❌ |
| `NEXT_PUBLIC_TELEGRAM_API_ID` | Telegram API ID | ❌ |
| `NEXT_PUBLIC_TELEGRAM_API_HASH` | Telegram API Hash | ❌ |

### Получение токенов

1. **Токен бота**: @BotFather → `/newbot`
2. **Chat ID**: @userinfobot → `/start`
3. **CryptoBot токен**: @CryptoBot → `/token`
4. **Telegram API**: https://my.telegram.org

## 🌐 Развертывание

### Быстрое развертывание
```bash
# Скачайте и запустите скрипт
wget https://raw.githubusercontent.com/your-repo/quick_install.sh
chmod +x quick_install.sh
sudo ./quick_install.sh
```

### Настройка домена
```bash
# Настройте webhook
sudo -u app /home/app/telegram-bot/manage.sh setup-webhook https://yourdomain.com
```

## 📚 Документация

- [Руководство по развертыванию](DEPLOYMENT_GUIDE.md) - Подробная инструкция
- [Простое руководство](SIMPLE_GUIDE.md) - Для заказчиков
- [Тестирование](TESTING.md) - Инструкции по тестированию

## 🔧 Управление

### Команды управления
```bash
# Все команды выполняются от имени пользователя app
sudo -u app /home/app/telegram-bot/manage.sh COMMAND

# Доступные команды:
# start    - Запуск приложения
# stop     - Остановка приложения  
# restart  - Перезапуск приложения
# logs     - Просмотр логов
# status   - Статус приложения
# update   - Обновление приложения
# backup   - Резервное копирование
```

## 🚨 Решение проблем

### Проверка логов
```bash
sudo -u app /home/app/telegram-bot/manage.sh logs
```

### Перезапуск при проблемах
```bash
sudo -u app /home/app/telegram-bot/manage.sh restart
```

### Проверка статуса
```bash
sudo -u app /home/app/telegram-bot/manage.sh status
```

## 📦 Структура проекта

```
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React компоненты
│   └── lib/                 # Утилиты и библиотеки
├── prisma/                  # База данных
├── docker-compose.yml       # Docker Compose конфигурация
├── Dockerfile              # Docker образ
├── install_server.sh       # Скрипт полной установки
├── quick_install.sh        # Скрипт быстрой установки
└── manage.sh               # Скрипт управления
```

## 🤝 Поддержка

При возникновении проблем:

1. Проверьте логи приложения
2. Убедитесь, что все токены корректны
3. Проверьте доступность портов
4. Свяжитесь с разработчиком

---

**Готово! Ваш Telegram Bot готов к работе.**

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
