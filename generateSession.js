// generateSession.js
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

// Читаем API ID и Hash из переменных окружения, переданных из bash-скрипта
const apiIdStr = process.env.TG_API_ID;
const apiHash = process.env.TG_API_HASH;

// Проверяем, что переменные были переданы
if (!apiIdStr || !apiHash) {
  console.error(
    "Ошибка: Переменные окружения TG_API_ID и TG_API_HASH должны быть установлены."
  );
  process.exit(1); // Выходим с ошибкой
}

const apiId = parseInt(apiIdStr);

if (isNaN(apiId)) {
  console.error("Ошибка: TG_API_ID должен быть числом.");
  process.exit(1);
}

(async () => {
  // Сообщения для пользователя выводим в stderr, чтобы не мешать захвату сессии
  console.error("Запуск скрипта для генерации сессии Telegram...");
  const stringSession = new StringSession("");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () =>
      await input.text(
        "Введите ваш номер телефона (например, +1234567890): "
      ),
    password: async () =>
      await input.text("Введите ваш 2FA пароль (если есть): "),
    phoneCode: async () =>
      await input.text("Введите код, полученный от Telegram: "),
    onError: (err) => console.error(err),
  });

  console.error("\n✅ Вход выполнен успешно.");
  console.error("Строка сессии будет захвачена автоматически.");

  // ВАЖНО: Выводим ТОЛЬКО строку сессии в stdout.
  // Bash-скрипт захватит именно этот вывод.
  console.log(client.session.save());

  await client.disconnect();
})();