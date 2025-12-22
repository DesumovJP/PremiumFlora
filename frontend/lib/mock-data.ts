import {
  AlertTriangle,
  Clock3,
  History,
  Leaf,
  LineChart,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  CartLine,
  CategorySplit,
  Client,
  Kpi,
  NavItem,
  Order,
  OrdersPerWeek,
  Product,
  SupplyPlan,
  TopProduct,
  WeeklyRevenue,
} from "./types";

export const navItems: NavItem[] = [
  { id: "pos", label: "POS Термінал", icon: ShoppingBag },
  { id: "products", label: "Товари", icon: Package },
  { id: "clients", label: "Клієнти", icon: Users },
  { id: "analytics", label: "Аналітика", icon: LineChart },
  { id: "history", label: "Історія", icon: History },
];

export const products: Product[] = [
  {
    id: "red-rose",
    name: "Троянда червона",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "50 см", price: 62, stock: 520, length: 50 },
      { size: "60 см", price: 75, stock: 450, length: 60 },
      { size: "70 см", price: 90, stock: 320, length: 70 },
      { size: "80 см", price: 105, stock: 180, length: 80 },
      { size: "90 см", price: 130, stock: 120, length: 90 },
    ],
  },
  {
    id: "white-rose",
    name: "Троянда біла",
    image:
      "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 75, stock: 380, length: 60 },
      { size: "70 см", price: 90, stock: 290, length: 70 },
      { size: "80 см", price: 105, stock: 210, length: 80 },
    ],
  },
  {
    id: "chrys",
    name: "Хризантема",
    image:
      "https://images.unsplash.com/photo-1724073339133-938ada52e511?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 54, stock: 520, length: 60 },
      { size: "70 см", price: 66, stock: 380, length: 70 },
    ],
  },
  {
    id: "lily-white",
    name: "Лілія біла",
    image:
      "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "70 см", price: 120, stock: 240, length: 70 },
      { size: "80 см", price: 135, stock: 190, length: 80 },
    ],
  },
  {
    id: "carnation",
    name: "Гвоздика рожева",
    image:
      "https://images.unsplash.com/photo-1613753207271-a79fb7388fd3?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 45, stock: 610, length: 60 },
      { size: "70 см", price: 54, stock: 480, length: 70 },
      { size: "80 см", price: 72, stock: 320, length: 80 },
    ],
  },
  {
    id: "tulip",
    name: "Тюльпан червоний",
    image:
      "https://images.unsplash.com/photo-1559153938-5a828158d753?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 60, stock: 390, length: 60 },
      { size: "70 см", price: 72, stock: 280, length: 70 },
    ],
  },
  {
    id: "hydrangea",
    name: "Гортензія блакитна",
    image:
      "https://images.unsplash.com/photo-1475713645614-bbadad2ed43d?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "50 см", price: 95, stock: 260, length: 50 },
      { size: "60 см", price: 110, stock: 180, length: 60 },
    ],
  },
  {
    id: "eustoma",
    name: "Еустома біла",
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "55 см", price: 80, stock: 340, length: 55 },
      { size: "65 см", price: 95, stock: 240, length: 65 },
    ],
  },
  {
    id: "peony",
    name: "Півонія рожева",
    image:
      "https://images.unsplash.com/photo-1496925538-49c4af1b7858?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "50 см", price: 140, stock: 150, length: 50 },
      { size: "60 см", price: 160, stock: 130, length: 60 },
    ],
  },
  {
    id: "alstro",
    name: "Альстромерія мікс",
    image:
      "https://images.unsplash.com/photo-1438109491414-7198515b166b?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 55, stock: 420, length: 60 },
      { size: "70 см", price: 68, stock: 310, length: 70 },
    ],
  },
  {
    id: "orchid",
    name: "Орхідея біла",
    image:
      "https://images.unsplash.com/photo-1710524784485-5c77ae822ecc?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "50 см", price: 180, stock: 90, length: 50 },
      { size: "60 см", price: 210, stock: 70, length: 60 },
    ],
  },
  {
    id: "tansy",
    name: "Танацетум",
    image:
      "https://images.unsplash.com/photo-1742544686707-718a0ffd5c69?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "55 см", price: 48, stock: 360, length: 55 },
      { size: "65 см", price: 58, stock: 250, length: 65 },
    ],
  },
  {
    id: "rose-spray-pink",
    name: "Спрей-троянда рожева",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "50 см", price: 85, stock: 260, length: 50 },
      { size: "60 см", price: 96, stock: 210, length: 60 },
    ],
  },
  {
    id: "rose-spray-white",
    name: "Спрей-троянда біла",
    image:
      "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "50 см", price: 82, stock: 240, length: 50 },
      { size: "60 см", price: 92, stock: 200, length: 60 },
    ],
  },
  {
    id: "rose-peach",
    name: "Троянда персикова",
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 88, stock: 320, length: 60 },
      { size: "70 см", price: 102, stock: 260, length: 70 },
    ],
  },
  {
    id: "rose-lavender",
    name: "Троянда лавандова",
    image:
      "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 92, stock: 210, length: 60 },
      { size: "70 см", price: 110, stock: 180, length: 70 },
    ],
  },
  {
    id: "gerbera-mix",
    name: "Гербера мікс",
    image:
      "https://images.unsplash.com/photo-1519376918334-c52cd69e55db?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "50 см", price: 48, stock: 480, length: 50 },
      { size: "60 см", price: 56, stock: 380, length: 60 },
    ],
  },
  {
    id: "gerbera-white",
    name: "Гербера біла",
    image:
      "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "50 см", price: 50, stock: 360, length: 50 },
      { size: "60 см", price: 58, stock: 290, length: 60 },
    ],
  },
  {
    id: "eucalyptus",
    name: "Евкаліпт мікс",
    image:
      "https://images.unsplash.com/photo-1508610048659-a06c66986c63?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 40, stock: 520, length: 60 },
      { size: "80 см", price: 55, stock: 410, length: 80 },
    ],
  },
  {
    id: "eucalyptus-baby",
    name: "Евкаліпт бейбі блю",
    image:
      "https://images.unsplash.com/photo-1519376918334-c52cd69e55db?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 44, stock: 430, length: 60 },
      { size: "80 см", price: 59, stock: 360, length: 80 },
    ],
  },
  {
    id: "greenery-mix",
    name: "Зелень флористична мікс",
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 38, stock: 610, length: 60 },
      { size: "70 см", price: 45, stock: 520, length: 70 },
    ],
  },
  {
    id: "ranunculus",
    name: "Ранункулюс",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "40 см", price: 72, stock: 260, length: 40 },
      { size: "50 см", price: 85, stock: 210, length: 50 },
    ],
  },
  {
    id: "lisianthus-mix",
    name: "Лізіантус мікс",
    image:
      "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "55 см", price: 78, stock: 340, length: 55 },
      { size: "65 см", price: 92, stock: 260, length: 65 },
    ],
  },
  {
    id: "anthurium",
    name: "Антуріум червоний",
    image:
      "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 160, stock: 120, length: 60 },
      { size: "70 см", price: 185, stock: 90, length: 70 },
    ],
  },
  {
    id: "anthurium-white",
    name: "Антуріум білий",
    image:
      "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 165, stock: 110, length: 60 },
      { size: "70 см", price: 190, stock: 80, length: 70 },
    ],
  },
  {
    id: "calla-white",
    name: "Калла біла",
    image:
      "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 150, stock: 140, length: 60 },
      { size: "70 см", price: 170, stock: 110, length: 70 },
    ],
  },
  {
    id: "calla-colored",
    name: "Калла кольорова мікс",
    image:
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 155, stock: 130, length: 60 },
      { size: "70 см", price: 178, stock: 95, length: 70 },
    ],
  },
  {
    id: "dahlia",
    name: "Жоржина мікс",
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 70, stock: 280, length: 60 },
      { size: "70 см", price: 82, stock: 220, length: 70 },
    ],
  },
  {
    id: "alstro-white",
    name: "Альстромерія біла",
    image:
      "https://images.unsplash.com/photo-1438109491414-7198515b166b?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 58, stock: 390, length: 60 },
      { size: "70 см", price: 70, stock: 310, length: 70 },
    ],
  },
  {
    id: "alstro-pink",
    name: "Альстромерія рожева",
    image:
      "https://images.unsplash.com/photo-1519376918334-c52cd69e55db?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 60, stock: 380, length: 60 },
      { size: "70 см", price: 72, stock: 300, length: 70 },
    ],
  },
  {
    id: "stock-matthiola",
    name: "Матіола (сток)",
    image:
      "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 65, stock: 260, length: 60 },
      { size: "70 см", price: 78, stock: 210, length: 70 },
    ],
  },
  {
    id: "statice",
    name: "Статиця",
    image:
      "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 52, stock: 320, length: 60 },
      { size: "70 см", price: 60, stock: 260, length: 70 },
    ],
  },
  {
    id: "gypso",
    name: "Гіпсофіла біла",
    image:
      "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 48, stock: 540, length: 60 },
      { size: "70 см", price: 56, stock: 430, length: 70 },
    ],
  },
  {
    id: "gypso-colored",
    name: "Гіпсофіла кольорова",
    image:
      "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 52, stock: 480, length: 60 },
      { size: "70 см", price: 60, stock: 360, length: 70 },
    ],
  },
  {
    id: "sunflower",
    name: "Соняшник декоративний",
    image:
      "https://images.unsplash.com/photo-1475713645614-bbadad2ed43d?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "70 см", price: 58, stock: 310, length: 70 },
      { size: "80 см", price: 70, stock: 240, length: 80 },
    ],
  },
  {
    id: "chrys-white",
    name: "Хризантема біла",
    image:
      "https://images.unsplash.com/photo-1724073339133-938ada52e511?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 56, stock: 430, length: 60 },
      { size: "70 см", price: 68, stock: 320, length: 70 },
    ],
  },
  {
    id: "chrys-santini",
    name: "Сантіні мікс",
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { size: "60 см", price: 54, stock: 450, length: 60 },
      { size: "70 см", price: 66, stock: 340, length: 70 },
    ],
  },
];

