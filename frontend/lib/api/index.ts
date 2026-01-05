/**
 * API Module Index
 *
 * Централізований експорт всіх API функцій
 *
 * Структура:
 * - client.ts - базові утиліти (fetchWithRetry, URLs)
 * - converters.ts - функції конвертації даних
 * - flowers.ts - CRUD для квітів
 * - customers.ts - CRUD для клієнтів
 * - transactions.ts - запити транзакцій
 * - pos.ts - POS операції (продажі, списання)
 * - analytics.ts - аналітика dashboard
 * - shifts.ts - управління змінами
 * - articles.ts - CRUD для статей
 * - tasks.ts - CRUD для завдань
 * - import.ts - Excel імпорт
 * - supply.ts - планування поставок
 */

// Client utilities
export { STRAPI_URL, API_URL, fetchWithRetry } from './client';

// Converters
export {
  extractImageUrl,
  blocksToText,
  blocksToHtml,
  convertFlowerToProduct,
  convertCustomer,
  convertTransaction,
  convertArticleToBlogPost,
  getCategoryLabel,
} from './converters';

// Flowers API
export {
  getFlowers,
  getFlowerBySlug,
  getFlowerById,
  searchFlowers,
  getFlowerDetails,
  getFlowerForEdit,
  updateFlower,
  updateVariant,
} from './flowers';

// Customers API
export {
  getCustomers,
  getCustomerById,
  createCustomer,
  deleteCustomer,
} from './customers';

// Transactions API
export {
  getTransactions,
  getPendingPaymentsTotal,
  getPendingPaymentsSummary,
  invalidatePendingPaymentsCache,
} from './transactions';

// POS API
export {
  createSale,
  createWriteOff,
  confirmPayment,
} from './pos';

// Analytics API
export {
  getDashboardAnalytics,
  getStockLevels,
} from './analytics';

// Shifts API
export {
  getCurrentShift,
  addShiftActivity,
  closeShift,
  getShifts,
} from './shifts';
export type {
  Shift,
  ShiftActivity,
  ShiftSummary,
  CloseShiftInput,
  AddActivityInput,
} from './shifts';

// Articles API
export {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getBlogPosts,
  getBlogPostById,
} from './articles';
export type { GraphQLArticle, CreateArticleInput, UpdateArticleInput } from './articles';

// Tasks API
export {
  getTasks,
  getUpcomingTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
} from './tasks';
export type { GraphQLTask, CreateTaskInput, UpdateTaskInput } from './tasks';

// Import API
export { importExcel } from './import';

// Supply API
export {
  getLowStockVariants,
  searchFlowersForSupply,
  getAllFlowersForSupply,
} from './supply';
