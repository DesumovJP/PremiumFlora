
# Аналіз проблеми зі збереженням даних Supply в Strapi v5

## Проблема

При імпорті Excel файлів створюються записи Supply, які:
1. ✅ Відображаються на головній сторінці Strapi (Last published entries)
2. ❌ При редагуванні показують "Untitled Draft" з пустими полями
3. ❌ В Content Manager показується "0 entries found"

## Глибокий аналіз

### Поточна реалізація

**Файл:** `backend/src/api/import/services/import.ts`

```typescript
const supply = await strapi.db.query('api::supply.supply').create({
  data: {
    filename,
    checksum,
    dateParsed: new Date().toISOString(),
    awb: effectiveAwb,
    supplier: effectiveSupplier,
    rows: supplyRows,  // JSON поле
    supplyStatus,
    supplyErrors: errors,  // JSON поле
    supplyWarnings: allWarnings,  // JSON поле
    users_permissions_user: options.userId || null,
    publishedAt: new Date().toISOString(),
    locale: 'uk',
  },
});
```

### Виявлені проблеми

#### 1. Використання `db.query()` замість Entity Service API

**Проблема:** У Strapi v5 для колекцій з `draftAndPublish: true` рекомендовано використовувати Entity Service API (`strapi.entityService`), а не прямий доступ до БД через `db.query()`.

**Чому це проблема:**
- `db.query()` обходить бізнес-логіку Strapi
- Не викликає хуки (lifecycle hooks)
- Може не правильно обробляти `publishedAt` для draft/publish системи
- JSON поля можуть не серіалізуватися правильно
- Не створює правильні зв'язки між draft та published версіями

#### 2. Проблема з JSON полями

**Проблема:** JSON поля (`rows`, `supplyErrors`, `supplyWarnings`) можуть не зберігатися правильно через `db.query()`.

**Чому:**
- Деякі БД (PostgreSQL, MySQL) потребують явної серіалізації JSON
- Strapi Entity Service автоматично обробляє JSON поля
- `db.query()` може не правильно обробляти складні JSON структури

#### 3. Проблема з Draft/Publish системою

**Проблема:** Навіть з `publishedAt`, запис може створюватися як draft.

**Чому:**
- `db.query().create()` не використовує Strapi's publish workflow
- Потрібно явно публікувати через Entity Service або використовувати `entityService.create()` з правильними параметрами

#### 4. Відсутність display field

**Проблема:** Supply schema не має поля, яке використовується як "title" для відображення в адмін-панелі.

**Чому "Untitled":**
- Strapi шукає поле `title` або інше display field
- Якщо його немає, показує "Untitled"
- `filename` існує, але не встановлено як display field

## План виправлення

### Крок 1: Додати display field до schema

**Файл:** `backend/src/api/supply/content-types/supply/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "supplies",
  "info": {
    "singularName": "supply",
    "pluralName": "supplies",
    "displayName": "Supply",
    "description": "Supply records from Excel imports"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": {
      "localized": false
    }
  },
  "attributes": {
    "filename": {
      "type": "string",
      "required": true
    },
    // ... інші поля
  }
}
```

**Дії:**
1. Додати `description` до `info`
2. Встановити `filename` як `required: true`
3. Можливо додати поле `title` для кращого відображення

### Крок 2: Переписати створення Supply на Entity Service API

**Файл:** `backend/src/api/import/services/import.ts`

**Замінити:**
```typescript
const supply = await strapi.db.query('api::supply.supply').create({...});
```

**На:**
```typescript
const supply = await strapi.entityService.create('api::supply.supply', {
  data: {
    filename,
    checksum,
    dateParsed: new Date().toISOString(),
    awb: effectiveAwb,
    supplier: effectiveSupplier,
    rows: supplyRows,
    supplyStatus,
    supplyErrors: errors,
    supplyWarnings: allWarnings,
    users_permissions_user: options.userId || null,
    publishedAt: new Date().toISOString(),
    locale: 'uk',
  },
  // Явно публікуємо запис
  populate: ['users_permissions_user'],
});
```

### Крок 3: Додати детальне логування

**Додати логування на кожному етапі:**

