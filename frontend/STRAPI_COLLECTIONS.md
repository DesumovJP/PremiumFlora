# Колекції Strapi для Premium Flora

Цей документ описує структуру колекцій, які потрібно створити в Strapi CMS для проекту Premium Flora.

## 📦 Основні колекції

### 1. **Product** (Товар / Квіт)

Основна колекція для каталогу квітів.

**Поля:**
- `name` (Text, required) - Назва товару (напр. "Троянда червона")
- `slug` (UID, required, unique) - URL-ідентифікатор (напр. "red-rose")
- `description` (Rich Text, optional) - Опис товару
- `image` (Media, single, required) - Головне зображення товару
- `images` (Media, multiple, optional) - Додаткові зображення
- `isPopular` (Boolean, default: false) - Чи є товар популярним (для бейджа "Популярне")
- `isFeatured` (Boolean, default: false) - Показувати на головній сторінці
- `category` (Relation, many-to-one) - Категорія товару
- `variants` (Relation, one-to-many) - Варіанти товару (розміри)
- `createdAt` (DateTime, auto)
- `updatedAt` (DateTime, auto)
- `publishedAt` (DateTime, optional)

**Налаштування:**
- Draft & Publish: увімкнено
- Internationalization: опціонально (uk, en)

---

### 2. **ProductVariant** (Варіант товару)

Варіанти товару з різними розмірами, цінами та залишками.

**Поля:**
- `size` (Text, required) - Розмір/висота (напр. "50 см", "60 см", "70 см")
- `price` (Decimal, required) - Ціна за одиницю (в грн)
- `stock` (Integer, required, default: 0) - Кількість на складі
- `product` (Relation, many-to-one, required) - Зв'язок з товаром
- `isActive` (Boolean, default: true) - Чи доступний варіант
- `createdAt` (DateTime, auto)
- `updatedAt` (DateTime, auto)

**Налаштування:**
- Draft & Publish: вимкнено (завжди опубліковано, якщо isActive = true)

---

### 3. **Category** (Категорія)

Категорії для організації товарів та статей блогу.

**Поля:**
- `name` (Text, required) - Назва категорії (напр. "Троянди", "Хризантеми")
- `slug` (UID, required, unique) - URL-ідентифікатор
- `description` (Text, optional) - Опис категорії
- `image` (Media, single, optional) - Зображення категорії
- `type` (Enumeration, required) - Тип категорії:
  - `product` - для товарів
  - `blog` - для статей блогу
- `parent` (Relation, many-to-one, optional) - Батьківська категорія (для вкладеності)
- `products` (Relation, one-to-many) - Товари в категорії
- `blogPosts` (Relation, one-to-many) - Статті в категорії
- `createdAt` (DateTime, auto)
- `updatedAt` (DateTime, auto)
- `publishedAt` (DateTime, optional)

**Налаштування:**
- Draft & Publish: увімкнено

---

### 4. **BlogPost** (Стаття блогу)

Статті для блогу з порадами та інформацією.

**Поля:**
- `title` (Text, required) - Заголовок статті
- `slug` (UID, required, unique) - URL-ідентифікатор
- `excerpt` (Text, required, maxLength: 300) - Короткий опис (для карток)
- `content` (Rich Text, required) - Повний текст статті (HTML)
- `image` (Media, single, required) - Головне зображення
- `date` (Date, required) - Дата публікації
- `author` (Relation, many-to-one, required) - Автор статті
- `category` (Relation, many-to-one, required) - Категорія (type: "blog")
- `tags` (Relation, many-to-many, optional) - Теги
- `isFeatured` (Boolean, default: false) - Велика картка на сторінці блогу
- `views` (Integer, default: 0) - Кількість переглядів
- `createdAt` (DateTime, auto)
- `updatedAt` (DateTime, auto)
- `publishedAt` (DateTime, optional)

**Налаштування:**
- Draft & Publish: увімкнено

---

### 5. **Author** (Автор)

Автори статей блогу.

**Поля:**
- `name` (Text, required) - Ім'я автора
- `slug` (UID, required, unique) - URL-ідентифікатор
- `bio` (Text, optional) - Біографія
- `avatar` (Media, single, optional) - Фото автора
- `email` (Email, optional) - Email автора
- `blogPosts` (Relation, one-to-many) - Статті автора
- `createdAt` (DateTime, auto)
- `updatedAt` (DateTime, auto)

