// src/app/api/cryptobot-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendMessageToAdmin } from '@/lib/telegram';
import { revalidatePath } from 'next/cache';
import { verifyWebhookSignature } from '@/lib/cryptobot';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('crypto-pay-api-signature');
  const bodyText = await req.text();

  // 1. Проверяем подпись для безопасности
  if (!verifyWebhookSignature(signature, bodyText)) {
    console.warn("Invalid webhook signature received.");
    return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 403 });
  }

  try {
    const webhookData = JSON.parse(bodyText);

    // 2. Нас интересуют только события об успешной оплате
    if (webhookData.update_type !== 'invoice_paid') {
      return NextResponse.json({ success: true, message: 'Event received, but it is not a payment confirmation.' });
    }

    const { invoice_id, status } = webhookData.payload;

    if (status !== 'paid') {
      return NextResponse.json({ success: true, message: 'Invoice status is not "paid".' });
    }

    // 3. Используем транзакцию для атомарного обновления данных
    const order = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { invoiceId: String(invoice_id) },
      });

      if (!existingOrder) throw new Error(`Order not found for invoice_id: ${invoice_id}`);
      if (existingOrder.status !== 'WAITING_PAYMENT') {
        console.log(`Invoice ${invoice_id} already processed. Current status: ${existingOrder.status}`);
        return null; // Выходим, если заказ уже обработан
      }

      const totalStarsSetting = await tx.setting.findUnique({ where: { key: 'totalStars' } });
      const currentTotalStars = parseInt(totalStarsSetting?.value || '0');

      if (currentTotalStars < existingOrder.stars) {
        // Критическая ситуация: оплата получена, но товара нет.
        // Меняем статус на FAILED и отправляем админу сигнал SOS для ручного возврата.
        await tx.order.update({ where: { id: existingOrder.id }, data: { status: 'FAILED' } });
        console.error(`CRITICAL: Payment for order ${existingOrder.id} received, but not enough stars in stock!`);
        throw new Error('Insufficient stock after payment.');
      }

      // Списываем звезды
      const newTotalStars = currentTotalStars - existingOrder.stars;
      await tx.setting.update({ where: { key: 'totalStars' }, data: { value: String(newTotalStars) } });

      // Обновляем статус заказа
      return tx.order.update({
        where: { id: existingOrder.id },
        data: { status: 'COMPLETED' },
      });
    });

    if (order) {
      // Если транзакция прошла успешно, уведомляем админа о ПОДТВЕРЖДЕННОМ платеже
      await sendMessageToAdmin(order, 'CryptoBot-Paid');
      revalidatePath('/');
      revalidatePath('/admin');
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook processing failed:', error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}