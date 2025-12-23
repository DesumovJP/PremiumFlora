# Premium Flora - План покращень та виправлень

## Пріоритети

- 🔴 **КРИТИЧНИЙ** - Потенційна втрата даних/грошей, негайне виправлення
- 🟠 **ВИСОКИЙ** - Важливо для стабільності, виправити найближчим часом
- 🟡 **СЕРЕДНІЙ** - Покращення якості, запланувати
- 🟢 **НИЗЬКИЙ** - Nice to have, при наявності часу

---

## Фаза 1: Критичні виправлення

### 1.1 🔴 Впровадження транзакцій БД для POS операцій

**Проблема:** Операції продажу/списання не атомарні. Якщо помилка відбувається після декременту stock, але до створення транзакції - stock втрачено без запису.

**Файл:** `backend/src/api/pos/services/pos.ts`

**Завдання:**
- [ ] Додати Knex transaction wrapper для createSale
- [ ] Додати Knex transaction wrapper для createWriteOff
- [ ] Додати rollback логіку при помилках
- [ ] Тестування сценаріїв помилок

**Код для впровадження:**
```typescript
// services/pos.ts
async createSale(data: CreateSaleInput) {
  const knex = strapi.db.connection;

  try {
    return await knex.transaction(async (trx) => {
      // Перевірка ідемпотентності
      const [existing] = await trx('transactions')
        .where('operation_id', data.operationId)
        .limit(1);

      if (existing) {
        return { success: true, idempotent: true, data: existing };
      }

      // Атомарний декремент з перевіркою
      for (const item of data.items) {
        const updated = await trx('variants')
          .where('document_id', variantDocumentId)
          .andWhere('stock', '>=', item.qty)
          .decrement('stock', item.qty);

        if (updated === 0) {
          throw new Error(`INSUFFICIENT_STOCK:${item.name}`);
        }
      }

      // Створення транзакції
      const [transaction] = await trx('transactions')
        .insert({
          date: new Date(),
          type: 'sale',
          operation_id: data.operationId,
          payment_status: data.paymentStatus,
          amount,
          items: JSON.stringify(data.items),
          customer_id: customerId,
        })
        .returning('*');

      return { success: true, data: transaction };
    });
  } catch (error) {
    if (error.message.startsWith('INSUFFICIENT_STOCK:')) {
      return {
        success: false,
        error: { code: 'INSUFFICIENT_STOCK', message: error.message },
      };
    }
    throw error;
  }
}
```

---

### 1.2 🔴 Захист POS ендпоінтів

**Проблема:** POS ендпоінти (`/api/pos/sales`, `/api/pos/write-offs`) доступні без аутентифікації.

**Файли:**
- `backend/src/api/pos/routes/pos.ts`
- `backend/src/api/pos/middlewares/` (створити)

**Завдання:**
- [ ] Створити middleware для перевірки auth token
- [ ] Додати middleware до всіх POS routes
- [ ] Додати rate limiting
- [ ] Тестування доступу без токена

**Код:**
```typescript
// routes/pos.ts
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
    {
      method: 'POST',
      path: '/pos/write-offs',
      handler: 'pos.createWriteOff',
      config: {
        middlewares: ['api::pos.rate-limit'],
        policies: ['global::is-authenticated'],
      },
    },
  ],
};
```

---

### 1.3 🔴 Захист від Race Condition

**Проблема:** Два користувачі можуть одночасно купити товар, якого залишилось мало, перевищивши stock.

**Файл:** `backend/src/api/pos/services/pos.ts`

**Завдання:**
- [ ] Змінити логіку декременту на атомарну операцію з перевіркою
- [ ] Додати оптимістичне блокування
- [ ] Тестування паралельних запитів

**Код:**
```typescript
// Замість:
await strapi.db.query('api::variant.variant').update({
  where: { documentId: variant.documentId },
  data: { stock: variant.stock - item.qty },
});

// Використовувати:
const result = await knex.raw(`
  UPDATE variants
  SET stock = stock - ?
  WHERE document_id = ?
    AND stock >= ?
  RETURNING stock
