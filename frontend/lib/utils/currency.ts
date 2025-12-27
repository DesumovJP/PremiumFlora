/**
 * Currency Formatting Utilities
 *
 * Функції форматування валюти та цін
 */

/**
 * Форматує ціну в гривнях
 * @param amount - Сума
 * @param showCurrency - Чи показувати "грн" (за замовчуванням: true)
 * @returns Форматований рядок (напр. "1 234 грн")
 */
export function formatPrice(amount: number, showCurrency = true): string {
  const formatted = new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  return showCurrency ? `${formatted} грн` : formatted;
}

/**
 * Форматує ціну з копійками
 * @param amount - Сума
 * @returns Форматований рядок (напр. "1 234.50 грн")
 */
export function formatPriceWithCents(amount: number): string {
  const formatted = new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} грн`;
}

/**
 * Форматує велику суму скорочено
 * @param amount - Сума
 * @returns Скорочений рядок (напр. "1.2K грн", "2.5M грн")
 */
export function formatPriceShort(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M грн`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K грн`;
  }
  return formatPrice(amount);
}

/**
 * Форматує відсоток
 * @param value - Значення відсотка (0-100)
 * @param showSign - Чи показувати знак + для позитивних значень
 * @returns Форматований рядок (напр. "+15%", "-5%")
 */
export function formatPercent(value: number, showSign = false): string {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Форматує кількість з одиницею виміру
 * @param qty - Кількість
 * @param unit - Одиниця виміру (за замовчуванням: "шт")
 */
export function formatQuantity(qty: number, unit = 'шт'): string {
  return `${qty} ${unit}`;
}
