# GraphQL API Documentation

## Огляд архітектури

Проект використовує **GraphQL** для стандартних CRUD операцій з колекціями Strapi та **REST API** для кастомних ендпоінтів.

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
├─────────────────────────────────────────────────────────────┤
│  lib/strapi.ts          │  Головний API модуль (експортує   │
│                         │  всі функції для використання)    │
├─────────────────────────────────────────────────────────────┤
│  lib/graphql/           │  GraphQL інфраструктура           │
│  ├── client.ts          │  - GraphQL клієнт                 │
│  ├── queries.ts         │  - Query запити                   │
│  ├── mutations.ts       │  - Mutation запити                │
│  └── types.ts           │  - TypeScript типи                │
├─────────────────────────────────────────────────────────────┤
│  hooks/                 │  React хуки (опціонально)         │
│  ├── use-flowers.ts     │  - Хуки для квітів                │
│  ├── use-customers.ts   │  - Хуки для клієнтів              │
│  └── use-transactions.ts│  - Хуки для транзакцій            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Strapi Backend                            │
├──────────────────────────┬──────────────────────────────────┤
│  /graphql                │  /api/*                          │
│  (GraphQL Playground)    │  (REST endpoints)                │
├──────────────────────────┼──────────────────────────────────┤
│  • flowers               │  • /api/pos/sales                │
│  • variants              │  • /api/pos/write-offs           │
│  • customers             │  • /api/analytics/dashboard      │
│  • transactions          │  • /api/planned-supply/*         │
│                          │  • /api/imports/excel            │
└──────────────────────────┴──────────────────────────────────┘
```

---

## Конфігурація

### Environment змінні

```env
# Frontend (.env.local)
NEXT_PUBLIC_STRAPI_URL=https://premiumflora-production.up.railway.app
NEXT_PUBLIC_STRAPI_TOKEN=your-api-token  # опціонально, для fallback авторизації
```

### GraphQL Endpoint

- **Production:** `https://premiumflora-production.up.railway.app/graphql`
- **Development:** `http://localhost:1337/graphql`
- **Playground:** доступний на тому ж URL (тільки в dev режимі)

---

## Strapi v5 GraphQL - Важливі особливості

### 1. Використовуй `documentId` замість `id`

```graphql
# ✅ Правильно
query GetFlower($documentId: ID!) {
  flower(documentId: $documentId) {
    documentId
    name
    slug
  }
}

# ❌ Неправильно - НЕ використовуй id
query GetFlower($id: ID!) {
  flower(id: $id) {  # ПОМИЛКА!
    id              # ПОМИЛКА!
    name
  }
}
```

### 2. Немає обгортки `data` у відповідях

```graphql
# Strapi v5 GraphQL повертає дані напряму:
{
  "flowers": [
    { "documentId": "abc123", "name": "Троянда" }
  ]
}

# НЕ так як в REST:
{
  "data": [
    { "id": 1, "attributes": { "name": "Троянда" } }
  ]
}
```

### 3. Фільтрація через `slug` або `documentId`

```graphql
# Пошук за slug
query GetFlowerBySlug($slug: String!) {
  flowers(filters: { slug: { eq: $slug } }) {
    documentId
    name
  }
}

# Отримання за documentId
query GetFlower($documentId: ID!) {
  flower(documentId: $documentId) {
    documentId
    name
  }
}
```

---

## Структура файлів

### `lib/graphql/client.ts`

GraphQL клієнт з підтримкою авторизації:

```typescript
import { graphqlRequest } from "@/lib/graphql/client";

// Публічний запит (без авторизації)
const data = await graphqlRequest<FlowersResponse>(GET_FLOWERS, { pageSize: 100 });

// Захищений запит (з авторизацією)
const data = await graphqlRequest<FlowerResponse>(
  GET_FLOWER_BY_DOCUMENT_ID,
  { documentId: "abc123" },
  true  // requireAuth = true
);
```

### `lib/graphql/queries.ts`

Всі GraphQL запити:

| Query | Опис | Змінні |
|-------|------|--------|
| `GET_FLOWERS` | Всі опубліковані квіти | `pageSize`, `status` |
| `GET_FLOWER_BY_SLUG` | Квітка за slug | `slug` |
| `GET_FLOWER_BY_DOCUMENT_ID` | Квітка за documentId | `documentId` |
| `SEARCH_FLOWERS` | Пошук квітів | `query`, `pageSize` |
| `GET_CUSTOMERS` | Всі клієнти | `pageSize` |
| `GET_CUSTOMER_BY_ID` | Клієнт за documentId | `documentId` |
| `GET_TRANSACTIONS` | Транзакції з фільтрами | `type`, `paymentStatus`, `customerId`, `dateFrom`, `dateTo` |
| `GET_VARIANT_BY_ID` | Варіант за documentId | `documentId` |

### `lib/graphql/mutations.ts`

Всі GraphQL мутації:

| Mutation | Опис | Змінні |
|----------|------|--------|
| `UPDATE_FLOWER` | Оновити квітку | `documentId`, `data` |
| `UPDATE_VARIANT` | Оновити варіант | `documentId`, `data` |
| `CREATE_CUSTOMER` | Створити клієнта | `data` |
| `UPDATE_CUSTOMER` | Оновити клієнта | `documentId`, `data` |
| `DELETE_CUSTOMER` | Видалити клієнта | `documentId` |

---

## Приклади використання

### 1. Отримати всі квіти

```typescript
import { getFlowers } from "@/lib/strapi";

// В Server Component
const flowers = await getFlowers();

// З примусовим оновленням (без кешу)
const flowers = await getFlowers({ fresh: true });
```

### 2. Отримати квітку за slug

```typescript
import { getFlowerBySlug } from "@/lib/strapi";

const flower = await getFlowerBySlug("rosa-red");
```

### 3. Оновити варіант

```typescript
import { updateVariant } from "@/lib/strapi";

const result = await updateVariant("variant-document-id", {
  price: 150,
  stock: 50,
});

if (result.success) {
  console.log("Оновлено!");
} else {
  console.error(result.error?.message);
}
```

### 4. Використання React хуків (Client Components)

```typescript
"use client";
import { useFlowers } from "@/hooks/use-flowers";

function FlowerList() {
  const { flowers, loading, error, refetch } = useFlowers();

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error.message}</div>;

  return (
    <ul>
      {flowers.map(flower => (
        <li key={flower.documentId}>{flower.name}</li>
      ))}
    </ul>
  );
}
```

---

## REST API (кастомні ендпоінти)

Ці функції використовують REST, оскільки це кастомні контролери Strapi:

### POS Operations

```typescript
import { createSale, createWriteOff, confirmPayment } from "@/lib/strapi";

// Створити продаж
const sale = await createSale({
  operationId: "unique-id",
  customerId: "customer-doc-id",
  items: [{ flowerSlug: "rosa", length: 50, qty: 10, price: 100, name: "Троянда" }],
  paymentStatus: "paid",
});

// Створити списання
const writeOff = await createWriteOff({
  operationId: "unique-id",
  flowerSlug: "rosa",
  length: 50,
  qty: 5,
  reason: "damage",
});

// Підтвердити оплату
const confirmed = await confirmPayment("transaction-doc-id");
```

### Analytics

```typescript
import { getDashboardAnalytics, getStockLevels } from "@/lib/strapi";

const dashboard = await getDashboardAnalytics();
const stock = await getStockLevels();
```

### Planned Supply

```typescript
import { getLowStockVariants, searchFlowersForSupply, getAllFlowersForSupply } from "@/lib/strapi";

const lowStock = await getLowStockVariants(100); // threshold = 100
const searchResults = await searchFlowersForSupply("роза");
const allFlowers = await getAllFlowersForSupply();
```

### Excel Import

```typescript
import { importExcel } from "@/lib/strapi";

const result = await importExcel(file, {
  dryRun: false,
  stockMode: "add",
  priceMode: "update",
});
```

---

## Авторизація

### Як працює авторизація

1. **JWT токен** зберігається в `localStorage` під ключем `auth_token`
2. При захищених запитах токен додається в заголовок `Authorization: Bearer <token>`
3. Якщо JWT немає, використовується `NEXT_PUBLIC_STRAPI_TOKEN` як fallback

### Захищені vs Публічні запити

```typescript
// Публічний запит (getFlowers, getFlowerBySlug, etc.)
await graphqlRequest(GET_FLOWERS, variables);

// Захищений запит (updateFlower, deleteCustomer, etc.)
await graphqlRequest(UPDATE_FLOWER, variables, true); // requireAuth = true
```

---

## Типи даних

### Product (квітка для frontend)

```typescript
interface Product {
  id: string;           // slug квітки
  documentId: string;   // Strapi documentId
  slug: string;
  name: string;
  image: string;        // повний URL зображення
  variants: Variant[];
}

interface Variant {
  size: string;    // "50 см"
  price: number;
  stock: number;
  length: number;  // 50
}
```

### Customer

```typescript
interface Customer {
  id: number;
  documentId: string;
  name: string;
  type: "VIP" | "Regular" | "Wholesale";
  phone?: string;
  email?: string;
  address?: string;
  totalSpent: number;
  orderCount: number;
}
```

### Transaction

```typescript
interface Transaction {
  documentId: string;
  date: string;
  type: "sale" | "writeOff";
  paymentStatus: "pending" | "paid" | "expected" | "cancelled";
  amount: number;
  items: TransactionItem[];
  customer?: Customer;
}
```

---

## Debugging

### GraphQL Playground

Відкрий `http://localhost:1337/graphql` для тестування запитів вручну.

### Приклад запиту в Playground

```graphql
query {
  flowers(pagination: { pageSize: 10 }) {
    documentId
    name
    slug
    variants {
      documentId
      length
      price
      stock
    }
  }
}
```

### Логування

В development режимі всі помилки логуються в консоль:

```typescript
console.error("Error fetching flowers:", error);
```

---

## Міграція з REST на GraphQL

Якщо потрібно додати нову функцію:

1. **Додай query/mutation** в `lib/graphql/queries.ts` або `mutations.ts`
2. **Додай типи** в `lib/graphql/types.ts`
3. **Додай функцію** в `lib/strapi.ts`
4. **(Опціонально)** Додай хук в `hooks/`

### Приклад додавання нової функції

```typescript
// 1. queries.ts
export const GET_NEW_DATA = gql`
  query GetNewData($id: ID!) {
    newCollection(documentId: $id) {
      documentId
      field1
      field2
    }
  }
`;

// 2. types.ts
export interface NewDataResponse {
  newCollection: {
    documentId: string;
    field1: string;
    field2: number;
  } | null;
}

// 3. strapi.ts
export async function getNewData(documentId: string) {
  const data = await graphqlRequest<NewDataResponse>(GET_NEW_DATA, { id: documentId });
  return data.newCollection;
}
```
