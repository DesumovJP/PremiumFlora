/**
 * Date Formatting Utilities
 *
 * Централізовані функції форматування дат для всього проекту
 */

/**
 * Форматує час з ISO рядка (HH:MM)
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Форматує дату і час з ISO рядка (DD.MM.YYYY, HH:MM)
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Форматує тривалість між двома датами
 * @param startIso - ISO рядок початку
 * @param endIso - ISO рядок кінця (якщо не вказано, використовує поточний час)
 * @returns Форматований рядок тривалості (напр. "2 год 30 хв" або "45 хв")
 */
export function formatDuration(startIso: string, endIso?: string | null): string {
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours} год ${minutes} хв`;
  }
  return `${minutes} хв`;
}

/**
 * Форматує коротку дату (DD.MM)
 */
export function formatShortDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
  });
}

/**
 * Форматує дату для відображення в українському форматі
 * @param isoString - ISO рядок дати
 * @param options - Опції форматування (за замовчуванням: день та місяць)
 */
export function formatUkrainianDate(
  isoString: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('uk-UA', options);
}

/**
 * Форматує повну дату (DD.MM.YYYY)
 */
export function formatFullDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Повертає відносний час (наприклад, "5 хв тому", "2 год тому")
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'щойно';
  if (diffMinutes < 60) return `${diffMinutes} хв тому`;
  if (diffHours < 24) return `${diffHours} год тому`;
  if (diffDays < 7) return `${diffDays} дн тому`;

  return formatFullDate(isoString);
}
