// lib/telegram.ts
import type { Order } from "@prisma/client";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Функция для экранирования символов, которые могут конфликтовать с MarkdownV2
// В этот список нужно добавить все символы, на которые может ругаться Telegram.
function escapeMarkdownV2(text: string): string {
  const charsToEscape = "_*[]()~`>#+-=|{}.!";
  return text.split("").map(char => charsToEscape.includes(char) ? `\\${char}` : char).join("");
}

export async function sendMessageToAdmin(order: Order, paymentMethod: string) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("Telegram Bot Token or Chat ID is not configured.");
    return;
  }

  // --- ИСПРАВЛЕНО ---
  // Подготавливаем все динамические строки, экранируя их
  const userName = escapeMarkdownV2(order.telegramName);
  const userUsername = order.telegramUsername; // Имя пользователя не экранируем, т.к. оно в URL и в `code`
  const starsCount = order.stars;
  const orderPrice = escapeMarkdownV2(String(order.price)); // Экранируем цену
  const payMethod = escapeMarkdownV2(paymentMethod); // Экранируем способ оплаты
  const orderId = order.id; // ID в `code`, экранировать не нужно
  const orderDate = escapeMarkdownV2(new Date(order.createdAt).toLocaleString("ru-RU")); // Экранируем дату

  const text = `
*Новый заказ \\!* 🛒

*Пользователь:* [${userName}](https://t.me/${userUsername}) \\(\`@${userUsername}\`\\)
*Заказ:* *${starsCount}* ⭐️ за *${orderPrice}* ₽
*Способ оплаты:* ${payMethod}
*ID заказа:* \`${orderId}\`
*Время:* ${orderDate}
  `;
  // --- КОНЕЦ ИСПРАВЛЕНИЙ ---

  const inline_keyboard = [
    [{ text: "✅ Выполнено", callback_data: `complete_order_${order.id}` }],
  ];

  try {
    const response = await fetch(`${API_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: "MarkdownV2",
        reply_markup: { inline_keyboard },
      }),
    });
    const result = await response.json();
    if (!result.ok) {
      console.error("Failed to send Telegram message:", result);
    } else {
      console.log("Successfully sent notification to admin.");
    }
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}