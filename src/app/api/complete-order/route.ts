import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ success: false, message: "orderId required" }, { status: 400 });
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    });
    revalidatePath("/admin");
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, message: "Ошибка при обновлении статуса." }, { status: 500 });
  }
}