`, [item.qty, variant.documentId, item.qty]);

if (result.rows.length === 0) {
  throw new Error('Stock depleted during checkout');
}
```

---

## Фаза 2: Високий пріоритет

### 2.1 🟠 Клієнтська валідація stock при додаванні до кошика

**Проблема:** Користувач може додати до кошика більше товару, ніж є на складі. Помилка показується тільки при checkout.

**Файл:** `frontend/components/sections/pos-section.tsx`

**Завдання:**
- [ ] Додати перевірку stock перед додаванням
- [ ] Показувати попередження при перевищенні
- [ ] Блокувати кнопку додавання якщо stock = 0
- [ ] Візуальна індикація недоступних варіантів

**Код:**
```typescript
const handleAdd = (product: Product, variant: Variant) => {
  const cartKey = `${product.id}-${variant.length}`;
  const existingQty = cart.find(l => l.id === cartKey)?.qty || 0;
  const newQty = existingQty + 25;

  if (newQty > variant.stock) {
    showWarning(
      'Недостатньо на складі',
      `Доступно: ${variant.stock} шт. В кошику: ${existingQty} шт.`
    );
    return;
  }

  // ... існуючий код додавання
};
```

---

### 2.2 🟠 Оптимізація завантаження статистики клієнтів

**Проблема:** При відкритті секції "Клієнти" робиться N паралельних запитів для N клієнтів. При 100+ клієнтах - проблеми з performance.

**Файли:**
- `frontend/components/sections/clients-section.tsx`
- `backend/src/api/customer/` (новий endpoint)

**Завдання:**
- [ ] Створити batch endpoint `/api/customers/with-stats`
- [ ] Агрегувати дані на сервері
- [ ] Замінити паралельні запити на один
- [ ] Кешування результатів

**Backend endpoint:**
```typescript
// controllers/customer.ts
async findWithStats(ctx) {
  const customers = await strapi.db.query('api::customer.customer').findMany();

  const stats = await strapi.db.connection.raw(`
    SELECT
      c.document_id,
      COUNT(t.id) as order_count,
      COALESCE(SUM(t.amount), 0) as total_spent,
      MAX(t.date) as last_order
    FROM customers c
    LEFT JOIN transactions t ON t.customer_id = c.id AND t.type = 'sale'
    GROUP BY c.document_id
  `);

  return customers.map(c => ({
    ...c,
    stats: stats.rows.find(s => s.document_id === c.documentId),
  }));
}
```

---

### 2.3 🟠 Retry логіка для мережевих запитів

**Проблема:** При тимчасових мережевих проблемах операції просто фейляться без спроби повтору.

**Файл:** `frontend/lib/strapi.ts`

**Завдання:**
- [ ] Створити fetchWithRetry wrapper
- [ ] Застосувати до критичних операцій (sale, writeOff)
- [ ] Налаштувати exponential backoff
- [ ] Логування retry спроб

