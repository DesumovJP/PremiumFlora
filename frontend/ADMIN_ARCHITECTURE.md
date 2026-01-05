# Premium Flora Admin Panel - Повна документація

> Останнє оновлення: Січень 2026

## Зміст

1. [Огляд архітектури](#1-огляд-архітектури)
2. [Моделі даних](#2-моделі-даних)
3. [Backend API](#3-backend-api)
4. [Frontend секції](#4-frontend-секції)
5. [Потоки даних](#5-потоки-даних)
6. [Аналітика](#6-аналітика)
7. [Безпека та ідемпотентність](#7-безпека-та-ідемпотентність)
8. [Кешування](#8-кешування)
9. [Експорт даних](#9-експорт-даних)

---

## 1. Огляд архітектури

### Стек технологій

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16 + React)                │
│  TypeScript, TailwindCSS, Shadcn/UI, Recharts                   │
├─────────────────────────────────────────────────────────────────┤
│                    BACKEND (Strapi v5)                          │
│  Custom controllers, services, PostgreSQL                       │
└─────────────────────────────────────────────────────────────────┘
```

### Структура файлів

```
/backend/src/api/
├── analytics/       # Аналітика та KPI
├── auth/           # Аутентифікація
├── customer/       # Клієнти
├── flower/         # Товари (квіти)
├── import/         # Імпорт Excel
├── planned-supply/ # Планування поставок
├── pos/            # Точка продажів (POS)
├── shift/          # Зміни
├── supply/         # Записи поставок
├── transaction/    # Транзакції
├── variant/        # Варіанти товарів
├── article/        # Статті/нотатки
└── task/           # Завдання

/frontend/
├── app/admin/      # Головна сторінка адмінки
├── components/sections/  # Секції адмінки
├── hooks/          # React хуки
├── lib/api/        # API клієнти
└── lib/types/      # TypeScript типи
```

---

## 2. Моделі даних

### 2.1 Flower (Товар)

```typescript
{
  documentId: string;       // Унікальний ID документа
  name: string;             // Назва квітки
  slug: string;             // URL-friendly назва (унікальна)
  description?: RichText;   // Опис (блоки Strapi)
  image?: Media;            // Зображення
  variants: Variant[];      // Варіанти (розміри)
  publishedAt?: string;     // Дата публікації
  locale: string;           // Мова (uk/en)
}
```

### 2.2 Variant (Варіант товару)

```typescript
{
  documentId: string;
  length: number;           // Довжина в см
  stock: number;            // Кількість на складі
  price: number;            // Ціна в грн
  flower: Flower;           // Зв'язок з квіткою
}
```

### 2.3 Customer (Клієнт)

```typescript
{
  documentId: string;
  name: string;             // Ім'я клієнта
  type: 'VIP' | 'Regular' | 'Wholesale';  // Тип
  phone?: string;           // Телефон
  email?: string;           // Email
  address?: string;         // Адреса
  totalSpent: number;       // Загальна сума покупок
  orderCount: number;       // Кількість замовлень
  transactions: Transaction[];  // Історія транзакцій
}
```

### 2.4 Transaction (Транзакція)

```typescript
{
  documentId: string;
  date: string;             // Дата операції
  type: 'sale' | 'writeOff';  // Тип: продаж або списання
  operationId: string;      // Унікальний ID операції (ідемпотентність)
  paymentStatus: 'pending' | 'paid' | 'expected' | 'cancelled';
  amount: number;           // Сума в грн
  items: TransactionItem[]; // Товари
  customer?: Customer;      // Клієнт (для продажів)
  paymentDate?: string;     // Дата оплати
  notes?: string;           // Примітки
  writeOffReason?: 'damage' | 'expiry' | 'adjustment' | 'other';
}

// Елемент транзакції
interface TransactionItem {
  flowerSlug: string;       // Slug квітки
  name: string;             // Назва (для історії)
  length: number;           // Довжина
  qty: number;              // Кількість
  price: number;            // Ціна за одиницю
}
```

### 2.5 Shift (Зміна)

```typescript
{
  documentId: string;
  startedAt: string;        // Початок зміни
  closedAt?: string;        // Кінець зміни
  status: 'active' | 'closed';
  activities: Activity[];   // JSON масив активностей
  summary?: ShiftSummary;   // Підсумки зміни
  totalSales: number;       // Кількість продажів
  totalSalesAmount: number; // Сума продажів
  totalWriteOffs: number;   // Кількість списань
  totalWriteOffsQty: number;// Кількість списаних одиниць
  notes?: string;           // Примітки при закритті
}
```

### 2.6 Activity (Активність зміни)

```typescript
type ActivityType =
  | 'sale'           // Продаж
  | 'writeOff'       // Списання
  | 'productEdit'    // Редагування товару
  | 'productCreate'  // Створення товару
  | 'productDelete'  // Видалення товару
  | 'variantDelete'  // Видалення варіанту
  | 'paymentConfirm' // Підтвердження оплати
  | 'customerCreate' // Створення клієнта
  | 'customerDelete' // Видалення клієнта
  | 'supply';        // Поставка (імпорт)

interface Activity {
  id: string;
  type: ActivityType;
  timestamp: string;
  details: ActivityDetails;
}
```

### 2.7 Supply (Запис поставки)

```typescript
{
  documentId: string;
  filename: string;         // Ім'я Excel файлу
  checksum: string;         // MD5 хеш для дедуплікації
  dateParsed: string;       // Дата імпорту
  awb?: string;             // Air Waybill номер
  supplier?: string;        // Постачальник
  rows: ImportRow[];        // Розпарсені рядки
  supplyStatus: 'success' | 'failed' | 'dry-run';
  supplyErrors?: string[];  // Помилки
  supplyWarnings?: string[];// Попередження
}
```

---

## 3. Backend API

### 3.1 POS Endpoints

#### POST /api/pos/sales
Створення продажу з атомарною транзакцією.

**Request:**
```json
{
  "operationId": "sale_abc123_1704067200000",
  "customerId": "doc_xyz789",
  "items": [
    {
      "flowerSlug": "red-rose",
      "length": 60,
      "qty": 10,
      "price": 45,
      "name": "Червона троянда"
    }
  ],
  "discount": 50,
  "paymentStatus": "paid",
  "notes": "Подарунок"
}
```

**Response (success):**
```json
{
  "success": true,
  "data": {
    "transaction": { ... },
    "stockUpdates": [
      {
        "flowerSlug": "red-rose",
        "length": 60,
        "previousStock": 100,
        "newStock": 90,
        "deducted": 10
      }
    ]
  }
}
```

**Response (error):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Недостатньо товару на складі",
    "details": {
      "flowerSlug": "red-rose",
      "length": 60,
      "requested": 10,
      "available": 5
    }
  }
}
```

#### POST /api/pos/write-offs
Списання товару.

**Request:**
```json
{
  "operationId": "wo_abc123_1704067200000",
  "flowerSlug": "white-lily",
  "length": 70,
  "qty": 5,
  "reason": "damage",
  "notes": "Пошкоджено при транспортуванні"
}
```

#### PUT /api/pos/transactions/:id/confirm-payment
Підтвердження оплати очікуваного платежу.

### 3.2 Shift Endpoints

| Endpoint | Метод | Опис |
|----------|-------|------|
| `/api/shifts/current` | GET | Отримати або створити активну зміну |
| `/api/shifts/current/activity` | POST | Додати активність до зміни |
| `/api/shifts/close` | POST | Закрити зміну |
| `/api/shifts` | GET | Список змін (пагінація) |
| `/api/shifts/:documentId` | GET | Деталі зміни |

### 3.3 Analytics Endpoints

| Endpoint | Метод | Опис |
|----------|-------|------|
| `/api/analytics/dashboard` | GET | Повна аналітика (KPI, графіки) |
| `/api/analytics/stock` | GET | Рівні складу |
| `/api/analytics/sales` | GET | Метрики продажів |
| `/api/analytics/write-offs` | GET | Статистика списань |
| `/api/analytics/customers/top` | GET | Топ клієнтів |
| `/api/analytics/daily-sales` | GET | Щоденні продажі |

**Query параметри:**
- `year` - рік (опційно, за замовчуванням поточний)
- `month` - місяць 0-11 (опційно, за замовчуванням поточний)

### 3.4 Import Endpoints

#### POST /api/imports/excel
Імпорт Excel файлу з товарами.

**Request (multipart/form-data):**
```
file: [Excel file]
dryRun: "true" | "false"
stockMode: "replace" | "add"
priceMode: "replace" | "skip"
applyPriceCalculation: "true" | "false"
exchangeRate: "42.5"
marginMultiplier: "2.5"
forceImport: "true" | "false"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "success",
    "stats": {
      "flowersCreated": 3,
      "flowersUpdated": 57,
      "variantsCreated": 12,
      "variantsUpdated": 145
    },
    "operations": [...],
    "rows": [...],
    "warnings": []
  }
}
```

### 3.5 Supply Planning Endpoints

| Endpoint | Метод | Опис |
|----------|-------|------|
| `/api/planned-supply/low-stock` | GET | Варіанти з stock < 150 |
| `/api/planned-supply/search?q=` | GET | Пошук товарів |
| `/api/planned-supply/all-flowers` | GET | Всі товари для планування |

---

## 4. Frontend секції

### 4.1 POS Section (Каса)
**Файл:** `components/sections/pos-section.tsx`

**Функціонал:**
- Сітка/список товарів з пошуком
- Кошик з живими розрахунками
- Вибір/створення клієнта
- Вибір статусу оплати (сплачено/очікується)
- Застосування знижки
- Примітки до замовлення
- Мобільна адаптація

**Ключові стейти:**
```typescript
cart: CartItem[]              // Кошик
selectedCustomer: Customer    // Вибраний клієнт
discount: number              // Знижка
paymentStatus: 'paid' | 'expected'
isCheckingOut: boolean        // Процес оформлення
```

### 4.2 Products Section (Товари)
**Файл:** `components/sections/products-section.tsx`

**Функціонал:**
- Таблиця товарів з фільтрами
- Попередження про низький склад (< 150)
- Сортування по назві/ціні/складу/даті
- Створення/редагування/видалення товарів
- Створення/редагування/видалення варіантів
- Списання окремих позицій
- Імпорт з Excel
- Планування поставок
- Експорт в Excel

**Модальні вікна:**
- `AddProductModal` - новий товар
- `EditProductModal` - редагування
- `WriteOffModal` - списання
- `DeleteModal` - підтвердження видалення
- `ImportModal` - імпорт Excel
- `PlannedSupplyModal` - планування поставок

### 4.3 Clients Section (Клієнти)
**Файл:** `components/sections/clients-section.tsx`

**Функціонал:**
- Список клієнтів з пошуком
- VIP позначки
- Контактна інформація
- Кількість замовлень та загальна сума
- Відстеження непогашених платежів
- Історія транзакцій по клієнту
- Створення/видалення клієнтів
- Підтвердження оплати
- Експорт в Excel

### 4.4 History Section (Історія)
**Файл:** `components/sections/history-section.tsx`

**Функціонал:**
- Активності поточної зміни з іконками/кольорами
- Підсумки зміни (продажі, списання, поставки)
- Закриття зміни
- Архів минулих змін
- Календар з візуалізацією днів
- Експорт зміни в Excel

**Типи активностей:**
| Тип | Іконка | Колір | Опис |
|-----|--------|-------|------|
| sale | ShoppingBag | Зелений | Продаж |
| writeOff | PackageMinus | Жовтий | Списання |
| productEdit | Pencil | Синій | Редагування товару |
| productCreate | Plus | Індіго | Створення товару |
| productDelete | Trash | Червоний | Видалення товару |
| supply | Truck | Cyan | Поставка |
| paymentConfirm | CreditCard | Зелений | Підтвердження оплати |
| customerCreate | UserPlus | Фіолетовий | Новий клієнт |

### 4.5 Analytics Section (Аналітика)
**Файл:** `components/sections/analytics-section.tsx`

**Функціонал:**
- KPI картки (виручка, замовлення, середній чек)
- Графік виручки по тижнях
- Графік замовлень
- Розподіл по категоріях (pie chart)
- Денний тренд продажів
- Топ товарів
- Топ списаних квітів
- Топ клієнтів
- Непогашені борги клієнтів
- Навігація по місяцях/роках

### 4.6 Articles Section (Статті)
**Файл:** `components/sections/articles-section.tsx`

**Функціонал:**
- Створення/редагування/видалення статей
- Категорії: нотатка, гайд, процедура, інфо, блог, догляд
- Пріоритети: низький, середній, високий
- Закріплення важливих статей
- Публічні/внутрішні статті
- Rich text редагування
- Підтримка зображень

### 4.7 Todo Section (Завдання)
**Файл:** `components/sections/todo-section.tsx`

**Функціонал:**
- Створення/редагування/видалення завдань
- Пріоритети з кольоровими індикаторами
- Категорії: доставка, поставка, обслуговування, зустріч, інше
- Статуси: очікує, в процесі, завершено, скасовано
- Дедлайни з нагадуваннями
- Таби (активні/завершені)

---

## 5. Потоки даних

### 5.1 Потік продажу

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Користувач вибирає товари → додає в кошик                    │
│ 2. Вибирає клієнта, знижку, статус оплати                       │
│ 3. Натискає "Оформити"                                          │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend:                                                        │
│ • Генерує operationId: `sale_${uuid}_${timestamp}`              │
│ • Відключає кнопку (isCheckingOut = true)                       │
│ • Викликає createSale() з 3 retry                               │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend (Atomic Transaction):                                    │
│ 1. Перевіряє ідемпотентність (operationId)                      │
│ 2. Валідує клієнта                                              │
│ 3. Валідує наявність товару                                     │
│ 4. START TRANSACTION:                                           │
│    • Ще раз перевіряє operationId (race condition)              │
│    • Атомарно зменшує stock (WHERE stock >= qty)                │
│    • Створює Transaction запис                                  │
│    • Оновлює Customer (totalSpent, orderCount)                  │
│ 5. COMMIT                                                       │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend Response:                                               │
│ • Очищає кошик                                                  │
│ • Показує alert з результатом                                   │
│ • Логує активність: logActivity('sale', {...})                  │
│ • Інвалідує кеш аналітики                                       │
│ • Оновлює підсумки зміни                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Потік списання

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Користувач натискає "Списати" на товарі                      │
│ 2. Вибирає варіант, кількість, причину                          │
│ 3. Підтверджує                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend:                                                         │
│ 1. Знаходить варіант по flower.slug + length                    │
│ 2. Перевіряє stock >= qty                                       │
│ 3. Атомарно зменшує stock                                       │
│ 4. Створює Transaction (type: 'writeOff')                       │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend:                                                        │
│ • Логує: logActivity('writeOff', {qty, reason, ...})            │
│ • Оновлює список товарів                                        │
│ • Інвалідує аналітику                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Потік імпорту Excel

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Користувач відкриває ImportModal                             │
│ 2. Вибирає Excel файл                                           │
│ 3. Налаштовує режими (stock/price mode, розрахунок ціни)        │
│ 4. Натискає "Попередній перегляд" (dryRun: true)                │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend:                                                         │
│ 1. Валідує Excel (magic bytes)                                  │
│ 2. Парсить рядки                                                │
│ 3. Для кожного рядка:                                           │
│    • Витягує назву, варіанти (length/stock/price)               │
│    • Перевіряє чи існує квітка                                  │
│    • Застосовує stockMode (replace/add)                         │
│    • Застосовує priceMode (replace/skip)                        │
│    • Якщо applyPriceCalculation: перераховує ціну               │
│ 4. Якщо dryRun: повертає preview                                │
│ 5. Якщо commit:                                                 │
│    • Перевіряє дублікати (checksum)                             │
│    • Створює/оновлює flowers та variants                        │
│    • Створює Supply запис                                       │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend:                                                        │
│ • Логує: logActivity('supply', {filename, stats, supplyItems})  │
│ • Оновлює список товарів                                        │
│ • Інвалідує аналітику                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4 Потік зміни

```
┌─────────────────────────────────────────────────────────────────┐
│ При завантаженні адмінки:                                       │
│ 1. Викликається getCurrentShift()                               │
│ 2. Якщо немає активної зміни - створюється нова                 │
│ 3. Зберігається shift.documentId                                │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ Під час зміни:                                                   │
│ • Кожна дія викликає logActivity()                              │
│ • logActivity → POST /shifts/current/activity                   │
│ • Backend додає activity до shift.activities JSON               │
│ • Кожні 30 сек frontend оновлює activities (polling)            │
│ • Розраховуються підсумки зміни                                 │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ Закриття зміни:                                                  │
│ 1. closeShift({notes?})                                         │
│ 2. Backend:                                                      │
│    • Розраховує фінальний summary                               │
│    • status: 'closed', closedAt: now()                          │
│ 3. Frontend:                                                     │
│    • Опційний експорт в Excel                                   │
│    • Очищення стану                                             │
│    • Наступна дія створить нову зміну                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Аналітика

### 6.1 Джерело даних

**Важливо:** Аналітика використовує `shifts.activities` як єдине джерело правди (Single Source of Truth).

Це забезпечує консистентність між:
- Календарем в аналітиці
- Архівом змін
- Експортом звітів

### 6.2 Метрики що розраховуються

| Метрика | Джерело | Розрахунок |
|---------|---------|------------|
| Виручка | sale activities | sum(totalAmount) |
| Кількість замовлень | sale activities | count |
| Середній чек | sale activities | revenue / orders |
| Списання (шт) | writeOff + productDelete | sum(qty) |
| Поставки (грн) | supply activities | sum((stockAfter - stockBefore) * priceAfter) |
| Топ товарів | sale activities | aggregate by item.name |
| Топ списань | writeOff + productDelete | aggregate by flower name |

### 6.3 Функції аналітичного сервісу

```typescript
// /backend/src/api/analytics/services/analytics.ts

getDailySales(year?, month?)      // Щоденні продажі/списання/поставки
getWeeklyRevenue(year?, month?)   // Виручка по тижнях
getOrdersPerWeek(year?, month?)   // Замовлення по тижнях
getSalesMetrics(period)           // Метрики за період (day/week/month)
getKpis(year?, month?)            // KPI з порівнянням з минулим місяцем
getWriteOffSummary()              // Статистика списань
getTopWriteOffFlowers()           // Топ-5 списаних квітів
getCategorySplit()                // Розподіл продажів по товарах
getPaymentSummary(year?, month?)  // Оплачені/очікувані платежі
getTotalPendingPayments()         // Загальна сума боргів
getStockLevels()                  // Рівні складу
getTopCustomers(limit)            // Топ клієнтів
getSupplyPlan()                   // План поставок
```

---

## 7. Безпека та ідемпотентність

### 7.1 Ідемпотентність операцій

Всі критичні операції використовують `operationId` для запобігання дублюванню:

```typescript
// Генерація operationId
const operationId = `sale_${uuid()}_${Date.now()}`;
// Приклад: "sale_a1b2c3d4-e5f6-7890-abcd-ef1234567890_1704067200000"
```

**Як це працює:**
1. Frontend генерує унікальний operationId
2. Backend перевіряє чи операція з таким ID вже існує
3. Якщо існує - повертає існуючий результат (не створює дублікат)
4. Якщо ні - виконує операцію

### 7.2 Атомарні транзакції

```sql
-- Приклад атомарного зменшення складу
BEGIN TRANSACTION;

-- Перевірка ідемпотентності в транзакції
SELECT id FROM transactions WHERE operation_id = :operationId;
-- Якщо знайдено - ROLLBACK і повернути існуючий

-- Атомарне оновлення (race condition protection)
UPDATE variants
SET stock = stock - :qty
WHERE flower_id = :flowerId
  AND length = :length
  AND stock >= :qty  -- Захист від від'ємного значення
RETURNING stock;

-- Якщо RETURNING порожній - ROLLBACK з помилкою INSUFFICIENT_STOCK

-- Створення транзакції
INSERT INTO transactions (...) VALUES (...);

COMMIT;
```

### 7.3 Retry логіка

```typescript
// /frontend/lib/api/client.ts

async function fetchWithRetry(url, options, retries = 3, backoff = 1000) {
  try {
    const response = await fetch(url, options);
    if (!response.ok && response.status >= 500) {
      throw new Error(`Server error: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(backoff);
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
}
```

---

## 8. Кешування

### 8.1 Backend кеш (Analytics)

```typescript
// In-memory кеш з TTL 3 хвилини
const CACHE_TTL = 3 * 60 * 1000;

const analyticsCache = {
  dashboard?: { data: any; timestamp: number };
  stock?: { data: any; timestamp: number };
};

// Інвалідація
export function invalidateAnalyticsCache() {
  analyticsCache.dashboard = undefined;
  analyticsCache.stock = undefined;
}
```

**Коли інвалідується:**
- Після продажу
- Після списання
- Після підтвердження оплати

### 8.2 Frontend кеш

```typescript
// Pending payments кеш (5 хвилин)
let pendingPaymentsCache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000
};

// Інвалідація
export function invalidatePendingPaymentsCache() {
  pendingPaymentsCache.data = null;
  pendingPaymentsCache.timestamp = 0;
}
```

---

## 9. Експорт даних

### 9.1 Доступні експорти

| Секція | Функція | Вміст |
|--------|---------|-------|
| Товари | `exportProducts()` | Всі товари з варіантами |
| Клієнти | `exportClients()` | Всі клієнти з контактами |
| Аналітика | `exportAnalytics()` | KPI та статистика |
| Зміна | `exportShift()` | Деталі зміни з активностями |
| Місячний звіт | `exportMonthlyReport()` | Зведений звіт за місяць |

### 9.2 Формат експорту (XLSX)

```typescript
// Приклад структури експорту зміни
{
  sheets: [
    {
      name: "Підсумки",
      columns: ["Метрика", "Значення"],
      rows: [
        ["Продажів", 15],
        ["Сума продажів", "12,500 грн"],
        ["Списань", 3],
        // ...
      ]
    },
    {
      name: "Поставки",
      columns: ["Час", "Товар", "Довжина", "Було", "Стало", "Різниця", "Ціна", "Сума"],
      // ...
    },
    {
      name: "Списання",
      columns: ["Час", "Товар", "Довжина", "К-сть", "Причина"],
      // ...
    }
  ]
}
```

---

## Додаток: Таблиця API endpoints

| Метод | Endpoint | Опис |
|-------|----------|------|
| POST | `/api/auth/admin/login` | Вхід в систему |
| POST | `/api/pos/sales` | Створити продаж |
| POST | `/api/pos/write-offs` | Списати товар |
| PUT | `/api/pos/transactions/:id/confirm-payment` | Підтвердити оплату |
| GET | `/api/shifts/current` | Поточна зміна |
| POST | `/api/shifts/current/activity` | Додати активність |
| POST | `/api/shifts/close` | Закрити зміну |
| GET | `/api/shifts` | Список змін |
| GET | `/api/analytics/dashboard` | Аналітика |
| POST | `/api/imports/excel` | Імпорт Excel |
| GET | `/api/planned-supply/low-stock` | Низький склад |
| GET/POST/PUT/DELETE | `/api/flowers` | CRUD товарів |
| GET/POST/PUT/DELETE | `/api/variants` | CRUD варіантів |
| GET/POST/DELETE | `/api/customers` | CRUD клієнтів |
| GET | `/api/transactions` | Транзакції |
| GET/POST/PUT/DELETE | `/api/articles` | CRUD статей |
| GET/POST/PUT/DELETE | `/api/tasks` | CRUD завдань |
