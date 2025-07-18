import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Проверяем, что заказ существует
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Обновляем статус на PAID для симуляции
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'PAID',
        updatedAt: new Date()
      },
    });

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      message: 'Order status updated to PAID (simulated)',
    });

  } catch (error) {
    console.error('Error simulating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
