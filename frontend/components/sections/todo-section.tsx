"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

// Mock data for demo
const mockTasks = [
  {
    id: "1",
    title: "Замовити троянди на наступний тиждень",
    date: "2024-12-25",
    completed: false,
    priority: "high" as const,
  },
  {
    id: "2",
    title: "Перевірити залишки гортензій",
    date: "2024-12-24",
    completed: true,
    priority: "medium" as const,
  },
  {
    id: "3",
    title: "Зв'язатися з постачальником Еквадору",
    date: "2024-12-26",
    completed: false,
    priority: "medium" as const,
  },
  {
    id: "4",
    title: "Оновити ціни на імпортні квіти",
    date: "2024-12-27",
    completed: false,
    priority: "low" as const,
  },
  {
    id: "5",
    title: "Інвентаризація на складі",
    date: "2024-12-30",
    completed: false,
    priority: "high" as const,
  },
];

const priorityColors = {
  high: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  medium: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  low: "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
};

const priorityLabels = {
  high: "Високий",
  medium: "Середній",
  low: "Низький",
};

export function TodoSection() {
  const [tasks, setTasks] = useState(mockTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "short",
    });
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <Card className="admin-card border border-slate-100 dark:border-[#30363d] bg-white/90 dark:bg-admin-surface shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl">Завдання</CardTitle>
              <Badge className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Демо
              </Badge>
            </div>
            <CardDescription>
              Планування завдань з прив'язкою до календаря
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Demo Notice */}
        <div className="rounded-2xl border border-violet-200 dark:border-violet-800/50 bg-gradient-to-r from-violet-50 via-violet-50/80 to-purple-50/60 dark:from-violet-900/30 dark:via-violet-900/20 dark:to-purple-900/10 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-800/40 shadow-sm">
              <AlertCircle className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-violet-900 dark:text-violet-200">
                Пропозиція для розробки
              </p>
              <p className="text-sm text-violet-700 dark:text-violet-300/80">
                Це демонстраційна версія функціоналу планування завдань. Якщо
                вам потрібна така функція — зв'яжіться з розробником для
                імплементації повноцінного рішення з синхронізацією та
                сповіщеннями.
              </p>
            </div>
          </div>
        </div>

        {/* Add Task Form (demo) */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Додати нове завдання..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="pr-10"
              disabled
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
          <Button disabled className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-1" />
            Додати
          </Button>
        </div>

        {/* Pending Tasks */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-admin-text-secondary flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Очікують ({pendingTasks.length})
          </h3>
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-admin-border bg-white dark:bg-admin-surface-elevated hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors cursor-pointer"
                onClick={() => toggleTask(task.id)}
              >
                <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-admin-text-primary truncate">
                    {task.title}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-xs shrink-0", priorityColors[task.priority])}
                >
                  {priorityLabels[task.priority]}
                </Badge>
                <span className="text-xs text-slate-500 dark:text-admin-text-tertiary shrink-0">
                  {formatDate(task.date)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-admin-text-tertiary flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Виконані ({completedTasks.length})
            </h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-admin-border bg-slate-50/50 dark:bg-admin-surface/50 hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer opacity-60"
                  onClick={() => toggleTask(task.id)}
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-500 dark:text-admin-text-tertiary line-through truncate">
                      {task.title}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-admin-text-tertiary shrink-0">
                    {formatDate(task.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
