/**
 * Скрипт для наповнення бази статтями
 *
 * Створює 16 статей на теми:
 * - Розвиток квіткового бізнесу
 * - Тренди флористики
 * - Догляд за квітами
 * - Поради для флористів
 */

import type { Core } from '@strapi/strapi';

// Placeholder images for articles (replace with real images later)
const placeholderImage = (text: string, width = 800, height = 400) =>
  `https://placehold.co/${width}x${height}/e8f5e9/2e7d32?text=${encodeURIComponent(text)}`;

interface BlockChild {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
}

interface ParagraphBlock {
  type: 'paragraph';
  children: BlockChild[];
}

interface HeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: BlockChild[];
}

interface ImageBlock {
  type: 'image';
  image: { url: string; alternativeText?: string };
  children: [{ type: 'text'; text: '' }];
}

interface ListBlock {
  type: 'list';
  format: 'ordered' | 'unordered';
  children: Array<{
    type: 'list-item';
    children: BlockChild[];
  }>;
}

type ContentBlock = ParagraphBlock | HeadingBlock | ImageBlock | ListBlock;

interface ArticleData {
  title: string;
  slug: string;
  content: ContentBlock[];
  category: 'note' | 'guide' | 'procedure' | 'info';
  priority: 'low' | 'medium' | 'high';
  pinned: boolean;
}

