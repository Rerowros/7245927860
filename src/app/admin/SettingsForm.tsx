// app/admin/SettingsForm.tsx
"use client";
import { useState } from "react";
import { updateSettingsAction } from "./actions";

type Settings = { exchangeRate: string; totalStars: string };

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    const result = await updateSettingsAction(formData);
    setMessage({ text: result.message, isError: !result.success });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="exchangeRate" className="block text-sm font-medium dark:text-neutral-300">Курс (1 ⭐️ = X ₽)</label>
        <input type="number" step="0.01" name="exchangeRate" id="exchangeRate" defaultValue={settings.exchangeRate} className="mt-1 w-full rounded-md border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:max-w-xs" />
      </div>
      <div>
        <label htmlFor="totalStars" className="block text-sm font-medium dark:text-neutral-300">Всего доступно звёзд</label>
        <input type="number" name="totalStars" id="totalStars" defaultValue={settings.totalStars} className="mt-1 w-full rounded-md border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:max-w-xs" />
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Сохранить</button>
        {message && <p className={`text-sm ${message.isError ? 'text-red-500' : 'text-green-500'}`}>{message.text}</p>}
      </div>
    </form>
  );
}