# Premium Flora - Архітектура Проекту

## Огляд

Premium Flora - це система управління квітковим магазином з:
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Strapi v5 (Headless CMS) + PostgreSQL
- **API**: GraphQL (стандартні колекції) + REST (кастомні ендпоінти)

---

## Структура Frontend

```
frontend/
├── app/                    # Next.js App Router
│   ├── admin/              # Адмін панель
│   │   ├── admin-client.tsx   # Головний клієнтський компонент
│   │   ├── page.tsx           # Серверна обгортка
│   │   └── login/             # Сторінка входу
│   ├── catalog/            # Публічний каталог
│   │   └── [id]/              # Сторінка товару
│   ├── blog/               # Блог
│   └── page.tsx            # Головна сторінка
│
├── components/
│   ├── sections/           # Секції адмін панелі
│   │   ├── products-section.tsx   # Управління товарами
│   │   ├── pos-section.tsx        # POS термінал
│   │   ├── history-section.tsx    # Історія змін
│   │   ├── clients-section.tsx    # Клієнти
│   │   ├── analytics-section.tsx  # Аналітика
│   │   ├── todo-section.tsx       # Завдання
│   │   └── articles-section.tsx   # Статті
│   ├── ui/                 # Базові UI компоненти
│   │   ├── button.tsx
│   │   ├── modal.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── client/             # Компоненти публічного сайту
│   └── layout/             # Layout компоненти (sidebar, header)
│
├── hooks/                  # React хуки
│   ├── use-modal.ts           # Управління модалками
│   ├── use-flowers.ts         # Кешування квітів
│   ├── use-customers.ts       # Кешування клієнтів
│   ├── use-activity-log.ts    # Логування активності
│   ├── use-alerts.ts          # Сповіщення
│   └── index.ts               # Експорт
│
├── lib/
│   ├── api/                # API модулі (розбито з strapi.ts)
│   │   ├── client.ts          # Базові утиліти (fetch, retry)
│   │   ├── converters.ts      # Конвертери даних
│   │   ├── flowers.ts         # API квітів
│   │   ├── customers.ts       # API клієнтів
│   │   ├── transactions.ts    # API транзакцій
│   │   ├── pos.ts             # API POS (продажі, списання)
│   │   ├── analytics.ts       # API аналітики
│   │   ├── shifts.ts          # API змін
│   │   ├── articles.ts        # API статей
│   │   ├── tasks.ts           # API завдань
│   │   ├── import.ts          # API імпорту Excel
│   │   ├── supply.ts          # API поставок
│   │   └── index.ts           # Експорт
│   │
│   ├── types/              # TypeScript типи (консолідовано)
│   │   ├── entities.ts        # Бізнес-сутності (Flower, Customer, Transaction)
│   │   ├── api.ts             # API типи (request/response)
│   │   ├── ui.ts              # UI типи (CartLine, NavItem)
│   │   ├── strapi.ts          # Strapi-специфічні типи
│   │   ├── import.ts          # Типи імпорту
│   │   ├── supply.ts          # Типи поставок
│   │   └── index.ts           # Експорт
│   │
│   ├── utils/              # Утиліти
│   │   ├── date.ts            # Форматування дат
│   │   ├── currency.ts        # Форматування валюти
│   │   ├── stock.ts           # Рівні запасів
│   │   └── index.ts           # Експорт + cn()
│   │
│   ├── graphql/            # GraphQL
│   │   ├── client.ts          # GraphQL клієнт
│   │   ├── queries.ts         # Запити
│   │   ├── mutations.ts       # Мутації
│   │   └── types.ts           # GraphQL типи
│   │
│   ├── strapi.ts           # Re-export з api/ (backward compatibility)
│   ├── types.ts            # Re-export з types/ (backward compatibility)
│   ├── api-types.ts        # Re-export з types/ (backward compatibility)
│   ├── auth.ts             # Аутентифікація
│   └── export.ts           # Експорт даних
│
└── public/                 # Статичні файли
```

---

## Структура Backend (Strapi)

