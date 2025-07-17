// app/api/telegram-webhook/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function editMessage(chat_id: number, message_id: number, text: string) {
  await fetch(`${API_URL}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, message_id, text, parse_mode: "MarkdownV2" }),
  });
}

async function answerCallbackQuery(callback_query_id: string, text: string) {
  await fetch(`${API_URL}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id, text }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.callback_query) {
      const { id, data, message } = body.callback_query;
      const { chat, message_id, text: originalText } = message;

      if (data.startsWith("complete_order_")) {
        const orderId = data.replace("complete_order_", "");

        await prisma.order.update({
          where: { id: orderId, status: "PENDING" }, // Убедимся, что не обновляем уже выполненный
          data: { status: "COMPLETED" },
        });

        const newText = `${originalText}\n\n*СТАТУС: ✅ ВЫПОЛНЕН*`;
        await editMessage(chat.id, message_id, newText);
        await answerCallbackQuery(id, "Статус заказа обновлен!");
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// Запустите эту команду в терминале один раз, чтобы зарегистрировать webhook
// Замените YOUR_VERCEL_URL на ваш реальный URL после деплоя
// curl -F "url=https://YOUR_VERCEL_URL/api/telegram-webhook" https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook