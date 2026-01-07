/**
 * Currency Service
 *
 * Отримання офіційного курсу валют з НБУ
 * https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange
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

let cachedEurRate: CachedRate | null = null;

/**
 * Отримати курс EUR/UAH з НБУ
 */
export async function fetchEurRateFromNBU(): Promise<{ rate: number; date: string }> {
  const url = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=EUR&json';

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`NBU API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as NBUExchangeRate[];

  if (!data || data.length === 0) {
    throw new Error('NBU API returned empty response');
  }

  const eurData = data[0];

  return {
    rate: eurData.rate,
    date: eurData.exchangedate,
  };
}

/**
 * Отримати курс EUR/UAH (з кешуванням)
 */
export async function getEurRate(): Promise<number> {
  const now = Date.now();

  // Перевірка кешу
  if (cachedEurRate && (now - cachedEurRate.fetchedAt) < CACHE_TTL_MS) {
    return cachedEurRate.rate;
  }

  try {
    const { rate, date } = await fetchEurRateFromNBU();

    // Оновити кеш
    cachedEurRate = {
      rate,
      date,
      fetchedAt: now,
    };

    console.log(`[Currency] EUR rate updated: ${rate} UAH (${date})`);

    return rate;
  } catch (error) {
    console.error('[Currency] Failed to fetch EUR rate:', error);

    // Fallback на кешований курс якщо є
    if (cachedEurRate) {
      console.log(`[Currency] Using cached rate: ${cachedEurRate.rate} UAH`);
      return cachedEurRate.rate;
    }

    // Fallback на приблизний курс якщо немає кешу
    const fallbackRate = 45.0;
    console.log(`[Currency] Using fallback rate: ${fallbackRate} UAH`);
    return fallbackRate;
  }
}

/**
 * Отримати повну інформацію про курс EUR
 */
export async function getEurRateInfo(): Promise<{
  rate: number;
  date: string;
  source: 'NBU' | 'cache' | 'fallback';
  cached: boolean;
}> {
  const now = Date.now();

  // Перевірка кешу
  if (cachedEurRate && (now - cachedEurRate.fetchedAt) < CACHE_TTL_MS) {
    return {
      rate: cachedEurRate.rate,
      date: cachedEurRate.date,
      source: 'cache',
      cached: true,
    };
  }

  try {
    const { rate, date } = await fetchEurRateFromNBU();

    // Оновити кеш
    cachedEurRate = {
      rate,
      date,
      fetchedAt: now,
    };

    return {
      rate,
      date,
      source: 'NBU',
      cached: false,
    };
  } catch (error) {
    console.error('[Currency] Failed to fetch EUR rate:', error);

    if (cachedEurRate) {
      return {
        rate: cachedEurRate.rate,
        date: cachedEurRate.date,
        source: 'cache',
        cached: true,
      };
    }

    return {
      rate: 45.0,
      date: new Date().toLocaleDateString('uk-UA'),
      source: 'fallback',
      cached: false,
    };
  }
}

/**
 * Очистити кеш курсу (для тестування)
 */
export function clearRateCache(): void {
  cachedEurRate = null;
}
