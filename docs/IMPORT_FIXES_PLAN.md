# План виправлення системи імпорту

## Критичні проблеми

### Проблема 1: Втрата кількості при дублюванні рядків
**Серйозність:** КРИТИЧНА
**Локація:** `backend/src/services/excel/upserter.service.ts`

**Опис:**
Якщо в Excel файлі є два рядки з однаковою квіткою і довжиною:
```
Rose, 90cm, 100 stems, $2.50
Rose, 90cm, 50 stems, $2.50
```
Другий рядок ПЕРЕЗАПИСУЄ перший замість агрегації.

**Результат:** Втрата 100 стеблин!

**Рішення:**
1. Перед upsert агрегувати рядки з однаковим `slug + length`
2. Сумувати `stock`
3. Брати останню ціну або середню

---

### Проблема 2: Неправильний Activity Log для поставок
**Серйозність:** КРИТИЧНА
**Локація:** `frontend/components/ui/import-modal.tsx`

**Опис:**
При логуванні supply activity відсутні:
- `stockBefore` - попередня кількість на складі
- `priceAfter` - ціна продажу

**Результат в історії:**
```typescript
const qty = (item.stockAfter || 0) - (item.stockBefore || 0);
// stockBefore = undefined → qty = stockAfter - 0 = stockAfter
// Для оновлених варіантів це НЕПРАВИЛЬНО!

const amount = qty * (item.priceAfter || 0);
// priceAfter = undefined → amount = 0
// Сума поставки = 0 грн - НЕПРАВИЛЬНО!
```

**Рішення:**
1. Отримувати `stockBefore` з результату upsert операції (operation.before.stock)
2. Передавати `priceAfter` = ціна продажу з DB або 0 для нових
3. Розрізняти нові (created) та оновлені (updated) варіанти

---

### Проблема 3: Редагування нормалізації
**Серйозність:** ВИСОКА
**Локація:** Frontend UI

**Опис:**
Користувач не може змінити нормалізовану назву перед імпортом.
Наприклад: "Freedom" автоматично стає "Freedom Rose", але це може бути неправильно.

**Рішення:**
1. В таблиці превʼю показувати: Оригінал | Нормалізоване | [Редагувати]
2. Дозволяти змінювати нормалізовану назву
3. Зберігати власні синоніми для майбутніх імпортів

---

## План виконання

### Етап 1: Агрегація дублікатів (КРИТИЧНО)
- [ ] 1.1. В `upserter.service.ts` додати функцію `aggregateRowsByVariant()`
- [ ] 1.2. Групувати рядки по `slug + length`
- [ ] 1.3. Для кожної групи:
  - Сумувати `stock`
  - Брати останню `price` (costPrice)
  - Зберігати всі оригінальні рядки для аудиту
- [ ] 1.4. Додати попередження якщо знайдено дублікати
- [ ] 1.5. Тестування з файлом що має дублікати

### Етап 2: Виправлення Activity Log (КРИТИЧНО)
- [ ] 2.1. В `import-modal.tsx` отримувати `stockBefore` з `operation.before.stock`
- [ ] 2.2. Отримувати `priceAfter` з `operation.after.price` або з DB
- [ ] 2.3. Правильно визначати `isNew` з типу операції (created vs updated)
- [ ] 2.4. Передавати повні дані в `onLogActivity()`
- [ ] 2.5. Перевірити відображення в `history-section.tsx`

### Етап 3: Покращення відображення кількості
- [ ] 3.1. В превʼю таблиці показувати оригінальну кількість з Excel
- [ ] 3.2. Показувати нормалізовану кількість (після Math.round)
- [ ] 3.3. Підсвічувати якщо є різниця
- [ ] 3.4. Показувати попередження про округлення

### Етап 4: Редагування нормалізації (UI)
- [ ] 4.1. Додати колонку "Оригінал" в таблицю превʼю
- [ ] 4.2. Зробити колонку "Назва" редагованою
- [ ] 4.3. Зробити колонку "Довжина" редагованою
- [ ] 4.4. При зміні - оновлювати локальний стан
- [ ] 4.5. Передавати змінені дані при застосуванні імпорту

### Етап 5: Збереження синонімів (опціонально)
- [ ] 5.1. Створити таблицю `flower_synonyms` в Strapi
- [ ] 5.2. При редагуванні нормалізації - пропонувати зберегти як синонім
- [ ] 5.3. В normalizer.service.ts - завантажувати користувацькі синоніми

---

## Деталі реалізації

### 1.1 Функція aggregateRowsByVariant()

