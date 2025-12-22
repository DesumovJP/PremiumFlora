"use client";

import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Star,
  Sparkles,
  Flower2,
  Heart,
  Shield,
  TrendingUp,
  Users,
  Award,
  Leaf,
  Truck as TruckIcon,
} from "lucide-react";

export default function UiBadgesCardsTestPage() {
  const badgeLabels = [
    "Преміальні квіти для вашого бізнесу",
    "Каталог",
    "Переваги",
    "Блог",
  ];

  const statsBase = {
    value: "100+",
    label: "Задоволених клієнтів",
    description: "Працюємо з найкращими квітковими бізнесами",
  };

  const benefitBase = {
    title: "Широкий асортимент",
    description:
      "Більше 10 видів квітів з різними варіантами висоти та розмірів",
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-slate-50/40">
        <section className="py-10 sm:py-14 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="mb-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Тестові варіанти бейджів та карток
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Сторінка для підбору фінальних стилів бейджів та інформаційних карток.
            </p>
          </div>
        </section>

        {/* Badges Section */}
        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
              <h2 className="mb-3 text-xl sm:text-2xl font-semibold text-slate-900">
                Варіанти бейджів
              </h2>
              <p className="text-sm text-slate-600">
                10 варіантів оформлення для бейджів: "Преміальні квіти для вашого бізнесу", "Каталог", "Переваги", "Блог".
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Variant 1: Нейтральний, м'які тони */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-800">
                    Варіант 1 — нейтральний
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Базовий нейтральний стиль, підходить майже для будь-якого контенту.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  {badgeLabels.map((label) => (
                    <Badge key={label}>{label}</Badge>
                  ))}
                </CardContent>
              </Card>

              {/* Variant 2: Успішний/зелений акцент */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-800">
                    Варіант 2 — зелений акцент
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Акцент на брендовому emerald з легкою обводкою.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  {badgeLabels.map((label, idx) => (
                    <Badge
                      key={label}
                      tone="success"
                      className="gap-1.5 ring-emerald-200/70 bg-emerald-50/80"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="truncate max-w-[140px]">{label}</span>
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              {/* Variant 3: Outline, спокійний */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-800">
                    Варіант 3 — outline
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Легкий контур, мінімалістично та акуратно.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  {badgeLabels.map((label) => (
                    <Badge
                      key={label}
                      tone="outline"
                      className="bg-white/80 shadow-sm hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                    >
                      {label}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              {/* Variant 4: Soft pill з іконкою */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-800">
                    Варіант 4 — з іконкою
                  </CardTitle>
                  <CardDescription className="text-xs">
                    М'який фон та невеликі іконки для кращої візуалізації.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  {badgeLabels.map((label, idx) => {
                    const icons = [Sparkles, Flower2, Shield, BookOpenIcon, PenIcon];
                    const Icon = icons[idx] ?? Sparkles;
                    return (
                      <Badge
                        key={label}
                        className="bg-emerald-50/90 text-emerald-800 ring-1 ring-emerald-100/80 px-3.5"
                      >
                        <Icon className="h-3 w-3" />
                        <span>{label}</span>
                      </Badge>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Variant 5: Темний контрастний */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-800">
                    Варіант 5 — темний
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Контрастні бейджі для важливих акцентів.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  {badgeLabels.map((label) => (
                    <Badge
                      key={label}
                      className="bg-slate-900 text-white/95 shadow-md shadow-slate-900/30 px-3.5"
                    >
                      <Star className="h-3 w-3 text-amber-300" />
                      <span>{label}</span>
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              {/* Variant 6: Soft gradient */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-800">
                    Варіант 6 — градієнт
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Легкий градієнт для більш преміального відчуття.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  {badgeLabels.map((label) => (
                    <Badge
                      key={label}
                      className="bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-white shadow-md shadow-emerald-500/40"
                    >
                      <Leaf className="h-3 w-3" />
                      <span>{label}</span>
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              {/* Variant 7: Very subtle */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-800">
                    Варіант 7 — дуже легкий
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Майже непомітний фон, максимум повітря.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  {badgeLabels.map((label) => (
                    <Badge
                      key={label}
                      className="bg-slate-50/80 text-slate-700 border border-slate-100/80"
                    >
                      {label}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              {/* Variant 8: Мікро бейджі */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-800">
                    Варіант 8 — компактні
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Для дуже компактних підписів.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  {badgeLabels.map((label) => (
                    <Badge
                      key={label}
                      className="px-2 py-0.5 text-[10px] uppercase tracking-wide bg-emerald-50 text-emerald-700"
                    >
                      {label}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              {/* Variant 9: Лінійні теги */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-800">
                    Варіант 9 — теги
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Більше схоже на теги/чіпси.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  {badgeLabels.map((label) => (
                    <Badge
                      key={label}
                      className="rounded-lg border border-slate-200 bg-white text-slate-800 px-3 py-1 shadow-sm"
                    >
                      {label}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              {/* Variant 10: Pill + icon right */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-800">
                    Варіант 10 — з іконкою справа
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Для бейджів-дій (наприклад, перейди до блогу).
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  {badgeLabels.map((label) => (
                    <Badge
                      key={label}
                      className="bg-emerald-600 text-white pr-2 pl-3 py-1 shadow-md shadow-emerald-500/40"
                    >
                      <span>{label}</span>
                      <TrendingUp className="h-3 w-3 opacity-90" />
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Cards Variants */}
        <section className="py-10 sm:py-14 border-t border-slate-100 bg-white/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
              <h2 className="mb-3 text-xl sm:text-2xl font-semibold text-slate-900">
                Варіанти карток статистики ("100+ Задоволених клієнтів")
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[...Array(10)].map((_, i) => (
                <Card
                  key={i}
                  className={cn(
                    "group flex h-full flex-col justify-between p-4 sm:p-5",
                    // 0 — базова KPI картка
                    i === 0 && "bg-white/90",
                    // 1 — акцентована, з бейджем тренду
                    i === 1 && "bg-emerald-50/80 border-emerald-100",
                    // 2 — темна, компактна
                    i === 2 && "bg-slate-900 text-white/95 border-slate-800",
                    // 3 — з градієнтним фоном та розділенням контенту
                    i === 3 && "bg-gradient-to-br from-emerald-50 to-teal-50",
                    // 4 — картка-рядок (compact list)
                    i === 4 && "bg-white/90 border-dashed",
                    // 5 — центрована, з великим числом
                    i === 5 && "bg-slate-50/80 text-center",
                    // 6 — картка з footer-стрічкою
                    i === 6 && "bg-white/95 shadow-md",
                    // 7 — картка зі side-pill індикатором
                    i === 7 && "bg-emerald-50/70",
                    // 8 — картка з розбиттям на 2 колонки
                    i === 8 && "bg-slate-50/80",
                    // 9 — максимально спрощена
                    i === 9 && "bg-white/90"
                  )}
                >
                  {/* Variant 0: стандартна KPI */}
                  {i === 0 && (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-500">
                          Ключовий показник
                        </div>
                      </div>
                      <div className="mb-1 text-2xl font-extrabold tracking-tight text-slate-900">
                        {statsBase.value}
                      </div>
                      <div className="mb-2 text-sm font-semibold text-slate-900">
                        {statsBase.label}
                      </div>
                      <p className="text-[11px] leading-snug text-slate-600">
                        {statsBase.description}
                      </p>
                    </>
                  )}

                  {/* Variant 1: з бейджем тренду та підкресленим ростом */}
                  {i === 1 && (
                    <>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                            <TrendingUp className="h-4 w-4" />
                          </div>
                          <div className="text-[11px] uppercase tracking-wide text-emerald-700">
                            Активне зростання
                          </div>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                          +24% за місяць
                        </span>
                      </div>
                      <div className="mb-2 flex items-baseline gap-1">
                        <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                          {statsBase.value}
                        </div>
                        <span className="text-[11px] text-slate-500">клієнтів</span>
                      </div>
                      <p className="text-[11px] leading-snug text-slate-600">
                        {statsBase.label}. Стабільний позитивний тренд.
                      </p>
                    </>
                  )}

                  {/* Variant 2: темна compact-картка */}
                  {i === 2 && (
                    <>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                            <Award className="h-4 w-4 text-emerald-300" />
                          </div>
                          <div className="text-[11px] uppercase tracking-wide text-emerald-200">
                            Топ показник
                          </div>
                        </div>
                        <span className="text-[10px] rounded-full bg-white/10 px-2 py-0.5 text-emerald-100">
                          98% задоволення
                        </span>
                      </div>
                      <div className="mb-1 text-2xl font-extrabold tracking-tight text-white">
                        {statsBase.value}
                      </div>
                      <div className="mb-2 text-sm font-semibold text-emerald-100">
                        {statsBase.label}
                      </div>
                      <p className="text-[11px] leading-snug text-slate-200">
                        Сервіс, якість та стабільність поставок на найвищому рівні.
                      </p>
                    </>
                  )}

                  {/* Variant 3: з вертикальним індикатором та міні-графіком */}
                  {i === 3 && (
                    <div className="flex h-full gap-3">
                      <div className="flex w-1 flex-col justify-between rounded-full bg-emerald-100">
                        <div className="h-1/3 rounded-b-full bg-emerald-500" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-wide text-emerald-700">
                            Динаміка клієнтів
                          </span>
                          <Users className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="mb-1 text-2xl font-extrabold tracking-tight text-slate-900">
                          {statsBase.value}
                        </div>
                        <p className="mb-3 text-[11px] leading-snug text-slate-600">
                          Плавне, але стабільне зростання бази клієнтів.
                        </p>
                        <div className="mt-auto flex items-end gap-1">
                          {[30, 40, 55, 65, 80].map((h, idx) => (
                            <div
                              key={idx}
                              className="flex-1 rounded-t-full bg-emerald-200"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Variant 4: compact-рядок для дашборду */}
                  {i === 4 && (
                    <div className="flex h-full flex-col justify-between gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <Users className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-medium text-slate-800">
                            {statsBase.label}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-900">
                          {statsBase.value}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Формат для щільних аналітичних таблиць.
                      </p>
                    </div>
                  )}

                  {/* Variant 5: центрована "герой"-картка */}
                  {i === 5 && (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                      <Heart className="h-5 w-5 text-emerald-500" />
                      <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {statsBase.value}
                      </div>
                      <div className="text-xs font-medium text-slate-600">
                        {statsBase.label}
                      </div>
                      <p className="mt-1 max-w-[160px] text-[11px] leading-snug text-slate-500">
                        Для hero-секцій або великих дашбордів.
                      </p>
                    </div>
                  )}

                  {/* Variant 6: з footer-стрічкою про зміну */}
                  {i === 6 && (
                    <>
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                          <div className="mb-1 text-xs font-medium text-slate-500">
                            Середня кількість активних клієнтів
                          </div>
                          <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                            {statsBase.value}
                          </div>
                        </div>
                        <div className="flex h-9 flex-col items-end justify-between text-right">
                          <span className="text-xs font-semibold text-emerald-600">
                            +12 клієнтів
                          </span>
                          <span className="text-[10px] text-slate-400">тиждень до тижня</span>
                        </div>
                      </div>
                      <p className="mb-3 text-[11px] leading-snug text-slate-600">
                        Збільшення завдяки регулярним поставкам та стабільній якості.
                      </p>
                      <div className="mt-auto rounded-md bg-emerald-50 px-2 py-1.5 text-[10px] text-emerald-800">
                        Останнє оновлення: 2 год тому
                      </div>
                    </>
                  )}

                  {/* Variant 7: з вертикальним кольоровим індикатором */}
                  {i === 7 && (
                    <div className="flex h-full gap-3">
                      <div className="w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-400" />
                      <div className="flex flex-1 flex-col">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-wide text-emerald-700">
                            Лояльність клієнтів
                          </span>
                          <Shield className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="mb-1 text-2xl font-extrabold tracking-tight text-slate-900">
                          {statsBase.value}
                        </div>
                        <p className="text-[11px] leading-snug text-slate-600">
                          Високий рівень повторних замовлень та довгострокових контрактів.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Variant 8: двоколонковий формат */}
                  {i === 8 && (
                    <div className="grid h-full grid-cols-2 gap-3">
                      <div className="flex flex-col justify-between">
                        <div>
                          <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">
                            Клієнти
                          </div>
                          <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                            {statsBase.value}
                          </div>
                        </div>
                        <p className="text-[11px] leading-snug text-slate-600">
                          Активні в поточному місяці.
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Users className="h-5 w-5 text-emerald-600" />
                        <div className="text-right text-[11px] text-slate-500">
                          <div>Середній чек: 2400 ₴</div>
                          <div>Середня частота: 3 замовлення</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Variant 9: максимально мінімалістична */}
                  {i === 9 && (
                    <div className="flex h-full flex-col justify-center gap-2">
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">
                        {statsBase.label}
                      </div>
                      <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                        {statsBase.value}
                      </div>
                      <p className="text-[11px] leading-snug text-slate-500">
                        Лаконічний варіант для місць, де вже є контекст.
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefit Cards Variants */}
        <section className="py-10 sm:py-14 bg-slate-50/60 border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
              <h2 className="mb-3 text-xl sm:text-2xl font-semibold text-slate-900">
                Варіанти карток переваг ("Широкий асортимент")
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[...Array(10)].map((_, i) => (
                <Card
                  key={i}
                  className={cn(
                    "group flex h-full flex-col overflow-hidden border bg-white/90 transition-all duration-300",
                    // 0 — базова описова картка
                    i === 0 && "bg-white",
                    // 1 — акцент з емблемою
                    i === 1 && "border-emerald-200 bg-emerald-50/60",
                    // 2 — темна преміум-картка
                    i === 2 && "bg-slate-900 text-white/95 border-slate-800",
                    // 3 — градієнтна, з вертикальним лейблом
                    i === 3 && "bg-gradient-to-br from-emerald-50 to-teal-50",
                    // 4 — картка-список з чек-іконками
                    i === 4 && "border-dashed",
                    // 5 — картка з великою ілюстративною іконкою
                    i === 5 && "bg-slate-50/80",
                    // 6 — картка з бейджами характеристик
                    i === 6 && "shadow-md",
                    // 7 — центрована compact-картка
                    i === 7 && "bg-white",
                    // 8 — картка з виділеним заголовком
                    i === 8 && "bg-emerald-50/60 border-emerald-100",
                    // 9 — мінімалістичний текстовий варіант
                    i === 9 && "bg-white/95"
                  )}
                >
                  <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
                    {/* Variant 0: базова картка переваги */}
                    {i === 0 && (
                      <>
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
                            <Flower2 className="h-4 w-4" />
                          </div>
                          <div className="text-[11px] uppercase tracking-wide text-slate-500">
                            Основна перевага
                          </div>
                        </div>
                        <h3 className="mb-1.5 text-sm font-semibold leading-tight text-slate-900">
                          {benefitBase.title}
                        </h3>
                        <p className="text-[11px] leading-snug text-slate-600">
                          {benefitBase.description}
                        </p>
                      </>
                    )}

                    {/* Variant 1: акцентована, з емблемою */}
                    {i === 1 && (
                      <>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                              <Leaf className="h-4 w-4" />
                            </div>
                            <div className="text-[11px] uppercase tracking-wide text-emerald-800">
                              Брендова перевага
                            </div>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                            Популярний вибір
                          </span>
                        </div>
                        <h3 className="mb-1.5 text-sm font-semibold leading-tight text-slate-900">
                          Широкий асортимент преміальних квітів
                        </h3>
                        <p className="text-[11px] leading-snug text-slate-700">
                          Від класичних троянд до екзотичних сортів — з фокусом на оптові поставки.
                        </p>
                      </>
                    )}

                    {/* Variant 2: темна преміум-картка */}
                    {i === 2 && (
                      <>
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                            <Star className="h-4 w-4" />
                          </div>
                          <div className="text-[11px] uppercase tracking-wide text-emerald-200">
                            Преміальний рівень
                          </div>
                        </div>
                        <h3 className="mb-1.5 text-sm font-semibold leading-tight text-white">
                          Гарантована якість та відбір
                        </h3>
                        <p className="mb-3 text-[11px] leading-snug text-slate-200">
                          Кожна партія проходить ручний відбір, контроль температури та вологості під час доставки.
                        </p>
                        <div className="mt-auto flex items-center justify-between text-[10px] text-emerald-100">
                          <span>Повернення без питань</span>
                          <span>24/7 підтримка</span>
                        </div>
                      </>
                    )}

                    {/* Variant 3: градієнтна з вертикальним лейблом */}
                    {i === 3 && (
                      <div className="flex h-full gap-3">
                        <div className="flex flex-col items-center justify-between">
                          <div className="rounded-full bg-emerald-600/90 px-2 py-1 text-[10px] font-medium text-white">
                            Логістика
                          </div>
                          <div className="h-12 w-px bg-emerald-200" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="mb-2 flex items-center gap-2">
                            <TruckIcon className="h-4 w-4 text-emerald-700" />
                            <span className="text-[11px] uppercase tracking-wide text-emerald-700">
                              Своєчасні поставки
                            </span>
                          </div>
                          <h3 className="mb-1.5 text-sm font-semibold leading-tight text-slate-900">
                            Стабільна логістика для вашого бізнесу
                          </h3>
                          <p className="text-[11px] leading-snug text-slate-600">
                            Чіткі графіки, контроль ланцюжка поставок та мінімізація втрат під час транспортування.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Variant 4: чек-лист переваг */}
                    {i === 4 && (
                      <>
                        <div className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">
                          Комплексна перевага
                        </div>
                        <h3 className="mb-2 text-sm font-semibold leading-tight text-slate-900">
                          Вигідні умови для оптових клієнтів
                        </h3>
                        <ul className="space-y-1.5 text-[11px] text-slate-600">
                          {[
                            "Персональні цінові пропозиції",
                            "Гнучкі умови оплати",
                            "Можливість резерву товару",
                          ].map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <CheckCircle2 className="mt-[1px] h-3 w-3 text-emerald-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* Variant 5: з великою ілюстративною іконкою */}
                    {i === 5 && (
                      <>
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700">
                            <Flower2 className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-wide text-slate-500">
                              Візуальна привабливість
                            </div>
                            <div className="text-xs text-slate-600">
                              Преміальний вигляд в залі продажів
                            </div>
                          </div>
                        </div>
                        <h3 className="mb-1.5 text-sm font-semibold leading-tight text-slate-900">
                          Квіти, які продають себе
                        </h3>
                        <p className="text-[11px] leading-snug text-slate-600">
                          Яскраві, свіжі та збалансовані за висотою та об'ємом, щоб виглядати виграшно у вітринах.
                        </p>
                      </>
                    )}

                    {/* Variant 6: з бейджами-характеристиками */}
                    {i === 6 && (
                      <>
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
                            <Shield className="h-4 w-4" />
                          </div>
                          <div className="text-[11px] uppercase tracking-wide text-slate-500">
                            Надійний постачальник
                          </div>
                        </div>
                        <h3 className="mb-2 text-sm font-semibold leading-tight text-slate-900">
                          Умови, зручні для рітейлу
                        </h3>
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {["Холодний ланцюг", "Страхування партій", "Прозорі документи"].map(
                            (tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700"
                              >
                                {tag}
                              </span>
                            )
                          )}
                        </div>
                        <p className="text-[11px] leading-snug text-slate-600">
                          Зручно інтегрується у ваші існуючі процеси закупівель.
                        </p>
                      </>
                    )}

                    {/* Variant 7: центрована компактна картка */}
                    {i === 7 && (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                        <Users className="h-5 w-5 text-emerald-500" />
                        <h3 className="text-sm font-semibold leading-tight text-slate-900">
                          Підтримка розвитку бізнесу
                        </h3>
                        <p className="max-w-[180px] text-[11px] leading-snug text-slate-600">
                          Консультації щодо асортименту, сезонних колекцій та трендів у флористиці.
                        </p>
                      </div>
                    )}

                    {/* Variant 8: акцент на заголовку */}
                    {i === 8 && (
                      <>
                        <div className="mb-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-medium text-emerald-800">
                          Асортимент для різних форматів
                        </div>
                        <h3 className="mb-1.5 text-sm font-semibold leading-tight text-slate-900">
                          Підбір під ваш тип точки продажу
                        </h3>
                        <p className="mb-2 text-[11px] leading-snug text-slate-600">
                          Рішення для супермаркетів, квіткових крамниць, студій декору та HoReCa.
                        </p>
                        <p className="text-[11px] leading-snug text-slate-500">
                          Допоможемо сформувати асортимент, що відповідає очікуванням ваших клієнтів.
                        </p>
                      </>
                    )}

                    {/* Variant 9: мінімалістичний текстовий варіант */}
                    {i === 9 && (
                      <>
                        <div className="mb-2 text-[11px] uppercase tracking-wide text-slate-400">
                          {benefitBase.title}
                        </div>
                        <p className="text-[11px] leading-snug text-slate-600">
                          {benefitBase.description} Простий, текстовий варіант без зайвих акцентів — коли
                          дизайн сторінки вже достатньо насичений.
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// Local helper icons (щоб не тягнути зайве)
function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 7H20" />
      <path d="M6.5 7A2.5 2.5 0 0 0 4 4.5v15A2.5 2.5 0 0 1 6.5 17" />
      <path d="M20 4v17" />
    </svg>
  );
}

function PenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

