// components/PurchaseModal.tsx
"use client";

import { useState, type FC, FormEvent } from "react";
import type { SVGProps } from "react";

// Типы для нашего модального окна
type Tier = {
  name: string;
  price: string;
  stars: string;
};

type TelegramUser = {
  name: string;
  username: string;
  avatarUrl: string;
};

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: Tier | null;
}

// --- ИКОНКИ (можно вынести в отдельный файл) ---
function LoaderIcon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className={`animate-spin ${props.className}`}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
    )
}

function CryptoBotIcon(props: SVGProps<SVGSVGElement>) {
  // Простая иконка для примера
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2.5-3.5h5v-2h-5v2zm0-3h5v-2h-5v2zm0-3h5v-2h-5v2z"></path></svg>;
}

function LztIcon(props: SVGProps<SVGSVGElement>) {
  // Простая иконка для примера
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4L17,9H14V15H10V9H7L12,4Z"></path></svg>;
}

// --- Основной компонент модального окна ---
export const PurchaseModal: FC<PurchaseModalProps> = ({ isOpen, onClose, tier }) => {
  const [step, setStep] = useState<"input" | "confirm" | "payment" | "success">("input");
  const [username, setUsername] = useState("");
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Сброс состояния при закрытии
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("input");
      setUsername("");
      setTelegramUser(null);
      setError(null);
      setIsLoading(false);
    }, 300); // Даем время на анимацию закрытия
  };

  // Шаг 1: Проверка username - ОБНОВЛЕННАЯ ВЕРСИЯ
  const handleUsernameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username) return;
    setIsLoading(true);
    setError(null);
    setTelegramUser(null);

    try {
      // Вызываем наш новый API эндпоинт
      const response = await fetch(`/api/user/${username}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        // Обрабатываем ошибки сервера или API
        throw new Error(data.error || "Не удалось проверить пользователя.");
      }

      if (data.exists) {
        // Пользователь найден, обновляем состояние
        setTelegramUser({
          name: data.name || "Telegram User",
          username: data.username,
          avatarUrl: data.avatar_url,
        });
        setStep("confirm");
      } else {
        // Пользователь не найден
        setError(`Пользователь @${username} не найден.`);
      }
    } catch (err: unknown) {
      console.error(err);
      if (typeof err === "object" && err !== null && "message" in err && typeof (err as any).message === "string") {
        setError((err as any).message || "Произошла ошибка. Попробуйте позже.");
      } else {
        setError("Произошла ошибка. Попробуйте позже.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Шаг 3: Выбор способа оплаты
const handlePayment = async (method: "CryptoBot" | "LZT") => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier,
        telegramUser,
        paymentMethod: method,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Не удалось создать заказ.");
    }
    
    setIsLoading(false);
    setStep("success");

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Order creation failed:", error);
    setError(error.message || "Произошла неизвестная ошибка.");
    setIsLoading(false);
  }
};
  
  if (!isOpen || !tier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-neutral-900">
        <button onClick={handleClose} className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">×</button>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{tier.name}</h2>
          <p className="mt-1 text-sm text-neutral-500">{tier.stars} Stars за {tier.price}</p>
        </div>

        <div className="mt-8">
            {/* ШАГ 1: ВВОД USERNAME */}
            {step === "input" && (
                <form onSubmit={handleUsernameSubmit}>
                    <label htmlFor="username" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Введите ваш Telegram Username
                    </label>
                    <div className="mt-2 flex gap-2">
                        <span className="flex items-center rounded-l-md border border-r-0 border-neutral-300 bg-neutral-100 px-3 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800">@</span>
                        <input 
                            type="text" 
                            name="username" 
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full rounded-r-md border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            placeholder="durov"
                            required
                        />
                    </div>
                    {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                    <button type="submit" disabled={isLoading} className="mt-6 w-full inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isLoading ? <LoaderIcon /> : "Проверить"}
                    </button>
                </form>
            )}

            {/* ШАГ 2: ПОДТВЕРЖДЕНИЕ */}
            {step === "confirm" && telegramUser && (
                <div className="flex flex-col items-center">
                    <img src={telegramUser.avatarUrl} alt="avatar" className="h-20 w-20 rounded-full border-2 border-blue-500"/>
                    <p className="mt-4 text-xl font-bold text-neutral-900 dark:text-neutral-100">{telegramUser.name}</p>
                    <p className="text-neutral-500">@{telegramUser.username}</p>
                    <div className="mt-6 grid w-full grid-cols-2 gap-4">
                        <button onClick={() => { setStep("input"); setError(null); }} className="rounded-md bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700">
                            Изменить
                        </button>
                        <button onClick={() => setStep("payment")} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                            Подтвердить
                        </button>
                    </div>
                </div>
            )}

            {/* ШАГ 3: ВЫБОР ОПЛАТЫ */}
            {step === 'payment' && (
                <div>
                    <p className="text-center text-sm font-medium text-neutral-700 dark:text-neutral-300">Выберите способ оплаты:</p>
                    <div className="mt-4 flex flex-col gap-4">
                        <button disabled={isLoading} onClick={() => handlePayment("CryptoBot")} className="flex w-full items-center justify-center gap-3 rounded-md bg-neutral-100 p-3 text-lg font-semibold hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700">
                            {isLoading ? <LoaderIcon /> : <><CryptoBotIcon className="h-6 w-6 text-sky-500"/> Crypto Bot</>}
                        </button>
                        <button disabled={isLoading} onClick={() => handlePayment("LZT")} className="flex w-full items-center justify-center gap-3 rounded-md bg-neutral-100 p-3 text-lg font-semibold hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700">
                            {isLoading ? <LoaderIcon /> : <><LztIcon className="h-6 w-6 text-green-500"/> LZT (Market)</>}
                        </button>
                    </div>
                </div>
            )}

            {/* ШАГ 4: УСПЕХ */}
            {step === 'success' && (
                <div className="text-center">
                    <h3 className="text-xl font-bold text-green-500">Успешно!</h3>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        Ваш заказ принят. Администратор скоро свяжется с вами и выдаст звёзды.
                    </p>
                    <button onClick={handleClose} className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                        Отлично!
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};