**Код:**
```typescript
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  {
    retries = 3,
    backoff = 1000,
    retryOn = [500, 502, 503, 504],
  } = {}
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.ok || !retryOn.includes(response.status)) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error as Error;
    }

    if (attempt < retries - 1) {
      const delay = backoff * Math.pow(2, attempt);
      console.warn(`Retry ${attempt + 1}/${retries} after ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  throw lastError;
}
```

---

### 2.4 🟠 Покращення rollback для activity log

**Проблема:** При помилці синхронізації з сервером optimistic update відміняється, але немає повідомлення користувачу.

**Файл:** `frontend/hooks/use-activity-log.ts`

**Завдання:**
- [ ] Додати toast при помилці синхронізації
- [ ] Зберігати failed activities для повторної спроби
- [ ] Показувати індикатор "unsaved changes"

---

## Фаза 3: Середній пріоритет

### 3.1 🟡 Валідація форм на клієнті

**Проблема:** Форми (створення клієнта, редагування товару) не мають клієнтської валідації.

**Файли:**
- `frontend/components/sections/clients-section.tsx`
- `frontend/components/sections/products-section.tsx`

**Завдання:**
- [ ] Додати валідацію email формату
- [ ] Додати валідацію телефону
- [ ] Перевірка обов'язкових полів
- [ ] Inline помилки під полями
- [ ] Використати react-hook-form + zod

**Приклад:**
```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const customerSchema = z.object({
  name: z.string().min(2, 'Мінімум 2 символи'),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Невірний формат'),
  email: z.string().email('Невірний email').optional().or(z.literal('')),
  address: z.string().optional(),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(customerSchema),
});
```

---

### 3.2 🟡 Обмеження розміру файлу при імпорті

**Проблема:** Немає перевірки розміру Excel файлу при імпорті.

**Файли:**
- `frontend/components/ui/import-modal.tsx`
- `backend/src/api/import/controllers/import.ts`

**Завдання:**
- [ ] Клієнтська перевірка (max 5MB)
- [ ] Серверна валідація
- [ ] Progress bar для великих файлів

---

### 3.3 🟡 Пагінація для товарів

**Проблема:** При великому каталозі (500+ товарів) сторінка буде повільною.

**Файли:**
- `frontend/components/sections/products-section.tsx`
- `frontend/lib/strapi.ts`

**Завдання:**
- [ ] Додати пагінацію компонент
- [ ] Infinite scroll або pagination controls
- [ ] Lazy loading зображень
- [ ] Віртуалізація списку (react-window)

---

### 3.4 🟡 Логування дій користувача

**Проблема:** Немає повного аудит логу всіх дій.

**Завдання:**
- [ ] Створити audit_logs таблицю
- [ ] Middleware для логування всіх mutations
- [ ] UI для перегляду логів (для адміна)

---

## Фаза 4: Покращення UX

### 4.1 🟢 Offline режим для POS

**Завдання:**
- [ ] Service Worker для кешування
- [ ] IndexedDB для offline queue
- [ ] Синхронізація при відновленні зв'язку
- [ ] Індикатор offline/online статусу

---

### 4.2 🟢 Real-time оновлення stock

**Завдання:**
- [ ] WebSocket або SSE для stock updates
- [ ] Оновлення UI без перезавантаження
- [ ] Notification про зміни від інших користувачів

---

### 4.3 🟢 Звіти та експорт

**Завдання:**
- [ ] Щоденний звіт продажів
- [ ] Тижневий/місячний аналіз
- [ ] Експорт в PDF
- [ ] Email відправка звітів

---

### 4.4 🟢 Покращення мобільного досвіду

**Завдання:**
- [ ] PWA manifest
- [ ] Touch-friendly інтерфейс
- [ ] Swipe gestures
- [ ] Нативні сповіщення

---

## Чеклист для впровадження

### Перед деплоєм на production:

- [ ] Всі критичні виправлення (Фаза 1) впроваджені
- [ ] Тести пройдені
- [ ] Backup бази даних
- [ ] Rollback план готовий

### Щотижневий огляд:

- [ ] Перевірка error logs
- [ ] Аналіз performance metrics
- [ ] Огляд user feedback
- [ ] Пріоритизація наступних задач

---

## Оцінка часу

| Фаза | Задачі | Оцінка |
|------|--------|--------|
| 1.1 | Транзакції БД | 4-6 год |
| 1.2 | Захист POS | 1-2 год |
| 1.3 | Race condition | 2-3 год |
| 2.1 | Stock валідація | 2-3 год |
| 2.2 | Batch endpoint | 3-4 год |
| 2.3 | Retry логіка | 2-3 год |
| 2.4 | Activity rollback | 1-2 год |
| **Разом Фаза 1-2** | | **15-23 год** |
| Фаза 3 | Валідація, пагінація | 8-12 год |
| Фаза 4 | UX покращення | 20-30 год |

---

*Документ створено: 2025-12-23*
*Оновлювати при прогресі*
