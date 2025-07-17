"use server";

export async function completeOrderAction(orderId: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Ошибка при обновлении статуса." };
  }
}


import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function loginAction(formData: FormData) {
  const password = formData.get("password");
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin-auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: "/",
    });
  } else {
    return "Неверный пароль";
  }
  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin-auth");
  redirect("/admin/login");
}

export async function updateSettingsAction(formData: FormData) {
  try {
    const exchangeRate = formData.get("exchangeRate") as string;
    const totalStars = formData.get("totalStars") as string;

    await prisma.$transaction([
      prisma.setting.upsert({
        where: { key: "exchangeRate" },
        update: { value: exchangeRate },
        create: { key: "exchangeRate", value: exchangeRate },
      }),
      prisma.setting.upsert({
        where: { key: "totalStars" },
        update: { value: totalStars },
        create: { key: "totalStars", value: totalStars },
      }),
    ]);
    revalidatePath("/admin");
    revalidatePath("/"); // Обновляем кэш главной страницы
    return { success: true, message: "Настройки успешно обновлены!" };
  } catch (error) {
    return { success: false, message: "Ошибка обновления настроек." };
  }
}