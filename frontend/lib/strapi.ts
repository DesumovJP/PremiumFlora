/**
 * Strapi API Module - Re-export
 *
 * Backward compatibility: реекспорт з нової модульної структури api/
 * Всі нові імпорти мають використовувати @/lib/api
 *
 * Оригінальний файл був розбитий на модулі:
 * - api/client.ts - базові утиліти
 * - api/converters.ts - функції конвертації
 * - api/flowers.ts - CRUD для квітів
 * - api/customers.ts - CRUD для клієнтів
 * - api/transactions.ts - запити транзакцій
 * - api/pos.ts - POS операції
 * - api/analytics.ts - аналітика
 * - api/shifts.ts - управління змінами
 * - api/articles.ts - CRUD для статей
 * - api/tasks.ts - CRUD для завдань
 * - api/import.ts - Excel імпорт
 * - api/supply.ts - планування поставок
 */

// Re-export everything from api modules
export * from './api/index';
