/**
 * UUID Generator
 *
 * Генерація унікальних ідентифікаторів для ідемпотентних операцій
 */

export function generateOperationId(): string {
  // Використовуємо crypto.randomUUID якщо доступний (сучасні браузери)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback для старіших браузерів
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
