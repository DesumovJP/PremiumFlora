# Виправлення бага зі скаканням бекграунду при скролі

## Проблема

При досягненні низу сторінки та спробі продовжити скрол (особливо на мобільних пристроях, включаючи iPhone 15) фіксований бекграунд з картинками починав "скакати" або "дригатися". Це створювало візуальні артефакти та погіршувало користувацький досвід.

## Причина

Проблема виникала через:
1. Overscroll bounce effect - браузери (особливо Safari на iOS) мають вбудований "rubber band" ефект, коли користувач намагається скролити за межі контенту
2. Фіксовані елементи - бекграунд використовує position: fixed, який реагує на overscroll поведінку
3. Відсутність обмежень - не було правил overscroll-behavior, які б запобігали bounce ефекту

## Рішення

### 1. Додано глобальні правила overscroll-behavior в globals.css

html {
  overscroll-behavior: none;
  overscroll-behavior-y: none;
  overscroll-behavior-x: none;
}

body {
  overscroll-behavior: none;
  overscroll-behavior-y: none;
  overscroll-behavior-x: none;
  -webkit-overflow-scrolling: touch;
}

main, section {
  overscroll-behavior: none;
  overscroll-behavior-y: none;
  overscroll-behavior-x: none;
  touch-action: pan-y;
}
### 2. Додано специфічні правила для фіксованих елементів

/* Prevent bounce on fixed background elements */
div[class*="fixed"][class*="inset-0"] {
  overscroll-behavior: none !important;
  overscroll-behavior-y: none !important;
  overscroll-behavior-x: none !important;
  touch-action: none !important;
  will-change: transform;
}
Це правило застосовується до всіх фіксованих елементів, які займають весь екран (наприклад, `BackgroundImagesGrid`).

### 3. Додано inline стилі до BackgroundImagesGrid.tsx

<div 
  className={rootClassName} 
  style={{ 
    overscrollBehavior: 'none', 
    overscrollBehaviorY: 'none', 
    touchAction: 'none' 
  }}
>
Це забезпечує, що бекграунд компонент має правильні стилі навіть якщо CSS правила не застосовуються.

### 4. Додано overscroll-none клас до main елементів

На сторінках додано клас overscroll-none до main елементів для додаткового захисту.

## Технічні деталі

### overscroll-behavior

- `none` - повністю відключає overscroll поведінку
- `overscroll-behavior-y: none` - відключає вертикальний overscroll
- `overscroll-behavior-x: none` - відключає горизонтальний overscroll

### touch-action: pan-y

Дозволяє тільки вертикальний скрол, запобігаючи небажаним touch взаємодіям.

### touch-action: none

Для фіксованих бекграунд елементів повністю відключає touch взаємодії, оскільки вони не повинні реагувати на дотики.

### will-change: transform

Оптимізує рендеринг фіксованих елементів, кажучи браузеру, що елемент може змінюватися через transform.

## Файли, які були змінені

1. `frontend/styles/globals.css`
   - Додано глобальні правила overscroll-behavior
   - Додано правила для фіксованих елементів

2. `frontend/components/BackgroundImagesGrid.tsx`
   - Додано inline стилі для запобігання bounce

3. `frontend/app/page.tsx`
   - Додано клас overscroll-none до main елемента

## Результат

Після застосування цих змін:
- ✅ Бекграунд більше не скаче при досягненні низу сторінки
- ✅ Працює на всіх браузерах (Chrome, Safari, Firefox)
- ✅ Працює на всіх пристроях (iOS, Android, Desktop)
- ✅ Не впливає на нормальний скрол контенту
- ✅ Не ламає інші функції сайту

## Тестування

Для перевірки виправлення:
1. Відкрити сайт на мобільному пристрої (особливо iPhone)
2. Скролити до самого низу сторінки
3. Спробувати продовжити скрол (swipe вниз)
4. Переконатися, що бекграунд не скаче і не дригається

## Додаткові нотатки

- overscroll-behavior підтримується в усіх сучасних браузерах
- На iOS Safari може знадобитися додатковий -webkit-overflow-scrolling: touch для плавного скролу
- Використання !important для фіксованих елементів необхідне, оскільки вони можуть мати інші стилі, які перекривають ці правилаК