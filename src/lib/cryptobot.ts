// src/lib/cryptobot.ts
import crypto from 'crypto';

const API_TOKEN = process.env.CRYPTOBOT_API_TOKEN;
const API_URL = "https://pay.crypt.bot/api";

if (!API_TOKEN) {
  console.warn("CRYPTOBOT_API_TOKEN environment variable is not set. CryptoBot integration will not work.");
}


type Invoice = {
  invoice_id: number;
  status: string;
  hash: string;
  asset: string;
  amount: string;
  pay_url: string;
  description?: string;
  created_at: string;
  allow_comments: boolean;
  allow_anonymous: boolean;
  is_paid: boolean;
};

type ExchangeRate = {
  is_valid: boolean;
  is_crypto: boolean;
  is_fiat: boolean;
  source: string;
  target: string;
  rate: string;
};

/**
 * Нормализует названия криптовалют для API CryptoBot
 * @param currency - Название валюты
 * @returns {string} - Нормализованное название
 */
function normalizeCurrencyName(currency: string): string {
  // Согласно документации CryptoBot API, поддерживаются следующие валюты:
  // "USDT", "TON", "BTC", "ETH", "LTC", "BNB", "TRX"
  const supportedCurrencies = ['USDT', 'TON', 'BTC', 'ETH', 'LTC', 'BNB', 'TRX'];
  
  if (supportedCurrencies.includes(currency)) {
    return currency;
  }
  
  // Если валюта не поддерживается, возвращаем TON как fallback
  return 'TON';
}

/**
 * Получает обменные курсы от CryptoBot.
 * @param source - Криптовалюта (TON, USDT, BTC, etc.)
 * @param target - Фиатная валюта (USD, EUR, RUB, etc.)
 * @returns {Promise<ExchangeRate>} - Объект с курсом обмена.
 */
export async function getExchangeRates(source: string = "TON", target: string = "RUB"): Promise<ExchangeRate> {
  if (!API_TOKEN) {
    throw new Error("CryptoBot API token is not configured.");
  }

  // Нормализуем название валюты
  const normalizedSource = normalizeCurrencyName(source);
  console.log(`Getting exchange rate for ${source} (normalized: ${normalizedSource}) to ${target}`);

  const response = await fetch(`${API_URL}/getExchangeRates`, {
    method: "GET",
    headers: {
      "Crypto-Pay-API-Token": API_TOKEN,
    },
  });

  const data = await response.json();
  console.log("Exchange rate response:", data);
  console.log("Available rates:", data.result?.map((r: any) => `${r.source} -> ${r.target}: ${r.rate}`));

  if (!data.ok) {
    console.error("CryptoBot API error:", data);
    throw new Error("Failed to get exchange rates from CryptoBot.");
  }

  // Ищем нужный курс в массиве результатов
  // API возвращает курсы в обратном порядке: target -> source
  let rate = data.result.find((r: any) => r.source === target && r.target === source);
  
  if (rate) {
    console.log(`Found reverse rate: 1 ${target} = ${rate.rate} ${source}`);
    // Инвертируем курс, так как API возвращает обратный порядок
    const invertedRate = 1 / parseFloat(rate.rate);
    return {
      is_valid: true,
      is_crypto: true,
      is_fiat: false,
      source,
      target,
      rate: invertedRate.toString(),
    };
  }
  
  // Может быть, курс в правильном порядке
  const directRate = data.result.find((r: any) => r.source === source && r.target === target);
  if (directRate) {
    console.log(`Found direct rate: 1 ${source} = ${directRate.rate} ${target}`);
    return {
      is_valid: true,
      is_crypto: true,
      is_fiat: false,
      source,
      target,
      rate: directRate.rate,
    };
  }
  
  console.log(`Direct rate ${source} to ${target} not found, trying USD fallback`);
  
  // Fallback к USD, если прямой курс не найден
  const sourceToUsd = data.result.find((r: any) => r.source === source && r.target === "USD");
  const usdToTarget = data.result.find((r: any) => r.source === "USD" && r.target === target);
  
  if (sourceToUsd && usdToTarget) {
    const calculatedRate = (parseFloat(sourceToUsd.rate) * parseFloat(usdToTarget.rate)).toString();
    console.log(`Using USD fallback: ${source} -> USD (${sourceToUsd.rate}) -> ${target} (${usdToTarget.rate}) = ${calculatedRate}`);
    return {
      is_valid: true,
      is_crypto: true,
      is_fiat: false,
      source,
      target,
      rate: calculatedRate,
    };
  } else {
    // Если и fallback не найден, возвращаем фиксированный курс
    console.log(`No rate found for ${source} to ${target}, using fallback rates`);
    const fallbackRates: { [key: string]: string } = {
      "TON-RUB": "255.0",
      "USDT-RUB": "77.0",
      "BTC-RUB": "9000000.0",
      "ETH-RUB": "280000.0",
    };
    const fallbackKey = `${source}-${target}`;
    return {
      is_valid: true,
      is_crypto: true,
      is_fiat: false,
      source,
      target,
      rate: fallbackRates[fallbackKey] || "100.0",
    };
  }
}

/**
 * Создает счет в CryptoBot.
 * @param amount - Сумма в криптовалюте (например, TON).
 * @param orderId - ID нашего заказа для привязки.
 * @param asset - Криптовалюта для оплаты (по умолчанию TON).
 * @returns {Promise<Invoice>} - Объект счета от CryptoBot.
 */
