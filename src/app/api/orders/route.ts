// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { sendMessageToAdmin } from "@/lib/telegram";
import { createInvoice, getExchangeRates } from "@/lib/cryptobot";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tier, telegramUser, paymentMethod, cryptoCurrency } = body;

    // --- Логируем входящие данные ---
    console.log("Received order request with body:", JSON.stringify(body, null, 2));

    if (!tier || !telegramUser || !paymentMethod) {
      return NextResponse.json({ success: false, error: "Отсутствуют обязательные поля" }, { status: 400 });
    }

    const starsToPurchaseRaw = tier.stars;
    const priceRaw = tier.price;

    // Заменяем все не-цифровые символы, кроме точки для цены
    const starsToPurchase = parseInt(String(starsToPurchaseRaw).replace(/\D/g, ""));
    const price = parseFloat(String(priceRaw).replace(/[^\d.]/g, ""));

    // --- Логируем распарсенные значения ---
    console.log(`Parsed tier data: starsToPurchase = ${starsToPurchase}, price = ${price}`);

    if (isNaN(starsToPurchase) || isNaN(price)) {
      console.error("Failed to parse tier data. Raw stars:", starsToPurchaseRaw, "Raw price:", priceRaw);
      return NextResponse.json({ success: false, error: "Неверные данные о тарифе" }, { status: 400 });
    }

    // --- Проверяем, достаточно ли звезд в наличии ПЕРЕД созданием заказа ---
    const totalStarsSetting = await prisma.setting.findUnique({ where: { key: "totalStars" } });
    const currentTotalStars = parseInt(totalStarsSetting?.value || "0");

    // --- САМОЕ ВАЖНОЕ ЛОГИРОВАНИЕ ---
    console.log(`Checking stock: User wants ${starsToPurchase} stars. We have ${currentTotalStars} stars in stock.`);

    if (currentTotalStars < starsToPurchase) {
      // Если код доходит сюда, выводим сообщение об этом
      console.error(`Conflict: Not enough stars. Required: ${starsToPurchase}, Available: ${currentTotalStars}.`);
      return NextResponse.json({ success: false, error: "К сожалению, столько звёзд уже нет в наличии." }, { status: 409 });
    }

    // --- Флоу для LZT (ручная оплата) ---
    if (paymentMethod === 'LZT') {
      const order = await prisma.$transaction(async (tx) => {
        const newTotalStars = currentTotalStars - starsToPurchase;
        await tx.setting.update({ where: { key: "totalStars" }, data: { value: String(newTotalStars) } });
        const newOrder = await tx.order.create({
          data: {
            telegramUsername: telegramUser.username,
            telegramName: telegramUser.name,
            telegramAvatarUrl: telegramUser.avatarUrl,
            stars: starsToPurchase,
            price: price,
            status: "PENDING",
            paymentMethod: "LZT",
            fiatCurrency: "RUB",
          },
        });
        return newOrder;
      });

      await sendMessageToAdmin(order, paymentMethod);
      revalidatePath("/");
      revalidatePath("/admin");
      return NextResponse.json({ success: true, paymentMethod: 'LZT', orderId: order.id });
    }

    // --- Флоу для CryptoBot (автоматическая оплата) ---
    if (paymentMethod === 'CryptoBot') {
      try {
        const selectedCrypto = cryptoCurrency || "TON";
        
        // Получаем курс обмена из CryptoBot
        let exchangeRate, cryptoAmount;
        
        try {
          const rate = await getExchangeRates(selectedCrypto, "USD");
          exchangeRate = parseFloat(rate.rate) * 95; // Конвертируем USD в RUB (1 USD ≈ 95 RUB)
          cryptoAmount = price / exchangeRate;
        } catch (error) {
          console.warn("Failed to get exchange rate from CryptoBot, using fallback:", error);
          
          // Fallback курсы (примерные)
          const fallbackRates: Record<string, number> = {
            TON: 280,      // 1 TON = 280 RUB
            USDT: 95,      // 1 USDT = 95 RUB
            BTC: 6000000,  // 1 BTC = 6,000,000 RUB
            ETH: 300000,   // 1 ETH = 300,000 RUB
            BNB: 40000,    // 1 BNB = 40,000 RUB
            TRX: 15,       // 1 TRX = 15 RUB
            LTC: 12000,    // 1 LTC = 12,000 RUB
          };
          
          exchangeRate = fallbackRates[selectedCrypto] || 280;
          cryptoAmount = price / exchangeRate;
        }
        
        console.log(`Exchange rate: 1 ${selectedCrypto} = ${exchangeRate} RUB`);
        console.log(`Converting ${price} RUB to ${cryptoAmount} ${selectedCrypto}`);
        
        // Проверяем минимальную сумму для разных валют
        const minAmounts: Record<string, number> = {
          BTC: 0.01,
          ETH: 0.0001,
          USDT: 1,
          TON: 0.4,
          BNB: 0.001,
          TRX: 4,
          LTC: 0.01,
        };
        
        const minAmount = minAmounts[selectedCrypto] || 0.01;
        if (cryptoAmount < minAmount) {
          return NextResponse.json({ 
            success: false, 
            error: `Сумма слишком мала для оплаты в ${selectedCrypto}. Минимум: ${minAmount} ${selectedCrypto}` 
          }, { status: 400 });
        }
        
        const order = await prisma.order.create({
          data: {
            telegramUsername: telegramUser.username,
            telegramName: telegramUser.name,
            telegramAvatarUrl: telegramUser.avatarUrl,
            stars: starsToPurchase,
            price: price,
            status: "WAITING_PAYMENT",
            paymentMethod: "CryptoBot",
            fiatCurrency: "RUB",
            cryptoCurrency: selectedCrypto,
            cryptoAmount: cryptoAmount,
            exchangeRate: exchangeRate,
          },
        });

        const invoice = await createInvoice(cryptoAmount, order.id, selectedCrypto);

        await prisma.order.update({
          where: { id: order.id },
          data: { invoiceId: String(invoice.invoice_id) },
        });
        
        // НЕ отправляем уведомление админу здесь! 
        // Уведомление будет отправлено только после подтверждения оплаты через webhook
        
        return NextResponse.json({ 
          success: true, 
          orderId: order.id,
          paymentMethod: 'CryptoBot', 
          paymentUrl: invoice.pay_url,
          cryptoAmount: cryptoAmount,
          cryptoCurrency: selectedCrypto,
          fiatAmount: price,
          fiatCurrency: "RUB"
        });
      } catch (error) {
        console.error("CryptoBot payment flow error:", error);
        
        // Более детальная обработка ошибок
        if (error instanceof Error) {
          if (error.message.includes("Minimum amount")) {
            return NextResponse.json({ 
              success: false, 
              error: error.message 
            }, { status: 400 });
          }
          
          if (error.message.includes("exchange rates")) {
            return NextResponse.json({ 
              success: false, 
              error: "Не удалось получить курс обмена. Попробуйте позже." 
            }, { status: 500 });
          }
          
          if (error.message.includes("CryptoBot")) {
            return NextResponse.json({ 
              success: false, 
              error: "Ошибка создания счета. Проверьте выбранную валюту и попробуйте позже." 
            }, { status: 500 });
          }
        }
        
        return NextResponse.json({ 
          success: false, 
          error: "Не удалось создать счет для оплаты. Попробуйте позже." 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ success: false, error: "Неизвестный способ оплаты." }, { status: 400 });

  } catch (error) {
    console.error("Failed to create order:", error);
    if (error instanceof Error && error.message.includes("CryptoBot")) {
       return NextResponse.json({ success: false, error: "Не удалось создать счет для оплаты. Попробуйте позже." }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}