# Premium Flora - Frontend

## Технології

- **Next.js 15** - React фреймворк з App Router
- **React 19** - UI бібліотека
- **TypeScript** - Типізація
- **Tailwind CSS** - Стилізація
- **shadcn/ui** - UI компоненти
- **Lucide React** - Іконки

---

## Швидкий Старт

```bash
cd frontend
npm install
npm run dev
```

Відкрити http://localhost:3000

---

## Структура Проекту

### `/app` - Сторінки (App Router)

```
app/
├── page.tsx              # Головна (/)
├── layout.tsx            # Root layout
├── globals.css           # Глобальні стилі
├── admin/
│   ├── page.tsx          # Адмін панель (/admin)
│   ├── admin-client.tsx  # Client component
│   ├── layout.tsx        # Admin layout
│   └── login/page.tsx    # Логін (/admin/login)
├── catalog/
│   ├── page.tsx          # Каталог (/catalog)
│   └── [id]/page.tsx     # Товар (/catalog/[id])
└── blog/
    └── page.tsx          # Блог (/blog)
```

### `/components` - Компоненти

```
components/
├── sections/           # Секції адмін панелі
│   ├── products-section.tsx    # Товари (2000+ рядків)
│   ├── pos-section.tsx         # POS термінал
│   ├── history-section.tsx     # Історія
│   ├── clients-section.tsx     # Клієнти
│   ├── analytics-section.tsx   # Аналітика
│   ├── todo-section.tsx        # Завдання
│   └── articles-section.tsx    # Статті
│
├── ui/                 # Базові UI компоненти (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── modal.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── table.tsx
│   └── ...
│
├── client/             # Публічний сайт
│   ├── hero-section.tsx
│   ├── navigation.tsx
│   ├── footer.tsx
│   └── ...
│
└── layout/             # Layout
    ├── sidebar.tsx
    └── header.tsx
```

### `/lib` - Бібліотеки та Утиліти

```
lib/
├── api/                # API клієнти (модульна структура)
│   ├── client.ts          # fetchWithRetry, базові утиліти
│   ├── flowers.ts         # getFlowers, updateFlower
│   ├── customers.ts       # getCustomers, createCustomer
│   ├── pos.ts             # createSale, createWriteOff
│   ├── analytics.ts       # getDashboardAnalytics
│   ├── shifts.ts          # getCurrentShift, closeShift
│   └── index.ts           # Експорт всього
│
├── types/              # TypeScript типи
│   ├── entities.ts        # Flower, Customer, Transaction
│   ├── api.ts             # Request/Response типи
│   ├── ui.ts              # CartLine, NavItem
│   └── index.ts           # Експорт всього
│
├── utils/              # Утиліти
│   ├── date.ts            # formatTime, formatDateTime
│   ├── currency.ts        # formatPrice
│   ├── stock.ts           # stockTone, isLowStock
│   └── index.ts           # Експорт + cn()
│
├── graphql/            # GraphQL
│   ├── client.ts
│   ├── queries.ts
│   ├── mutations.ts
│   └── types.ts
│
└── strapi.ts           # Re-export (backward compatibility)
```

### `/hooks` - React Хуки

```
hooks/
├── use-modal.ts           # Управління модалками
├── use-flowers.ts         # Кешування квітів
├── use-customers.ts       # Кешування клієнтів
├── use-activity-log.ts    # Логування активності
├── use-alerts.ts          # Сповіщення
├── use-scroll-animation.ts
├── use-intersection.ts
└── index.ts               # Експорт всього
```

---

## API Модулі

### Імпорт

```typescript
// Рекомендовано (модульний імпорт)
import { getFlowers, createSale } from '@/lib/api';

// Backward compatibility
import { getFlowers, createSale } from '@/lib/strapi';
```

### Приклади Використання

