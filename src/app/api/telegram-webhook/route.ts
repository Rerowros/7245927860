// app/api/telegram-webhook/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ЭТУ ФУНКЦИЮ МЫ БОЛЬШЕ НЕ ИСПОЛЬЗУЕМ, НО МОЖНО ОСТАВИТЬ
async function editMessage(chat_id: number, message_id: number, text: string) {
  await fetch(`${API_URL}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, message_id, text, parse_mode: "MarkdownV2" }),
  });
}

// --- НОВАЯ ФУНКЦИЯ ДЛЯ УДАЛЕНИЯ СООБЩЕНИЯ ---
async function deleteMessage(chat_id: number, message_id: number) {
    try {
        await fetch(`${API_URL}/deleteMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id, message_id }),
        });
    } catch (e) {
        console.error("Failed to delete message", e);
        // Не прерываем выполнение, если не удалось удалить сообщение
    }
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
      const { chat, message_id } = message; // Убираем `originalText`, он нам больше не нужен

      if (data.startsWith("complete_order_")) {
        const orderId = data.replace("complete_order_", "");

        const updatedOrder = await prisma.order.update({
          where: { id: orderId, status: "PENDING" }, // Убедимся, что не обновляем уже выполненный
          data: { status: "COMPLETED" },
        });

        if (updatedOrder) {
          // --- ИЗМЕНЕНО ---
          // Вместо редактирования сообщения, удаляем его
          await deleteMessage(chat.id, message_id);
          // И показываем всплывающее уведомление
          await answerCallbackQuery(id, "Заказ выполнен и удален!");

          // Важно: сбрасываем кеш для админки, чтобы там статус обновился
          revalidatePath("/admin");
        } else {
            // Если заказ уже был выполнен, просто сообщаем об этом
             await answerCallbackQuery(id, "Этот заказ уже был выполнен.");
        }
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    // Отвечаем на callback_query даже в случае ошибки, чтобы кнопка не "висела"
    if (error && typeof error === 'object' && 'callback_query' in error) {
        const { id } = (error as any).callback_query;
        await answerCallbackQuery(id, "Ошибка обработки заказа.");
    }
    return NextResponse.json({ success: false }, { status: 500 });
  }
}