export const clients: Client[] = [
  {
    id: "lily",
    name: 'Квіткова крамниця "Лілія"',
    contact: "+380 67 123 4567",
    email: "lilya@flowers.ua",
    city: "м. Київ, вул. Хрещатик, 22",
    orders: 48,
    spent: 940_000,
    lastOrder: "28.11.2025",
    isVip: true,
  },
  {
    id: "troianda",
    name: 'Салон "Троянда"',
    contact: "+380 93 456 7890",
    email: "troianda@mail.ua",
    city: "м. Львів, пр. Свободи, 15",
    orders: 36,
    spent: 668_000,
    lastOrder: "30.11.2025",
    isVip: true,
  },
  {
    id: "flora",
    name: 'Магазин "Флора"',
    contact: "+380 50 789 0123",
    email: "flora@gmail.com",
    city: "м. Одеса, вул. Дерибасівська, 8",
    orders: 52,
    spent: 1_175_000,
    lastOrder: "01.12.2025",
    isVip: true,
  },
  {
    id: "orchid",
    name: 'Бутик "Орхідея"',
    contact: "+380 63 234 5678",
    email: "orchid@ukr.net",
    city: "м. Харків, вул. Сумська, 45",
    orders: 28,
    spent: 504_000,
    lastOrder: "15.11.2025",
  },
  {
    id: "kyiv-roses",
    name: 'Салон "Роза-Люкс"',
    contact: "+380 44 789 0011",
    email: "luxrose@kiev.ua",
    city: "м. Київ, вул. Басейна, 12",
    orders: 42,
    spent: 812_000,
    lastOrder: "10.12.2025",
  },
  {
    id: "kyiv-green",
    name: 'Студія "Green City"',
    contact: "+380 44 555 3344",
    email: "hello@greencity.ua",
    city: "м. Київ, вул. Гончара, 9",
    orders: 31,
    spent: 654_000,
    lastOrder: "07.12.2025",
  },
  {
    id: "kyiv-botan",
    name: 'Бутік "Ботан"',
    contact: "+380 44 222 7788",
    email: "info@botan.ua",
    city: "м. Київ, бул. Лесі Українки, 26",
    orders: 27,
    spent: 522_000,
    lastOrder: "02.12.2025",
  },
  {
    id: "lviv-buket",
    name: 'Майстерня "Букет Львів"',
    contact: "+380 32 456 1122",
    email: "buket.lviv@mail.ua",
    city: "м. Львів, пл. Ринок, 10",
    orders: 33,
    spent: 578_000,
    lastOrder: "05.12.2025",
  },
];

export const initialCart: CartLine[] = [
  {
    id: "white-rose-70",
    name: "Троянда біла",
    size: "70 см",
    price: 90,
    qty: 10,
    image: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=1200&q=80",
    flowerSlug: "white-rose",
    length: 70,
  },
  {
    id: "white-rose-80",
    name: "Троянда біла",
    size: "80 см",
    price: 105,
    qty: 50,
    image: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=1200&q=80",
    flowerSlug: "white-rose",
    length: 80,
  },
  {
    id: "red-rose-70",
    name: "Троянда червона",
    size: "70 см",
    price: 90,
    qty: 10,
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    flowerSlug: "red-rose",
    length: 70,
  },
  {
    id: "tulip-60",
    name: "Тюльпан червоний",
    size: "60 см",
    flowerSlug: "tulip",
    length: 60,
    price: 60,
    qty: 10,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80",
  },
];

export const latestOrders: Order[] = [
  {
    id: "008",
    status: "Очікується",
    date: "01.12.2025",
    list: "Троянда червона (80см) x120, Троянда біла (80см) x100",
    amount: 61600,
  },
  {
    id: "009",
    status: "Оплачено",
    date: "25.11.2025",
    list: "Хризантема (60см) x200, Хризантема (70см) x150",
    amount: 55200,
  },
  {
    id: "010",
    status: "Оплачено",
    date: "18.11.2025",
    list: "Лілія біла (70см) x60, Тюльпан червоний (70см) x100",
    amount: 38400,
  },
];

