# Premium Flora - Адмін-панель: Повний технічний аналіз

## Зміст

1. [Огляд архітектури](#1-огляд-архітектури)
2. [Структура файлів](#2-структура-файлів)
3. [Компоненти та секції](#3-компоненти-та-секції)
4. [API та потік даних](#4-api-та-потік-даних)
5. [Критичні точки обробки даних](#5-критичні-точки-обробки-даних)
6. [Потенційні помилки та ризики](#6-потенційні-помилки-та-ризики)
7. [Обробка помилок](#7-обробка-помилок)
8. [Безпека](#8-безпека)
9. [План покращень](#9-план-покращень)

---

## 1. Огляд архітектури

### Технологічний стек

**Frontend:**
- Next.js 14 (App Router)
- React 18 з Server/Client Components
- TypeScript для типізації
- Tailwind CSS для стилізації
- Radix UI для базових компонентів
- GraphQL (graphql-request) для запитів до Strapi

**Backend:**
- Strapi v5 (Headless CMS)
- PostgreSQL (через Railway)
- GraphQL plugin для стандартних операцій
- REST API для кастомних ендпоінтів (POS, Analytics, Import)
- DigitalOcean Spaces для зображень

### Архітектурна діаграма

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ admin-client│  │  sections/  │  │   hooks/    │             │
│  │    .tsx     │──│ (5 секцій)  │──│ (7 хуків)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          ▼                                       │
│              ┌─────────────────────┐                            │
│              │    lib/strapi.ts    │                            │
│              │  (API абстракція)   │                            │
│              └─────────────────────┘                            │
│                          │                                       │
├──────────────────────────┼──────────────────────────────────────┤
│                          ▼                                       │
│     ┌──────────────────────────────────────────┐                │
│     │              GraphQL + REST               │                │
│     └──────────────────────────────────────────┘                │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                          ▼                                       │
│                   Backend (Strapi v5)                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Controllers │  │  Services   │  │   Models    │             │
│  │  (10+)      │──│ (POS, etc)  │──│ (6 колекцій)│             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                          │                                       │
│                          ▼                                       │
│              ┌─────────────────────┐                            │
│              │     PostgreSQL      │                            │
│              └─────────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Структура файлів

### Frontend

```
frontend/
├── app/
│   └── admin/
│       ├── page.tsx              # Server Component - точка входу
│       ├── layout.tsx            # Auth перевірка + metadata
│       ├── admin-client.tsx      # 656 рядків - головний клієнт
│       └── login/
│           └── page.tsx          # Форма авторизації
├── components/
│   ├── sections/
│   │   ├── pos-section.tsx       # 704 рядки - POS термінал
│   │   ├── products-section.tsx  # 1930 рядків - Товари
│   │   ├── clients-section.tsx   # 717 рядків - Клієнти
│   │   ├── analytics-section.tsx # 490 рядків - Аналітика
│   │   └── history-section.tsx   # 617 рядків - Історія зміни
│   ├── ui/
│   │   ├── import-modal.tsx      # Excel імпорт
│   │   ├── planned-supply-modal.tsx
│   │   ├── modal.tsx
│   │   └── alert-toast.tsx
│   └── layout/
│       ├── sidebar.tsx
│       └── header.tsx
├── hooks/
│   ├── use-activity-log.ts       # 241 рядок - Історія дій
│   ├── use-alerts.ts             # Тост повідомлення
│   ├── use-customers.ts          # CRUD клієнтів
│   ├── use-flowers.ts            # CRUD товарів
│   └── use-transactions.ts       # Транзакції
├── lib/
│   ├── strapi.ts                 # 1172 рядки - API модуль
│   ├── types.ts                  # Типи
│   ├── api-types.ts              # API типи
│   ├── auth.ts                   # JWT авторизація
│   ├── graphql/
│   │   ├── client.ts             # GraphQL клієнт
│   │   ├── queries.ts            # GraphQL запити
│   │   ├── mutations.ts          # GraphQL мутації
│   │   └── types.ts              # GraphQL типи
│   └── export.ts                 # Excel експорт
```

### Backend (Strapi)

```
backend/
├── src/
│   └── api/
│       ├── flower/               # Стандартний Strapi CRUD
│       ├── variant/              # Варіанти квітів
│       ├── customer/             # Клієнти
│       ├── transaction/          # Транзакції
│       ├── shift/                # Робочі зміни
│       │   ├── controllers/shift.ts  # 372 рядки
│       │   └── routes/shift.ts
│       ├── pos/                  # POS операції
│       │   ├── controllers/pos.ts    # 356 рядків
│       │   ├── services/pos.ts       # 560 рядків
│       │   └── routes/pos.ts
│       ├── analytics/            # Аналітика
│       │   ├── controllers/analytics.ts
│       │   └── services/analytics.ts
│       ├── import/               # Excel імпорт
│       │   ├── controllers/import.ts
│       │   └── routes/import.ts
│       ├── planned-supply/       # Заплановані поставки
│       └── auth/                 # Авторизація
└── config/
    ├── database.ts
    ├── plugins.ts
    └── middlewares.ts
```

---

## 3. Компоненти та секції

### 3.1 AdminClient (admin-client.tsx)

**Головний компонент** - оркеструє всі секції та стан.

```typescript
// Основні стани
const [products, setProducts] = useState<Product[]>(initialProducts);
const [customers, setCustomers] = useState<Customer[]>([]);
const [analyticsData, setAnalyticsData] = useState<DashboardData | null>(null);
const [cart, setCart] = useState<CartLine[]>([]);
const [selectedClient, setSelectedClient] = useState<string>();
const [isCheckingOut, setIsCheckingOut] = useState(false);
```

**Ключові функції:**

```typescript
// Створення продажу - КРИТИЧНА ОПЕРАЦІЯ
const handleCheckout = async () => {
  if (!selectedClient || cart.length === 0) {
    showError("Помилка", "Оберіть клієнта та додайте товари");
    return;
  }

  setIsCheckingOut(true);
  try {
    const operationId = generateOperationId(); // Ідемпотентність
    const result = await createSale({
      operationId,
      customerId: selectedClient,
      items: cart.map((line) => ({
        flowerSlug: line.flowerSlug,
        length: line.length,
        qty: line.qty,
        price: line.price,
        name: line.name,
      })),
      discount,
      paymentStatus,
    });

    if (result.success) {
      // Логуємо для історії зміни
      logActivity('sale', { customerName, items, totalAmount, discount });

      showSuccess("Замовлення створено");
      setCart([]); // Очищаємо кошик
      await refreshProducts(); // Оновлюємо склад
      await fetchCustomers(); // Оновлюємо статистику клієнта
    } else {
      showError("Помилка", result.error?.message);
    }
  } finally {
    setIsCheckingOut(false);
  }
};
```

### 3.2 PosSection (pos-section.tsx)

**POS термінал** - швидке оформлення замовлень.

**Критичні точки:**

```typescript
// Додавання до кошика
const addToCart = (product: Product, variant: Variant) => {
  const id = `${product.id}-${variant.length}`;
  setCart((current) => {
    const existing = current.find((line) => line.id === id);
    if (existing) {
      // УВАГА: Додаємо фіксовано 25 шт - немає перевірки на stock!
      return current.map((line) =>
        line.id === id ? { ...line, qty: line.qty + 25 } : line
      );
    }
    return [...current, {
      id,
      flowerSlug: product.id, // product.id = slug
      length: variant.length,
      qty: 25, // Фіксована кількість
      price: variant.price,
      name: product.name,
    }];
  });
};
```

**Потенційна проблема:** Немає клієнтської перевірки stock при додаванні до кошика. Перевірка відбувається тільки на сервері при checkout.

### 3.3 ProductsSection (products-section.tsx)

**Найбільший компонент** - управління товарами.

**Структура станів:**

```typescript
// Основні стани
const [open, setOpen] = useState(false);           // Модалка додавання
const [draft, setDraft] = useState<{...}>();       // Чернетка нового товару
const [editModalOpen, setEditModalOpen] = useState(false);
const [editingProduct, setEditingProduct] = useState<Product | null>(null);
const [editData, setEditData] = useState<{
  image: File | null;
  imagePreview: string | null;
  description: string;
  variants: Array<{
    documentId: string;
    length: number;
    price: number;
    stock: number;
    isNew?: boolean;
    isDeleted?: boolean;  // Для видалення варіантів
  }>;
  originalVariants: Array<{...}>;  // Для порівняння змін
}>();
```

**Критична операція - збереження редагування:**

```typescript
const handleSaveEdit = async () => {
  // 1. Завантаження зображення
  let imageId: number | null = null;
  if (editData.image) {
    const uploadResponse = await fetch(`${STRAPI_URL}/api/upload`, {
      method: "POST",
      headers: uploadHeaders,
      body: imageFormData,
    });
    // Якщо помилка - запитуємо користувача продовжити без зображення
  }

  // 2. Оновлення квітки
  await updateFlower(editingProduct.documentId, {
    description: descriptionBlocks,
    imageId,
  });

  // 3. Видалення позначених варіантів
  for (const variant of deletedVariants) {
    await fetch(`${STRAPI_URL}/api/variants/${variant.documentId}`, {
      method: "DELETE",
    });
    // Логуємо видалення
    onLogActivity('variantDelete', {
      productName: editingProduct.name,
      variantLength: variant.length,
      variantPrice: variant.price,
      variantStock: variant.stock,
    });
  }

  // 4. Оновлення/створення варіантів
  for (const variant of activeVariants) {
    if (variant.isNew) {
      // Створюємо новий
      await fetch(`${STRAPI_URL}/api/variants`, {
        method: "POST",
        body: JSON.stringify({
          data: {
            length: variant.length,
            price: variant.price,
            stock: variant.stock,
            flower: { connect: [{ documentId: editingProduct.documentId }] },
          },
        }),
      });
    } else {
      // Оновлюємо існуючий
      await updateVariant(variant.documentId, {
        price: variant.price,
        stock: variant.stock,
      });
    }
  }
};
```

**КРИТИЧНИЙ РИЗИК:** Операції не атомарні! Якщо видалення варіанта успішне, але оновлення іншого - часткові зміни.

### 3.4 ClientsSection (clients-section.tsx)

**Управління клієнтами.**

```typescript
// Завантаження транзакцій для ВСІХ клієнтів при монтуванні
useEffect(() => {
  const loadTransactionsForAll = async () => {
    const transactionPromises = customers.map(async (customer) => {
      const result = await getTransactions({
        customerId: customer.documentId,
        type: 'sale',
        limit: 100,
      });
      // Обчислюємо реальну статистику з транзакцій
      return {
        customerId: customer.documentId,
        orders: result.data.length,
        spent: result.data.reduce((sum, t) => sum + t.amount, 0),
      };
    });
    await Promise.all(transactionPromises);
  };
  loadTransactionsForAll();
}, [customers]);
```

**Потенційна проблема:** При великій кількості клієнтів - багато паралельних запитів. Може призвести до rate limiting.

### 3.5 HistorySection (history-section.tsx)

**Історія робочої зміни** з синхронізацією між пристроями.

```typescript
// Polling кожні 30 секунд для multi-device sync
const POLL_INTERVAL = 30000;

useEffect(() => {
  pollIntervalRef.current = setInterval(() => {
    fetchCurrentShift();
  }, POLL_INTERVAL);
  return () => clearInterval(pollIntervalRef.current);
}, []);
```

---

## 4. API та потік даних

### 4.1 GraphQL запити (lib/graphql/queries.ts)

```graphql
# Отримання квітів з варіантами
query GetFlowers($pageSize: Int = 100) {
  flowers(
    pagination: { pageSize: $pageSize }
    filters: { publishedAt: { notNull: true } }
  ) {
    documentId
    name
    slug
    description
    publishedAt
    updatedAt
    image {
      documentId
      url
      formats
    }
    variants {
      documentId
      length
      price
      stock
    }
  }
}
```

### 4.2 REST API ендпоінти

| Ендпоінт | Метод | Опис | Захист |
|----------|-------|------|--------|
| `/api/pos/sales` | POST | Створити продаж | Публічний |
| `/api/pos/write-offs` | POST | Списання | Публічний |
| `/api/pos/transactions/:id/confirm-payment` | PUT | Підтвердити оплату | Публічний |
| `/api/shifts/current` | GET | Поточна зміна | Публічний |
| `/api/shifts/current/activity` | POST | Додати дію | Auth |
| `/api/shifts/close` | POST | Закрити зміну | Auth |
| `/api/analytics/dashboard` | GET | Аналітика | Публічний |
| `/api/imports/excel` | POST | Імпорт Excel | Auth |
| `/api/planned-supply/low-stock` | GET | Низькі залишки | Публічний |

### 4.3 Потік даних при продажу

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  1. Користувач натискає "Оформити замовлення"                   │
│  2. handleCheckout() в admin-client.tsx                         │
│  3. generateOperationId() - унікальний ID для ідемпотентності   │
│  4. createSale() в lib/strapi.ts                                │
│                          │                                       │
│                          ▼                                       │
│         POST /api/pos/sales                                     │
│         {                                                        │
│           operationId: "550e8400-e29b-...",                     │
│           customerId: "abc123",                                  │
│           items: [...],                                          │
│           discount: 0,                                           │
│           paymentStatus: "expected"                              │
│         }                                                        │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                          ▼                                       │
│                    BACKEND (Strapi)                              │
├─────────────────────────────────────────────────────────────────┤
│  POS Controller (pos.ts:67)                                     │
│  │                                                               │
│  ├── 1. Валідація вхідних даних                                 │
│  │   - operationId required                                      │
│  │   - customerId required                                       │
│  │   - items[] not empty                                         │
│  │   - each item has flowerSlug, length, qty, price, name       │
│  │                                                               │
│  └── 2. Виклик POS Service                                      │
│                                                                  │
│  POS Service (pos.ts:195)                                       │
│  │                                                               │
│  ├── 1. Перевірка ідемпотентності                               │
│  │   SELECT * FROM transactions WHERE operationId = ?            │
│  │   Якщо існує → return { success: true, idempotent: true }    │
│  │                                                               │
│  ├── 2. Перевірка клієнта                                       │
│  │   SELECT * FROM customers WHERE documentId = ?                │
│  │                                                               │
│  ├── 3. Валідація stock для кожного item                        │
│  │   FOR EACH item:                                              │
│  │     SELECT * FROM variants                                    │
│  │     WHERE flower.slug = ? AND length = ?                      │
│  │     IF stock < qty → ERROR                                    │
│  │                                                               │
│  ├── 4. АТОМАРНІ ОПЕРАЦІЇ (послідовно, без транзакції!)        │
│  │   │                                                           │
│  │   ├── 4a. Декремент stock                                    │
│  │   │   FOR EACH item:                                          │
│  │   │     UPDATE variants SET stock = stock - qty               │
│  │   │                                                           │
│  │   ├── 4b. Створення Transaction                              │
│  │   │   INSERT INTO transactions (...)                          │
│  │   │                                                           │
│  │   └── 4c. Оновлення статистики клієнта (якщо paid)           │
│  │       UPDATE customers SET orderCount++, totalSpent+=         │
│  │                                                               │
│  └── 5. Return result                                           │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                          ▼                                       │
│                    FRONTEND (продовження)                        │
├─────────────────────────────────────────────────────────────────┤
│  5. Обробка відповіді                                           │
│  6. logActivity('sale', {...}) - запис в історію зміни          │
│  7. showSuccess() - тост повідомлення                           │
│  8. setCart([]) - очищення кошика                               │
│  9. refreshProducts() - оновлення stock                         │
│  10. fetchCustomers() - оновлення статистики клієнта            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Критичні точки обробки даних

### 5.1 Створення продажу (POS Service)

**Файл:** `backend/src/api/pos/services/pos.ts:195-340`

```typescript
async createSale(data: CreateSaleInput) {
  // КРИТИЧНА ТОЧКА 1: Ідемпотентність
  const existing = await this.findByOperationId(data.operationId);
  if (existing) {
    return { success: true, idempotent: true, data: existing };
  }

  // КРИТИЧНА ТОЧКА 2: Перевірка клієнта
  const customer = await strapi.db.query('api::customer.customer').findOne({
    where: { documentId: data.customerId },
  });
  if (!customer) {
    return { success: false, error: { code: 'CUSTOMER_NOT_FOUND' } };
  }

  // КРИТИЧНА ТОЧКА 3: Валідація stock
  const { valid, errors, variants } = await this.validateStock(data.items);
  if (!valid) {
    return {
      success: false,
      error: {
        code: 'INSUFFICIENT_STOCK',
        details: errors, // Масив з деталями по кожному item
      },
    };
  }

  // КРИТИЧНА ТОЧКА 4: Операції з БД (НЕ АТОМАРНІ!)
  try {
    // 4a. Декремент stock
    for (const item of data.items) {
      const variant = variants.get(`${item.flowerSlug}-${item.length}`);
      await strapi.db.query('api::variant.variant').update({
        where: { documentId: variant.documentId },
        data: { stock: variant.stock - item.qty },
      });
    }

    // 4b. Створення транзакції
    const transaction = await strapi.db.query('api::transaction.transaction').create({
      data: {
        date: new Date().toISOString(),
        type: 'sale',
        operationId: data.operationId,
        paymentStatus: data.paymentStatus || 'pending',
        amount,
        items: data.items,
        customer: customer.id,
      },
    });

    // 4c. Оновлення статистики клієнта
    if (data.paymentStatus === 'paid') {
      await strapi.db.query('api::customer.customer').update({
        where: { documentId: customer.documentId },
        data: {
          orderCount: (customer.orderCount || 0) + 1,
          totalSpent: (customer.totalSpent || 0) + amount,
        },
      });
    }

    return { success: true, data: transaction };
  } catch (error) {
    // ⚠️ РИЗИК: Якщо помилка після декременту stock - rollback відсутній!
    strapi.log.error('Sale creation error:', error);
    return { success: false, error: { code: 'INTERNAL_ERROR' } };
  }
}
```

### 5.2 Списання товару

**Файл:** `backend/src/api/pos/services/pos.ts:345-473`

```typescript
async createWriteOff(data: CreateWriteOffInput) {
  // Ідемпотентність
  const existing = await this.findByOperationId(data.operationId);
  if (existing) return { success: true, idempotent: true };

  // Пошук варіанта
  const variant = await this.findVariant(data.flowerSlug, data.length);
  if (!variant) {
    return { success: false, error: { code: 'VARIANT_NOT_FOUND' } };
  }

  // Перевірка stock
  if (variant.stock < data.qty) {
    return {
      success: false,
      error: {
        code: 'INSUFFICIENT_STOCK',
        message: `Cannot write off ${data.qty}. Only ${variant.stock} available.`,
      },
    };
  }

  // Операції
  await strapi.db.query('api::variant.variant').update({
    where: { documentId: variant.documentId },
    data: { stock: variant.stock - data.qty },
  });

  const transaction = await strapi.db.query('api::transaction.transaction').create({
    data: {
      type: 'writeOff',
      operationId: data.operationId,
      paymentStatus: 'cancelled',
      amount: 0,
      items: [{
        flowerSlug: data.flowerSlug,
        length: data.length,
        qty: data.qty,
        price: variant.price,
        name: variant.flower?.name,
      }],
      writeOffReason: data.reason,
    },
  });

  return { success: true, data: transaction };
}
```

### 5.3 Excel імпорт

**Файл:** `frontend/components/ui/import-modal.tsx`

```typescript
// Опції імпорту
const [options, setOptions] = useState<ImportOptions>({
  dryRun: true,           // Тестовий режим за замовчуванням
  stockMode: "add",       // Додати до існуючого stock
  priceMode: "skip",      // Залишити стару ціну
});

// Процес імпорту
const handleImport = async () => {
  const result = await importExcel(selectedFile, {
    ...options,
    awb: awb || undefined,
    supplier: supplier || undefined,
    forceImport: checksum ? true : undefined,  // Обхід дублікату
  });

  if (result.success) {
    // Показуємо результати
    // flowers_created, flowers_updated, variants_created, etc.
  }
};
```

**Backend валідація:**
- Нормалізація назв квітів (Freedom Rose → Freedom)
- Checksum для запобігання дублікатів
- Логування всіх змін

### 5.4 Редагування варіантів

**Файл:** `frontend/components/sections/products-section.tsx:389-583`

```typescript
// Видалення варіанта (позначка, не фактичне видалення)
const removeEditVariant = (documentId: string) => {
  setEditData((prev) => {
    const variant = prev.variants.find(v => v.documentId === documentId);
    if (variant?.isNew) {
      // Новий варіант - просто видаляємо
      return {
        ...prev,
        variants: prev.variants.filter((v) => v.documentId !== documentId),
      };
    }
    // Існуючий - позначаємо як видалений
    return {
      ...prev,
      variants: prev.variants.map((v) =>
        v.documentId === documentId ? { ...v, isDeleted: true } : v
      ),
    };
  });
};

// Збереження - послідовні операції
const handleSaveEdit = async () => {
  // ... upload image ...
  // ... update flower ...

  // Видалення позначених варіантів
  const deletedVariants = editData.variants.filter(v => v.isDeleted && !v.isNew);
  for (const variant of deletedVariants) {
    const deleteResponse = await fetch(
      `${STRAPI_URL}/api/variants/${variant.documentId}`,
      { method: "DELETE", headers: authHeaders }
    );

    if (deleteResponse.ok && onLogActivity) {
      onLogActivity('variantDelete', {
        productName: editingProduct.name,
        variantLength: variant.length,
        variantPrice: variant.price,
        variantStock: variant.stock,
      });
    }
  }
  // ... update/create variants ...
};
```

---

## 6. Потенційні помилки та ризики

### 6.1 КРИТИЧНІ (можуть призвести до втрати даних)

| # | Проблема | Місце | Вплив | Рекомендація |
|---|----------|-------|-------|--------------|
| 1 | **Відсутність транзакцій БД** | POS Service | Часткове оновлення при помилці | Впровадити database transactions |
| 2 | **Race condition при checkout** | POS Service | Продаж товару з недостатнім stock | Оптимістичне блокування або SELECT FOR UPDATE |
| 3 | **Неповне видалення варіантів** | products-section.tsx | Orphan варіанти | Каскадне видалення через Strapi relations |
| 4 | **Втрата даних при закритті браузера** | import-modal.tsx | Втрата прогресу імпорту | Server-side sessions для імпорту |

### 6.2 ВИСОКИЙ ПРІОРИТЕТ

| # | Проблема | Місце | Вплив |
|---|----------|-------|-------|
| 5 | Немає перевірки stock при addToCart | pos-section.tsx | UX - помилка тільки при checkout |
| 6 | Паралельні запити для всіх клієнтів | clients-section.tsx | Rate limiting, повільна завантаження |
| 7 | Optimistic update без rollback | use-activity-log.ts | Неконсистентний UI стан |
| 8 | Немає retry логіки для мережевих помилок | strapi.ts | Втрата операцій при нестабільній мережі |

### 6.3 СЕРЕДНІЙ ПРІОРИТЕТ

| # | Проблема | Місце | Вплив |
|---|----------|-------|-------|
| 9 | POS ендпоінти без аутентифікації | pos routes | Потенційна вразливість |
| 10 | Немає валідації на клієнті | forms | Зайві запити до сервера |
| 11 | Немає обмеження розміру файлу | import-modal.tsx | DoS через великі файли |
| 12 | Немає пагінації для квітів | products-section.tsx | Проблеми з великим каталогом |

### 6.4 Детальний аналіз критичних проблем

#### Проблема #1: Відсутність транзакцій БД

```typescript
// ПОТОЧНИЙ КОД (небезпечний)
try {
  // Операція 1: декремент stock
  await strapi.db.query('api::variant.variant').update({...});

  // Операція 2: створення транзакції
  // Якщо тут помилка - stock вже зменшено!
  await strapi.db.query('api::transaction.transaction').create({...});

  // Операція 3: оновлення клієнта
  await strapi.db.query('api::customer.customer').update({...});
} catch (error) {
  // Немає rollback!
  return { success: false };
}
```

**Рекомендований підхід:**

```typescript
// З Knex транзакціями
const knex = strapi.db.connection;
await knex.transaction(async (trx) => {
  await trx('variants').where('document_id', variantId).decrement('stock', qty);
  await trx('transactions').insert({...});
  await trx('customers').where('document_id', customerId).update({...});
});
```

#### Проблема #2: Race condition

```typescript
// Сценарій race condition:
// Час T0: Клієнт A перевіряє stock = 10
// Час T1: Клієнт B перевіряє stock = 10
// Час T2: Клієнт A купує 8 шт → stock = 2
// Час T3: Клієнт B купує 8 шт → stock = -6 (ПОМИЛКА!)
```

**Рекомендований підхід:**

```typescript
// Оптимістичне блокування
const result = await strapi.db.query('api::variant.variant').updateMany({
  where: {
    documentId: variant.documentId,
    stock: { $gte: qty }, // Додаткова перевірка
  },
  data: { stock: strapi.db.connection.raw('stock - ?', [qty]) },
});

if (result.count === 0) {
  throw new Error('Insufficient stock or concurrent modification');
}
```

---

## 7. Обробка помилок

### 7.1 Frontend

**AdminClient:**
```typescript
// Використовує useAlerts hook
const { showSuccess, showError, dismiss } = useAlerts();

// Обробка помилок API
const handleCheckout = async () => {
  try {
    const result = await createSale({...});
    if (result.success) {
      showSuccess(result.alert?.title, result.alert?.message);
    } else {
      showError(
        result.alert?.title || "Помилка",
        result.alert?.message || result.error?.message,
        result.error?.details // Деталі помилок stock
      );
    }
  } catch (error) {
    console.error("Checkout error:", error);
    showError("Помилка", "Сталася помилка при оформленні");
  }
};
```

**useActivityLog:**
```typescript
// Optimistic update з rollback
const logActivity = useCallback(async (type, details) => {
  const newActivity = { id: generateOperationId(), type, timestamp: new Date().toISOString(), details };

  // Optimistic
  setActivities((prev) => [newActivity, ...prev]);

  try {
    const result = await addShiftActivity({ activity: newActivity });
    if (result.success) {
      setActivities(result.data.activities);
    }
  } catch (error) {
    // Rollback
    setActivities((prev) => prev.filter((a) => a.id !== newActivity.id));
  }
}, []);
```

### 7.2 Backend

**POS Controller:**
```typescript
async createSale(ctx: Context) {
  try {
    // Валідація
    if (!body.operationId) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: { code: 'MISSING_OPERATION_ID', message: 'operationId is required' },
      };
      return;
    }

    // Виклик сервісу
    const result = await posService.createSale(body);

    if (result.success) {
      ctx.status = result.idempotent ? 200 : 201;
      ctx.body = {
        success: true,
        idempotent: result.idempotent,
        data: result.data,
        alert: {
          type: 'success',
          title: result.idempotent ? 'Замовлення вже існує' : 'Замовлення створено',
          message: '...',
        },
      };
    } else {
      ctx.status = result.error?.code === 'INSUFFICIENT_STOCK' ? 409 : 400;
      ctx.body = {
        success: false,
        error: result.error,
        alert: { type: 'error', title: 'Помилка', message: result.error?.message },
      };
    }
  } catch (error) {
    strapi.log.error('POS createSale error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An error occurred' },
    };
  }
}
```

### 7.3 Коди помилок

| Код | HTTP | Опис | Дія користувача |
|-----|------|------|-----------------|
| MISSING_OPERATION_ID | 400 | Немає ID операції | Повторити запит |
| MISSING_CUSTOMER_ID | 400 | Не вибрано клієнта | Вибрати клієнта |
| MISSING_ITEMS | 400 | Порожній кошик | Додати товари |
| CUSTOMER_NOT_FOUND | 400 | Клієнт не існує | Перезавантажити сторінку |
| VARIANT_NOT_FOUND | 400 | Варіант не знайдено | Оновити каталог |
| INSUFFICIENT_STOCK | 409 | Недостатньо на складі | Зменшити кількість |
| INTERNAL_ERROR | 500 | Внутрішня помилка | Повідомити адміна |
| NETWORK_ERROR | - | Немає з'єднання | Перевірити інтернет |

---

## 8. Безпека

### 8.1 Аутентифікація

**Поточна реалізація:**
```typescript
// frontend/lib/auth.ts
export function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('admin_token')
    : null;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
```

**Перевірка в layout:**
```typescript
// app/admin/layout.tsx
export default async function AdminLayout({ children }) {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}
```

### 8.2 Проблеми безпеки

| Рівень | Проблема | Рекомендація |
|--------|----------|--------------|
| 🔴 Критичний | POS ендпоінти без auth | Додати middleware авторизації |
| 🟠 Високий | Токен в localStorage | Використовувати httpOnly cookies |
| 🟠 Високий | Немає rate limiting | Впровадити Strapi rate limiter |
| 🟡 Середній | Немає валідації CSRF | Додати CSRF токени |
| 🟡 Середній | Логування sensitive даних | Фільтрувати логи |

### 8.3 Рекомендації

```typescript
// backend/src/api/pos/routes/pos.ts - ПОТОЧНИЙ
export default {
  routes: [
    { method: 'POST', path: '/pos/sales', handler: 'pos.createSale' },
    // Немає middleware!
  ],
};

// РЕКОМЕНДОВАНИЙ
export default {
  routes: [
    {
      method: 'POST',
      path: '/pos/sales',
      handler: 'pos.createSale',
      config: {
        policies: ['is-authenticated'], // Додати політику
      },
    },
  ],
};
```

---

## 9. План покращень

### Фаза 1: Критичні виправлення (Негайно)

#### 1.1 Впровадження транзакцій БД

**Пріоритет:** 🔴 КРИТИЧНИЙ
**Файли:** `backend/src/api/pos/services/pos.ts`
**Оцінка:** 4-6 годин

```typescript
// Використання Knex транзакцій
import { Knex } from 'knex';

async createSale(data: CreateSaleInput) {
  const knex = strapi.db.connection as Knex;

  return knex.transaction(async (trx) => {
    // Всі операції в одній транзакції
    for (const item of data.items) {
      const updated = await trx('variants')
        .where('document_id', variant.documentId)
        .andWhere('stock', '>=', item.qty)
        .decrement('stock', item.qty);

      if (updated === 0) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
    }

    const [transaction] = await trx('transactions').insert({...}).returning('*');
    return transaction;
  });
}
```

#### 1.2 Захист POS ендпоінтів

**Пріоритет:** 🔴 КРИТИЧНИЙ
**Файли:** `backend/src/api/pos/routes/pos.ts`
**Оцінка:** 1-2 години

```typescript
// Додати middleware
export default {
  routes: [
    {
      method: 'POST',
      path: '/pos/sales',
      handler: 'pos.createSale',
      config: {
        middlewares: ['api::pos.rate-limit'],
        policies: ['global::is-authenticated'],
      },
    },
  ],
};
```

#### 1.3 Race condition захист

**Пріоритет:** 🔴 КРИТИЧНИЙ
**Файли:** `backend/src/api/pos/services/pos.ts`
**Оцінка:** 2-3 години

```typescript
// Атомарний декремент з перевіркою
const result = await knex.raw(`
  UPDATE variants
  SET stock = stock - ?
  WHERE document_id = ? AND stock >= ?
  RETURNING stock
`, [qty, documentId, qty]);

if (result.rows.length === 0) {
  throw new Error('Stock depleted or concurrent modification');
}
```

### Фаза 2: Важливі покращення (1-2 тижні)

#### 2.1 Клієнтська валідація stock

**Файл:** `frontend/components/sections/pos-section.tsx`

```typescript
const addToCart = (product: Product, variant: Variant) => {
  // Перевірка перед додаванням
  const currentInCart = cart.find(l => l.id === `${product.id}-${variant.length}`)?.qty || 0;
  const newQty = currentInCart + 25;

  if (newQty > variant.stock) {
    showWarning(`Недостатньо на складі. Доступно: ${variant.stock}`);
    return;
  }

  // ... додавання до кошика
};
```

#### 2.2 Оптимізація завантаження клієнтів

**Файл:** `frontend/components/sections/clients-section.tsx`

```typescript
// Замість паралельних запитів - batch endpoint
const loadClientsWithStats = async () => {
  // Один запит замість N
  const result = await fetch(`${API_URL}/customers/with-stats`);
  // Backend агрегує дані
};
```

#### 2.3 Retry логіка

**Файл:** `frontend/lib/strapi.ts`

```typescript
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response.json();
      if (response.status >= 500) throw new Error('Server error');
      return response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

### Фаза 3: Покращення UX (2-4 тижні)

#### 3.1 Offline mode для POS

```typescript
// Service Worker + IndexedDB
const offlineCart = new OfflineQueue('pos-sales');

const handleCheckout = async () => {
  if (!navigator.onLine) {
    await offlineCart.add(saleData);
    showInfo('Збережено офлайн. Синхронізація при підключенні.');
    return;
  }
  // ... нормальний checkout
};

// Синхронізація при відновленні зв'язку
window.addEventListener('online', async () => {
  const pending = await offlineCart.getAll();
  for (const sale of pending) {
    await createSale(sale);
    await offlineCart.remove(sale.id);
  }
});
```

#### 3.2 Real-time оновлення stock

```typescript
// WebSocket або Server-Sent Events
const stockUpdates = new EventSource('/api/stock/updates');

stockUpdates.onmessage = (event) => {
  const { variantId, newStock } = JSON.parse(event.data);
  setProducts(prev => prev.map(p => ({
    ...p,
    variants: p.variants.map(v =>
      v.documentId === variantId ? { ...v, stock: newStock } : v
    ),
  })));
};
```

#### 3.3 Пагінація та віртуалізація

```typescript
// Для великих каталогів
import { useVirtualizer } from '@tanstack/react-virtual';

const ProductList = ({ products }) => {
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      {virtualizer.getVirtualItems().map(item => (
        <ProductCard key={item.key} product={products[item.index]} />
      ))}
    </div>
  );
};
```

### Фаза 4: Розширення функціональності

#### 4.1 Аудит лог

```typescript
// Повний трекінг всіх змін
interface AuditLog {
  id: string;
  userId: string;
  action: 'create' | 'update' | 'delete';
  entity: 'flower' | 'variant' | 'customer' | 'transaction';
  entityId: string;
  changes: Record<string, { old: unknown; new: unknown }>;
  timestamp: string;
  ipAddress: string;
}
```

#### 4.2 Звіти та експорт

- Щоденні/тижневі звіти продажів
- Аналіз по категоріях
- Прогнозування stock
- Експорт в PDF/Excel

#### 4.3 Інтеграції

- SMS/Email нотифікації клієнтам
- Інтеграція з бухгалтерськими системами
- Синхронізація з постачальниками

---

## Підсумок

### Що працює добре ✅

1. **Ідемпотентність** - operationId запобігає дублікатам
2. **Структура коду** - чіткий поділ на компоненти/хуки/сервіси
3. **TypeScript** - сильна типізація
4. **UI/UX** - responsive, адаптивний дизайн
5. **Activity logging** - повна історія дій
6. **Multi-device sync** - polling для синхронізації

### Що потребує уваги ⚠️

1. **Транзакції БД** - відсутні, ризик часткових змін
2. **Race conditions** - можливий oversell
3. **Безпека POS** - публічні ендпоінти
4. **Валідація на клієнті** - недостатня
5. **Error recovery** - немає retry логіки

### Рекомендований порядок дій

1. 🔴 **Негайно:** Транзакції БД + POS auth
2. 🟠 **Тиждень 1:** Race condition захист + валідація
3. 🟡 **Тиждень 2-3:** Оптимізація + retry логіка
4. 🟢 **Тиждень 4+:** UX покращення + розширення

---

*Документ створено: 2025-12-23*
*Автор: Claude Code Analysis*
