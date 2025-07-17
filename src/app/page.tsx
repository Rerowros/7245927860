// app/page.tsx
import prisma from "@/lib/prisma";
import PageClient from "./PageClient";

// Настройки по умолчанию, если в БД ничего нет
const defaultConfig = {
  STAR_EXCHANGE_RATE_RUB: 1.5,
  TOTAL_AVAILABLE_STARS: 50000,
  MIN_STARS: 100,
  MAX_STARS: 5000,
};

export default async function HomePage() {
  // Получаем настройки из БД
  const settings = await prisma.setting.findMany();
  const settingsMap = settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);

  // Собираем конфиг, используя значения из БД или дефолтные
  const config = {
    STAR_EXCHANGE_RATE_RUB: parseFloat(settingsMap.exchangeRate) || defaultConfig.STAR_EXCHANGE_RATE_RUB,
    TOTAL_AVAILABLE_STARS: parseInt(settingsMap.totalStars) || defaultConfig.TOTAL_AVAILABLE_STARS,
    MIN_STARS: defaultConfig.MIN_STARS,
    MAX_STARS: defaultConfig.MAX_STARS,
  };

  // Рендерим клиентский компонент и передаем ему конфиг
  return <PageClient config={config} />;
}