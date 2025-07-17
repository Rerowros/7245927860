// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { sendMessageToAdmin } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tier, telegramUser, paymentMethod } = body;

    if (!tier || !telegramUser || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Отсутствуют обязательные поля" },
        { status: 400 }
      );
    }

    const starsToPurchase = parseInt(tier.stars.replace(/\s/g, ""));
    const price = parseFloat(tier.price.replace(/[^\d.]/g, ""));

    if (isNaN(starsToPurchase) || isNaN(price)) {
      return NextResponse.json(
        { success: false, error: "Неверные данные о тарифе" },
        { status: 400 }
      );
    }

    // Используем транзакцию для атомарного выполнения операций
    const order = await prisma.$transaction(async (tx) => {
      // 1. Получаем текущее количество звёзд
      const totalStarsSetting = await tx.setting.findUnique({
        where: { key: "totalStars" },
      });
      const currentTotalStars = parseInt(totalStarsSetting?.value || "0");

      // 2. Проверяем, достаточно ли звёзд для покупки
      if (currentTotalStars < starsToPurchase) {
        throw new Error("Недостаточно звёзд для покупки.");
      }

      // 3. Вычитаем купленные звёзды и обновляем настройку
      const newTotalStars = currentTotalStars - starsToPurchase;
      await tx.setting.update({
        where: { key: "totalStars" },
        data: { value: String(newTotalStars) },
      });

      // 4. Создаем заказ
      const newOrder = await tx.order.create({
        data: {
          telegramUsername: telegramUser.username,
          telegramName: telegramUser.name,
          telegramAvatarUrl: telegramUser.avatarUrl,
          stars: starsToPurchase,
          price: price,
          status: "PENDING",
        },
      });

      return newOrder;
    });

    // Отправляем уведомление администратору только после успешной транзакции
    await sendMessageToAdmin(order, paymentMethod);

    // Сбрасываем кеш для главной страницы и админки
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Failed to create order:", error);
    
    // Возвращаем специфическую ошибку, если звёзд не хватило
    if (error instanceof Error && error.message === "Недостаточно звёзд для покупки.") {
       return NextResponse.json(
         { success: false, error: "К сожалению, столько звёзд уже нет в наличии." },
         { status: 409 } // 409 Conflict
       );
    }

    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}