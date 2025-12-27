import { Users, Package, TrendingUp, Award } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "100+",
    label: "Задоволених клієнтів",
    description: "Працюємо з найкращими квітковими бізнесами",
  },
  {
    icon: Package,
    value: "10+",
    label: "Видів квітів",
    description: "Широкий асортимент височної якості",
  },
  {
    icon: TrendingUp,
    value: "5+",
    label: "Років досвіду",
    description: "Надійний партнер для вашого бізнесу",
  },
  {
    icon: Award,
    value: "100%",
    label: "Гарантія якості",
    description: "Свіжі квіти з гарантією свіжості",
  },
];

export function StatsSection() {
  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50/50 dark:from-emerald-900/10 dark:via-admin-surface dark:to-blue-900/10 section-padding-sm">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_50%,rgba(236,248,241,0.4),transparent)] dark:bg-[radial-gradient(1200px_circle_at_50%_50%,rgba(13,17,23,0.3),transparent)]" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative flex flex-col items-center rounded-xl bg-white dark:bg-admin-surface p-3 sm:p-6 text-center border border-slate-100 dark:border-admin-border transition-colors duration-200 hover:border-emerald-200 dark:hover:border-emerald-500/30"
              >
                {/* Icon */}
                <div className="mb-2 sm:mb-3 inline-flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500 text-white">
                  <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                
                {/* Value */}
                <div className="mb-1 sm:mb-1.5 text-xl font-extrabold tracking-tight text-slate-900 dark:text-admin-text-primary sm:text-3xl lg:text-4xl">
                  {stat.value}
                </div>
                
                {/* Label */}
                <div className="mb-1 sm:mb-1.5 text-xs font-bold text-slate-900 dark:text-admin-text-primary sm:text-base">
                  {stat.label}
                </div>
                
                {/* Description */}
                <p className="text-[9px] sm:text-[11px] text-slate-600 dark:text-admin-text-secondary leading-tight">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}



