// app/admin/page.tsx
import prisma from "@/lib/prisma";
import SettingsForm from "./SettingsForm";
import OrdersTable from "./OrdersTable";

export const revalidate = 10; // Revalidate data every 10 seconds

async function getSettings() {
  const settings = await prisma.setting.findMany();
  const settingsMap = settings.reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    },
    {} as Record<string, string>
  );
  return {
    exchangeRate: settingsMap.exchangeRate || "1.5",
    totalStars: settingsMap.totalStars || "50000",
  };
}

export default async function AdminPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });
  const settings = await getSettings();

  return (
    <div className="space-y-8">
      <div className="rounded-lg bg-white p-6 shadow dark:bg-neutral-800">
        <h2 className="mb-4 text-lg font-medium leading-6 text-neutral-900 dark:text-neutral-100">
          Настройки
        </h2>
        <SettingsForm settings={settings} />
      </div>
      <div className="rounded-lg bg-white p-6 shadow dark:bg-neutral-800">
        <h2 className="mb-4 text-lg font-medium leading-6 text-neutral-900 dark:text-neutral-100">
          Заказы
        </h2>
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}