```typescript
// Отримати квіти
const flowers = await getFlowers();

// Створити продаж
const result = await createSale({
  operationId: uuid(),
  customerId: selectedClient,
  items: cart.map(item => ({
    flowerSlug: item.flowerSlug,
    length: item.length,
    qty: item.qty,
    price: item.price,
    name: item.name,
  })),
  paymentStatus: 'expected',
});

if (result.success) {
  // Успіх
} else {
  // Помилка: result.error
}
```

---

## Типи

### Імпорт

```typescript
import type { Flower, Customer, Transaction } from '@/lib/types';
import type { CreateSaleInput, ApiResponse } from '@/lib/types';
```

### Основні Типи

```typescript
interface Flower {
  id: number;
  documentId: string;
  slug: string;
  name: string;
  image: string | null;
  variants: Variant[];
}

interface Variant {
  length: number;
  price: number;
  stock: number;
  size: string;  // "50 см"
}

interface Customer {
  id: number;
  documentId: string;
  name: string;
  type: 'VIP' | 'Regular' | 'Wholesale';
  totalSpent: number;
  orderCount: number;
}

interface Transaction {
  id: number;
  documentId: string;
  type: 'sale' | 'writeOff';
  amount: number;
  items: TransactionItem[];
  paymentStatus: 'pending' | 'paid' | 'expected';
}
```

---

## Утиліти

### Форматування Дат

```typescript
import { formatTime, formatDateTime, formatDuration } from '@/lib/utils';

formatTime('2024-01-15T10:30:00Z');      // "10:30"
formatDateTime('2024-01-15T10:30:00Z');  // "15.01.2024, 10:30"
formatDuration('2024-01-15T08:00:00Z');  // "2 год 30 хв"
```

### Форматування Валюти

```typescript
import { formatPrice, formatPriceShort } from '@/lib/utils';

formatPrice(1234);       // "1 234 грн"
formatPriceShort(1500000); // "1.5M грн"
```

### Рівні Запасів

```typescript
import { stockTone, isLowStock, STOCK_THRESHOLDS } from '@/lib/utils';

stockTone(50);  // "text-amber-600 bg-amber-50..."
isLowStock(30); // true (< 50)

STOCK_THRESHOLDS.LOW;      // 50
STOCK_THRESHOLDS.CRITICAL; // 10
```

---

## Хуки

### useModal

```typescript
import { useModal } from '@/hooks';

const editModal = useModal<Product>();

// Відкрити з даними
editModal.open(selectedProduct);

// Закрити
editModal.close();

// В JSX
<Modal open={editModal.isOpen} onClose={editModal.close}>
  {editModal.data && (
    <EditForm product={editModal.data} />
  )}
</Modal>
```

### useFlowers

```typescript
import { useFlowers } from '@/hooks';

const { flowers, refresh, isLoading, error } = useFlowers();

// Примусово оновити
await refresh();
```

### useActivityLog

```typescript
import { useActivityLog } from '@/hooks';

const { logActivity, activities, summary } = useActivityLog();

// Залогувати продаж
logActivity('sale', {
  customerName: 'Іван Петренко',
  items: [...],
  totalAmount: 1500,
});
```

---

## Темна Тема

Підтримується через Tailwind `dark:` модифікатори:

```tsx
<div className="bg-white dark:bg-admin-surface">
  <p className="text-slate-900 dark:text-admin-text-primary">
    Текст
  </p>
</div>
```

Кольори темної теми визначені в `tailwind.config.ts`:
- `admin-bg` - Фон
- `admin-surface` - Поверхні
- `admin-border` - Границі
- `admin-text-primary` - Основний текст
- `admin-text-secondary` - Вторинний текст

---

## Рекомендації

### DO

- Використовуйте типи з `@/lib/types`
- Використовуйте API функції з `@/lib/api`
- Використовуйте утиліти з `@/lib/utils`
- Використовуйте хуки для стану UI

### DON'T

- Не дублюйте типи
- Не створюйте прямі fetch запити (використовуйте api/)
- Не хардкодьте кольори (використовуйте Tailwind)
- Не ігноруйте TypeScript помилки