```typescript
// Перед створенням
strapi.log.info('Preparing Supply data', {
  filename,
  checksum,
  rowsCount: supplyRows.length,
  rowsSample: supplyRows[0],
  supplyStatus,
  errorsCount: errors.length,
  warningsCount: allWarnings.length,
  dataToSave: {
    filename,
    checksum,
    dateParsed: new Date().toISOString(),
    awb: effectiveAwb,
    supplier: effectiveSupplier,
    rowsType: typeof supplyRows,
    rowsIsArray: Array.isArray(supplyRows),
    supplyStatus,
    errorsType: typeof errors,
    errorsIsArray: Array.isArray(errors),
    warningsType: typeof allWarnings,
    warningsIsArray: Array.isArray(allWarnings),
  },
});

// Після створення через Entity Service
strapi.log.info('Supply created via Entity Service', {
  supplyId: supply.id,
  documentId: supply.documentId,
  filename: supply.filename,
  supplyStatus: supply.supplyStatus,
  publishedAt: supply.publishedAt,
  rowsStored: supply.rows 
    ? (Array.isArray(supply.rows) ? supply.rows.length : 'not an array')
    : 'null',
  rowsType: supply.rows ? typeof supply.rows : 'null',
});

// Перевірка через db.query після створення
const dbCheck = await strapi.db.query('api::supply.supply').findOne({
  where: { id: supply.id },
});
strapi.log.info('DB verification after Entity Service create', {
  id: dbCheck?.id,
  documentId: dbCheck?.documentId,
  filename: dbCheck?.filename,
  supplyStatus: dbCheck?.supplyStatus,
  publishedAt: dbCheck?.publishedAt,
  rowsInDB: dbCheck?.rows 
    ? (Array.isArray(dbCheck.rows) ? dbCheck.rows.length : 'not an array')
    : 'null',
  allFields: Object.keys(dbCheck || {}),
});
```

### Крок 4: Перевірити JSON серіалізацію

**Додати перевірку перед збереженням:**

```typescript
// Перевірити, що JSON дані правильно сформовані
const rowsJson = JSON.stringify(supplyRows);
const errorsJson = JSON.stringify(errors);
const warningsJson = JSON.stringify(allWarnings);

strapi.log.info('JSON serialization check', {
  rowsJsonLength: rowsJson.length,
  errorsJsonLength: errorsJson.length,
  warningsJsonLength: warningsJson.length,
  rowsParseable: (() => {
    try {
      JSON.parse(rowsJson);
      return true;
    } catch {
      return false;
    }
  })(),
});
```

### Крок 5: Додати lifecycle hooks для діагностики

**Файл:** `backend/src/api/supply/content-types/supply/lifecycles.ts` (створити новий)

```typescript
export default {
  async beforeCreate(event) {
    const { data } = event.params;
    strapi.log.info('Supply beforeCreate hook', {
      filename: data.filename,
      hasRows: !!data.rows,
      rowsType: typeof data.rows,
      rowsIsArray: Array.isArray(data.rows),
    });
  },

  async afterCreate(event) {
    const { result } = event;
    strapi.log.info('Supply afterCreate hook', {
      id: result.id,
      documentId: result.documentId,
      filename: result.filename,
      publishedAt: result.publishedAt,
      rowsStored: result.rows 
        ? (Array.isArray(result.rows) ? result.rows.length : 'not an array')
        : 'null',
    });
  },
};
```

### Крок 6: Перевірити permissions

**Переконатися, що користувач має права на створення Supply:**

```typescript
// Додати перевірку permissions
if (options.userId) {
  const user = await strapi.db.query('plugin::users-permissions.user').findOne({
    where: { id: options.userId },
  });
  strapi.log.info('User permissions check', {
    userId: options.userId,
    username: user?.username,
    email: user?.email,
  });
}
```

### Крок 7: Альтернативне рішення - використання REST API

**Якщо Entity Service не працює, спробувати через REST API:**

```typescript
// Створити через HTTP запит до Strapi API
const response = await fetch(`${process.env.STRAPI_URL || 'http://localhost:1337'}/api/supplies`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    data: {
      filename,
      checksum,
      // ... інші поля
    },
  }),
});
```

## Порядок виконання

1. ✅ **Крок 1**: Оновити schema (додати description, required поля)
2. ✅ **Крок 2**: Переписати на Entity Service API
3. ✅ **Крок 3**: Додати детальне логування
4. ✅ **Крок 4**: Перевірити JSON серіалізацію
5. ✅ **Крок 5**: Додати lifecycle hooks
6. ✅ **Крок 6**: Перевірити permissions
7. ⚠️ **Крок 7**: Якщо не працює - спробувати REST API

## Очікуваний результат

Після виправлення:
- ✅ Записи Supply правильно зберігаються з усіма полями
- ✅ Дані відображаються при редагуванні
- ✅ Записи видимі в Content Manager
- ✅ JSON поля правильно збережені та доступні
- ✅ Показується правильна назва (filename) замість "Untitled"

## Логування для діагностики

Всі логи будуть містити:
- Дані перед створенням
- Результат створення через Entity Service
- Перевірку через db.query після створення
- Перевірку JSON серіалізації
- Інформацію про lifecycle hooks
- Перевірку permissions

## Додаткові міркування

1. **Можлива проблема з локалізацією**: Якщо `locale: 'uk'` не підтримується, спробувати без нього
2. **Можлива проблема з датами**: Переконатися, що `dateParsed` правильно форматується
3. **Можлива проблема з relations**: `users_permissions_user` може потребувати особливої обробки





