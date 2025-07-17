// app/admin/layout.tsx
import { logoutAction } from "./actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      <header className="bg-white shadow-sm dark:bg-neutral-800">
        <div className="mx-auto flex max-w-7xl justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Панель администратора
          </h1>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Выйти
            </button>
          </form>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}