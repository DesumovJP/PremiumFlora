/**
 * Currency Service
 *
 * Отримання офіційного курсу валют з НБУ
 * https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange
 *
 * Підтримує:
 * - Автоматичний курс з НБУ
 * - Ручний курс (має пріоритет)
 */

interface NBUExchangeRate {
  r030: number;
  txt: string;
  rate: number;
  cc: string;
  exchangedate: string;
}

interface CachedRate {
  rate: number;
  date: string;
  fetchedAt: number;
}

// Кеш курсу (1 година)
const CACHE_TTL_MS = 60 * 60 * 1000;

let cachedUsdRate: CachedRate | null = null;

// Ручний курс (якщо встановлено - має пріоритет над НБУ)
let manualUsdRate: { rate: number; setAt: number } | null = null;

/**
 * Встановити ручний курс USD/UAH
 * @param rate - курс (наприклад 41.5), або null щоб скасувати ручний курс
 */
export function setManualUsdRate(rate: number | null): void {
  if (rate === null) {
    manualUsdRate = null;
    console.log('[Currency] Manual USD rate cleared, will use NBU rate');
  } else {
    manualUsdRate = { rate, setAt: Date.now() };
    console.log(`[Currency] Manual USD rate set: ${rate} UAH`);
  }
}

/**
 * Отримати ручний курс (якщо встановлено)
 */
export function getManualUsdRate(): number | null {
  return manualUsdRate?.rate ?? null;
}

/**
 * Отримати курс USD/UAH з НБУ
 */
export async function fetchUsdRateFromNBU(): Promise<{ rate: number; date: string }> {
  const url = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json';

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`NBU API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as NBUExchangeRate[];

  if (!data || data.length === 0) {
    throw new Error('NBU API returned empty response');
  }

  const usdData = data[0];

  return {
    rate: usdData.rate,
    date: usdData.exchangedate,
  };
}

/**
 * Отримати курс USD/UAH (з кешуванням)
 * Якщо встановлено ручний курс - повертає його
 */
export async function getUsdRate(): Promise<number> {
  // Перевірка ручного курсу (має пріоритет)
  if (manualUsdRate) {
    return manualUsdRate.rate;
  }

  const now = Date.now();

  // Перевірка кешу
  if (cachedUsdRate && (now - cachedUsdRate.fetchedAt) < CACHE_TTL_MS) {
    return cachedUsdRate.rate;
  }

  try {
    const { rate, date } = await fetchUsdRateFromNBU();

    // Оновити кеш
    cachedUsdRate = {
      rate,
      date,
      fetchedAt: now,
    };

    console.log(`[Currency] USD rate updated: ${rate} UAH (${date})`);

    return rate;
  } catch (error) {
    console.error('[Currency] Failed to fetch USD rate:', error);

    // Fallback на кешований курс якщо є
    if (cachedUsdRate) {
      console.log(`[Currency] Using cached rate: ${cachedUsdRate.rate} UAH`);
      return cachedUsdRate.rate;
    }

    // Fallback на приблизний курс якщо немає кешу
    const fallbackRate = 41.5;
    console.log(`[Currency] Using fallback rate: ${fallbackRate} UAH`);
    return fallbackRate;
  }
}

/**
 * Отримати повну інформацію про курс USD
 */
export async function getUsdRateInfo(): Promise<{
  rate: number;
  date: string;
  source: 'NBU' | 'cache' | 'fallback' | 'manual';
  cached: boolean;
  isManual: boolean;
}> {
  // Перевірка ручного курсу (має пріоритет)
  if (manualUsdRate) {
    return {
      rate: manualUsdRate.rate,
      date: new Date(manualUsdRate.setAt).toLocaleDateString('uk-UA'),
      source: 'manual',
      cached: false,
      isManual: true,
    };
  }

  const now = Date.now();

  // Перевірка кешу
  if (cachedUsdRate && (now - cachedUsdRate.fetchedAt) < CACHE_TTL_MS) {
    return {
      rate: cachedUsdRate.rate,
      date: cachedUsdRate.date,
      source: 'cache',
      cached: true,
      isManual: false,
    };
  }

  try {
    const { rate, date } = await fetchUsdRateFromNBU();

    // Оновити кеш
    cachedUsdRate = {
      rate,
      date,
      fetchedAt: now,
    };

    return {
      rate,
      date,
      source: 'NBU',
      cached: false,
      isManual: false,
    };
  } catch (error) {
    console.error('[Currency] Failed to fetch USD rate:', error);

    if (cachedUsdRate) {
      return {
        rate: cachedUsdRate.rate,
        date: cachedUsdRate.date,
        source: 'cache',
        cached: true,
        isManual: false,
      };
    }

    return {
      rate: 41.5,
      date: new Date().toLocaleDateString('uk-UA'),
      source: 'fallback',
      cached: false,
      isManual: false,
    };
  }
}

/**
 * Очистити кеш курсу (для тестування)
 */
export function clearRateCache(): void {
  cachedUsdRate = null;
}

// Backward compatibility exports (deprecated, will be removed)
/** @deprecated Use getUsdRate instead */
export const getEurRate = getUsdRate;
/** @deprecated Use getUsdRateInfo instead */
export const getEurRateInfo = getUsdRateInfo;
/** @deprecated Use fetchUsdRateFromNBU instead */
export const fetchEurRateFromNBU = fetchUsdRateFromNBU;
