import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      paymentMethod: (order as any).paymentMethod,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });

  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