**Налаштування:**
- Draft & Publish: вимкнено

---

### 6. **Tag** (Тег)

Теги для статей блогу та товарів.

**Поля:**
- `name` (Text, required, unique) - Назва тегу
- `slug` (UID, required, unique) - URL-ідентифікатор
- `blogPosts` (Relation, many-to-many) - Статті з цим тегом
- `createdAt` (DateTime, auto)
- `updatedAt` (DateTime, auto)

**Налаштування:**
- Draft & Publish: вимкнено

---

## 🏢 Адмін-панель колекції

### 7. **Client** (Клієнт)

Клієнти для адмін-панелі (B2B клієнти).

**Поля:**
- `name` (Text, required) - Назва клієнта (напр. "Квіткова крамниця 'Лілія'")
- `contact` (Text, required) - Телефон
- `email` (Email, required) - Email
- `city` (Text, required) - Місто та адреса
- `orders` (Integer, default: 0) - Кількість замовлень
- `spent` (Decimal, default: 0) - Сума витрат
- `lastOrder` (Date, optional) - Дата останнього замовлення
- `isVip` (Boolean, default: false) - VIP клієнт
- `notes` (Text, optional) - Примітки
- `createdAt` (DateTime, auto)
- `updatedAt` (DateTime, auto)

**Налаштування:**
- Draft & Publish: вимкнено
- Permissions: тільки для адміністраторів

---

### 8. **Order** (Замовлення)

Замовлення клієнтів.

**Поля:**
- `orderId` (Text, required, unique) - Номер замовлення (напр. "008")
- `status` (Enumeration, required) - Статус:
  - `pending` - Очікується
  - `paid` - Оплачено
  - `processing` - В обробці
  - `shipped` - Відправлено
  - `delivered` - Доставлено
  - `cancelled` - Скасовано