export const kpis: Kpi[] = [
  { label: "Виручка за місяць", value: "1,780,000 грн", delta: "+12.5%" },
  { label: "Замовлень", value: "99", delta: "+8.2%" },
  { label: "Активних клієнтів", value: "48", delta: "+5.4%" },
  { label: "Середній чек", value: "17,980 грн", delta: "+3.8%" },
  { label: "Запасів на складі", value: "4,220 шт", delta: "+4.1%" },
];

export const weeklyRevenue: WeeklyRevenue = [320000, 410000, 520000, 480000];

export const categorySplit: CategorySplit[] = [
  { name: "Троянди", value: 35, color: "bg-emerald-500" },
  { name: "Хризантеми", value: 25, color: "bg-emerald-400" },
  { name: "Лілії", value: 20, color: "bg-emerald-300" },
  { name: "Гвоздики", value: 15, color: "bg-emerald-200" },
  { name: "Тюльпани", value: 5, color: "bg-emerald-100" },
];

export const ordersPerWeek: OrdersPerWeek = [18, 20, 21, 19];

export const topProducts: TopProduct[] = [
  { name: "Троянда червона 70см", sold: 2400, revenue: 576000, share: 100 },
  { name: "Хризантема 60см", sold: 2100, revenue: 302400, share: 53 },
  { name: "Троянда біла 60см", sold: 1800, revenue: 360000, share: 63 },
  { name: "Лілія біла 70см", sold: 1200, revenue: 384000, share: 67 },
  { name: "Гвоздика рожева 60см", sold: 1900, revenue: 228000, share: 40 },
];

export const supplyPlan: SupplyPlan = {
  nextDate: "П'ятниця, 6 грудня 2025",
  recommended: "~850 шт",
  currentStock: "3,410 шт",
  forecast: "~620 шт/тиждень",
};

export const supplyCard = {
  title: "Наступна поставка",
  subtitle: "",
  icon: Clock3,
};

export const lowStockAlert = {
  icon: AlertTriangle,
  messageTitle: "Попередження про низькі залишки",
  message:
    "Троянда червона (80см) — залишилось 180 шт. Наступна поставка у п'ятницю.",
};

export const brandCard = {
  title: "Premium Flora",
  subtitle: "Квіти для Вас",
  icon: Leaf,
};

export const forecastActions = {
  exportLabel: "Експорт XLS",
  forecastLabel: "Побудувати прогноз",
  icon: TrendingUp,
};

