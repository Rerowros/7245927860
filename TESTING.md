// components/PurchaseModal.tsx
"use client";

import { useState, useEffect, type FC, FormEvent } from "react";
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
  const [step, setStep] = useState<"input" | "confirm" | "payment" | "processing" | "success">("input");
  const [username, setUsername] = useState("");
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('TON');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
// Иконки криптовалют
const CurrencyIcon = ({ currency, className = "h-6 w-6" }: { currency: string; className?: string }) => {
    const icons = {
        TON: () => (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z" fill="#0088cc"/>
                <path d="M8 12h8v2H8z" fill="white"/>
            </svg>
        ),
        USDT: () => (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="#26a17b"/>
                <path d="M12 6v12M8 10h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
        BTC: () => (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="#f7931a"/>
                <path d="M8 12h8M10 8h4M10 16h4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
        ETH: () => (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="#627eea"/>
                <path d="M12 3l5 8-5 3-5-3 5-8z" fill="white"/>
            </svg>
        ),
        BNB: () => (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="#f3ba2f"/>
                <path d="M8 8h8v8H8z" fill="white"/>
            </svg>
        ),
        TRX: () => (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="#ff060a"/>
                <path d="M8 8l8 4-8 4V8z" fill="white"/>
            </svg>
        ),
        LTC: () => (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="#bfbbbb"/>
                <path d="M8 6v8h8M8 12h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
        USDC: () => (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="#2775ca"/>
                <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
    };

    const Icon = icons[currency as keyof typeof icons];
    return Icon ? <Icon /> : <div className={`${className} bg-gray-400 rounded-full`} />;
};

// Компонент для кнопки выбора валюты
const CurrencyButton = ({ 
    currency, 
    selected, 
    onClick,
    isLoading = false
}: { 
    currency: string; 
    selected: boolean; 
    onClick: () => void; 
    isLoading?: boolean;
}) => (
    <button
        onClick={onClick}
        disabled={isLoading}
        className={`group relative p-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 ${
            selected 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
    >
        <div className="flex flex-col items-center gap-2">
            <div className="relative">
                <CurrencyIcon currency={currency} className="h-8 w-8" />
                {selected && isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    </div>
                )}
            </div>
            <span className="text-sm font-medium">{currency}</span>
        </div>
        {selected && !isLoading && (
            <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
        )}
    </button>
);

    // Функция для получения курса валют
    const getExchangeRate = async (currency: string) => {
        try {
            const response = await fetch('/api/cryptobot-exchange-rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ currency }),
            });
            const data = await response.json();
            return data.rate;
        } catch (error) {
            console.error('Ошибка получения курса:', error);
            return 0;
        }
    };

    // Обновление суммы к оплате при изменении валюты
    useEffect(() => {
        const updatePaymentAmount = async () => {
            if (tier && selectedCurrency) {
                setIsLoadingRate(true);
                try {
                    const priceInRub = parseFloat(tier.price.replace(/[^\d.]/g, ''));
                    const rate = await getExchangeRate(selectedCurrency);
                    if (rate > 0) {
                        const amount = priceInRub / rate;
                        setPaymentAmount(amount.toFixed(6));
                        setExchangeRate(rate);
                    } else {
                        setPaymentAmount('');
                        setExchangeRate(0);
                    }
                } catch (error) {
                    console.error('Error updating payment amount:', error);
                    setPaymentAmount('');
                    setExchangeRate(0);
                } finally {
                    setIsLoadingRate(false);
                }
            }
        };
        updatePaymentAmount();
    }, [selectedCurrency, tier]);

  // Сброс состояния при закрытии
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("input");
      setUsername("");
      setTelegramUser(null);
      setError(null);
      setIsLoading(false);
      setIsLoadingRate(false);
      setSelectedCurrency("TON");
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
      if (err instanceof Error) {
        setError(err.message || "Произошла ошибка. Попробуйте позже.");
      } else {
        setError("Произошла ошибка. Попробуйте позже.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Шаг 3: Выбор способа оплаты
  const handlePayment = async (method: "CryptoBot") => {
    if (!telegramUser) return;
    
    setIsLoading(true);
    setError(null);

    try {
      setStep("processing");
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          telegramUser,
          paymentMethod: method,
          cryptoCurrency: selectedCurrency,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        let errorMessage = "Не удалось создать заказ";
        
        if (data.error) {
          if (data.error.includes("AMOUNT_INVALID")) {
            errorMessage = "Недопустимая сумма для оплаты. Проверьте выбранную валюту и сумму заказа.";
          } else if (data.error.includes("CURRENCY_NOT_SUPPORTED")) {
            errorMessage = "Выбранная валюта не поддерживается. Попробуйте другую валюту.";
          } else if (data.error.includes("Exchange rate")) {
            errorMessage = "Временно недоступен курс обмена. Попробуйте позже или выберите другую валюту.";
          } else if (data.error.includes("UNAUTHORIZED")) {
            errorMessage = "Ошибка авторизации платежной системы. Обратитесь в поддержку.";
          } else {
            errorMessage = data.error;
          }
        } else if (response.status === 400) {
          errorMessage = "Некорректные данные заказа. Проверьте введенную информацию.";
        } else if (response.status === 500) {
          errorMessage = "Внутренняя ошибка сервера. Попробуйте позже.";
        }
        
        throw new Error(errorMessage);
      }
      
      // Сохраняем данные для отслеживания
      setOrderId(data.orderId);
      setPaymentUrl(data.paymentUrl);
      
      // Открываем ссылку для оплаты в новом окне
      window.open(data.paymentUrl, '_blank');
      
      // Начинаем отслеживание статуса
      checkPaymentStatus(data.orderId);

    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Order creation failed:", error);
      setError(error.message || "Произошла неизвестная ошибка.");
      setStep("payment");
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для проверки статуса платежа
  const checkPaymentStatus = async (orderIdToCheck: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 минут с интервалом 5 сек
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/orders/${orderIdToCheck}/status`);
        const data = await response.json();
        
        if (data.status === 'PAID' || data.status === 'COMPLETED') {
          setStep("success");
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000); // Проверяем каждые 5 секунд
        }
      } catch (error) {
        console.error('Ошибка при проверке статуса:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        }
      }
    };
    
    checkStatus();
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
                    
                    {/* Селектор валют */}
                    <div className="mt-4 mb-6">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                            <div className="flex items-center gap-2">
                                <span>Выберите криптовалюту для оплаты:</span>
                                {isLoadingRate && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                )}
                            </div>
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {['TON', 'USDT', 'BTC', 'ETH', 'BNB', 'TRX', 'LTC', 'USDC'].map((currency) => (
                                <CurrencyButton
                                    key={currency}
                                    currency={currency}
                                    selected={selectedCurrency === currency}
                                    onClick={() => setSelectedCurrency(currency)}
                                    isLoading={selectedCurrency === currency && isLoadingRate}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Детали оплаты</h3>
                            <div className="flex items-center gap-2">
                                <CurrencyIcon currency={selectedCurrency} className="h-6 w-6" />
                                <span className="font-bold text-blue-600 dark:text-blue-400">{selectedCurrency}</span>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Стоимость:</span>
                                <span className="font-semibold text-gray-800 dark:text-white">{tier.price}</span>
                            </div>
                            
                            {/* Секция с суммой к оплате */}
                            <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">К оплате:</span>
                                <div className="flex items-center gap-2">
                                    {isLoadingRate ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Загрузка...</span>
                                        </div>
                                    ) : paymentAmount ? (
                                        <>
                                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                {paymentAmount}
                                            </span>
                                            <CurrencyIcon currency={selectedCurrency} className="h-5 w-5" />
                                        </>
                                    ) : (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Не удалось получить курс</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Секция с курсом валют */}
                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                <span>Курс:</span>
                                {isLoadingRate ? (
                                    <div className="flex items-center gap-1">
                                        <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-3 w-20 rounded"></div>
                                    </div>
                                ) : exchangeRate > 0 ? (
                                    <span>1 {selectedCurrency} = {exchangeRate.toFixed(2)} ₽</span>
                                ) : (
                                    <span className="text-red-400">Курс недоступен</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button 
                            disabled={isLoading || isLoadingRate || !paymentAmount} 
                            onClick={() => handlePayment("CryptoBot")} 
                            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center justify-center gap-3">
                                {isLoading ? (
                                    <>
                                        <LoaderIcon className="h-6 w-6 animate-spin" />
                                        <span className="text-lg font-semibold">Создание счета для оплаты...</span>
                                    </>
                                ) : isLoadingRate ? (
                                    <>
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                        <span className="text-lg font-semibold">Загрузка курса валют...</span>
                                    </>
                                ) : (
                                    <>
                                        <CryptoBotIcon className="h-8 w-8" />
                                        <div className="flex flex-col items-center">
                                            <span className="text-lg font-bold">Оплатить криптовалютой</span>
                                            <span className="text-sm opacity-90">через CryptoBot</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* ШАГ 4: ОБРАБОТКА ПЛАТЕЖА */}
            {step === 'processing' && (
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                        Обработка платежа
                    </h3>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        Мы открыли страницу оплаты в новом окне. Пожалуйста, завершите оплату в CryptoBot.
                    </p>
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
                        Статус заказа обновится автоматически после подтверждения оплаты.
                    </p>
                    
                    {paymentUrl && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                                Если окно не открылось, воспользуйтесь ссылкой:
                            </p>
                            <a 
                                href={paymentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                            >
                                Перейти к оплате
                            </a>
                        </div>
                    )}
                    
                    <button 
                        onClick={handleClose} 
                        className="mt-6 w-full rounded-md bg-neutral-600 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
                    >
                        Закрыть окно
                    </button>
                </div>
            )}

            {/* ШАГ 5: УСПЕХ */}
            {step === 'success' && (
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full h-16 w-16 bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
                        Платеж успешно обработан!
                    </h3>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        Ваш заказ оплачен. Администратор скоро свяжется с вами и выдаст звёзды.
                    </p>
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
                        Спасибо за покупку! 🎉
                    </p>
                    <button 
                        onClick={handleClose} 
                        className="mt-6 w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                        Отлично!
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};