```typescript
// В upserter.service.ts
private aggregateRowsByVariant(rows: NormalizedRow[]): {
  aggregated: NormalizedRow[];
  duplicates: Array<{ slug: string; length: number; count: number; totalStock: number }>;
} {
  const grouped = new Map<string, NormalizedRow[]>();

  for (const row of rows) {
    const key = `${row.slug}:${row.length ?? row.grade}`;
    const existing = grouped.get(key) || [];
    existing.push(row);
    grouped.set(key, existing);
  }

  const aggregated: NormalizedRow[] = [];
  const duplicates: Array<{ slug: string; length: number; count: number; totalStock: number }> = [];

  for (const [key, groupRows] of grouped) {
    if (groupRows.length > 1) {
      // Знайдено дублікат - агрегуємо
      const totalStock = groupRows.reduce((sum, r) => sum + r.stock, 0);
      const lastRow = groupRows[groupRows.length - 1];

      duplicates.push({
        slug: lastRow.slug,
        length: lastRow.length,
        count: groupRows.length,
        totalStock,
      });

      // Створюємо агрегований рядок
      aggregated.push({
        ...lastRow,
        stock: totalStock,
        // original зберігає всі оригінальні дані
        original: {
          ...lastRow.original,
          _aggregatedFrom: groupRows.map(r => r.original),
        },
      });
    } else {
      aggregated.push(groupRows[0]);
    }
  }

  return { aggregated, duplicates };
}
```

### 2.1 Виправлення supplyItems в import-modal.tsx

```typescript
// В handleApplyImport()
const entries: PriceEntry[] = [];
const variantOps = res.data.operations?.filter(op => op.entity === 'variant') || [];

for (const row of res.data.rows || []) {
  const matchingOp = variantOps.find(op =>
    op.data.length === (row.length ?? 0) &&
    // Шукаємо по slug квітки
    res.data.operations?.some(fOp =>
      fOp.entity === 'flower' &&
      fOp.data.slug === row.slug
    )
  );

  if (matchingOp) {
    entries.push({
      documentId: matchingOp.documentId,
      flowerName: row.flowerName,
      length: row.length,
      costPrice: row.price,
      salePrice: '',
      originalStock: (row.original?.units as number) || row.stock,
      importedStock: row.stock,
      // Нові поля для activity log
      stockBefore: matchingOp.before?.stock ?? 0,
      stockAfter: matchingOp.after?.stock ?? row.stock,
      priceAfter: matchingOp.after?.price ?? 0,
      isNew: matchingOp.type === 'create',
    });
  }
}

// При логуванні
const supplyItems = entries.map(e => ({
  flowerName: e.flowerName,
  length: e.length,
  stockBefore: e.stockBefore,
  stockAfter: e.stockAfter,
  priceBefore: 0, // Для нових = 0
  priceAfter: e.priceAfter,
  isNew: e.isNew,
}));
```

---

## Тестування

### Тест 1: Агрегація дублікатів
1. Створити Excel файл:
   ```
   Rose, 90cm, 100, 2.50
   Rose, 90cm, 50, 2.60
   Tulip, 50cm, 200, 1.00
   ```
2. Імпортувати
3. Перевірити: Rose 90cm = 150 шт, costPrice = 2.60

### Тест 2: Activity Log
1. Імпортувати файл
2. Перевірити в історії:
   - Для нових: stockBefore = 0, stockAfter = кількість
   - Для оновлених: stockBefore = попередній, stockAfter = новий
   - Сума поставки = qty * priceAfter

### Тест 3: Редагування нормалізації
1. Імпортувати файл з "Freedom"
2. В превʼю побачити: Оригінал = "Freedom", Нормалізоване = "Freedom Rose"
3. Змінити на "Freedom"
4. Застосувати - створюється квітка "Freedom"

---

## Файли для зміни

| Файл | Зміни |
|------|-------|
| `backend/src/services/excel/upserter.service.ts` | Агрегація дублікатів |
| `backend/src/services/excel/types.ts` | Новий тип для duplicates warning |
| `frontend/components/ui/import-modal.tsx` | Activity log + редагування |
| `frontend/lib/types/import.ts` | Нові поля в PriceEntry |
| `frontend/hooks/use-activity-log.ts` | Перевірити типи |

---

## Прогрес

- [x] Етап 1: Агрегація дублікатів
  - Додано `aggregateVariants()` метод в `upserter.service.ts`
  - Рядки з однаковим `slug + length` агрегуються, stock сумується
  - Генеруються попередження про агреговані рядки
- [x] Етап 2: Activity Log
  - Додано `costPrice` для розрахунку вартості поставок
  - Оновлено `stockBefore`, `stockAfter`, `priceAfter` в activity log
  - Виправлено відображення в `history-section.tsx`
- [x] Етап 3: Відображення кількості
  - Додано секцію попереджень в превʼю імпорту
  - Показується оригінальна назва під нормалізованою
  - Підсвічуються агреговані рядки
  - Показується кількість агрегованих рядків
- [x] Етап 4: Редагування нормалізації
  - Назва квітки тепер редагується прямо в таблиці превʼю
  - Змінені рядки підсвічуються зеленим
  - Оверрайди передаються на бекенд при застосуванні імпорту
  - Бекенд застосовує оверрайди перед валідацією та upsert
- [ ] Етап 5: Збереження синонімів (опціонально, на майбутнє)

**Останнє оновлення:** 2026-01-06