// Blog posts mock data
export const blogPosts = [
  {
    id: "1",
    title: "Як зберігати свіжість квітів: поради від експертів",
    excerpt: "Дізнайтеся про найкращі способи збереження свіжості квітів для максимальної довговічності та привабливого вигляду.",
    content: `
      <h2>Чому важливо правильно зберігати квіти?</h2>
      <p>Свіжі квіти - це живий продукт, який потребує особливого догляду. Правильне зберігання може продовжити життя квітів на 50-100%, що критично важливо для квіткового бізнесу. Кожен день свіжості - це додатковий прибуток та задоволені клієнти.</p>
      
      <img src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80" alt="Зберігання квітів" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Підготовка квітів до зберігання</h2>
      <p>Перший крок до успішного зберігання - правильна підготовка. Ось що потрібно зробити одразу після отримання квітів:</p>
      
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Обрізання стебел:</strong> Обріжте стебла під кутом 45 градусів під проточною водою. Це забезпечить максимальну площу поверхні для поглинання води.</li>
        <li><strong>Видалення листя:</strong> Приберіть усі листки, які будуть під водою - вони сприяють розвитку бактерій.</li>
        <li><strong>Очищення ваз:</strong> Використовуйте тільки чисту посуду. Бактерії - головний ворог свіжості квітів.</li>
        <li><strong>Температура води:</strong> Для більшості квітів оптимальна температура води - 20-25°C, але для троянд краще використовувати теплу воду (30-35°C).</li>
      </ul>
      
      <img src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&q=80" alt="Обрізання квітів" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Умови зберігання: температура та вологість</h2>
      <p>Ідеальні умови зберігання - це основа успіху. Більшість квітів найкраще зберігаються при температурі 2-4°C. Це сповільнює метаболізм та продовжує життя квітів.</p>
      
      <p><strong>Вологість повітря</strong> повинна бути в межах 85-95%. Занадто сухе повітря призводить до в'янення, а надмірна вологість сприяє розвитку грибків.</p>
      
      <h2>Консерванти та поживні речовини</h2>
      <p>Спеціальні консерванти для квітів - це не марна витрата, а інвестиція в якість. Вони містять:</p>
      
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Цукор (глюкозу):</strong> Додає енергію для підтримки життя квітів</li>
        <li><strong>Кислоту (цитрусову або лимонну):</strong> Знижує pH води, що покращує поглинання</li>
        <li><strong>Антибактеріальні компоненти:</strong> Запобігають розвитку бактерій у воді</li>
        <li><strong>Блокатори етилену:</strong> Запобігають передчасному старінню</li>
      </ul>
      
      <img src="https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1200&q=80" alt="Консерванти для квітів" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Особливості зберігання різних видів квітів</h2>
      
      <h3>Троянди</h3>
      <p>Троянди потребують особливої уваги. Зберігайте їх у прохолодному місці, регулярно міняйте воду та додавайте консервант. Обрізайте стебла кожні 2-3 дні.</p>
      
      <h3>Лілії</h3>
      <p>Лілії виділяють багато пилку, тому зберігайте їх окремо від інших квітів. Вони добре зберігаються при низькій температурі.</p>
      
      <h3>Хризантеми</h3>
      <p>Хризантеми - одні з найвитриваліших квітів. Вони можуть зберігатися до 2-3 тижнів при правильному догляді.</p>
      
      <h2>Практичні поради для квіткового бізнесу</h2>
      <p>Якщо ви ведете квітковий бізнес, ось кілька важливих моментів:</p>
      
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Інвестуйте в якісну холодильну камеру з контролем температури та вологості</li>
        <li>Навчіть персонал правильним технікам обробки квітів</li>
        <li>Використовуйте консерванти систематично - це економія на збитках</li>
        <li>Ведіть облік термінів зберігання для різних видів квітів</li>
        <li>Регулярно очищайте та дезінфікуйте холодильні камери</li>
      </ul>
      
      <h2>Висновок</h2>
      <p>Правильне зберігання квітів - це не просто техніка, а ціла наука. Дотримуючись цих порад, ви не тільки продовжите життя квітів, але й значно покращите якість своєї продукції та задоволеність клієнтів. Пам'ятайте: кожна квітка, яка залишається свіжою на день довше - це ваш успіх.</p>
    `,
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800",
    date: "2024-01-15",
    author: "Марія Квіткова",
    category: "Догляд",
  },
  {
    id: "2",
    title: "Тренди у квітковому дизайні 2024",
    excerpt: "Огляд найпопулярніших трендів у квітковому дизайні цього року: від мінімалізму до яскравих кольорових акцентів.",
    content: `
      <h2>Квітковий дизайн у 2024: що в моді?</h2>
      <p>Світ квіткового дизайну постійно еволюціонує, і 2024 рік приніс цікаві нововведення. Від мінімалістичних композицій до яскравих кольорових експериментів - розглянемо основні тренди, які формують індустрію сьогодні.</p>
      
      <img src="https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=1200&q=80" alt="Квітковий дизайн 2024" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Мінімалізм та архітектурна простота</h2>
      <p>Мінімалізм продовжує домінувати у квітковому дизайні. Сучасні композиції акцентують увагу на формі, структурі та негативному просторі. Менше квітів, але більше виразності.</p>
      
      <p><strong>Ключові елементи мінімалістичного дизайну:</strong></p>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Монохромні або двохкольорові палітри</li>
        <li>Акцент на одній-двох видах квітів</li>
        <li>Геометричні форми та чіткі лінії</li>
        <li>Мінімум декоративних елементів</li>
      </ul>
      
      <img src="https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1200&q=80" alt="Мінімалістичний букет" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Яскраві кольори та сміливі комбінації</h2>
      <p>На противагу мінімалізму, яскраві та насичені кольори також займають важливе місце в трендах 2024. Особливо популярні:</p>
      
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Помаранчевий:</strong> Символ енергії та оптимізму</li>
        <li><strong>Рожевий:</strong> Від ніжних пастельних до яскравих фуксій</li>
        <li><strong>Фіолетовий:</strong> Містичний та елегантний</li>
        <li><strong>Жовтий:</strong> Сонячний та життєрадісний</li>
      </ul>
      
      <p>Сміливі кольорові комбінації, які раніше вважалися несумісними, тепер створюють динамічні та виразні композиції.</p>
      
      <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80" alt="Яскраві квіти" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Екологічність та локальні квіти</h2>
      <p>Екологічна свідомість стає все більш важливою для клієнтів. Тренд на локальні та сезонні квіти набирає обертів.</p>
      
      <h3>Переваги локальних квітів:</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Менший вуглецевий слід</li>
        <li>Краща свіжість та довговічність</li>
        <li>Підтримка місцевих виробників</li>
        <li>Унікальність сезонних композицій</li>
      </ul>
      
      <h2>Текстури та матеріали</h2>
      <p>2024 рік приніс акцент на різноманітність текстур. Комбінування гладких та шорстких поверхонь, м'яких та твердих елементів створює цікаві тактильні композиції.</p>
      
      <p><strong>Популярні текстури:</strong></p>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Сухі квіти та рослини</li>
        <li>Евкаліпт та інша зелень з цікавими формами</li>
        <li>Ягоди та плоди в композиціях</li>
        <li>Декоративні трави та злаки</li>
      </ul>
      
      <img src="https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1200&q=80" alt="Текстури в квітковому дизайні" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Особливі події та стилі</h2>
      
      <h3>Весільні тренди</h3>
      <p>Для весіль популярні природні, "дикі" композиції з акцентом на органічність. Букети виглядають так, ніби їх щойно зібрали в саду.</p>
      
      <h3>Корпоративні події</h3>
      <p>Для бізнес-подій актуальні елегантні та структуровані композиції з акцентом на якість та професійність.</p>
      
      <h2>Як застосувати тренди у вашому бізнесі</h2>
      <p>Для квіткового бізнесу важливо бути в курсі трендів, але не слід сліпо слідувати за всіма. Ось практичні поради:</p>
      
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Створюйте портфоліо з прикладами трендових композицій</li>
        <li>Пропонуйте клієнтам варіанти в різних стилях</li>
        <li>Навчайте персонал новим технікам та підходам</li>
        <li>Стежте за соціальними мережами та інспіраціями</li>
        <li>Експериментуйте, але завжди зберігайте якість</li>
      </ul>
      
      <h2>Висновок</h2>
      <p>Тренди у квітковому дизайні 2024 року показують різноманітність та свободу творчості. Від мінімалізму до яскравих кольорів, від екологічності до сміливих комбінацій - головне залишається незмінним: якість, увага до деталей та любов до квітів. Слідкуйте за трендами, але завжди додавайте свій унікальний стиль.</p>
    `,
    image: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=800",
    date: "2024-01-10",
    author: "Олександр Флорист",
    category: "Тренди",
  },
  {
    id: "3",
    title: "Вибір квітів для весілля: повний гайд",
    excerpt: "Детальний посібник з вибору квітів для весільного свята: від букетів до декору залу.",
    content: `
      <h2>Квіти для весілля: з чого почати?</h2>
      <p>Весілля - це один з найважливіших днів у житті, і квіти відіграють ключову роль у створенні атмосфери. Правильний вибір квітів може перетворити звичайне свято на незабутнє. У цьому гайді ми розглянемо всі аспекти вибору квітів для весілля.</p>
      
      <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80" alt="Весільні квіти" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Букет нареченої: головний акцент</h2>
      <p>Букет нареченої - це не просто аксесуар, а продовження її образу. Він повинен гармонійно поєднуватися з сукнею, стилем весілля та особистістю нареченої.</p>
      
      <h3>Популярні квіти для букета нареченої:</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Троянди:</strong> Класика, яка ніколи не виходить з моди. Символ любові та пристрасті</li>
        <li><strong>Півонії:</strong> Розкішні та романтичні, особливо популярні влітку</li>
        <li><strong>Лілії:</strong> Елегантні та ароматні, ідеальні для весіль у класичному стилі</li>
        <li><strong>Ранункулюси:</strong> Ніжні та вишукані, створюють м'який, романтичний образ</li>
        <li><strong>Гортензії:</strong> Об'ємні та пишні, додають розкішності композиції</li>
      </ul>
      
      <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80" alt="Букет нареченої" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Декор залу: створюємо атмосферу</h2>
      <p>Декор залу - це те, що створює загальну атмосферу весілля. Тут важливо враховувати кілька ключових моментів:</p>
      
      <h3>Розмір приміщення</h3>
      <p>Для великих залів потрібні об'ємні композиції, які будуть помітні здалеку. Для невеликих приміщень краще підійдуть елегантні, але не перевантажені композиції.</p>
      
      <h3>Кольорова схема</h3>
      <p>Квіти повинні доповнювати загальну кольорову палітру весілля. Популярні комбінації:</p>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Білий + зелений (класика)</li>
        <li>Блідо-рожевий + кремовий (романтика)</li>
        <li>Бордовий + золотий (розкіш)</li>
        <li>Лавандовий + білий (ніжність)</li>
      </ul>
      
      <h3>Ключові точки декорування</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Алтар або арка:</strong> Головний фокус, потребує найбільш виразної композиції</li>
        <li><strong>Столи гостей:</strong> Центральні композиції, які не заважають спілкуванню</li>
        <li><strong>Вхідна зона:</strong> Перше враження для гостей</li>
        <li><strong>Фотозона:</strong> Красивий фон для фотографій</li>
      </ul>
      
      <img src="https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1200&q=80" alt="Декор залу" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Бутоньєрки та корсажі: деталі мають значення</h2>
      <p>Деталі роблять образ завершеним. Бутоньєрки для жениха та корсажі для матерів, свідків та особливих гостей - це важливі елементи весільного стилю.</p>
      
      <h3>Бутоньєрка для жениха</h3>
      <p>Повинна поєднуватися з букетом нареченої, але бути більш стриманою. Зазвичай використовують одну-дві квіти з додаванням зеленої рослинності.</p>
      
      <h3>Корсажі</h3>
      <p>Для матерів та свідків створюють більш вишукані композиції, які доповнюють їхні образи та загальний стиль весілля.</p>
      
      <h2>Сезонність та бюджет</h2>
      <p>Важливо враховувати сезонність квітів - це впливає на їх доступність та ціну.</p>
      
      <h3>Весна</h3>
      <p>Тюльпани, нарциси, півонії, троянди - широкий вибір свіжих квітів за доступними цінами.</p>
      
      <h3>Літо</h3>
      <p>Півонії, соняшники, лілії, троянди - розкішний вибір сезонних квітів.</p>
      
      <h3>Осінь</h3>
      <p>Хризантеми, далії, айстри - теплі кольори осені.</p>
      
      <h3>Зима</h3>
      <p>Троянди, амариліси, гіацинти - класичні зимові квіти, які завжди виглядають елегантно.</p>
      
      <h2>Практичні поради для планування</h2>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Почніть планування за 3-6 місяців до весілля</li>
        <li>Зустрічайтеся з флористом для обговорення деталей</li>
        <li>Зберігайте інспіраційні фото в окремій папці</li>
        <li>Враховуйте бюджет - квіти можуть становити 10-15% від загального бюджету</li>
        <li>Обговоріть альтернативи для дорогих квітів</li>
        <li>Перевірте, чи немає алергій у гостей на певні квіти</li>
      </ul>
      
      <h2>Висновок</h2>
      <p>Вибір квітів для весілля - це творчий процес, який вимагає уваги до деталей та гармонії. Правильно підібрані квіти створюють незабутню атмосферу та роблять ваш особливий день справді унікальним. Не забувайте: головне - це щоб квіти відображали вашу особистість та любов, яку ви ділите з близькими.</p>
    `,
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
    date: "2024-01-05",
    author: "Анна Весільна",
    category: "Події",
  },
  {
    id: "4",
    title: "Як створити ідеальний букет: покрокова інструкція",
    excerpt: "Навчіться створювати красиві букети самостійно з нашими покроковими інструкціями та порадами.",
    content: `
      <h2>Мистецтво створення букета</h2>
      <p>Створення букета - це не просто розміщення квітів разом, а справжнє мистецтво, яке поєднує творчість, техніку та розуміння природної краси. У цій статті ми розберемо покрокову інструкцію створення ідеального букета, яку зможе освоїти кожен.</p>
      
      <img src="https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1200&q=80" alt="Створення букета" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Крок 1: Підготовка матеріалів та інструментів</h2>
      <p>Перш ніж почати, переконайтеся, що у вас є все необхідне:</p>
      
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Свіжі квіти різних розмірів та форм</li>
        <li>Зелена рослинність (евкаліпт, аспарагус, папороть)</li>
        <li>Гострий ніж або ножиці для квітів</li>
        <li>Вода в контейнері для підготовки квітів</li>
        <li>Стрічка або декоративний матеріал для обв'язки</li>
        <li>Консервант для квітів (за бажанням)</li>
      </ul>
      
      <h2>Крок 2: Вибір та підготовка квітів</h2>
      <p>Якість букета залежить від якості квітів. Ось що важливо знати:</p>
      
      <h3>Як вибрати свіжі квіти:</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Перевірте стебла - вони повинні бути міцними та зеленими</li>
        <li>Подивіться на бутони - вони повинні бути напіврозкритими</li>
        <li>Уникніть квітів з в'ялими листками або пошкодженнями</li>
        <li>Перевірте аромат - свіжі квіти мають приємний запах</li>
      </ul>
      
      <h3>Підготовка квітів:</h3>
      <ol style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Обріжте стебла під кутом 45° під проточною водою</li>
        <li>Приберіть усі листки, які будуть під водою</li>
        <li>Помістіть квіти у воду з консервантом на 2-4 години перед використанням</li>
      </ol>
      
      <img src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&q=80" alt="Підготовка квітів" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Крок 3: Вибір кольорової палітри</h2>
      <p>Кольорова палітра - це основа гармонійного букета. Ось кілька підходів:</p>
      
      <h3>Монохромна схема</h3>
      <p>Використовуйте квіти одного кольору, але різних відтінків. Це створює елегантну та вишукану композицію.</p>
      
      <h3>Аналогічна схема</h3>
      <p>Комбінуйте сусідні кольори на колірному колі (наприклад, жовтий, помаранчевий, червоний). Це створює теплу та гармонійну композицію.</p>
      
      <h3>Контрастна схема</h3>
      <p>Використовуйте протилежні кольори (наприклад, червоний та зелений, синій та помаранчевий). Це створює яскраву та виразну композицію.</p>
      
      <img src="https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=1200&q=80" alt="Кольорова палітра" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Крок 4: Техніка збирання букета</h2>
      <p>Існує кілька технік збирання букета. Розглянемо найпопулярнішу - спіральну техніку:</p>
      
      <ol style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Початок:</strong> Візьміть центральну квітку (найбільшу або найяскравішу) як основу</li>
        <li><strong>Спіраль:</strong> Додавайте квіти по спіралі, кожна нова квітка трохи нижче попередньої</li>
        <li><strong>Розподіл:</strong> Рівномірно розподіляйте квіти різних розмірів та кольорів</li>
        <li><strong>Зелень:</strong> Додавайте зелень між квітами для об'єму та текстури</li>
        <li><strong>Форма:</strong> Створюйте куполоподібну форму - висока в центрі, нижча по краях</li>
      </ol>
      
      <h3>Поради щодо розміщення:</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Великі квіти - в центрі або як акценти</li>
        <li>Малі квіти - для наповнення та текстури</li>
        <li>Зелень - по краях та між квітами</li>
        <li>Уникайте симетричності - природність виглядає краще</li>
      </ul>
      
      <img src="https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1200&q=80" alt="Техніка збирання" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Крок 5: Фіксація та обв'язка</h2>
      <p>Після того, як букет набрав потрібну форму, його потрібно зафіксувати:</p>
      
      <ol style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Тримайте букет міцно в місці, де стебла перетинаються</li>
        <li>Обв'яжіть стебла стрічкою або шпагатом, починаючи зверху</li>
        <li>Зробіть кілька обертів, щоб надійно зафіксувати форму</li>
        <li>Зав'яжіть міцний вузол або бант</li>
        <li>Обріжте стебла до однакової довжини (зазвичай 30-40 см)</li>
      </ol>
      
      <h2>Крок 6: Фінальні штрихи</h2>
      <p>Останні деталі роблять букет завершеним:</p>
      
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Перевірте, чи всі квіти добре зафіксовані</li>
        <li>Приберіть зайві листки або пошкоджені елементи</li>
        <li>Додайте декоративну стрічку або обгортку (за бажанням)</li>
        <li>Помістіть букет у воду з консервантом</li>
        <li>Зберігайте в прохолодному місці до використання</li>
      </ul>
      
      <h2>Поширені помилки та як їх уникнути</h2>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Занадто багато квітів:</strong> Краще менше, але якісніше</li>
        <li><strong>Ігнорування зеленої рослинності:</strong> Зелень додає об'єм та природність</li>
        <li><strong>Неправильна підготовка:</strong> Завжди обрізайте стебла під кутом</li>
        <li><strong>Ігнорування сезонності:</strong> Використовуйте сезонні квіти для кращої якості</li>
      </ul>
      
      <h2>Висновок</h2>
      <p>Створення букета - це творчий процес, який вимагає практики та терпіння. Не бійтеся експериментувати з різними комбінаціями квітів, кольорів та форм. Кожен букет - це унікальний твір мистецтва, який несе емоції та красу. Практикуйтеся, навчайтеся та насолоджуйтесь процесом створення!</p>
    `,
    image: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800",
    date: "2023-12-28",
    author: "Вікторія Майстер",
    category: "Майстер-клас",
  },
  {
    id: "5",
    title: "Сезонні квіти: що вибрати взимку",
    excerpt: "Огляд найкращих зимових квітів та поради щодо їх використання в композиціях.",
    content: `
      <h2>Зима та квіти: особливий сезон</h2>
      <p>Зима - це час, коли природа спить, але квіти продовжують приносити радість та красу. Правильний вибір зимових квітів може створити особливу атмосферу тепла та затишку в холодну пору року. У цій статті ми розглянемо найкращі зимові квіти та поради щодо їх використання.</p>
      
      <img src="https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1200&q=80" alt="Зимові квіти" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Класичні зимові квіти</h2>
      
      <h3>Троянди</h3>
      <p>Троянди - це універсальний вибір для будь-якого сезону, але взимку вони особливо популярні. Червона троянда - класичний символ любові, ідеальний для романтичних подій та святкувань.</p>
      <p><strong>Переваги:</strong> Довговічність, широкий вибір кольорів, універсальність</p>
      <p><strong>Догляд:</strong> Обрізайте стебла під кутом, використовуйте теплу воду, додавайте консервант</p>
      
      <h3>Хризантеми</h3>
      <p>Хризантеми - одні з найвитриваліших зимових квітів. Вони можуть зберігатися до 2-3 тижнів і доступні в широкому спектрі кольорів.</p>
      <p><strong>Переваги:</strong> Витривалість, доступність, різноманітність форм</p>
      <p><strong>Догляд:</strong> Регулярно міняйте воду, обрізайте стебла кожні 2-3 дні</p>
      
      <img src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80" alt="Хризантеми" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h3>Гіацинти</h3>
      <p>Гіацинти - це ароматні весняні квіти, які можна вирощувати взимку. Їхній солодкий аромат та яскраві кольори створюють особливу атмосферу.</p>
      <p><strong>Переваги:</strong> Чудовий аромат, яскраві кольори, унікальність</p>
      <p><strong>Догляд:</strong> Потребують прохолодного місця, регулярного поливу</p>
      
      <h3>Амариліси</h3>
      <p>Амариліси - великі, виразні квіти, які стають справжньою зіркою будь-якої композиції. Вони символізують гордість та красу.</p>
      <p><strong>Переваги:</strong> Великі розміри, виразність, довговічність</p>
      <p><strong>Догляд:</strong> Потребують підтримки через важкі квіти, регулярної зміни води</p>
      
      <h3>Орхідеї</h3>
      <p>Орхідеї - екзотичні та вишукані квіти, які добре зберігаються взимку. Вони додають елегантності будь-якій композиції.</p>
      <p><strong>Переваги:</strong> Елегантність, довговічність, унікальність</p>
      <p><strong>Догляд:</strong> Потребують особливого догляду, спеціального субстрату</p>
      
      <img src="https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=1200&q=80" alt="Орхідеї" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Зимова кольорова палітра</h2>
      <p>Зимові композиції мають свою особливу кольорову палітру, яка відображає атмосферу сезону:</p>
      
      <h3>Класична зимова палітра</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Білий:</strong> Символ чистоти та свіжості, асоціюється зі снігом</li>
        <li><strong>Червоний:</strong> Тепло та енергія, ідеальний для святкувань</li>
        <li><strong>Зелено-сріблястий:</strong> Природність та елегантність</li>
        <li><strong>Бордовий:</strong> Розкіш та вишуканість</li>
        <li><strong>Кремовий:</strong> Ніжність та тепло</li>
      </ul>
      
      <h3>Сучасні зимові комбінації</h3>
      <p>Сучасні дизайнери експериментують з незвичайними комбінаціями:</p>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Білий + сріблястий + блакитний (крижана елегантність)</li>
        <li>Червоний + золотий (розкіш та святковість)</li>
        <li>Фіолетовий + білий (містична краса)</li>
        <li>Помаранчевий + коричневий (тепло та затишок)</li>
      </ul>
      
      <img src="https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1200&q=80" alt="Зимова палітра" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Особливості догляду за зимовими квітами</h2>
      <p>Зима створює особливі умови, які потребують спеціального підходу:</p>
      
      <h3>Температура</h3>
      <p>Зимові квіти потребують захисту від екстремальних температур. При транспортуванні обгортайте їх, щоб захистити від холоду.</p>
      
      <h3>Вологість</h2>
      <p>Сухе повітря в опалюваних приміщеннях може швидко висушити квіти. Використовуйте консерванти та регулярно обприскуйте квіти водою.</p>
      
      <h3>Освітлення</h3>
      <p>Взимку менше природного світла, тому квіти можуть потребувати додаткового освітлення для підтримки життя.</p>
      
      <h2>Зимові композиції: ідеї та поради</h2>
      
      <h3>Різдвяні композиції</h3>
      <p>Для різдвяних святкувань популярні композиції з червоних троянд, хризантем та зеленої рослинності. Додайте декоративні елементи: ялинові гілки, ягоди, шишки.</p>
      
      <h3>Новорічні букети</h3>
      <p>Новорічні букети можуть бути яскравими та веселими. Використовуйте золоті та сріблясті акценти для створення святкової атмосфери.</p>
      
      <h3>Романтичні зимові композиції</h3>
      <p>Для романтичних подій використовуйте ніжні кольори: білі троянди, кремові півонії, лавандові відтінки.</p>
      
      <h2>Практичні поради для квіткового бізнесу</h2>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Плануйте замовлення заздалегідь - взимку попит на квіти високий</li>
        <li>Зберігайте запас витривалих квітів (хризантеми, троянди)</li>
        <li>Пропонуйте клієнтам сезонні композиції з зимовою тематикою</li>
        <li>Навчіть персонал особливостям догляду за зимовими квітами</li>
        <li>Створюйте спеціальні зимові колекції та пропозиції</li>
      </ul>
      
      <h2>Висновок</h2>
      <p>Зима - це особливий час для квітів, який вимагає особливого підходу та уваги. Правильний вибір зимових квітів, розуміння їх особливостей та правильний догляд забезпечать успіх ваших зимових композицій. Нехай квіти приносять радість та красу навіть у найхолодніші дні!</p>
    `,
    image: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800",
    date: "2023-12-20",
    author: "Марія Квіткова",
    category: "Сезонність",
  },
  {
    id: "6",
    title: "Бізнес-ідея: відкриття квіткового магазину",
    excerpt: "Практичні поради для тих, хто хоче відкрити власний квітковий бізнес: від планування до реалізації.",
    content: `
      <h2>Квітковий бізнес: можливості та виклики</h2>
      <p>Відкриття квіткового магазину - це не просто бізнес, а спосіб життя, який поєднує творчість, пристрасть та комерційний успіх. Квітковий ринок продовжує рости, особливо в сегменті оптових продажів та B2B послуг. У цій статті ми розглянемо всі аспекти відкриття успішного квіткового бізнесу.</p>
      
      <img src="https://images.unsplash.com/photo-1563241521-5eda0f6c2f0b?w=1200&q=80" alt="Квітковий магазин" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Крок 1: Аналіз ринку та бізнес-план</h2>
      <p>Перший крок до успіху - це ретельне планування. Почніть з аналізу ринку та створення детального бізнес-плану.</p>
      
      <h3>Аналіз ринку</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Дослідження конкурентів:</strong> Проаналізуйте наявні квіткові магазини у вашому регіоні</li>
        <li><strong>Цільова аудиторія:</strong> Визначте, хто буде вашими клієнтами (B2B, B2C, обидва)</li>
        <li><strong>Ціноутворення:</strong> Дослідіть ринкові ціни та визначте свою цінову стратегію</li>
        <li><strong>Сезонність:</strong> Розумійте попит у різні сезони та під час свят</li>
      </ul>
      
      <h3>Структура бізнес-плану</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Опис бізнесу та місії</li>
        <li>Аналіз ринку та конкурентів</li>
        <li>Маркетингова стратегія</li>
        <li>Операційний план</li>
        <li>Фінансовий план та прогнози</li>
        <li>Управління ризиками</li>
      </ul>
      
      <img src="https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1200&q=80" alt="Бізнес-план" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Крок 2: Вибір локації</h2>
      <p>Локація - це один з найважливіших факторів успіху квіткового бізнесу. Правильний вибір може визначити долю вашого бізнесу.</p>
      
      <h3>Критерії вибору локації:</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Високий трафік:</strong> Місце з великою кількістю пішоходів або автомобілів</li>
        <li><strong>Видимість:</strong> Легко помітне місце, можливість для вивіски</li>
        <li><strong>Доступність:</strong> Зручний під'їзд для клієнтів та постачальників</li>
        <li><strong>Паркування:</strong> Наявність місць для паркування</li>
        <li><strong>Конкуренція:</strong> Не надто близько до конкурентів, але й не в ізоляції</li>
        <li><strong>Вартість:</strong> Відповідає вашому бюджету</li>
      </ul>
      
      <h3>Альтернативні варіанти:</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Онлайн-магазин:</strong> Менші витрати, ширша аудиторія</li>
        <li><strong>Мобільний бізнес:</strong> Доставка без фізичного магазину</li>
        <li><strong>Співпраця:</strong> Куток у супермаркеті або торговому центрі</li>
      </ul>
      
      <img src="https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=1200&q=80" alt="Локація магазину" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Крок 3: Пошук постачальників</h2>
      <p>Якість квітів - це основа успіху квіткового бізнесу. Знаходження надійних постачальників - критично важливий крок.</p>
      
      <h3>Критерії вибору постачальника:</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Якість продукції:</strong> Свіжість, різноманітність, стабільність</li>
        <li><strong>Надійність:</strong> Час доставки, виконання зобов'язань</li>
        <li><strong>Ціни:</strong> Конкурентні ціни, можливість оптових знижок</li>
        <li><strong>Сервіс:</strong> Підтримка, консультації, гнучкість</li>
        <li><strong>Локація:</strong> Відстань, логістика, витрати на доставку</li>
      </ul>
      
      <h3>Типи постачальників:</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Оптові постачальники:</strong> Великі обсяги, нижчі ціни</li>
        <li><strong>Локальні виробники:</strong> Свіжість, підтримка місцевих бізнесів</li>
        <li><strong>Імпортери:</strong> Екзотичні квіти, широкий асортимент</li>
        <li><strong>Гібридний підхід:</strong> Комбінація різних постачальників</li>
      </ul>
      
      <h2>Крок 4: Обладнання та інфраструктура</h2>
      <p>Правильне обладнання забезпечує якість продукції та ефективність роботи.</p>
      
      <h3>Необхідне обладнання:</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Холодильна камера:</strong> Для зберігання квітів (2-4°C)</li>
        <li><strong>Робочий стіл:</strong> Для обробки та складання букетів</li>
        <li><strong>Інструменти:</strong> Ножі, ножиці, дроти, стрічки</li>
        <li><strong>Вази та контейнери:</strong> Для демонстрації та зберігання</li>
        <li><strong>Обгортковий матеріал:</strong> Папір, стрічки, декоративні елементи</li>
        <li><strong>Система обліку:</strong> POS-система, програмне забезпечення</li>
      </ul>
      
      <img src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80" alt="Обладнання" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />
      
      <h2>Крок 5: Маркетинг та просування</h2>
      <p>Ефективний маркетинг - це ключ до привернення клієнтів та побудови бренду.</p>
      
      <h3>Цифровий маркетинг:</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Соціальні мережі:</strong> Instagram, Facebook для демонстрації робіт</li>
        <li><strong>Веб-сайт:</strong> Онлайн-каталог, можливість замовлення</li>
        <li><strong>SEO:</strong> Оптимізація для пошукових систем</li>
        <li><strong>Email-маркетинг:</strong> Розсилки про акції та новинки</li>
        <li><strong>Контент-маркетинг:</strong> Блог з порадами, інструкціями</li>
      </ul>
      
      <h3>Традиційний маркетинг:</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Локальна реклама:</strong> Реклама в місцевих ЗМІ</li>
        <li><strong>Співпраця:</strong> З подіями, ресторанами, готелями</li>
        <li><strong>Вітрина:</strong> Красива вивіска та оформлення</li>
        <li><strong>Програми лояльності:</strong> Знижки для постійних клієнтів</li>
      </ul>
      
      <h2>Крок 6: Управління та персонал</h2>
      <p>Якісний персонал - це основа успішного квіткового бізнесу.</p>
      
      <h3>Наймання персоналу:</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Флористи:</strong> Досвід, творчість, технічні навички</li>
        <li><strong>Продавці:</strong> Комунікабельність, знання продукції</li>
        <li><strong>Кур'єри:</strong> Для доставки (якщо потрібно)</li>
      </ul>
      
      <h3>Навчання та розвиток:</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Регулярне навчання новим технікам</li>
        <li>Стеження за трендами</li>
        <li>Обмін досвідом з колегами</li>
        <li>Участь у виставках та майстер-класах</li>
      </ul>
      
      <h2>Фінансове планування</h2>
      <p>Розуміння фінансів критично важливе для успіху бізнесу.</p>
      
      <h3>Початкові інвестиції:</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Оренда приміщення (завдаток + перший місяць)</li>
        <li>Обладнання та інвентар</li>
        <li>Перший запас квітів</li>
        <li>Оформлення та реєстрація бізнесу</li>
        <li>Маркетингові витрати</li>
        <li>Резервний фонд (3-6 місяців операційних витрат)</li>
      </ul>
      
      <h3>Операційні витрати:</h3>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li>Орендна плата</li>
        <li>Зарплата персоналу</li>
        <li>Закупівля квітів та матеріалів</li>
        <li>Комунальні послуги</li>
        <li>Маркетинг та реклама</li>
        <li>Податки та страхування</li>
      </ul>
      
      <h2>Ризики та як їх мінімізувати</h2>
      <ul style="margin: 16px 0; padding-left: 24px; line-height: 1.8;">
        <li><strong>Сезонність:</strong> Плануйте бюджет з урахуванням сезонних коливань</li>
        <li><strong>Псування продукції:</strong> Правильне зберігання та управління запасами</li>
        <li><strong>Конкуренція:</strong> Диференціація через якість та сервіс</li>
        <li><strong>Економічні кризи:</strong> Різноманітність послуг та клієнтів</li>
      </ul>
      
      <h2>Висновок</h2>
      <p>Відкриття квіткового магазину - це захоплююча подорож, яка вимагає ретельного планування, пристрасті до квітів та готовності до роботи. З правильним підходом, якісними постачальниками та ефективним маркетингом ваш квітковий бізнес може стати успішним та прибутковим. Пам'ятайте: успіх приходить до тих, хто поєднує любов до квітів з професійним підходом до бізнесу.</p>
    `,
    image: "https://images.unsplash.com/photo-1563241521-5eda0f6c2f0b?w=800",
    date: "2023-12-15",
    author: "Олександр Флорист",
    category: "Бізнес",
  },
  {
    id: "7",
    title: "Як сформувати ідеальний асортимент для квіткового магазину",
    excerpt:
      "Дізнайтесь, які позиції мають бути в асортименті, щоб задовольнити більшість клієнтів і не заморожувати зайвий склад.",
    content: `
      <h2>Базовий асортимент: що має бути завжди</h2>
      <p>Для стабільних продажів важливо мати перелік позицій, які клієнти очікують побачити завжди. Це класичні троянди, хризантеми, тюльпани в сезон, зелень та базові наповнювачі.</p>
      <p>Побудуйте асортимент за принципом "ядро + сезонні акценти". Ядро — це позиції, що продаються цілий рік. Сезонні акценти — квіти, які створюють вау-ефект і стимулюють імпульсні покупки.</p>
    `,
    image: "https://images.unsplash.com/photo-1563241521-5eda0f6c2f0b?w=800",
    date: "2023-12-10",
    author: "Марія Квіткова",
    category: "Бізнес",
  },
  {
    id: "8",
    title: "ТОП-5 помилок в оптових закупівлях квітів",
    excerpt:
      "Найчастіші помилки при оптових закупівлях, які знижують прибуток і збільшують списання товару.",
    content: `
      <h2>Помилка 1: Закупівля без аналізу попиту</h2>
      <p>Найпоширеніша помилка — замовляти "на око". Ведіть мінімальну аналітику: що і в якій кількості ви продаєте щотижня, які позиції найчастіше списуються.</p>
      <h2>Помилка 2: Відсутність резерву на пікові дні</h2>
      <p>Свята, вихідні та локальні події різко збільшують попит. Плануйте додатковий запас для днів з підвищеним попитом.</p>
    `,
    image: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800",
    date: "2023-12-05",
    author: "Олександр Флорист",
    category: "Бізнес",
  },
  {
    id: "9",
    title: "Оформлення вітрини: як привернути увагу перехожих",
    excerpt:
      "Практичні поради щодо оформлення вітрини, яка зупиняє погляд і приводить нових клієнтів у магазин.",
    content: `
      <h2>Вітрина як інструмент продажів</h2>
      <p>Вітрина — це ваша безкоштовна реклама 24/7. Важливо, щоб вона розповідала історію, а не була випадковим набором композицій.</p>
      <h2>Сезонні сюжети</h2>
      <p>Створюйте сюжети до свят, змін пір року та локальних подій. Це формує емоційний зв'язок із клієнтами.</p>
    `,
    image: "https://images.unsplash.com/photo-1519376918334-c52cd69e55db?w=800",
    date: "2023-11-28",
    author: "Вікторія Майстер",
    category: "Вітрина",
  },
  {
    id: "10",
    title: "Як оптимізувати залишки квітів на складі",
    excerpt:
      "Стратегії, які допомагають зменшити списання і збільшити оборотність товару у квітковому бізнесі.",
    content: `
      <h2>ABC-аналіз асортименту</h2>
      <p>Розділіть позиції на групи A, B і C за оборотністю. Для кожної групи встановіть свій підхід до замовлення і запасів.</p>
      <h2>Крос-продажі та акції</h2>
      <p>Використовуйте повільні позиції в акційних букетах, спеціальних пропозиціях та крос-продажах.</p>
    `,
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800",
    date: "2023-11-20",
    author: "Марія Квіткова",
    category: "Аналітика",
  },
  {
    id: "11",
    title: "Ціноутворення у квітковому бізнесі: з чого почати",
    excerpt:
      "Ключові підходи до формування цін, щоб залишатися конкурентними й прибутковими.",
    content: `
      <h2>Облік реальної собівартості</h2>
      <p>Враховуйте не лише закупівельну вартість, а й логістику, списання, роботу персоналу та упаковку.</p>
      <h2>Прайс для B2B та B2C</h2>
      <p>Розділіть ціни для роздрібних клієнтів і для оптових партнерів, закладаючи обсяг закупівель.</p>
    `,
    image: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=800",
    date: "2023-11-10",
    author: "Олександр Флорист",
    category: "Бізнес",
  },
  {
    id: "12",
    title: "Комунікація з оптовими клієнтами: як будувати довгострокові відносини",
    excerpt:
      "Практичні поради, як стати партнером, а не просто постачальником квітів для ваших клієнтів.",
    content: `
      <h2>Прозорість і стабільність</h2>
      <p>Чітко комунікуйте умови, строки поставок та можливі зміни. Надійність — ключ до довіри.</p>
      <h2>Додана цінність</h2>
      <p>Допомагайте клієнтам з плануванням закупівель, трендами та навчанням — це зміцнює партнерство.</p>
    `,
    image: "https://images.unsplash.com/photo-1563241521-5eda0f6c2f0b?w=800",
    date: "2023-11-01",
    author: "Вікторія Майстер",
    category: "Клієнти",
  },
];