- `date` (Date, required) - Дата замовлення
- `client` (Relation, many-to-one, optional) - Клієнт
- `items` (JSON, required) - Список товарів (масив об'єктів)
- `amount` (Decimal, required) - Загальна сума
- `notes` (Text, optional) - Примітки
- `createdAt` (DateTime, auto)
- `updatedAt` (DateTime, auto)

**Налаштування:**
- Draft & Publish: вимкнено
- Permissions: тільки для адміністраторів

**Приклад структури `items`:**
```json
[
  {
    "productId": "red-rose",
    "productName": "Троянда червона",
    "size": "80 см",
    "quantity": 120,
    "price": 105,
    "total": 12600
  }
]
```

---

## 📄 Контент сторінок

### 9. **PageContent** (Контент сторінки)

Статичний контент для різних сторінок сайту.

**Поля:**
- `page` (Enumeration, required, unique) - Сторінка:
  - `home` - Головна
  - `about` - Про нас
  - `catalog` - Каталог
  - `blog` - Блог
- `heroTitle` (Text, optional) - Заголовок hero-секції
- `heroSubtitle` (Text, optional) - Підзаголовок hero-секції
- `heroDescription` (Rich Text, optional) - Опис в hero
- `heroImage` (Media, single, optional) - Зображення hero
- `heroVideo` (Media, single, optional) - Відео для hero
- `content` (Rich Text, optional) - Основний контент сторінки
- `metaTitle` (Text, optional) - SEO заголовок
- `metaDescription` (Text, optional) - SEO опис
- `createdAt` (DateTime, auto)
- `updatedAt` (DateTime, auto)
- `publishedAt` (DateTime, optional)

**Налаштування:**
- Draft & Publish: увімкнено
- Single Type: так (по одному запису на сторінку)

---

### 10. **ContactInfo** (Контактна інформація)

Контактна інформація компанії.

**Поля:**
- `phones` (JSON, required) - Масив телефонів:
  ```json
  [
    { "label": "Основний", "number": "+380 67 123 4567" },
    { "label": "Додатковий", "number": "+380 50 123 4567" }
  ]
  ```
- `email` (Email, required) - Email
- `address` (Text, required) - Адреса
- `workingHours` (JSON, required) - Режим роботи:
  ```json
  {
    "weekdays": "Пн-Пт: 9:00-18:00",
    "saturday": "Сб: 10:00-16:00",
    "sunday": "Нд: Вихідний"
  }
  ```
- `socialLinks` (JSON, optional) - Соціальні мережі
- `mapEmbed` (Text, optional) - HTML для вбудованої карти
- `createdAt` (DateTime, auto)
- `updatedAt` (DateTime, auto)

**Налаштування:**
- Draft & Publish: вимкнено
- Single Type: так (один запис)

---

### 11. **GalleryImage** (Зображення галереї)

Зображення для галереї на сторінці "Про нас".

**Поля:**
- `image` (Media, single, required) - Зображення
- `title` (Text, optional) - Назва
- `description` (Text, optional) - Опис
- `order` (Integer, default: 0) - Порядок сортування
- `isActive` (Boolean, default: true) - Показувати в галереї
- `createdAt` (DateTime, auto)
- `updatedAt` (DateTime, auto)

**Налаштування:**
- Draft & Publish: вимкнено

---

## ⚙️ Налаштування

### 12. **SiteSettings** (Налаштування сайту)

Глобальні налаштування сайту.

**Поля:**
- `siteName` (Text, required, default: "Premium Flora") - Назва сайту
- `siteDescription` (Text, optional) - Опис сайту
- `logo` (Media, single, optional) - Логотип
- `favicon` (Media, single, optional) - Favicon
- `defaultMetaTitle` (Text, optional) - Заголовок за замовчуванням
- `defaultMetaDescription` (Text, optional) - Опис за замовчуванням
- `deliveryInfo` (Text, optional) - Інформація про доставку (напр. "Свіжа поставка щоп'ятниці")
- `minOrder` (Text, optional) - Мінімальне замовлення (напр. "Мінімальне замовлення від 50 шт")
- `stats` (JSON, optional) - Статистика для головної:
  ```json
  {
    "yearsExperience": 10,
    "satisfiedClients": 500,
    "productsCount": 30,
    "deliveryDays": "П'ятниця"
  }
  ```
- `createdAt` (DateTime, auto)
- `updatedAt` (DateTime, auto)

**Налаштування:**
- Draft & Publish: вимкнено
- Single Type: так (один запис)

---

## 🔗 Зв'язки між колекціями

```
Product (1) ──< (N) ProductVariant
Product (N) >──< (1) Category
Category (1) ──< (N) BlogPost
BlogPost (N) >──< (1) Author
BlogPost (N) >──< (N) Tag
Order (N) >──< (1) Client
```

---

## 📋 Додаткові рекомендації

### Поля для пошуку та фільтрації:
- Додайте індекси на поля `slug`, `name`, `title` для швидкого пошуку
- Використовуйте `publishedAt` для контролю публікації

### Медіа:
- Налаштуйте оптимізацію зображень в Strapi
- Рекомендовані формати: WebP для зображень, MP4 для відео
- Розміри: товари - 1200x1200px, блог - 1920x1080px

### Права доступу:
- **Public API**: Product, ProductVariant, BlogPost, Category, Author, Tag, PageContent, ContactInfo, SiteSettings, GalleryImage
- **Admin Only**: Client, Order

### Інтернаціоналізація (опціонально):
- Якщо потрібна підтримка кількох мов, увімкніть i18n для:
  - Product
  - BlogPost
  - Category
  - PageContent

---

## 🚀 Порядок створення колекцій

1. **SiteSettings** - базові налаштування
2. **Category** - категорії для товарів та блогу
3. **Author** - автори для блогу
4. **Tag** - теги
5. **Product** - товари
6. **ProductVariant** - варіанти товарів
7. **BlogPost** - статті блогу
8. **PageContent** - контент сторінок
9. **ContactInfo** - контакти
10. **GalleryImage** - галерея
11. **Client** - клієнти (адмін)
12. **Order** - замовлення (адмін)

---

## 📝 Примітки

- Всі текстові поля, які відображаються на сайті, мають підтримувати українську мову
- Для числових полів (ціни, залишки) використовуйте Decimal або Integer залежно від потреби
- JSON поля дозволяють гнучко зберігати структуровані дані без створення окремих колекцій
- Single Type колекції (SiteSettings, ContactInfo, PageContent) мають тільки один запис