const articlesData: ArticleData[] = [
  // 1. Бізнес-стратегія
  {
    title: 'Як відкрити квітковий магазин: покрокова інструкція',
    slug: 'yak-vidkryty-kvitkovyi-mahazyn',
    category: 'guide',
    priority: 'high',
    pinned: true,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Відкриття власного квіткового магазину — це захоплююча подорож, що поєднує творчість із підприємництвом. У цьому гайді ми розглянемо ключові етапи створення успішного квіткового бізнесу.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Квітковий магазин'), alternativeText: 'Інтер\'єр сучасного квіткового магазину' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Крок 1: Дослідження ринку' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Перш ніж інвестувати кошти, проведіть ретельний аналіз місцевого ринку. Визначте свою цільову аудиторію: чи це будуть корпоративні клієнти, весільні замовлення, чи роздрібні покупці. Дослідіть конкурентів — їх цінову політику, асортимент та сервіс.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Крок 2: Вибір локації' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Розташування магазину критично важливе для квіткового бізнесу. Ідеальні місця — біля станцій метро, торгових центрів, бізнес-центрів або житлових комплексів. Враховуйте прохідність, видимість вітрини та зручність паркування.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Крок 3: Обладнання та інвентар' }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Холодильні вітрини для зберігання квітів (температура +2...+8°C)' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Робочий стіл флориста з інструментами' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Стелажі та вази для демонстрації' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Пакувальні матеріали та декор' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'POS-система та термінал для оплати' }] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Крок 4: Постачальники' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Налагодьте відносини з надійними постачальниками квітів. Це можуть бути оптові бази, імпортери або місцеві теплиці. Важливо мати кілька джерел постачання, щоб уникнути перебоїв. Домовляйтесь про регулярні поставки та умови повернення неякісного товару.' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Пам\'ятайте: успішний квітковий бізнес будується на якості продукції, креативності композицій та бездоганному сервісі. Інвестуйте в навчання персоналу та слідкуйте за трендами флористики.' }],
      },
    ],
  },

  // 2. Сезонність
  {
    title: 'Сезонність у квітковому бізнесі: як планувати закупівлі',
    slug: 'sezonnist-u-kvitkovomu-biznesi',
    category: 'guide',
    priority: 'high',
    pinned: true,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Квітковий бізнес характеризується яскраво вираженою сезонністю. Розуміння цих циклів дозволяє оптимізувати закупівлі, мінімізувати списання та максимізувати прибуток.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Сезонні квіти'), alternativeText: 'Календар сезонних квітів' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Пікові періоди продажів' }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: '14 лютого — День закоханих (троянди, тюльпани, серцеподібні композиції)' }] },
          { type: 'list-item', children: [{ type: 'text', text: '8 березня — Міжнародний жіночий день (найбільший пік продажів у році)' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Травень-червень — весільний сезон (півонії, еустоми, гортензії)' }] },
          { type: 'list-item', children: [{ type: 'text', text: '1 вересня — День знань (гладіолуси, айстри, хризантеми)' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Листопад — День подяки (осінні композиції)' }] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Весняний асортимент (березень-травень)' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Весна — час тюльпанів, нарцисів, гіацинтів та фрезій. Ці квіти символізують оновлення та свіжість. Також популярними стають перші півонії та бузок. Закуповуйте збільшену кількість за 2-3 тижні до 8 березня.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Літній асортимент (червень-серпень)' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Літо — найкращий час для місцевих квітів: соняшники, жоржини, гладіолуси, лаванда. Ціни на імпортні троянди знижуються через конкуренцію з місцевими виробниками. Це ідеальний час для експериментів із польовими та садовими квітами.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Осінній асортимент (вересень-листопад)' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Осінь приносить хризантеми, айстри, калли та декоративні гарбузи. Кольорова гама зміщується до теплих відтінків: помаранчевий, бордовий, золотий. Не забувайте про сухоцвіти та декоративну зелень.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Зимовий асортимент (грудень-лютий)' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Зимою домінують імпортні троянди, еустоми, орхідеї та амариліси. Популярними стають різдвяні композиції з ялиновими гілками, пуансетіями та остролистом. Готуйтесь до підвищеного попиту на День святого Валентина.' }],
      },
    ],
  },

  // 3. Тренди
  {
    title: 'Тренди флористики 2024-2025: що замовляють клієнти',
    slug: 'trendy-florystyky-2024-2025',
    category: 'info',
    priority: 'high',
    pinned: false,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Флористика постійно еволюціонує, відображаючи зміни у суспільстві, моді та екологічній свідомості. Розглянемо ключові тренди, що домінують у сучасній флористиці.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Тренди флористики'), alternativeText: 'Сучасні флористичні тренди' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '1. Сталість та еко-свідомість' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Клієнти все частіше обирають місцеві сезонні квіти замість імпортних. Популярними стають композиції без пластикової упаковки, з використанням крафтового паперу, тканини або багаторазових контейнерів. Сухоцвіти та стабілізовані квіти — як альтернатива зрізаним.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '2. Природна естетика' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'На зміну ідеально симетричним букетам прийшли композиції у стилі "щойно зібрані з саду". Асиметрія, різна висота стебел, включення трав та гілок — все це створює відчуття природності та автентичності.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '3. Монохромні палітри' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Замість строкатих різнобарвних букетів клієнти обирають витончені монохромні композиції. Особливо популярні відтінки: пильно-рожевий, теракотовий, лавандовий та класичний білий. Гра текстур компенсує обмежену колірну гаму.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '4. Мінімалізм' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Один вишуканий стебло орхідеї чи три елегантні калли можуть справити більше враження, ніж пишний букет. Мінімалізм підкреслює красу кожної квітки та демонструє впевненість у виборі.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '5. Незвичні квіти та зелень' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Зростає інтерес до рідкісних сортів: ранункулюси, анемони, протеї, банксії. Декоративна зелень виходить на перший план — евкаліпт, рускус, аспарагус стають повноцінними елементами композицій.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '6. Персоналізація' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Клієнти цінують індивідуальний підхід: букети "під настрій", композиції з улюбленими квітами одержувача, врахування алергій та вподобань. Пропонуйте консультації та створюйте унікальні рішення.' }],
      },
    ],
  },

  // 4. Догляд за трояндами
  {
    title: 'Догляд за зрізаними трояндами: як продовжити свіжість',
    slug: 'dohliad-za-zrizanymy-troiandamy',
    category: 'guide',
    priority: 'medium',
    pinned: false,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Троянди — найпопулярніші квіти у світі, але вони вимагають особливого догляду. Правильне поводження може продовжити їх життя з 5-7 днів до 2-3 тижнів.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Троянди у вазі'), alternativeText: 'Свіжі троянди у вазі' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Підготовка квітів' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Одразу після отримання квітів обріжте стебла під кутом 45° гострим ножем (не ножицями — вони сплющують капіляри). Видаліть листя, яке опиниться під водою. Зануріть стебла у воду кімнатної температури.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Вибір вази та води' }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Використовуйте чисту вазу, вимиту з милом' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Вода — прохолодна, бажано фільтрована або відстояна' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Додайте спеціальний розчин для квітів або домашній замінник' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Рівень води — 2/3 висоти вази' }] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Домашній розчин для троянд' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'На 1 літр води: 1 столова ложка цукру (живлення) + 1 столова ложка оцту або лимонного соку (запобігає бактеріям) + декілька крапель відбілювача (дезінфекція). Цей розчин імітує комерційні добавки для квітів.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Щоденний догляд' }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Міняйте воду кожні 2 дні' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Підрізайте стебла на 1-2 см при кожній зміні води' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Видаляйте в\'янучі пелюстки та листя' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Тримайте квіти подалі від фруктів (етилен прискорює в\'янення)' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Уникайте прямого сонця та гарячих приладів' }] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Реанімація в\'янучих троянд' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Якщо голівки троянд почали опускатись, спробуйте "гарячий метод": обріжте стебла і опустіть їх у гарячу воду (не окріп) на 30 секунд, потім одразу у холодну. Це відновлює рух соків по капілярах.' }],
      },
    ],
  },

  // 5. Весільна флористика
  {
    title: 'Весільна флористика: від консультації до декору',
    slug: 'vesilna-florystyka',
    category: 'guide',
    priority: 'medium',
    pinned: false,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Весільна флористика — один із найприбутковіших напрямків квіткового бізнесу. Це комплексний сервіс, що включає букет нареченої, бутоньєрки, декор церемонії та банкету.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Весільний букет'), alternativeText: 'Елегантний весільний букет' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Перша консультація' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'На першій зустрічі з\'ясуйте: стиль весілля (класика, рустик, бохо, мінімалізм), колірну палітру, бюджет, локацію та сезон. Попросіть фото сукні нареченої та референси з Pinterest. Запитайте про алергії та особисті вподобання.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Елементи весільного замовлення' }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Букет нареченої (основний та дублер для кидання)' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Бутоньєрка для нареченого' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Браслети та прикраси для подружок' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Арка або інсталяція для церемонії' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Центральні композиції на столи' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Декор зони президіуму' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Пелюстки для доріжки' }] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Популярні весільні квіти' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Півонії, садові троянди, ранункулюси та еустоми — фаворити весільної флористики. Для додаткового об\'єму використовуйте гортензії, для романтичності — лізіантуси. Евкаліпт та оливкові гілки додають модної зеленої текстури.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Логістика весільного дня' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Плануйте доставку за 2-3 години до початку церемонії. Підготуйте контакти координатора та план локації. Візьміть запасні квіти для непередбачених ситуацій. Після монтажу зробіть фото для портфоліо.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Ціноутворення' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Весільні замовлення оцінюються комплексно: вартість квітів + робота флориста + доставка та монтаж. Зазвичай маржа на весільні послуги вища, ніж на роздріб, через складність та відповідальність. Беріть передоплату 50% для закупівлі матеріалів.' }],
      },
    ],
  },

  // 6. Робота з клієнтами
  {
    title: 'Комунікація з клієнтами: як перетворити покупця на постійного',
    slug: 'komunikatsiia-z-kliientamy',
    category: 'procedure',
    priority: 'medium',
    pinned: false,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'У квітковому бізнесі відносини з клієнтами — ключовий актив. Емоційна природа покупки квітів створює унікальні можливості для побудови лояльності.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Обслуговування клієнтів'), alternativeText: 'Флорист консультує клієнта' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Перше враження' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Вітайте кожного клієнта з посмішкою та зоровим контактом. Дайте хвилину оглянутися, потім запитайте: "Шукаєте щось конкретне, чи можу допомогти з вибором?" Уникайте нав\'язливості, але будьте доступні.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Виявлення потреб' }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Для кого квіти? (мама, дівчина, колега, клієнт)' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'З якого приводу? (день народження, вибачення, без приводу)' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Який бюджет? (пропонуйте варіанти у різних цінових категоріях)' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Чи є побажання щодо кольору або квітів?' }] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Активне слухання' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Слухайте уважно та ставте уточнюючі запитання. Якщо клієнт каже "щось яскраве", запитайте: "Яскраві теплі тони, як соняшники, чи яскраві холодні, як ірiси?" Це демонструє професіоналізм та допомагає зробити точний вибір.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Робота з запереченнями' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Якщо клієнт каже "занадто дорого", запропонуйте альтернативу в межах бюджету або поясніть цінність: свіжість, сорт, розмір бутонів. Ніколи не принижуйте дешевші варіанти — кожен букет має бути представлений гідно.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Програма лояльності' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Ведіть базу клієнтів із датами важливих подій. Надсилайте нагадування: "Завтра день народження вашої мами — замовити букет?" Пропонуйте знижки постійним клієнтам та бонуси за рекомендації.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Після продажу' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Надайте інструкцію з догляду. Додайте візитку. Для великих замовлень зателефонуйте наступного дня, щоб переконатися, що все сподобалось. Цей простий жест створює емоційний зв\'язок та стимулює повторні покупки.' }],
      },
    ],
  },

  // 7. Оптимізація закупівель
  {
    title: 'Оптимізація закупівель: як мінімізувати списання квітів',
    slug: 'optymizatsiia-zakupivel',
    category: 'procedure',
    priority: 'high',
    pinned: false,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Списання — найбільший виклик квіткового бізнесу. Квіти — швидкопсувний товар, і кожна несвіжа троянда — це втрачений прибуток. Розглянемо стратегії мінімізації втрат.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Оптимізація закупівель'), alternativeText: 'Планування закупівель квітів' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Аналіз історії продажів' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Ведіть детальну статистику: які квіти, в яких кольорах, в які дні продаються найкраще. Використовуйте POS-систему для автоматичного збору даних. Аналізуйте тренди за місяцями, враховуйте свята та погоду.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Принцип FIFO' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'First In, First Out — використовуйте спочатку квіти, що надійшли раніше. Маркуйте партії датою надходження. Розміщуйте свіжіші квіти позаду у холодильнику. Це просте правило суттєво зменшує списання.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Гнучке ціноутворення' }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Знижки на квіти, що наближаються до кінця терміну' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Пакетні пропозиції "букет дня" з надлишків' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Спецціни для корпоративних клієнтів на великі обсяги' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Продаж окремих квіток за зниженою ціною' }] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Правильне зберігання' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Температура у холодильнику +2...+5°C для більшості квітів. Тропічні (орхідеї, антуріуми) потребують +12...+15°C. Уникайте протягів та коливань температури. Регулярно очищуйте холодильник та контейнери.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Часті невеликі закупівлі' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Краще замовляти частіше меншими партіями, ніж рідко великими. Так, логістика дорожча, але свіжість квітів вища, а списання менше. Ідеальний варіант — поставки 2-3 рази на тиждень.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Резервний план' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Домовтесь з постачальником про можливість термінових замовлень. Майте контакти 2-3 резервних джерел. Це дозволить не тримати великі запаси "на всякий випадок" і оперативно реагувати на попит.' }],
      },
    ],
  },

  // 8. Instagram для флориста
  {
    title: 'Instagram для квіткового магазину: стратегія просування',
    slug: 'instagram-dlia-kvitkovoho-mahazyna',
    category: 'guide',
    priority: 'medium',
    pinned: false,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Instagram — ідеальна платформа для квіткового бізнесу завдяки візуальній природі продукту. Грамотне ведення профілю може стати основним джерелом клієнтів.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Instagram маркетинг'), alternativeText: 'Смартфон з Instagram профілем квіткового магазину' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Оформлення профілю' }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Впізнаваний аватар — логотип або стилізоване фото' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Чітке біо: що ви пропонуєте, локація, як замовити' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Посилання на сайт або месенджер для замовлень' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Highlights з категоріями: букети, весілля, ціни, відгуки' }] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Контент-план' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Публікуйте регулярно: мінімум 4-5 постів на тиждень. Чергуйте формати: красиві фото букетів, процес створення, задоволені клієнти (з дозволом), поради з догляду, знайомство з командою. Stories — щодня, показуйте "закулісся".' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Фотографія' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Якісні фото — ключ до успіху. Використовуйте природне світло, нейтральний фон, різні ракурси. Показуйте масштаб — людська рука додає розуміння розміру. Редагуйте фото у єдиному стилі для цілісності стрічки.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Взаємодія з аудиторією' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Відповідайте на коментарі та повідомлення швидко — бажано протягом години. Ставте запитання у постах. Проводьте опитування в Stories. Дякуйте за відгуки та репости. Активна взаємодія підвищує охоплення алгоритмом.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Reels та відео' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Відео отримують більше охоплення. Знімайте таймлапс створення букету, розпакування поставки, "до і після" в\'янучого букету у вазі. Короткі навчальні ролики (як обрізати стебла) позиціонують вас як експерта.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Хештеги та геолокація' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Використовуйте мікс хештегів: брендові (#вашназва), локальні (#квітиКиїв), тематичні (#букетнареченої). Завжди додавайте геолокацію — це допомагає знайти вас місцевим клієнтам.' }],
      },
    ],
  },

  // 9. Екзотичні квіти
  {
    title: 'Екзотичні квіти: як працювати з рідкісними сортами',
    slug: 'ekzotychni-kvity',
    category: 'info',
    priority: 'low',
    pinned: false,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Екзотичні квіти — спосіб виділитися серед конкурентів та запропонувати клієнтам щось особливе. Але вони потребують спеціальних знань та умов.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Екзотичні квіти'), alternativeText: 'Тропічні та екзотичні квіти' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Популярні екзотичні квіти' }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Протея — символ Південної Африки, неймовірна текстура' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Банксія — австралійська квітка з унікальною формою' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Стреліція — "райський птах", тропічна класика' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Антуріум — серцеподібні глянцеві квіти' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Лотос — священна квітка Сходу' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Глоріоза — "полум\'яна лілія" з вигнутими пелюстками' }] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Особливості зберігання' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Тропічні квіти не переносять холоду нижче +10°C — їх не можна зберігати у звичайному квітковому холодильнику. Тримайте їх при кімнатній температурі або у теплій зоні. Обприскуйте водою для підтримки вологості.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Постачальники' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Екзотику найчастіше імпортують з Нідерландів, Еквадору, Колумбії та Південної Африки. Замовляйте заздалегідь — терміни доставки можуть сягати тижня. Працюйте з перевіреними імпортерами, які гарантують якість.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Ціноутворення' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Екзотичні квіти коштують у 3-5 разів дорожче звичайних. Маржа також вища, але й ризики більші. Замовляйте під конкретного клієнта або тестуйте попит маленькими партіями. Позиціонуйте як преміум-продукт.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Використання у композиціях' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Одна протея може стати центром мінімалістичного букету. Екзотичні квіти рідко поєднуються з класичними — створюйте або повністю тропічні композиції, або використовуйте як яскравий акцент серед зелені.' }],
      },
    ],
  },

  // 10. Корпоративні клієнти
  {
    title: 'Корпоративні клієнти: як залучити та утримати бізнес',
    slug: 'korporatyvni-kliienty',
    category: 'guide',
    priority: 'medium',
    pinned: false,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Корпоративний сектор — стабільне джерело доходу для квіткового магазину. Регулярні замовлення, передбачуваний обсяг та своєчасна оплата — переваги роботи з бізнесом.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Корпоративна флористика'), alternativeText: 'Квіти для офісу та корпоративних подій' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Типи корпоративних замовлень' }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Регулярне оформлення офісу та ресепшену' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Букети до свят для співробітників' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Подарунки клієнтам та партнерам' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Оформлення корпоративних подій' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Квіти для готелів та ресторанів' }] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Як знайти корпоративних клієнтів' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Почніть з локальних бізнесів поруч з магазином. Запропонуйте безкоштовну пробну композицію. Відвідуйте бізнес-нетворкінги. Налагодьте партнерство з готелями, ресторанами, event-агенціями. Розмістіть комерційну пропозицію на сайті.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Комерційна пропозиція' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Підготуйте професійну презентацію: портфоліо робіт, прайс-лист, умови співпраці, контакти. Пропонуйте знижки за обсяг та регулярність. Вкажіть переваги: доставка, заміна несвіжих квітів, персональний менеджер.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Обслуговування' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Корпоративні клієнти цінують надійність. Доставляйте вчасно, попереджайте про затримки. Пропонуйте автоматичні нагадування про свята. Ведіть базу дат народження керівництва. Надсилайте рахунки заздалегідь.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Особливості ціноутворення' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Для корпоративних клієнтів працюйте з фіксованим бюджетом. Наприклад: "композиція на ресепшен до 1500 грн/тиждень". Це спрощує планування для обох сторін. Пропонуйте річні контракти зі знижкою.' }],
      },
    ],
  },

  // 11. Сухоцвіти
  {
    title: 'Сухоцвіти та стабілізовані квіти: новий тренд',
    slug: 'sukhostvity-ta-stabilizovani-kvity',
    category: 'info',
    priority: 'medium',
    pinned: false,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Сухоцвіти переживають ренесанс популярності. Екологічність, довговічність та унікальна естетика роблять їх привабливою альтернативою свіжим квітам.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Сухоцвіти'), alternativeText: 'Композиція з сухоцвітів' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Види сухоцвітів' }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Натурально висушені: лаванда, евкаліпт, пампасна трава, бавовна' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Стабілізовані (консервовані гліцерином): троянди, гортензії, мохи' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Фарбовані сухоцвіти: яскраві неприродні кольори для акцентів' }] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Переваги для бізнесу' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Сухоцвіти не псуються — немає списання. Їх можна готувати заздалегідь у спокійні дні. Не потребують холодильника. Ідеальні для інтернет-магазину — витримують доставку. Маржа вища, ніж на свіжих квітах.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Популярні формати' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Букети у стилі "бохо" з пампасною травою та евкаліптом. Композиції у вазах для декору інтер\'єру. Вінки на двері. Міні-букетики для подарунків. Сухоцвіти у смолі (jewelry). Весільний декор — арки, бутоньєрки.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Як сушити квіти' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Найпростіший метод — підвісити квіти головою вниз у сухому темному місці на 2-3 тижні. Для збереження форми використовуйте силікагель. Для яскравості кольору — сушіння в мікрохвильовій печі з силікагелем.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Зберігання та догляд' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Сухоцвіти бояться вологи та прямого сонця. Зберігайте у сухому місці, періодично здувайте пил. Стабілізовані квіти можуть зберігати вигляд 2-5 років при правильному догляді. Не мочіть водою!' }],
      },
    ],
  },

  // 12. Помилки початківців
  {
    title: 'Топ-10 помилок початківців у квітковому бізнесі',
    slug: 'top-10-pomylok-pochatkivtsiv',
    category: 'note',
    priority: 'high',
    pinned: false,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Квітковий бізнес виглядає романтично, але приховує багато пасток. Розглянемо типові помилки, яких варто уникати.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Помилки у бізнесі'), alternativeText: 'Навчання на помилках' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '1. Занадто великий початковий асортимент' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Бажання мати "все для всіх" призводить до великих списань. Почніть з 10-15 позицій, що добре продаються, та поступово розширюйте асортимент на основі попиту.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '2. Неправильне ціноутворення' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Занижені ціни не покривають витрат, завищені — відлякують клієнтів. Враховуйте всі витрати: закупівля, оренда, зарплати, списання, упаковка, доставка. Маржа має бути мінімум 100% від закупівлі.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '3. Ігнорування обліку' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Без чіткого обліку продажів, списань та витрат неможливо оцінити прибутковість. Використовуйте POS-систему з першого дня. Аналізуйте дані щотижня.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '4. Залежність від одного постачальника' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Якщо єдиний постачальник підведе, ви залишитесь без товару. Завжди майте 2-3 резервних контакти, навіть якщо основний працює ідеально.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '5. Неправильне зберігання' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Квіти — живий товар. Неправильна температура, брудна вода, сусідство з фруктами прискорюють в\'янення. Інвестуйте у якісне холодильне обладнання та навчіть персонал.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '6. Відсутність онлайн-присутності' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'У 2024 році клієнти шукають квіти в інтернеті. Відсутність Instagram чи сайту означає втрату значної частини аудиторії. Мінімум — профіль у соцмережах та Google Maps.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '7. Ігнорування свят' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Непідготовленість до 8 березня чи Дня закоханих — катастрофа. Плануйте закупівлі та персонал за місяць до пікових дат.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '8. Економія на персоналі' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Некваліфікований продавець може зіпсувати враження від найкращих квітів. Інвестуйте в навчання. Мотивований персонал — обличчя вашого бізнесу.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '9. Відсутність унікальності' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Якщо ваш магазин нічим не відрізняється від сусіднього, клієнт обере за ціною. Знайдіть свою нішу: екзотичні квіти, весільна флористика, еко-букети, преміум-сервіс.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '10. Вигорання' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Квітковий бізнес вимагає роботи у вихідні та свята. Плануйте відпочинок, делегуйте рутину, автоматизуйте процеси. Збережіть любов до квітів, з якої все почалось.' }],
      },
    ],
  },

  // 13. Пакування
  {
    title: 'Пакування букетів: від крафту до люксу',
    slug: 'pakuvannia-buketiv',
    category: 'procedure',
    priority: 'low',
    pinned: false,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Пакування — невід\'ємна частина букету. Воно захищає квіти, підкреслює їх красу та формує враження про магазин. Правильне пакування може збільшити вартість букету на 20-30%.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Пакування букетів'), alternativeText: 'Різні стилі пакування букетів' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Основні матеріали' }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Крафтовий папір — еко-тренд, підходить для натуральних букетів' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Калька — напівпрозора, елегантна, не відволікає від квітів' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Органза та сітка — для урочистих композицій' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Фетр — модний матеріал з текстурою' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Плівка — практична, захищає від вологи' }] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Стилі пакування' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Мінімалізм: один шар нейтрального паперу, просто перев\'язаний стрічкою. Класика: кілька шарів з оформленням краю. Люкс: коробка-шляпа, дерев\'яний ящик або дизайнерська ваза. Еко: повторно використовувані контейнери, тканина.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Колірні рішення' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Пакування має доповнювати квіти, а не конкурувати з ними. Нейтральні тони (бежевий, білий, сірий) підходять до будь-яких букетів. Яскраве пакування — тільки для монохромних композицій. Чорний колір — для преміум-сегменту.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Брендування' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Додавайте елементи бренду: наклейки з логотипом, фірмові стрічки, візитки, листівки з порадами з догляду. Це підвищує впізнаваність та стимулює повторні покупки. Клієнт запам\'ятає, де купив красивий букет.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Захисна функція' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Пакування захищає квіти під час транспортування. Використовуйте внутрішню плівку для утримання вологи. Для ніжних квітів — каркас з картону. Для доставки — міцні коробки з фіксацією букету.' }],
      },
    ],
  },

  // 14. Гортензії
  {
    title: 'Все про гортензії: сезон, догляд, використання',
    slug: 'vse-pro-hortenzii',
    category: 'info',
    priority: 'low',
    pinned: false,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Гортензія — королева літнього сезону. Її пишні суцвіття стали must-have для весільних букетів та інтер\'єрного декору. Розглянемо особливості роботи з цією квіткою.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Гортензії'), alternativeText: 'Букет з блакитних гортензій' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Сезонність та кольори' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Сезон гортензій — травень-жовтень. Найпоширеніші кольори: білий, рожевий, блакитний, фіолетовий, зелений. Є також біколорні та "антикварні" сорти з приглушеними відтінками. Колір залежить від кислотності ґрунту — у кислому синіють, у лужному рожевіють.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Особливості зберігання' }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Температура +5...+8°C — оптимальна' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Обріжте стебло під кутом, розщепіть кінець' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Використовуйте багато води — гортензії "п\'ють" активно' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Обприскуйте суцвіття водою' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Уникайте протягів та прямого сонця' }] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Реанімація в\'янучих гортензій' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Гортензії швидко в\'януть, але легко відновлюються. Занурте увесь букет (разом з суцвіттями) у прохолодну воду на 30-60 хвилин. Цей метод працює, бо гортензії вбирають воду через пелюстки. Після процедури обріжте стебла та поставте у свіжу воду.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Використання у флористиці' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Одна велика гортензія може замінити 10-15 дрібних квітів — це робить її економічно вигідною для об\'ємних композицій. Ідеальна для весільних арок, центральних композицій на столи, букетів нареченої. Добре поєднується з трояндами, еустомами, півоніями.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Сушіння гортензій' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Гортензії чудово сушаться та зберігають форму. Найкращий час для сушіння — кінець сезону, коли пелюстки стають щільнішими. Підвісьте головою вниз або залиште у вазі без води — вони висохнуть природно за 2-3 тижні.' }],
      },
    ],
  },

  // 15. Святкові композиції
  {
    title: 'Святкові композиції: ідеї для різних приводів',
    slug: 'sviatkovi-kompozytsii',
    category: 'guide',
    priority: 'medium',
    pinned: false,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Кожне свято має свою символіку та традиції у виборі квітів. Розуміння цих нюансів допоможе створювати доречні та затребувані композиції.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Святкові букети'), alternativeText: 'Різноманітні святкові композиції' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'День народження' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Найуніверсальніший привід. Обирайте квіти залежно від віку та статі одержувача. Для дівчат — рожеві та пастельні тони. Для жінок елегантного віку — класичні троянди, лілії. Для чоловіків — стриманий декор, темна зелень, екзотика.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '14 лютого — День закоханих' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Червоні троянди — класика жанру. Але для тих, хто хоче виділитись: серцеподібні композиції, тюльпани, орхідеї, композиції у формі серця. Популярні подарункові набори: квіти + шоколад/вино. Готуйте подвійний запас — попит пік.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '8 березня — Міжнародний жіночий день' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Найбільший день у році для квіткового бізнесу. Тюльпани — символ свята. Також популярні мімози, нарциси, гіацинти. Пропонуйте корпоративні замовлення: однакові букети для всіх співробітниць. Найактивніший час — ранок 8 березня.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Великдень' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Весняні квіти у пастельних тонах: нарциси, тюльпани, гіацинти, фрезії. Додавайте декор: пташки, кролики, яйця, верба. Популярні настільні композиції для святкового столу.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'День матері' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Ніжні букети з теплим посланням. Рожеві троянди, гвоздики, еустоми. Додавайте листівку з персональним текстом. Пропонуйте доставку-сюрприз на адресу мами.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: '1 вересня — День знань' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Букети для вчителів: гладіолуси, айстри, жоржини, хризантеми. Осінні кольори: жовтий, помаранчевий, бордовий. Пропонуйте невеликі доступні букети — основні покупці — батьки школярів з обмеженим бюджетом.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Новий рік та Різдво' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Композиції з ялиновими гілками, шишками, свічками. Пуансетії, амариліси, гіпеаструми — класичні різдвяні квіти. Біло-червона або біло-золота гама. Популярні вінки на двері та святкові кошики.' }],
      },
    ],
  },

  // 16. Бізнес-план
  {
    title: 'Базовий бізнес-план квіткового магазину',
    slug: 'biznes-plan-kvitkovoho-mahazyna',
    category: 'note',
    priority: 'high',
    pinned: true,
    content: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Бізнес-план — дорожня карта вашого квіткового бізнесу. Він допомагає оцінити інвестиції, спланувати витрати та спрогнозувати прибутковість.' }],
      },
      {
        type: 'image',
        image: { url: placeholderImage('Бізнес-план'), alternativeText: 'Планування квіткового бізнесу' },
        children: [{ type: 'text', text: '' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Початкові інвестиції' }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Оренда та ремонт приміщення: залежить від локації' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Холодильне обладнання: $2,000-5,000' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Меблі та стелажі: $1,000-3,000' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Перша закупівля квітів: $1,000-2,000' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Пакувальні матеріали: $500-1,000' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'POS-система та каса: $500-1,500' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Вивіска та реклама: $500-2,000' }] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Щомісячні витрати' }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Оренда приміщення' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Зарплата персоналу' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Закупівля квітів (40-50% від виручки)' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Комунальні послуги (електроенергія для холодильників)' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Пакувальні матеріали' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Маркетинг та реклама' }] },
        ],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Джерела доходу' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Роздрібний продаж букетів (60-70% доходу). Весільна флористика (20-30% доходу, вища маржа). Корпоративні клієнти (5-10% доходу, стабільність). Майстер-класи та додаткові послуги.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Маржинальність' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Середня маржа на букети: 100-150% від закупівлі. На готові букети вища, на замовлення — нижча. Весільні замовлення: 150-200% маржі. Враховуйте списання 10-20% товару.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Точка беззбитковості' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Розрахуйте мінімальний обсяг продажів, що покриває всі витрати. Зазвичай квітковий магазин виходить на самоокупність через 6-12 місяців роботи. Перший рік — період інвестицій у бренд та клієнтську базу.' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Ключові метрики' }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Відстежуйте: середній чек, кількість транзакцій на день, відсоток списання, повторні покупки, конверсію в Instagram. Аналізуйте щотижня та коригуйте стратегію.' }],
      },
    ],
  },
];

export async function seedArticles(strapi: Core.Strapi): Promise<void> {
  strapi.log.info('📝 Starting articles seed...');

  try {
    // Check if articles already exist
    // @ts-expect-error - type will be generated after first run
    const existingArticles = await strapi.documents('api::article.article').findMany({
      fields: ['documentId'],
    });

    if (existingArticles.length > 0) {
      strapi.log.info(`Database already contains ${existingArticles.length} articles. Skipping seed.`);
      return;
    }

    // Create articles
    for (const articleData of articlesData) {
      // @ts-expect-error - type will be generated after first run
      await strapi.documents('api::article.article').create({
        data: articleData as unknown,
      });
      strapi.log.info(`✅ Created article: ${articleData.title}`);
    }

    strapi.log.info(`✨ Articles seed completed! Created ${articlesData.length} articles.`);
  } catch (error) {
    strapi.log.error('❌ Error during articles seed:', error);
    throw error;
  }
}
