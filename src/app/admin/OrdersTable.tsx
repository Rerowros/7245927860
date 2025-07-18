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
  const [filter, setFilter] = useState<'all' | 'pending' | 'waiting_payment' | 'paid' | 'completed' | 'failed'>('all');
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.status === 'PENDING';
    if (filter === 'waiting_payment') return order.status === 'WAITING_PAYMENT';
    if (filter === 'paid') return order.status === 'PAID';
    if (filter === 'completed') return order.status === 'COMPLETED';
    if (filter === 'failed') return order.status === 'FAILED';
    return true;
  });

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

  const handleSimulatePayment = async (orderId: string) => {
    setLoadingId(orderId);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/simulate-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        
        if (response.ok) {
          // Заказ будет обновлен через revalidatePath в handleComplete
          console.log('Payment simulated successfully');
        } else {
          console.error('Failed to simulate payment');
        }
      } catch (error) {
        console.error('Error simulating payment:', error);
      } finally {
        setLoadingId(null);
      }
    });
  };

  return (
    <div>
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}
          onClick={() => setFilter('all')}
        >
          Все ({orders.length})
        </button>
        <button
          className={`px-3 py-1 rounded text-sm ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}
          onClick={() => setFilter('pending')}
        >
          Ожидают ({orders.filter(o => o.status === 'PENDING').length})
        </button>
        <button
          className={`px-3 py-1 rounded text-sm ${filter === 'waiting_payment' ? 'bg-yellow-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}
          onClick={() => setFilter('waiting_payment')}
        >
          Ожидание оплаты ({orders.filter(o => o.status === 'WAITING_PAYMENT').length})
        </button>
        <button
          className={`px-3 py-1 rounded text-sm ${filter === 'paid' ? 'bg-purple-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}
          onClick={() => setFilter('paid')}
        >
          Оплачено ({orders.filter(o => o.status === 'PAID').length})
        </button>
        <button
          className={`px-3 py-1 rounded text-sm ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}
          onClick={() => setFilter('completed')}
        >
          Выполнено ({orders.filter(o => o.status === 'COMPLETED').length})
        </button>
        <button
          className={`px-3 py-1 rounded text-sm ${filter === 'failed' ? 'bg-red-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}
          onClick={() => setFilter('failed')}
        >
          Ошибки ({orders.filter(o => o.status === 'FAILED').length})
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-300">Пользователь</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-300">Заказ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-300">Способ оплаты</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-300">Дата</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-300">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-700 dark:bg-neutral-800">
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <Link href={`https://fragment.com/stars/buy`} target="_blank" rel="noopener noreferrer" className="flex items-center">
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
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {order.price} {(order as any).fiatCurrency || '₽'}
                    {(order as any).cryptoAmount && (order as any).cryptoCurrency && (
                      <div className="text-xs text-neutral-400">
                        {(order as any).cryptoAmount.toFixed(4)} {(order as any).cryptoCurrency}
                      </div>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-neutral-900 dark:text-neutral-100">
                    {(order as any).paymentMethod || 'Не указано'}
                  </div>
                  {(order as any).invoiceId && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      ID: {(order as any).invoiceId.substring(0, 8)}
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                  {format(new Date(order.createdAt), "dd.MM.yyyy HH:mm")}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {order.status === "COMPLETED" ? (
                    <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800 dark:bg-green-900 dark:text-green-200">
                      ✓ Выполнен
                    </span>
                  ) : order.status === "WAITING_PAYMENT" ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        ⏳ Ожидание оплаты
                      </span>
                      <button
                        type="button"
                        className="inline-flex rounded-full bg-purple-100 px-2 text-xs font-semibold leading-5 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800 disabled:opacity-50"
                        disabled={isPending && loadingId === order.id}
                        onClick={() => handleSimulatePayment(order.id)}
                        title="Симулировать успешную оплату для тестирования"
                      >
                        {isPending && loadingId === order.id ? '...' : '🎯 Симулировать оплату'}
                      </button>
                    </div>
                  ) : order.status === "PAID" ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex rounded-full bg-purple-100 px-2 text-xs font-semibold leading-5 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        💰 Оплачено
                      </span>
                      <button
                        type="button"
                        className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 disabled:opacity-50"
                        disabled={isPending && loadingId === order.id}
                        onClick={() => handleComplete(order.id)}
                      >
                        {isPending && loadingId === order.id ? '...' : '✓ Выполнить'}
                      </button>
                    </div>
                  ) : order.status === "FAILED" ? (
                    <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800 dark:bg-red-900 dark:text-red-200">
                      ✗ Ошибка
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link href="https://fragment.com/stars/buy/" target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800">
                        📋 Ожидает обработки
                      </Link>
                      <button
                        type="button"
                        className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 disabled:opacity-50"
                        disabled={isPending && loadingId === order.id}
                        onClick={() => handleComplete(order.id)}
                      >
                        {isPending && loadingId === order.id ? '...' : '✓ Выполнить'}
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