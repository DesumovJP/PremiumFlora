# Premium Flora - Backend

## Технології

- **Strapi v5** - Headless CMS
- **PostgreSQL** - База даних (production)
- **SQLite** - База даних (development)
- **GraphQL** - API для колекцій
- **REST** - Кастомні ендпоінти

---

## Швидкий Старт

```bash
cd backend
npm install
npm run develop
```

Відкрити http://localhost:1337/admin

---

## Структура Проекту

```
backend/
├── config/
│   ├── database.ts       # Налаштування БД
│   ├── middlewares.ts    # CORS, rate-limit
│   ├── plugins.ts        # Email, upload, graphql
│   └── server.ts         # Порт, хост
│
├── src/
│   ├── api/              # API модулі
│   │   ├── analytics/       # Аналітика (REST)
│   │   ├── pos/             # POS операції (REST)
│   │   ├── shift/           # Зміни (REST)
│   │   ├── import/          # Excel імпорт (REST)
│   │   ├── planned-supply/  # Поставки (REST)
│   │   ├── flower/          # Квіти (GraphQL + REST)
│   │   ├── variant/         # Варіанти
│   │   ├── customer/        # Клієнти
│   │   ├── transaction/     # Транзакції
│   │   ├── supply/          # Поставки
│   │   ├── article/         # Статті
│   │   └── task/            # Завдання
│   │
│   ├── services/
│   │   └── excel/           # Обробка Excel
│   │
│   └── bootstrap.ts      # Ініціалізація
│
└── types/                # Автогенеровані типи
```

---

## API Ендпоінти

### GraphQL (Колекції)

Strapi автоматично генерує GraphQL ендпоінти для колекцій:

```graphql
# Квіти
query {
  flowers(pagination: { pageSize: 500 }) {
    documentId
    name
    slug
    variants {
      length
      price
      stock
    }
  }
}

# Клієнти
query {
  customers(pagination: { pageSize: 100 }) {
    documentId
    name
    type
    totalSpent
  }
}
```

### REST (Кастомні Ендпоінти)

#### POS Operations

```
POST /api/pos/sales          # Створити продаж
POST /api/pos/write-offs     # Списати товар
PUT  /api/pos/transactions/:id/confirm-payment  # Підтвердити оплату
```

#### Analytics

```
GET /api/analytics/dashboard  # Повна аналітика
GET /api/analytics/stock      # Рівні складу
```

#### Shifts

```
GET  /api/shifts/current      # Поточна зміна
POST /api/shifts/current/activity  # Додати активність
POST /api/shifts/close        # Закрити зміну
GET  /api/shifts              # Список змін
```

#### Import

```
POST /api/imports/excel       # Імпорт Excel
```

#### Planned Supply

```
GET /api/planned-supply/low-stock     # Низькі залишки
GET /api/planned-supply/search        # Пошук для поставки
GET /api/planned-supply/all-flowers   # Всі квіти
```

---

## Колекції (Content Types)

### Flower (Квітка)

```typescript
{
  name: string;
  slug: string;          // URL-friendly
  description: Block[];  // Rich text
  image: Media;
  variants: Variant[];   // Relation
}
```

### Variant (Варіант)

```typescript
{
  length: number;        // Довжина в см
  price: number;         // Ціна в грн
  stock: number;         // Залишок
  flower: Flower;        // Relation
}
```

### Customer (Клієнт)

```typescript
{
  name: string;
  type: 'VIP' | 'Regular' | 'Wholesale';
  phone?: string;
  email?: string;
  address?: string;
  totalSpent: number;
  orderCount: number;
}
```

### Transaction (Транзакція)

```typescript
{
  type: 'sale' | 'writeOff';
  operationId: string;   // Ідемпотентність
  date: datetime;
  amount: number;
  items: JSON;           // Array<TransactionItem>
  paymentStatus: 'pending' | 'paid' | 'expected' | 'cancelled';
  customer?: Customer;   // Relation
  writeOffReason?: 'damage' | 'expiry' | 'adjustment' | 'other';
  notes?: string;
}
```

### Shift (Зміна)

```typescript
{
  startedAt: datetime;
  closedAt?: datetime;
  status: 'active' | 'closed';
  activities: JSON;      // Array<ShiftActivity>
  summary: JSON;         // ShiftSummary
  totalSales: number;
  totalSalesAmount: number;
  totalWriteOffs: number;
  totalWriteOffsQty: number;
}
```

---

## Сервіси

### Analytics Service

`src/api/analytics/services/analytics.ts`

- `getStockLevels()` - Рівні складу
- `getSalesMetrics(period)` - Метрики продажів
- `getWriteOffSummary()` - Статистика списань
- `getDashboardData()` - Повна аналітика
- `invalidateAnalyticsCache()` - Інвалідувати кеш

### POS Service

`src/api/pos/services/pos.ts`

- `createSale(data)` - Створити продаж (атомарно)
- `createWriteOff(data)` - Списати товар
- `confirmPayment(transactionId)` - Підтвердити оплату

### Excel Services

`src/services/excel/`

- `parser.service.ts` - Парсинг Excel
- `normalizer.service.ts` - Нормалізація даних
- `validator.service.ts` - Валідація
- `upserter.service.ts` - Upsert операції

---

## Ідемпотентність

POS операції використовують `operationId` для запобігання дублюванню:

```typescript
// Frontend генерує UUID
const operationId = crypto.randomUUID();

// Backend перевіряє
const existing = await findByOperationId(operationId);
if (existing) {
  return { success: true, idempotent: true, data: existing };
}
```

---

## Кешування

Analytics сервіс використовує in-memory кеш:

```typescript
const CACHE_TTL = 3 * 60 * 1000; // 3 хвилини

// Інвалідувати кеш після змін
invalidateAnalyticsCache();
```

---

## Lifecycle Hooks

### Flower Lifecycle

`src/api/flower/content-types/flower/lifecycles.ts`

- `beforeCreate` - Генерація slug
- `afterUpdate` - Інвалідація кешу

### Supply Lifecycle

`src/api/supply/content-types/supply/lifecycles.ts`

- `beforeCreate` - Валідація даних

---

## Змінні Оточення

```env
# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=premium_flora
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=secret

# Server
HOST=0.0.0.0
PORT=1337

# Admin
ADMIN_JWT_SECRET=xxx
API_TOKEN_SALT=xxx
APP_KEYS=xxx,xxx

# Upload (Cloudinary)
CLOUDINARY_NAME=xxx
CLOUDINARY_KEY=xxx
CLOUDINARY_SECRET=xxx
```

---

## Розгортання

### Railway (Production)

1. Push до GitHub
2. Railway автоматично білдить
3. Використовується PostgreSQL

### Локально (Development)

```bash
npm run develop    # Strapi dev mode
npm run build      # Build для production
npm run start      # Production mode
```

---

## Рекомендації

### DO

- Використовуйте GraphQL для читання колекцій
- Використовуйте REST для кастомної логіки
- Завжди використовуйте `operationId` для POS
- Інвалідуйте кеш після змін даних

### DON'T

- Не модифікуйте дані напряму в БД
- Не пропускайте валідацію
- Не зберігайте секрети в коді
