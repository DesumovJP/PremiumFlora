# Premium Flora - Архітектура адмін-панелі

> Повний технічний опис системи управління квітковим магазином

## Зміст

1. [Огляд системи](#1-огляд-системи)
2. [Технологічний стек](#2-технологічний-стек)
3. [Frontend архітектура](#3-frontend-архітектура)
4. [Backend архітектура](#4-backend-архітектура)
5. [Моделі даних](#5-моделі-даних)
6. [API комунікація](#6-api-комунікація)
7. [Ключові функції](#7-ключові-функції)
8. [Потоки даних](#8-потоки-даних)

---

## 1. Огляд системи

Premium Flora - це повноцінна система управління квітковим оптовим магазином з наступними можливостями:

- **POS-термінал** - продажі, кошик, клієнти
- **Управління товарами** - каталог, склад, варіанти
- **Клієнти** - база клієнтів, баланси, борги
- **Аналітика** - KPI, графіки, звіти
- **Історія змін** - лог активності, зміни
- **Завдання** - планування, нагадування
- **Імпорт** - Excel накладні від постачальників

### Архітектурна схема

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  Next.js 14 (App Router) + React + TypeScript + Tailwind CSS    │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │   POS    │ │ Products │ │ Clients  │ │Analytics │            │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘            │
│       │            │            │            │                   │
│       └────────────┴────────────┴────────────┘                   │
│                         │                                        │
│              ┌──────────┴──────────┐                            │
│              │    AdminClient      │  (Central State Manager)    │
│              └──────────┬──────────┘                            │
│                         │                                        │
│         ┌───────────────┼───────────────┐                       │
│         │               │               │                        │
│    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐                   │
│    │ GraphQL │    │  REST   │    │  Hooks  │                    │
│    │ Client  │    │  API    │    │ (State) │                    │
│    └────┬────┘    └────┬────┘    └─────────┘                    │
└─────────┼──────────────┼────────────────────────────────────────┘
          │              │
          ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                    Strapi v5 CMS                                 │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   GraphQL   │  │  REST API   │  │  Services   │              │
│  │  /graphql   │  │    /api     │  │  (Custom)   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│              ┌───────────┴───────────┐                          │
│              │      Database         │                           │
│              │  SQLite / PostgreSQL  │                           │
│              └───────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Технологічний стек

### Frontend
| Технологія | Версія | Призначення |
|------------|--------|-------------|
| Next.js | 14.x | React фреймворк з App Router |
| React | 18.x | UI бібліотека |
| TypeScript | 5.x | Типізація |
| Tailwind CSS | 3.x | Стилізація |
| Radix UI | - | Компоненти (Modal, Tabs, Select) |
| Recharts | 2.x | Графіки та діаграми |
| Lucide React | - | Іконки |
| graphql-request | - | GraphQL клієнт |

### Backend
| Технологія | Версія | Призначення |
|------------|--------|-------------|
| Strapi | 5.x | Headless CMS |
| Node.js | 18+ | Runtime |
| Knex.js | - | SQL Query Builder |
| SQLite/PostgreSQL | - | База даних |
| JWT | - | Автентифікація |

---

## 3. Frontend архітектура

### 3.1 Структура директорій

```
frontend/
├── app/
│   └── admin/
│       ├── page.tsx           # Server component (fetch products)
│       ├── admin-client.tsx   # Main client orchestrator (850 lines)
│       ├── layout.tsx         # Auth wrapper
│       └── login/
│           └── page.tsx       # Login form
│
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx        # Navigation, theme toggle, logout
│   │   └── header.tsx         # Mobile header
│   │
│   ├── sections/
│   │   ├── pos-section.tsx        # POS terminal (56KB)
│   │   ├── products-section.tsx   # Product management (97KB)
│   │   ├── clients-section.tsx    # Customer management (49KB)
│   │   ├── analytics-section.tsx  # Dashboard & charts (35KB)
│   │   ├── history-section.tsx    # Shift activity log (71KB)
│   │   └── todo-section.tsx       # Task management (25KB)
│   │
│   └── ui/
│       ├── modal.tsx
│       ├── button.tsx
│       ├── import-modal.tsx       # Excel import (40KB)
│       └── ... (24 components)
│
├── hooks/
│   ├── use-alerts.ts          # Toast notifications
│   ├── use-activity-log.ts    # Shift tracking
│   ├── use-modal.ts           # Modal state
│   ├── use-customers.ts       # Customer CRUD
│   ├── use-flowers.ts         # Product CRUD
│   └── use-transactions.ts    # Transaction queries
│
├── lib/
│   ├── api/
│   │   ├── client.ts          # fetchWithRetry, URLs
│   │   ├── pos.ts             # POS operations
│   │   ├── analytics.ts       # Dashboard data
│   │   ├── shifts.ts          # Shift management
│   │   ├── import.ts          # Excel import
│   │   ├── currency.ts        # EUR/UAH rate
│   │   └── ...
│   │
│   ├── graphql/
│   │   ├── client.ts          # GraphQL client + auth
│   │   ├── queries.ts         # All queries
│   │   ├── mutations.ts       # All mutations
│   │   └── types.ts           # GraphQL types
│   │
│   └── types/
│       ├── entities.ts        # Business entities
│       ├── api.ts             # API types
│       └── ...
```

### 3.2 Центральний стейт (AdminClient)

`admin-client.tsx` є головним оркестратором усіх даних:

```typescript
// Основні стейти
const [products, setProducts] = useState<Product[]>(initialProducts);
const [customers, setCustomers] = useState<Customer[]>([]);
const [analyticsData, setAnalyticsData] = useState<DashboardData | null>(null);

// POS стейти
const [selectedClient, setSelectedClient] = useState<string>();
const [cart, setCart] = useState<CartLine[]>([]);
const [discount, setDiscount] = useState<number>(0);
const [paymentStatus, setPaymentStatus] = useState<'paid' | 'expected'>('paid');
const [paidAmount, setPaidAmount] = useState<number>(0);

// UI стейти
const [tab, setTab] = useState<string>("pos");
const [search, setSearch] = useState("");
```

### 3.3 Патерн передачі даних

```
AdminClient (orchestrator)
    │
    ├── useAlerts() ──────────► Toast notifications
    ├── useActivityLog() ─────► Shift tracking
    │
    ├── API calls ────────────► createSale, createWriteOff, etc.
    │
    └── Renders Sections ─────► PosSection, ProductsSection, etc.
                                    │
                                    ├── Receives data as props
                                    ├── Receives callbacks (onAdd, onCheckout)
                                    ├── Manages local UI state
                                    └── Calls parent callbacks for mutations
```

### 3.4 Hooks

| Hook | Призначення |
|------|-------------|
| `useAlerts` | Toast повідомлення (success, error, warning, info) |
| `useActivityLog` | Лог активності зміни, синхронізація кожні 30с |
| `useModal` | Стан модальних вікон з даними |
| `useCustomers` | CRUD операції з клієнтами |
| `useFlowers` | CRUD операції з товарами |
| `useTransactions` | Запити транзакцій з фільтрами |

---

## 4. Backend архітектура

### 4.1 Структура API

```
backend/src/
├── api/
│   ├── customer/           # Клієнти
│   ├── transaction/        # Транзакції
│   ├── flower/             # Квіти
│   ├── variant/            # Варіанти (розміри)
│   ├── supply/             # Записи поставок
│   ├── shift/              # Зміни
│   ├── task/               # Завдання
│   ├── article/            # Статті
│   ├── pos/                # POS операції (custom)
│   ├── analytics/          # Аналітика (custom)
│   ├── import/             # Імпорт Excel (custom)
│   ├── currency/           # Курс валют (custom)
│   └── planned-supply/     # Планування поставок (custom)
│
├── services/
│   ├── excel/
│   │   ├── parser.service.ts      # Парсинг Excel
│   │   ├── normalizer.service.ts  # Нормалізація даних
│   │   ├── validator.service.ts   # Валідація
│   │   ├── upserter.service.ts    # Upsert в БД
│   │   └── checksum.service.ts    # SHA256 дедуплікація
│   │
│   └── currency/
│       └── currency.service.ts    # NBU API
│
├── middlewares/
│   └── force-https.ts             # HTTPS редірект
│
└── policies/
    └── is-authenticated.ts        # JWT перевірка
```

### 4.2 Custom Services

#### POS Service (`api::pos.pos`)

```typescript
// Атомарне створення продажу
createSale(input: CreateSaleInput) {
  // 1. Перевірка ідемпотентності (operationId)
  // 2. Валідація клієнта
  // 3. Валідація наявності stock
  // 4. DB Transaction:
  //    - Декремент stock
  //    - Створення Transaction
  //    - Оновлення балансу клієнта
  // 5. Інвалідація кешу аналітики
}

// Списання товару
createWriteOff(input: WriteOffInput) { ... }

// Підтвердження оплати
confirmPayment(transactionId: string) { ... }

// Синхронізація балансів
syncBalances() { ... }
```

#### Analytics Service (`api::analytics.analytics`)

```typescript
// Повна аналітика dashboard
getDashboardData(year?, month?) {
  // Кешування 3 хвилини
  return {
    kpis,              // KPI метрики
    weeklyRevenue,     // Виручка по тижнях
    ordersPerWeek,     // Замовлення по тижнях
    dailySales,        // Денні продажі
    topProducts,       // Топ продукти
    topCustomers,      // Топ клієнти
    stockLevels,       // Рівні складу
    writeOffSummary,   // Статистика списань
    monthlyProfit,     // Прибуток (реальний)
    ...
  };
}
```

#### Excel Import Pipeline

```
Excel File
    │
    ▼
┌─────────────┐
│  Checksum   │ ──► SHA256, перевірка дублікатів
└──────┬──────┘
       ▼
┌─────────────┐
│   Parser    │ ──► Auto-detect формату (Colombia, Ross, Generic)
└──────┬──────┘
       ▼
┌─────────────┐
│ Normalizer  │ ──► Merge дублікатів, weighted avg price
└──────┬──────┘
       ▼
┌─────────────┐
│  Validator  │ ──► Перевірка полів, типів
└──────┬──────┘
       ▼
┌─────────────┐
│  Upserter   │ ──► Create/Update flowers & variants
└──────┬──────┘
       ▼
┌─────────────┐
│   Supply    │ ──► Запис в БД з metadata
└─────────────┘
```

#### Currency Service

```typescript
// Курс EUR/UAH з НБУ
getEurRate() {
  // Кеш 1 година
  // API: bank.gov.ua/NBUStatService/v1/statdirectory/exchange
  // Fallback на кешований курс
  // Останній fallback: 45.0 UAH/EUR
}
```

---

## 5. Моделі даних

### 5.1 Основні сутності

#### Customer (Клієнт)
```typescript
{
  documentId: string;
  name: string;
  type: "VIP" | "Regular" | "Wholesale";
  phone: string | null;
  email: string | null;
  address: string | null;
  totalSpent: number;      // Загальна сума покупок
  orderCount: number;      // Кількість замовлень
  balance: number;         // Баланс (- = борг, + = переплата)
  transactions: Transaction[];
}
```

#### Flower (Квітка)
```typescript
{
  documentId: string;
  name: string;
  slug: string;            // URL-friendly ідентифікатор
  description: Block[];    // Rich text
  image: Image | null;
  variants: Variant[];
}
```

#### Variant (Варіант)
```typescript
{
  documentId: string;
  length: number;          // Довжина стебла (см)
  stock: number;           // Кількість на складі
  price: number;           // Ціна продажу (UAH)
  costPrice: number;       // Собівартість (EUR)
  flower: Flower;
}
```

#### Transaction (Транзакція)
```typescript
{
  documentId: string;
  date: string;
  type: "sale" | "writeOff";
  operationId: string;     // Ключ ідемпотентності
  paymentStatus: "pending" | "paid" | "expected" | "cancelled";
  amount: number;          // Загальна сума
  paidAmount: number;      // Оплачено (для часткової оплати)
  items: TransactionItem[];
  customer: Customer | null;
  writeOffReason: "damage" | "expiry" | "adjustment" | "other" | null;
}
```

#### TransactionItem (Позиція транзакції)
```typescript
{
  flowerSlug: string;
  length: number;
  qty: number;
  price: number;           // Ціна продажу
  costPrice: number;       // Собівартість (для розрахунку прибутку)
  name: string;
  subtotal: number;
  profit: number;          // Прибуток по позиції
  isCustom?: boolean;      // Кастомна позиція (послуга)
}
```

#### Shift (Зміна)
```typescript
{
  documentId: string;
  shiftDate: string;       // YYYY-MM-DD (одна на день)
  startedAt: string;
  closedAt: string | null;
  status: "active" | "closed";
  activities: Activity[];  // Лог активності
  summary: ShiftSummary;
  totalSales: number;
  totalSalesAmount: number;
  totalWriteOffs: number;
}
```

#### Task (Завдання)
```typescript
{
  documentId: string;
  title: string;
  description: string | null;
  dueDate: string;
  reminderAt: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  category: "delivery" | "supply" | "maintenance" | "meeting" | "other";
}
```

### 5.2 Діаграма зв'язків

```
┌──────────┐       ┌─────────────┐       ┌─────────┐
│ Customer │──1:N──│ Transaction │──N:1──│  Shift  │
└──────────┘       └──────┬──────┘       └─────────┘
                          │
                    [items: JSON]
                          │
                          ▼
                   ┌────────────┐
                   │   Flower   │──1:N──┌─────────┐
                   └────────────┘       │ Variant │
                                        └─────────┘

┌─────────┐
│ Supply  │ ── [rows: JSON with outcomes]
└─────────┘
```

---

## 6. API комунікація

### 6.1 Гібридна архітектура

| Тип | Використання | Приклади |
|-----|--------------|----------|
| **GraphQL** | CRUD операції, читання даних | Flowers, Customers, Transactions, Tasks |
| **REST** | Бізнес-операції, спеціалізовані ендпоінти | POS, Analytics, Shifts, Import |

### 6.2 GraphQL ендпоінти

```graphql
# Queries
GET_FLOWERS          # Всі опубліковані квіти
GET_FLOWER_BY_SLUG   # Квітка за slug
GET_CUSTOMERS        # Всі клієнти (sort: name:asc)
GET_CUSTOMER_BY_ID   # Клієнт з транзакціями
GET_TRANSACTIONS     # Транзакції з фільтрами
GET_TASKS            # Завдання з фільтрами
GET_ARTICLES         # Статті

# Mutations
CREATE_CUSTOMER      # Створення клієнта
UPDATE_CUSTOMER      # Оновлення клієнта
DELETE_CUSTOMER      # Видалення клієнта
UPDATE_FLOWER        # Оновлення квітки
UPDATE_VARIANT       # Оновлення варіанту
CREATE_TASK          # Створення завдання
UPDATE_TASK          # Оновлення завдання
DELETE_TASK          # Видалення завдання
```

### 6.3 REST ендпоінти

| Endpoint | Method | Опис | Auth |
|----------|--------|------|------|
| `/api/pos/sales` | POST | Створення продажу | Yes |
| `/api/pos/write-offs` | POST | Списання товару | Yes |
| `/api/pos/transactions/:id/confirm-payment` | PUT | Підтвердження оплати | Yes |
| `/api/pos/sync-balances` | POST | Синхронізація балансів | Yes |
| `/api/analytics/dashboard` | GET | Дані dashboard | No |
| `/api/analytics/stock` | GET | Рівні складу | No |
| `/api/shifts/current` | GET | Поточна зміна | No |
| `/api/shifts/current/activity` | POST | Додати активність | Yes |
| `/api/shifts/close` | POST | Закрити зміну | Yes |
| `/api/imports/excel` | POST | Імпорт Excel | Yes |
| `/api/imports/update-prices` | POST | Оновлення цін | Yes |
| `/api/currency/eur` | GET | Курс EUR/UAH | No |
| `/api/planned-supply/low-stock` | GET | Low stock варіанти | No |

### 6.4 Автентифікація

```typescript
// JWT Token Flow
1. POST /api/auth/admin/login
   Body: { email, password }
   Response: { token, user }

2. Token зберігається в localStorage ("admin_token")

3. Authenticated requests:
   Headers: { Authorization: "Bearer {token}" }

// Підтримка двох типів користувачів:
- Users & Permissions (стандартні користувачі)
- Admin Users (адміністратори Strapi)
```

---

## 7. Ключові функції

### 7.1 POS-термінал

```
┌─────────────────────────────────────────────────────────────┐
│                      POS TERMINAL                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   Product Search    │    │         Shopping Cart       │ │
│  │   ─────────────     │    │         ─────────────       │ │
│  │   [Search input]    │    │   Item 1: Rose 60cm × 10    │ │
│  │                     │    │   Item 2: Lily 50cm × 5     │ │
│  │   ┌─────┐ ┌─────┐   │    │   ─────────────────────     │ │
│  │   │Rose │ │Lily │   │    │   Subtotal: 5,000 ₴         │ │
│  │   │ +   │ │ +   │   │    │   Discount: -500 ₴          │ │
│  │   └─────┘ └─────┘   │    │   ─────────────────────     │ │
│  │   ┌─────┐ ┌─────┐   │    │   Total: 4,500 ₴            │ │
│  │   │Tulip│ │Chrys│   │    │                             │ │
│  │   │ +   │ │ +   │   │    │   [Client: VIP Customer ▼]  │ │
│  │   └─────┘ └─────┘   │    │   Balance: -2,000 ₴ (борг)  │ │
│  │                     │    │                             │ │
│  └─────────────────────┘    │   Payment: [Оплачено ▼]     │ │
│                             │                             │ │
│                             │   [    Оформити    ]        │ │
│                             └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Можливості:**
- Пошук товарів по назві
- Вибір варіанту (довжина)
- Кошик з редагуванням кількості та ціни
- Кастомні позиції (послуги, товари з чужого складу)
- Вибір клієнта з відображенням балансу
- Знижка
- Статус оплати (оплачено / в борг)
- Часткова оплата

### 7.2 Управління товарами

**Можливості:**
- Таблиця/картки товарів
- Створення товару з варіантами
- Редагування товару і варіантів
- Видалення товару
- Списання (damage, expiry, adjustment, other)
- Імпорт з Excel накладних
- Сортування (назва, ціна, склад, дата)
- Показник низького залишку

### 7.3 Клієнти

**Можливості:**
- Список клієнтів з типами (VIP, Regular, Wholesale)
- Баланс клієнта (борг/переплата)
- Історія транзакцій клієнта
- Підтвердження оплати боргу
- Створення/видалення клієнтів

### 7.4 Аналітика

```
┌─────────────────────────────────────────────────────────────┐
│                     DASHBOARD                                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Прибуток │  │ На складі│  │ Очікує   │                   │
│  │ 45,000 ₴ │  │ 125,000 ₴│  │ оплати   │                   │
│  │ 32% від  │  │ 1,500 шт │  │ 12,000 ₴ │                   │
│  │ виручки  │  │          │  │ 3 зам.   │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                              │
│  ┌───────────────────────┐  ┌───────────────────────┐       │
│  │   Виручка по тижнях   │  │  Замовлення по тижнях │       │
│  │   ▁▃▅▇█▇▅▃▁          │  │  ▁▂▃▄▅▆▇█▇▆          │       │
│  └───────────────────────┘  └───────────────────────┘       │
│                                                              │
│  ┌───────────────────────┐  ┌───────────────────────┐       │
│  │    Топ продукти       │  │    Топ клієнти        │       │
│  │  1. Rose - 35%        │  │  1. Client A - 25,000 │       │
│  │  2. Lily - 25%        │  │  2. Client B - 18,000 │       │
│  │  3. Tulip - 20%       │  │  3. Client C - 12,000 │       │
│  └───────────────────────┘  └───────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 7.5 Історія змін

**Activity Types:**
- `sale` - Продаж
- `writeOff` - Списання
- `productCreate` - Створення товару
- `productEdit` - Редагування товару
- `productDelete` - Видалення товару
- `variantDelete` - Видалення варіанту
- `paymentConfirm` - Підтвердження оплати
- `customerCreate` - Створення клієнта
- `customerDelete` - Видалення клієнта
- `supply` - Поставка (імпорт)

### 7.6 Імпорт Excel

**Підтримувані формати:**
- **Colombia Format**: variety, type, grade, units, supplier, price, total, awb
- **Ross Format**: CULTIVOS, FB, VARIEDAD, GRADO, TALLOS, PRECIO
- **Generic Format**: Автовизначення колонок

**Процес:**
1. Завантаження файлу
2. Показ курсу EUR/UAH (НБУ)
3. Dry-run перегляд з можливістю редагування
4. Застосування імпорту
5. Встановлення цін продажу

---

## 8. Потоки даних

### 8.1 Створення продажу

```
User clicks "Оформити"
         │
         ▼
┌─────────────────────────────┐
│  AdminClient.handleCheckout │
│  ─────────────────────────  │
│  1. Validate cart & client  │
│  2. Generate operationId    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  POST /api/pos/sales        │
│  ─────────────────────────  │
│  Body: {                    │
│    operationId,             │
│    customerId,              │
│    items: [...],            │
│    discount,                │
│    paymentStatus,           │
│    paidAmount               │
│  }                          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  POS Service (Backend)      │
│  ─────────────────────────  │
│  1. Check idempotency       │
│  2. Validate stock          │
│  3. DB Transaction:         │
│     - Create Transaction    │
│     - Decrement stocks      │
│     - Update customer       │
│       balance               │
│  4. Invalidate cache        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Response                   │
│  ─────────────────────────  │
│  { success: true,           │
│    data: Transaction,       │
│    stockUpdates: [...] }    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  AdminClient                │
│  ─────────────────────────  │
│  1. Clear cart              │
│  2. Refresh products        │
│  3. Refresh customers       │
│  4. Log activity            │
│  5. Show success toast      │
└─────────────────────────────┘
```

### 8.2 Імпорт Excel

```
User uploads file
         │
         ▼
┌─────────────────────────────┐
│  POST /api/imports/excel    │
│  (dryRun: true)             │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Import Service             │
│  ─────────────────────────  │
│  1. Compute SHA256          │
│  2. Check duplicate         │
│  3. Parse (auto-detect)     │
│  4. Normalize (merge dups)  │
│  5. Validate fields         │
│  6. Return preview          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Preview in ImportModal     │
│  User can edit rows         │
└──────────────┬──────────────┘
               │
    User clicks "Застосувати"
               │
               ▼
┌─────────────────────────────┐
│  POST /api/imports/excel    │
│  (dryRun: false,            │
│   rowOverrides: {...})      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Upserter Service           │
│  ─────────────────────────  │
│  For each row:              │
│  1. Find/create Flower      │
│  2. Find/create Variant     │
│  3. Update stock            │
│  4. Calculate price:        │
│     price = costPrice       │
│            × 1.10           │
│            × EUR_RATE       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Pricing Step               │
│  User sets sale prices      │
└─────────────────────────────┘
```

### 8.3 Розрахунок прибутку

```
GET /api/analytics/dashboard
         │
         ▼
┌─────────────────────────────┐
│  getMonthlyProfit()         │
│  ─────────────────────────  │
│  Query: transactions        │
│  where: type = 'sale'       │
│         date in month       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  For each transaction:      │
│  ─────────────────────────  │
│  For each item:             │
│    revenue += price × qty   │
│    cost += costPrice × qty  │
│                             │
│  profit = revenue - cost    │
│  margin = profit / revenue  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Return:                    │
│  { profit: 45000,           │
│    margin: 32,              │
│    revenue: 140625,         │
│    costOfGoods: 95625 }     │
└─────────────────────────────┘
```

---

## Додаткова інформація

### Кешування

| Що | TTL | Тип |
|----|-----|-----|
| Analytics Dashboard | 3 хв | In-memory (backend) |
| Pending Payments | 5 хв | In-memory (frontend) |
| EUR/UAH Rate | 1 год | In-memory (backend) |
| GraphQL | - | Disabled (cache: no-store) |

### Помилки

| Код | Опис | HTTP |
|-----|------|------|
| `MISSING_OPERATION_ID` | Немає operationId | 400 |
| `INSUFFICIENT_STOCK` | Недостатньо товару | 409 |
| `DUPLICATE_CHECKSUM` | Файл вже імпортовано | 409 |
| `TRANSACTION_NOT_FOUND` | Транзакція не знайдена | 404 |
| `UNAUTHORIZED` | Немає токена | 401 |

### Безпека

- JWT автентифікація
- CORS обмеження
- HTTPS редірект (production)
- Ідемпотентність через operationId
- Атомарні DB транзакції

---

## 9. Детальний опис системи імпорту Excel

### 9.1 Підтримувані формати накладних

#### Colombia Format (Makavchuk)
```
┌─────┬──────────┬──────┬───────┬───────┬──────────┬──────────┬───────┬───────┬─────────────┐
│ QB  │ Variety  │ Type │ Grade │ Units │ Supplier │Recipient │ Price │ Total │    AWB      │
├─────┼──────────┼──────┼───────┼───────┼──────────┼──────────┼───────┼───────┼─────────────┤
│ QB  │ Freedom  │ Rose │  90   │  100  │ Finca A  │ Premium  │  0.85 │ 85.00 │ 071-5898... │
│ FB  │ Explorer │ Rose │  70   │   50  │ Finca B  │ Premium  │  0.75 │ 37.50 │ 071-5898... │
└─────┴──────────┴──────┴───────┴───────┴──────────┴──────────┴───────┴───────┴─────────────┘
```

**Особливості:**
- Перший рядок містить метадані: дату, "цена", "сумма", AWB
- Позиційне мапування колонок (фіксовані позиції)
- Підсумкові рядки (HB, QB, FB, Total) автоматично пропускаються

#### Ross Format (Іспанські заголовки)
```
┌──────────┬────┬──────────┬───────┬────────┬────────┬──────────┐
│ CULTIVOS │ FB │ VARIEDAD │ GRADO │ TALLOS │ PRECIO │ TOTAL PR │
├──────────┼────┼──────────┼───────┼────────┼────────┼──────────┤
│ Finca A  │ FB │ Freedom  │  90   │  100   │  0.85  │   85.00  │
│          │    │ Explorer │  70   │   50   │  0.75  │   37.50  │
└──────────┴────┴──────────┴───────┴────────┴────────┴──────────┘
```

**Особливості:**
- Заголовки CULTIVOS, VARIEDAD, GRADO, TALLOS, PRECIO
- Постачальник (CULTIVOS) може бути порожнім - береться попередній
- Дата може бути в перших рядках перед заголовками

#### Generic Format
- Автовизначення колонок за ключовими словами
- Підтримує: variety, type, grade, units, price, supplier, total, awb
- Мультимовний пошук (EN, ES, UA)

### 9.2 Структура даних імпорту

#### ParsedRow (після парсингу)
```typescript
{
  rowIndex: number;          // Номер рядка (1-based)
  original: Record<string, unknown>; // Оригінальні дані
  variety: string;           // "Freedom"
  type: string | null;       // "Rose"
  grade: string;             // "90" або "jumbo"
  units: number;             // 100
  price: number;             // 0.85 (EUR)
  total: number | null;      // 85.00
  supplier: string | null;   // "Finca A"
  awb: string | null;        // "071-5898 5975"
  qbCode: string | null;     // "QB", "FB", "HB"
  recipient: string | null;  // "Premium Flora"
}
```

#### NormalizedRow (після нормалізації)
```typescript
{
  rowIndex: number;
  original: Record<string, unknown>;
  flowerName: string;        // "Freedom Rose" (Title Case)
  slug: string;              // "freedom-rose" (kebab-case)
  length: number | null;     // 90 (см) або null
  grade: string | null;      // "Jumbo" (текстовий grade)
  stock: number;             // 100 (ціле число)
  price: number;             // 0.85 (собівартість EUR)
  supplier: string | null;
  awb: string | null;
  hash: string;              // SHA256 хеш рядка
}
```

### 9.3 Pipeline обробки

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           IMPORT PIPELINE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. CHECKSUM                                                                 │
│     ├─ SHA256 хеш всього файлу                                              │
│     ├─ Перевірка в таблиці supplies                                         │
│     └─ Якщо знайдено → DUPLICATE_CHECKSUM помилка                           │
│                                                                              │
│  2. PARSER                                                                   │
│     ├─ Читання Excel через XLSX library                                     │
│     ├─ Автодетект формату (Colombia/Ross/Generic)                           │
│     ├─ Знаходження заголовків та рядка даних                                │
│     ├─ Мапування колонок                                                    │
│     └─ Пропуск підсумкових рядків (HB, QB, FB, Total)                       │
│                                                                              │
│  3. NORMALIZER                                                               │
│     ├─ Title Case назви (freedom rose → Freedom Rose)                       │
│     ├─ Slug генерація (Freedom Rose → freedom-rose)                         │
│     ├─ Нормалізація length (90cm → 90, jumbo → Jumbo)                       │
│     ├─ Округлення stock до цілого                                           │
│     ├─ Словник синонімів назв квіток                                        │
│     │   └─ "Freedom" → "Freedom Rose"                                       │
│     │   └─ "Pink Floyd" → "Pink Floyd Rose"                                 │
│     │   └─ "Baby Flow Spray" → "Baby Flow Spray Rose"                       │
│     ├─ АГРЕГАЦІЯ ДУБЛІКАТІВ:                                                │
│     │   └─ Групування по slug + length                                      │
│     │   └─ stock = сума всіх кількостей                                     │
│     │   └─ price = середньозважена ціна                                     │
│     │       price = Σ(stock_i × price_i) / Σ(stock_i)                       │
│     └─ SHA256 хеш кожного рядка                                             │
│                                                                              │
│  4. VALIDATOR                                                                │
│     ├─ Перевірка обов'язкових полів                                         │
│     ├─ Перевірка типів даних                                                │
│     ├─ Перевірка діапазонів (length: 1-500, stock > 0)                      │
│     └─ Генерація помилок та попереджень                                     │
│                                                                              │
│  5. UPSERTER (тільки якщо dryRun: false)                                    │
│     ├─ Для кожного унікального slug:                                        │
│     │   └─ Знайти або створити Flower                                       │
│     ├─ Для кожного варіанту (slug + length):                                │
│     │   ├─ Знайти існуючий варіант                                          │
│     │   ├─ Якщо існує:                                                      │
│     │   │   └─ stock = applyStockMode(old, new, mode)                       │
│     │   │   └─ costPrice = new (завжди оновлюється)                         │
│     │   │   └─ price = НЕ змінюється                                        │
│     │   └─ Якщо новий:                                                      │
│     │       └─ stock = new                                                  │
│     │       └─ costPrice = new                                              │
│     │       └─ price = costPrice × 1.10 × EUR_RATE                          │
│     └─ Логування операцій (create/update)                                   │
│                                                                              │
│  6. SUPPLY RECORD                                                            │
│     ├─ Збереження metadata (filename, checksum, date)                       │
│     ├─ Збереження всіх рядків з outcomes                                    │
│     └─ Статус: success | dry-run | failed                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.4 Режими оновлення stock (stockMode)

| Режим | Формула | Опис |
|-------|---------|------|
| `replace` | `stock = new` | Повна заміна (інвентаризація) |
| `add` | `stock = old + new` | Додавання (поставка) |
| `skip` | `stock = old` | Пропустити (не змінювати) |

### 9.5 Ціноутворення при імпорті

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRICE CALCULATION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  З Excel файлу:                                                  │
│     costPrice = 0.85 EUR (собівартість)                         │
│                                                                  │
│  Курс EUR/UAH (НБУ API):                                        │
│     EUR_RATE = 45.50 UAH/EUR                                    │
│                                                                  │
│  Базова ціна продажу (тільки для НОВИХ варіантів):              │
│     price = costPrice × 1.10 × EUR_RATE                         │
│     price = 0.85 × 1.10 × 45.50 = 42.54 UAH                     │
│                                                                  │
│  Для ІСНУЮЧИХ варіантів:                                        │
│     price = залишається незмінною                                │
│     (адміністратор контролює ціну продажу)                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.6 Агрегація дублікатів

**Приклад:** Файл містить два рядки Freedom Rose 90cm:
```
Рядок 5: Freedom Rose 90cm, 100 шт, 0.80 EUR
Рядок 8: Freedom Rose 90cm,  50 шт, 0.90 EUR
```

**Результат агрегації:**
```typescript
{
  flowerName: "Freedom Rose",
  length: 90,
  stock: 150,  // 100 + 50
  price: 0.833 // (100×0.80 + 50×0.90) / 150 = 125/150
}
```

### 9.7 Import Modal UI Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     КРОК 1: ЗАВАНТАЖЕННЯ                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Курс НБУ: 45.50 ₴/€ (07.01.2026)              [🔄 Оновити]     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  📁 Виберіть файл                                           ││
│  │     xlsx, xls                                                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│                              [ Скасувати ] [ Перевірити ]        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     КРОК 2: PREVIEW (dry-run)                    │
├─────────────────────────────────────────────────────────────────┤
│  ℹ️ Попередній перегляд                                         │
│  Рядків: 45  |  Валідних: 43  |  Помилок: 2                     │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ #  │ Оригінал    │ Нормалізовано │ См │ К-сть│Ціна │Сума │  │
│  │────┼─────────────┼───────────────┼────┼──────┼─────┼─────│  │
│  │  2 │ freedom     │ Freedom Rose  │ 90 │  100 │0.85 │85.00│  │
│  │  3 │ explorer    │ Explorer Rose │ 70 │   50 │0.75 │37.50│  │
│  │  5 │ pink floyd  │ Pink Floyd... │ 60 │   75 │0.65 │48.75│  │
│  │────┼─────────────┼───────────────┼────┼──────┼─────┼─────│  │
│  │    │             │       ВСЬОГО: │    │  225 │     │171.2│  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ⚠️ Рядки можна редагувати (клік на назву)                      │
│                                                                  │
│                              [ Скасувати ] [ Застосувати ]       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     КРОК 3: ВСТАНОВЛЕННЯ ЦІН                     │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Імпорт завершено успішно!                                    │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Назва           │ См │ К-сть │ Собівартість │ Ціна прод. │  │
│  │─────────────────┼────┼───────┼──────────────┼────────────│  │
│  │ Freedom Rose    │ 90 │  100  │    0.85      │ [  42.50 ] │  │
│  │ Explorer Rose   │ 70 │   50  │    0.75      │ [  38.00 ] │  │
│  │ Pink Floyd Rose │ 60 │   75  │    0.65      │ [  32.00 ] │  │
│  │─────────────────┼────┼───────┼──────────────┼────────────│  │
│  │        ВСЬОГО:  │    │  225  │  171.25 ₴    │            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│                              [ Пропустити ] [ Зберегти ціни ]    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Детальний опис POS терміналу

### 10.1 Архітектура кошика

```typescript
// CartLine - позиція в кошику
interface CartLine {
  id: string;              // "{slug}-{length}" або "custom-{timestamp}"
  name: string;            // "Freedom Rose"
  size: string;            // "90 см"
  price: number;           // Ціна продажу (може бути змінена)
  qty: number;             // Кількість
  image?: string;          // URL зображення
  flowerSlug: string;      // slug квітки
  length: number;          // Довжина (см)

  // Кастомні позиції
  isCustom?: boolean;      // true = послуга/товар без складу
  customNote?: string;     // Примітка

  // Зміна ціни
  originalPrice?: number;  // Оригінальна ціна (якщо змінена)
}
```

### 10.2 Операції з кошиком

#### Додавання товару (addToCart)
```
User clicks on product variant
         │
         ▼
┌─────────────────────────────────────┐
│ 1. Check available stock            │
│    availableToAdd = stock - inCart  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Calculate quantity to add        │
│    defaultQty = 25                  │
│    addQty = min(25, availableToAdd) │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
   availableToAdd   availableToAdd
      <= 0            > 0
        │              │
        ▼              ▼
   ┌─────────┐    ┌─────────────────┐
   │ Warning │    │ Add to cart     │
   │ "All    │    │ - New item or   │
   │ stock   │    │ - Update qty    │
   │ in cart"│    └─────────────────┘
   └─────────┘
```

#### Оновлення кількості (updateQty)
```typescript
// delta > 0: збільшення (перевіряємо stock)
// delta < 0: зменшення (мін. 1 шт)
// qty = 0: видалення з кошика
```

#### Зміна ціни (updatePrice)
- Зберігає originalPrice
- Нова ціна застосовується до позиції
- В транзакції зберігається і нова, і оригінальна ціна

#### Кастомна позиція (addCustomItem)
```typescript
{
  id: "custom-{timestamp}-{random}",
  name: "Доставка",
  size: "-",
  price: 150,
  qty: 1,
  flowerSlug: "custom",
  length: 0,
  isCustom: true,
  customNote: "Доставка по місту"
}
```

### 10.3 Процес оформлення (Checkout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CHECKOUT FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FRONTEND (AdminClient.handleCheckout)                                       │
│  ═══════════════════════════════════════                                    │
│  1. Validate: cart not empty, client selected                               │
│  2. Generate unique operationId (UUID)                                      │
│  3. Prepare sale data:                                                      │
│     {                                                                        │
│       operationId: "sale-1704621234567-abc123",                             │
│       customerId: "abc-def-123",                                            │
│       items: [                                                               │
│         { flowerSlug, length, qty, price, name, isCustom?, originalPrice? } │
│       ],                                                                     │
│       discount: 500,                                                         │
│       paymentStatus: "paid" | "expected",                                   │
│       paidAmount: 2000,  // для часткової оплати                            │
│       notes: "Коментар"                                                     │
│     }                                                                        │
│  4. Call POST /api/pos/sales                                                │
│                                                                              │
│  BACKEND (POS Service)                                                       │
│  ═══════════════════════                                                    │
│  1. Idempotency Check                                                       │
│     └─ SELECT * FROM transactions WHERE operation_id = ?                    │
│     └─ If exists → return existing (success: true, idempotent: true)        │
│                                                                              │
│  2. Customer Validation                                                      │
│     └─ SELECT * FROM customers WHERE document_id = ?                        │
│     └─ If not found → error CUSTOMER_NOT_FOUND                              │
│                                                                              │
│  3. Stock Validation (pre-check)                                            │
│     └─ For each non-custom item:                                            │
│         └─ Find variant by slug + length                                    │
│         └─ If stock < qty → error INSUFFICIENT_STOCK                        │
│                                                                              │
│  4. DB TRANSACTION (Knex)                                                   │
│     ┌──────────────────────────────────────────────────────────────────┐    │
│     │  a. Re-check idempotency (race condition protection)              │    │
│     │                                                                   │    │
│     │  b. Atomic stock decrement:                                       │    │
│     │     UPDATE variants                                               │    │
│     │     SET stock = stock - ?                                         │    │
│     │     WHERE id = ? AND stock >= ?                                   │    │
│     │     (Skip custom items - they don't have stock)                   │    │
│     │                                                                   │    │
│     │  c. Create transaction record:                                    │    │
│     │     INSERT INTO transactions (                                    │    │
│     │       document_id, date, type, operation_id,                      │    │
│     │       payment_status, amount, paid_amount, items, notes           │    │
│     │     )                                                             │    │
│     │     items JSON includes: costPrice, profit per item               │    │
│     │                                                                   │    │
│     │  d. Update customer:                                              │    │
│     │     If paid:                                                      │    │
│     │       order_count++, total_spent += amount                        │    │
│     │     If expected (борг):                                           │    │
│     │       balance -= (amount - paidAmount)                            │    │
│     │       If partial paid: order_count++, total_spent += paidAmount   │    │
│     └──────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  5. Link customer relation (Strapi Documents API)                           │
│                                                                              │
│  6. Invalidate analytics cache                                              │
│                                                                              │
│  7. Return result                                                            │
│     { success: true, data: Transaction, stockUpdates: [...] }               │
│                                                                              │
│  FRONTEND (Post-checkout)                                                    │
│  ═══════════════════════════                                                │
│  1. Log activity (shift history)                                            │
│  2. Show success toast                                                      │
│  3. Clear cart, reset form                                                  │
│  4. Refresh products (get new stock)                                        │
│  5. Refresh customers (get new balance)                                     │
│  6. Update pending payments sidebar                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.4 Процес списання (Write-off)

```
┌─────────────────────────────────────────────────────────────────┐
│                      WRITE-OFF FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Input:                                                          │
│  {                                                               │
│    operationId: "writeoff-1704621234567-xyz789",                │
│    flowerSlug: "freedom-rose",                                  │
│    length: 90,                                                  │
│    qty: 10,                                                     │
│    reason: "damage" | "expiry" | "adjustment" | "other",        │
│    notes: "Пошкоджено при транспортуванні"                      │
│  }                                                               │
│                                                                  │
│  Backend Process:                                                │
│  1. Idempotency check                                           │
│  2. Find variant (by slug + length)                             │
│  3. Validate stock >= qty                                       │
│  4. DB Transaction:                                             │
│     - Decrement stock atomically                                │
│     - Create transaction (type: writeOff, paymentStatus: cancelled) │
│  5. Invalidate cache                                            │
│                                                                  │
│  Reasons:                                                        │
│  ├─ damage     → Пошкодження                                    │
│  ├─ expiry     → Закінчення терміну                             │
│  ├─ adjustment → Інвентаризація                                 │
│  └─ other      → Інша причина                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.5 Статуси оплати

```
┌─────────────────────────────────────────────────────────────────┐
│                     PAYMENT STATUS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐                                                   │
│  │  paid    │  Оплачено повністю                               │
│  │          │  └─ paidAmount = amount                           │
│  │          │  └─ customer.balance: не змінюється               │
│  │          │  └─ customer.totalSpent += amount                 │
│  └──────────┘                                                   │
│                                                                  │
│  ┌──────────┐                                                   │
│  │ expected │  В борг (повністю або частково)                   │
│  │          │  └─ paidAmount = 0 ... amount                     │
│  │          │  └─ debt = amount - paidAmount                    │
│  │          │  └─ customer.balance -= debt                      │
│  │          │  └─ customer.totalSpent += paidAmount             │
│  └──────────┘                                                   │
│                                                                  │
│  ┌──────────┐                                                   │
│  │ pending  │  Очікує (рідко використовується)                 │
│  │          │  └─ Для майбутніх статусів                        │
│  └──────────┘                                                   │
│                                                                  │
│  ┌──────────┐                                                   │
│  │cancelled │  Скасовано (тільки для writeOff)                 │
│  │          │  └─ amount = 0                                    │
│  └──────────┘                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Детальний опис системи клієнтів

### 11.1 Модель клієнта

```typescript
// Database Schema (Strapi)
{
  documentId: string;              // Унікальний ID документа
  name: string;                    // "ФОП Іванов"
  type: "VIP" | "Regular" | "Wholesale";
  phone: string | null;            // "+380501234567"
  email: string | null;            // "client@example.com"
  address: string | null;          // "м. Київ, вул. Хрещатик 1"
  totalSpent: number;              // 125000.00 (сума оплачених замовлень)
  orderCount: number;              // 47 (кількість оплачених замовлень)
  balance: number;                 // -5000 (борг) або +1000 (переплата)
  transactions: Transaction[];     // Зв'язок 1:N
}
```

### 11.2 Типи клієнтів

| Тип | Опис | Особливості |
|-----|------|-------------|
| **VIP** | Преміум клієнти | Відмічаються іконкою ⭐ |
| **Regular** | Звичайні клієнти | Стандартний тип за замовчуванням |
| **Wholesale** | Оптові клієнти | Великі об'єми закупівель |

### 11.3 CRUD операції

#### Створення клієнта
```typescript
// Frontend
const handleAddCustomer = async (data) => {
  await createCustomer({
    name: data.name,
    type: 'Regular',  // Завжди Regular за замовчуванням
    phone: data.phone,
    email: data.email,
    address: data.address,
  });
  logActivity('customerCreate', { customerName: data.name, ... });
};

// GraphQL Mutation
mutation CREATE_CUSTOMER($data: CustomerInput!) {
  createCustomer(data: $data) {
    documentId
    name
    type
  }
}
```

#### Отримання клієнтів
```typescript
// GraphQL Query
query GET_CUSTOMERS {
  customers(sort: ["name:asc"]) {
    documentId
    name
    type
    phone
    email
    address
    totalSpent
    orderCount
    balance
    transactions { ... }
  }
}
```

#### Видалення клієнта
```typescript
// Перевірки перед видаленням:
// 1. Чи немає активних транзакцій?
// 2. Чи баланс = 0?
// Рішення: видалення дозволено, історія залишається

mutation DELETE_CUSTOMER($documentId: ID!) {
  deleteCustomer(documentId: $documentId) {
    documentId
  }
}
```

### 11.4 UI клієнтів

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENTS SECTION                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [🔍 Пошук клієнта...        ]  [+ Додати клієнта] [📤 Експорт] │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Клієнт          │ Тип     │ Замовлень │ Витрачено │ Баланс │  │
│  │─────────────────┼─────────┼───────────┼───────────┼────────│  │
│  │ ⭐ ФОП Іванов   │ VIP     │    47     │ 125,000 ₴ │ -5,000 │  │
│  │ ТОВ Квіти       │Wholesale│    23     │  85,000 ₴ │      0 │  │
│  │ Петренко О.     │ Regular │    12     │  15,000 ₴ │ +1,000 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  При кліку на клієнта → Modal з деталями та історією            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 11.5 Детальний перегляд клієнта

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER DETAILS MODAL                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⭐ ФОП Іванов (VIP)                                            │
│  ──────────────────                                             │
│  📞 +380501234567                                               │
│  ✉️  ivanov@example.com                                         │
│  📍 м. Київ, вул. Хрещатик 1                                    │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Замовлень   │  │  Витрачено  │  │   Баланс    │              │
│  │     47      │  │  125,000 ₴  │  │  -5,000 ₴   │              │
│  │             │  │             │  │   (борг)    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  Історія транзакцій:                                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Дата       │ Тип    │ Сума    │ Статус    │ Дія           │  │
│  │────────────┼────────┼─────────┼───────────┼───────────────│  │
│  │ 07.01.2026 │ Продаж │ 5,000 ₴ │ Очікує ⏳ │[✓ Підтвердити]│  │
│  │ 05.01.2026 │ Продаж │ 3,500 ₴ │ Оплачено ✅│               │  │
│  │ 03.01.2026 │ Продаж │ 8,000 ₴ │ Оплачено ✅│               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│                                           [ 🗑️ Видалити ] [ ✕ ] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Детальний опис системи балансу

### 12.1 Концепція балансу

```
┌─────────────────────────────────────────────────────────────────┐
│                     BALANCE CONCEPT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  balance < 0  →  БОРГ клієнта магазину                          │
│                  (клієнт винен гроші)                           │
│                                                                  │
│  balance = 0  →  Нема боргів                                    │
│                                                                  │
│  balance > 0  →  ПЕРЕПЛАТА клієнта                              │
│                  (магазин винен товар/гроші)                    │
│                                                                  │
│  Приклад:                                                        │
│  └─ Клієнт купує на 10,000 ₴ в борг                             │
│     balance = 0 - 10,000 = -10,000 ₴                            │
│  └─ Клієнт оплачує 6,000 ₴                                      │
│     balance = -10,000 + 6,000 = -4,000 ₴                        │
│  └─ Клієнт оплачує решту 4,000 ₴                                │
│     balance = -4,000 + 4,000 = 0 ₴                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 12.2 Сценарії зміни балансу

#### Сценарій 1: Продаж з повною оплатою
```
Замовлення: 5,000 ₴
paymentStatus: "paid"
─────────────────────────────
customer.balance: без змін
customer.totalSpent: +5,000 ₴
customer.orderCount: +1
```

#### Сценарій 2: Продаж повністю в борг
```
Замовлення: 5,000 ₴
paymentStatus: "expected"
paidAmount: 0 ₴
─────────────────────────────
debt = 5,000 - 0 = 5,000 ₴
customer.balance: -5,000 ₴
customer.totalSpent: без змін
customer.orderCount: без змін
```

#### Сценарій 3: Часткова оплата
```
Замовлення: 5,000 ₴
paymentStatus: "expected"
paidAmount: 2,000 ₴
─────────────────────────────
debt = 5,000 - 2,000 = 3,000 ₴
customer.balance: -3,000 ₴
customer.totalSpent: +2,000 ₴
customer.orderCount: +1
```

#### Сценарій 4: Підтвердження оплати
```
Транзакція: 5,000 ₴ (status: expected)
paidAmount: 2,000 ₴
debt: 3,000 ₴
─────────────────────────────
POST /api/pos/transactions/:id/confirm-payment
─────────────────────────────
transaction.paymentStatus: "paid"
transaction.paidAmount: 5,000 ₴
customer.balance: +3,000 ₴ (погашення боргу)
customer.totalSpent: +3,000 ₴ (решта суми)
```

### 12.3 Flow підтвердження оплати

```
┌─────────────────────────────────────────────────────────────────┐
│                  CONFIRM PAYMENT FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User clicks "Підтвердити оплату" on pending transaction     │
│                                                                  │
│  2. Frontend: POST /api/pos/transactions/:id/confirm-payment    │
│                                                                  │
│  3. Backend POS Service:                                        │
│     ┌────────────────────────────────────────────────────────┐  │
│     │  a. Find transaction by documentId                      │  │
│     │     - Check exists                                      │  │
│     │     - Check type = 'sale'                               │  │
│     │     - Check not already 'paid' (idempotency)           │  │
│     │                                                         │  │
│     │  b. DB Transaction:                                     │  │
│     │     - Update transaction:                               │  │
│     │       payment_status = 'paid'                           │  │
│     │       payment_date = now()                              │  │
│     │       paid_amount = amount                              │  │
│     │                                                         │  │
│     │     - Update customer:                                  │  │
│     │       previouslyPaid = old paidAmount                   │  │
│     │       debtAmount = amount - previouslyPaid              │  │
│     │       remainingToPay = amount - previouslyPaid          │  │
│     │                                                         │  │
│     │       If previouslyPaid = 0:                            │  │
│     │         order_count += 1                                │  │
│     │                                                         │  │
│     │       total_spent += remainingToPay                     │  │
│     │       balance += debtAmount (погашення боргу)           │  │
│     │                                                         │  │
│     └────────────────────────────────────────────────────────┘  │
│                                                                  │
│  4. Invalidate analytics cache                                  │
│                                                                  │
│  5. Return updated transaction                                  │
│                                                                  │
│  6. Frontend:                                                    │
│     - Log activity (paymentConfirm)                             │
│     - Refresh customers                                         │
│     - Update pending payments sidebar                           │
│     - Show success toast                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 12.4 Синхронізація балансів

```typescript
// POST /api/pos/sync-balances
// Використовується для міграції існуючих даних

async syncBalances() {
  for (const customer of customers) {
    let totalDebt = 0;

    // Рахуємо загальний борг з неоплачених транзакцій
    for (const tx of customer.transactions) {
      if (tx.type === 'sale' && tx.paymentStatus === 'expected') {
        const paidAmount = tx.paidAmount || 0;
        const debtAmount = tx.amount - paidAmount;
        totalDebt += debtAmount;
      }
    }

    // Оновлюємо баланс (негативний = борг)
    customer.balance = -totalDebt;
  }
}
```

### 12.5 UI відображення балансу

```
┌─────────────────────────────────────────────────────────────────┐
│                   BALANCE DISPLAY                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  В POS терміналі (при виборі клієнта):                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 👤 ФОП Іванов                                           │    │
│  │    Баланс: -5,000 ₴ ⚠️                                  │    │
│  │    (клієнт має борг)                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  В списку клієнтів:                                             │
│  ┌──────────────────┬────────────┐                              │
│  │ Клієнт           │  Баланс    │                              │
│  │──────────────────┼────────────│                              │
│  │ ФОП Іванов       │ -5,000 ₴ 🔴│  ← Борг (червоний)          │
│  │ ТОВ Квіти        │      0 ₴   │  ← Без боргу               │
│  │ Петренко О.      │ +1,000 ₴ 🟢│  ← Переплата (зелений)     │
│  └──────────────────┴────────────┘                              │
│                                                                  │
│  В сайдбарі (загальна сума очікуваних оплат):                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 💰 Очікує оплати                                        │    │
│  │    12,500 ₴ (5 замовлень)                               │    │
│  │    [Переглянути →]                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 12.6 Кешування pending payments

```typescript
// Frontend cache (5 хвилин)
let pendingPaymentsCache = null;
let pendingPaymentsCacheTime = 0;
const PENDING_CACHE_TTL = 5 * 60 * 1000;

async function getPendingPaymentsSummary(forceRefresh = false) {
  const now = Date.now();

  if (!forceRefresh && pendingPaymentsCache &&
      (now - pendingPaymentsCacheTime) < PENDING_CACHE_TTL) {
    return pendingPaymentsCache;
  }

  const result = await fetch('/api/analytics/pending-payments');
  pendingPaymentsCache = result;
  pendingPaymentsCacheTime = now;

  return result;
}

function invalidatePendingPaymentsCache() {
  pendingPaymentsCache = null;
  pendingPaymentsCacheTime = 0;
}
```

---

*Документ створено: Січень 2026*
*Версія системи: 1.0*
*Оновлено: Детальний опис імпорту, POS, клієнтів та балансу*
