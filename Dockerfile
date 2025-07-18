# Используем официальный образ Node.js как базовый
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Копируем Prisma схему сначала
COPY prisma ./prisma/

# Устанавливаем зависимости (включая Prisma generate из postinstall)
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Собираем приложение (отключаем ESLint)
ENV NEXT_ESLINT_ENABLED=false
RUN npm run build

# Создаем директорию для базы данных
RUN mkdir -p /app/prisma

# Открываем порт 3000
EXPOSE 3000

# Создаем скрипт для запуска с миграциями
RUN echo '#!/bin/sh\n\
npx prisma migrate deploy\n\
npm start' > /app/start.sh && chmod +x /app/start.sh

# Запускаем приложение
CMD ["/app/start.sh"]