export async function createInvoice(amount: number, orderId: string, asset: string = "TON"): Promise<Invoice> {
  if (!API_TOKEN) {
    throw new Error("CryptoBot API token is not configured.");
  }

  // Проверяем, что валюта поддерживается
  const normalizedAsset = normalizeCurrencyName(asset);
  console.log(`Creating invoice for ${amount} ${asset} (validated: ${normalizedAsset})`);

  // Проверяем минимальную сумму
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  // Для разных валют могут быть разные минимальные суммы
  const minAmounts: Record<string, number> = {
    TON: 0.01,
    USDT: 1,
    BTC: 0.00001,
    ETH: 0.001,
    BNB: 0.01,
    TRX: 1,
    LTC: 0.001,
  };

  const minAmount = minAmounts[asset] || 0.01;
  if (amount < minAmount) {
    throw new Error(`Minimum amount for ${asset} is ${minAmount}`);
  }

  // Для примера используем TON. Можно заменить на USDT или другую валюту.
  // Важно: `amount` должен быть в той же валюте, что и `asset`.
  // CryptoBot API требует, чтобы amount был строкой с правильным форматом
  const formattedAmount = amount.toFixed(8).replace(/\.?0+$/, ''); // Убираем лишние нули
  
  console.log(`Creating invoice for ${formattedAmount} ${asset}`);
  
  const response = await fetch(`${API_URL}/createInvoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Crypto-Pay-API-Token": API_TOKEN,
    },
    body: JSON.stringify({
      asset: asset, // Используем оригинальное название
      amount: formattedAmount, // Передаем как строку
      description: `Покупка Stars (Заказ #${orderId.substring(0, 8)})`,
      payload: JSON.stringify({ orderId }), // Кастомное поле для вебхука
      expires_in: 3600, // Счет действителен 1 час
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    console.error("CryptoBot API error:", data);
    throw new Error("Failed to create CryptoBot invoice.");
  }

  return data.result as Invoice;
}

/**
 * Проверяет подпись вебхука от CryptoBot для безопасности.
 * @param signature - Заголовок 'crypto-pay-api-signature' из запроса.
 * @param body - Тело запроса в виде строки.
 * @returns {boolean} - true, если подпись верна.
 */
export function verifyWebhookSignature(signature: string | null, body: string): boolean {
    if (!signature || !API_TOKEN) {
      return false;
    }
    try {
      const secret = crypto.createHash('sha256').update(API_TOKEN).digest();
      const hash = crypto.createHmac('sha256', secret).update(body).digest('hex');
      return signature === hash;
    } catch (error) {
      console.error("Error verifying webhook signature:", error);
      return false;
    }
}

// Экспорт функции для получения курса одной валюты
export async function getExchangeRate(currency: string): Promise<number> {
  try {
    if (!API_TOKEN) {
      throw new Error("CryptoBot API token is not configured.");
    }

    // Получаем все курсы напрямую от API
    const response = await fetch(`${API_URL}/getExchangeRates`, {
      method: "GET",
      headers: {
        "Crypto-Pay-API-Token": API_TOKEN,
      },
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error("Failed to get exchange rates from CryptoBot.");
    }

    const rates = data.result;
    
    // Сначала пытаемся найти прямой курс currency -> RUB
    const directRate = rates.find((rate: ExchangeRate) => 
      rate.source === currency && rate.target === 'RUB'
    );
    
    if (directRate) {
      return parseFloat(directRate.rate);
    }
    
    // Если прямого курса нет, пытаемся найти обратный RUB -> currency
    const inverseRate = rates.find((rate: ExchangeRate) => 
      rate.source === 'RUB' && rate.target === currency
    );
    
    if (inverseRate) {
      return 1 / parseFloat(inverseRate.rate);
    }
    
    // Если нет ни того, ни другого, используем USD как промежуточную валюту
    const currencyToUsdRate = rates.find((rate: ExchangeRate) => 
      rate.source === currency && rate.target === 'USD'
    );
    
    const usdToRubRate = rates.find((rate: ExchangeRate) => 
      rate.source === 'USD' && rate.target === 'RUB'
    );
    
    if (currencyToUsdRate && usdToRubRate) {
      return parseFloat(currencyToUsdRate.rate) * parseFloat(usdToRubRate.rate);
    }
    
    // Если и это не работает, используем fallback
    console.warn(`No exchange rate found for ${currency}, using fallback`);
    return getDefaultRate(currency);
    
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    return getDefaultRate(currency);
  }
}

// Fallback курсы для случаев, когда API недоступен
function getDefaultRate(currency: string): number {
  const defaultRates: { [key: string]: number } = {
    'TON': 250, // 1 TON = 250 RUB
    'USDT': 78,  // 1 USDT = 78 RUB
    'BTC': 5000000, // 1 BTC = 5,000,000 RUB
    'ETH': 300000,  // 1 ETH = 300,000 RUB
    'BNB': 45000,   // 1 BNB = 45,000 RUB
    'TRX': 25,      // 1 TRX = 25 RUB
    'LTC': 15000,   // 1 LTC = 15,000 RUB
  };
  
  return defaultRates[currency] || 1;
}