```
backend/
├── config/                 # Конфігурація Strapi
│   ├── database.ts            # БД (PostgreSQL/SQLite)
│   ├── middlewares.ts         # CORS, rate-limit
│   ├── plugins.ts             # Email, upload
│   └── server.ts              # Порт, хост
│
├── src/
│   ├── api/                # API модулі
│   │   ├── analytics/         # /api/analytics (REST)
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   ├── pos/               # /api/pos (REST)
│   │   ├── shift/             # /api/shifts (REST)
│   │   ├── import/            # /api/imports (REST)
│   │   ├── planned-supply/    # /api/planned-supply (REST)
│   │   ├── flower/            # Колекція (GraphQL + REST)
│   │   ├── variant/           # Колекція
│   │   ├── customer/          # Колекція
│   │   ├── transaction/       # Колекція
│   │   ├── supply/            # Колекція
│   │   ├── article/           # Колекція
│   │   └── task/              # Колекція
│   │
│   ├── services/           # Спільні сервіси
│   │   └── excel/             # Обробка Excel
│   │       ├── parser.service.ts
│   │       ├── normalizer.service.ts
│   │       ├── validator.service.ts
│   │       ├── upserter.service.ts
│   │       └── types.ts
│   │
│   └── bootstrap.ts        # Ініціалізація
│
└── types/                  # Автогенеровані типи
```

---

## Ключові Патерни

### 1. API Модулі

**GraphQL** для стандартних колекцій:
```typescript
import { getFlowers, getCustomers } from '@/lib/api';
// або
import { getFlowers } from '@/lib/strapi'; // backward compatibility
```

**REST** для кастомної логіки:
```typescript
import { createSale, getDashboardAnalytics } from '@/lib/api';
```

### 2. Типи

Всі типи консолідовані в `lib/types/`:
```typescript
import type { Flower, Customer, Transaction } from '@/lib/types';
import type { CreateSaleInput, ApiResponse } from '@/lib/types';
```

### 3. Утиліти

```typescript
import { formatDateTime, formatPrice, stockTone } from '@/lib/utils';
```

### 4. Хуки

```typescript
import { useModal, useFlowers, useActivityLog } from '@/hooks';

// useModal - управління модалками
const editModal = useModal<Product>();
editModal.open(product);
editModal.close();

// useFlowers - кешування даних
const { flowers, refresh, isLoading } = useFlowers();
```

---

## Потік Даних

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  GraphQL/    │────▶│   Strapi    │
│  (Next.js)  │     │    REST      │     │  (Backend)  │
└─────────────┘     └──────────────┘     └─────────────┘
       │                                        │
       │                                        ▼
       │                                 ┌─────────────┐
       └────────────────────────────────▶│ PostgreSQL  │
                                         └─────────────┘
```

---

## Конвенції

### Іменування Файлів
- Компоненти: `kebab-case.tsx` (напр. `products-section.tsx`)
- Хуки: `use-*.ts` (напр. `use-modal.ts`)
- Типи: `*.ts` в `types/` директорії
- API: `*.ts` в `api/` директорії

### Іменування Змінних
- Компоненти: `PascalCase` (напр. `ProductsSection`)
- Функції: `camelCase` (напр. `getFlowers`)
- Типи: `PascalCase` (напр. `Customer`)
- Константи: `SCREAMING_SNAKE_CASE` (напр. `STOCK_THRESHOLDS`)

### Backward Compatibility
Оригінальні файли (`strapi.ts`, `types.ts`, `api-types.ts`) зберігаються як реекспорти для сумісності з існуючим кодом.

---

## Важливі Файли

| Файл | Опис |
|------|------|
| `lib/api/index.ts` | Експорт всіх API функцій |
| `lib/types/index.ts` | Експорт всіх типів |
| `lib/utils/index.ts` | Експорт утиліт + `cn()` |
| `hooks/index.ts` | Експорт хуків |
| `app/admin/admin-client.tsx` | Головний компонент адмін панелі |
| `backend/src/bootstrap.ts` | Ініціалізація backend |
