// app/admin/login/page.tsx
"use client";
import { loginAction } from "@/app/admin/actions";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    const result = await loginAction(formData);
    if (result) {
      setError(result);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-900">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md dark:bg-neutral-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-neutral-800 dark:text-neutral-100">
          Вход в панель
        </h1>
        <form action={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}