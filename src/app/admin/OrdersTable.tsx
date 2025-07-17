// app/admin/OrdersTable.tsx
"use client";
import type { Order } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

import CopyUsernameButton from "./CopyUsernameButton";
// import { completeOrderAction } from "./actions";
import { useState, useTransition } from "react";

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<'all' | 'pending'>('all');
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status !== 'COMPLETED');

  const handleComplete = async (orderId: string) => {
    setLoadingId(orderId);
    startTransition(async () => {
      await fetch("/api/complete-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      setLoadingId(null);
    });
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}
          onClick={() => setFilter('all')}
        >
          Все
        </button>
        <button
          className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}
          onClick={() => setFilter('pending')}
        >
          Не выполненные
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-300">Пользователь</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-300">Заказ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-300">Дата</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-300">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-700 dark:bg-neutral-800">
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <Link href={`https://t.me/${order.telegramUsername}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <Image className="h-10 w-10 rounded-full" src={order.telegramAvatarUrl} alt="" width={40} height={40}/>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:underline">{order.telegramName}</div>
                      </div>
                    </Link>
                    <CopyUsernameButton username={order.telegramUsername} />
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-neutral-900 dark:text-neutral-100">{order.stars} ⭐️</div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">{order.price} ₽</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                  {format(new Date(order.createdAt), "dd.MM.yyyy HH:mm")}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {order.status === "COMPLETED" ? (
                    <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800 dark:bg-green-900 dark:text-green-200">Выполнен</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link href="https://fragment.com/stars/buy/" target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800">
                        Не выполнен
                      </Link>
                      <button
                        type="button"
                        className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 disabled:opacity-50"
                        disabled={isPending && loadingId === order.id}
                        onClick={() => handleComplete(order.id)}
                      >
                        {isPending && loadingId === order.id ? '...' : 'Выполнено'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}