"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  type GraphQLTask,
  type CreateTaskInput,
} from "@/lib/strapi";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  PlayCircle,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";

const toast = {
  success: (msg: string) => console.log(`[SUCCESS] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
};

type TaskPriority = "low" | "medium" | "high";
type TaskCategory = "delivery" | "supply" | "maintenance" | "meeting" | "other";

interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  reminderAt: string;
  priority: TaskPriority;
  category: TaskCategory;
}

const defaultFormData: TaskFormData = {
  title: "",
  description: "",
  dueDate: "",
  reminderAt: "",
  priority: "medium",
  category: "other",
};

// Category labels and colors
const categoryConfig: Record<TaskCategory, { label: string; color: string; bgColor: string }> = {
  delivery: { label: "Доставка", color: "text-cyan-700 dark:text-cyan-400", bgColor: "bg-cyan-100 dark:bg-cyan-900/30" },
  supply: { label: "Постачання", color: "text-violet-700 dark:text-violet-400", bgColor: "bg-violet-100 dark:bg-violet-900/30" },
  maintenance: { label: "Обслуговування", color: "text-orange-700 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
  meeting: { label: "Зустріч", color: "text-pink-700 dark:text-pink-400", bgColor: "bg-pink-100 dark:bg-pink-900/30" },
  other: { label: "Інше", color: "text-slate-600 dark:text-slate-400", bgColor: "bg-slate-100 dark:bg-slate-800" },
};

// Priority colors for left border
const priorityBorderColor: Record<TaskPriority, string> = {
  low: "border-l-emerald-400",
  medium: "border-l-amber-400",
  high: "border-l-rose-500",
};

export function TodoSection() {
  const [tasks, setTasks] = useState<GraphQLTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<GraphQLTask | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const result = await getTasks();
      if (result.success && result.data) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Не вдалося завантажити завдання");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 30000);
    return () => clearInterval(interval);
  }, [loadTasks]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Сьогодні, ${date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Завтра, ${date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString("uk-UA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().slice(0, 16);
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dueDate) return;

    setIsSubmitting(true);
    try {
      if (editingTask) {
        const result = await updateTask(editingTask.documentId, {
          title: formData.title,
          description: formData.description || undefined,
          dueDate: new Date(formData.dueDate).toISOString(),
          reminderAt: formData.reminderAt ? new Date(formData.reminderAt).toISOString() : undefined,
          priority: formData.priority,
          category: formData.category,
        });
        if (result.success) {
          toast.success("Завдання оновлено");
          await loadTasks();
          window.dispatchEvent(new CustomEvent("tasks-updated"));
        } else {
          toast.error(result.error?.message || "Помилка оновлення");
        }
      } else {
        const taskData: CreateTaskInput = {
          title: formData.title,
          description: formData.description || undefined,
          dueDate: new Date(formData.dueDate).toISOString(),
          reminderAt: formData.reminderAt ? new Date(formData.reminderAt).toISOString() : undefined,
          priority: formData.priority,
          category: formData.category,
          status: "pending",
        };
        const result = await createTask(taskData);
        if (result.success) {
          toast.success("Завдання створено");
          await loadTasks();
          window.dispatchEvent(new CustomEvent("tasks-updated"));
        } else {
          toast.error(result.error?.message || "Помилка створення");
        }
      }
      setShowAddModal(false);
      setEditingTask(null);
      setFormData(defaultFormData);
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Помилка збереження");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (task: GraphQLTask) => {
    try {
      const result = await completeTask(task.documentId);
      if (result.success) {
        await loadTasks();
        // Notify sidebar to refresh upcoming tasks
        window.dispatchEvent(new CustomEvent("tasks-updated"));
      } else {
        toast.error(result.error?.message || "Помилка оновлення");
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleStartProgress = async (task: GraphQLTask) => {
    try {
      const result = await updateTask(task.documentId, { status: "in_progress" });
      if (result.success) {
        await loadTasks();
        window.dispatchEvent(new CustomEvent("tasks-updated"));
      } else {
        toast.error(result.error?.message || "Помилка оновлення");
      }
    } catch (error) {
      console.error("Error starting task:", error);
    }
  };

  const handleDelete = async (task: GraphQLTask) => {
    if (!confirm("Видалити це завдання?")) return;
    try {
      const result = await deleteTask(task.documentId);
      if (result.success) {
        await loadTasks();
        window.dispatchEvent(new CustomEvent("tasks-updated"));
      } else {
        toast.error(result.error?.message || "Помилка видалення");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleUncomplete = async (task: GraphQLTask) => {
    try {
      const result = await updateTask(task.documentId, { status: "pending" });
      if (result.success) {
        await loadTasks();
        // Notify sidebar to refresh upcoming tasks
        window.dispatchEvent(new CustomEvent("tasks-updated"));
      } else {
        toast.error(result.error?.message || "Помилка оновлення");
      }
    } catch (error) {
      console.error("Error uncompleting task:", error);
    }
  };

  const handleEdit = (task: GraphQLTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      dueDate: formatDateForInput(task.dueDate),
      reminderAt: task.reminderAt ? formatDateForInput(task.reminderAt) : "",
      priority: task.priority,
      category: task.category,
    });
    setShowAddModal(true);
  };

  const openAddModal = () => {
    setEditingTask(null);
    setFormData(defaultFormData);
    setShowAddModal(true);
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const displayTasks = activeTab === "pending" ? pendingTasks : completedTasks;

  // Compact row for completed tasks
  const CompletedTaskRow = ({ task }: { task: GraphQLTask }) => {
    const categoryInfo = categoryConfig[task.category as TaskCategory] || categoryConfig.other;

    return (
      <div className="group flex items-center gap-3 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-100 dark:border-slate-700 transition-colors">
        <button
          onClick={() => handleUncomplete(task)}
          className="shrink-0"
          title="Повернути до активних"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-500 hover:text-amber-500 transition-colors" />
        </button>
        <span className="flex-1 text-sm text-[var(--admin-text-muted)] line-through truncate">
          {task.title}
        </span>
        <Badge className={cn("text-[10px] shrink-0 opacity-60", categoryInfo.bgColor, categoryInfo.color)}>
          {categoryInfo.label}
        </Badge>
        <span className="text-xs text-[var(--admin-text-muted)] shrink-0">
          {new Date(task.updatedAt || task.dueDate).toLocaleDateString('uk-UA')}
        </span>
        <button
          onClick={() => handleUncomplete(task)}
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-all"
          title="Повернути до активних"
        >
          <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
        </button>
        <button
          onClick={() => handleDelete(task)}
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-all"
          title="Видалити"
        >
          <Trash2 className="h-3.5 w-3.5 text-rose-400" />
        </button>
      </div>
    );
  };

  // Pin Card component - styled like a pinned note
  const TaskCard = ({ task }: { task: GraphQLTask }) => {
    const overdue = task.status !== "completed" && isOverdue(task.dueDate);
    const isCompleted = task.status === "completed";
    const isInProgress = task.status === "in_progress";

    const categoryInfo = categoryConfig[task.category as TaskCategory] || categoryConfig.other;

    // Random rotation for pin effect (-2 to 2 degrees)
    const rotation = useMemo(() => {
      const hash = task.documentId.charCodeAt(0) + task.documentId.charCodeAt(1);
      return (hash % 5) - 2;
    }, [task.documentId]);

    return (
      <div
        className={cn(
          "relative group rounded-lg border p-4 transition-all duration-200 shadow-sm",
          "hover:shadow-lg hover:-translate-y-1",
          // Pin effect - slight rotation
          `hover:rotate-0`,
          isCompleted
            ? "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60"
            : overdue
            ? "bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-800/50"
            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        )}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Pin icon */}
        <div className={cn(
          "absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-md",
          task.priority === "high" ? "bg-rose-500" : task.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
        )} />

        {/* Header with checkbox and category */}
        <div className="flex items-start justify-between gap-2 mb-2 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isCompleted) handleComplete(task);
            }}
            className="shrink-0 mt-0.5 group/check"
            disabled={isCompleted}
            title={isCompleted ? "Виконано" : isInProgress ? "В роботі" : "Натисніть, щоб виконати"}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : isInProgress ? (
              <PlayCircle className="h-5 w-5 text-blue-500" />
            ) : (
              <div className="relative">
                <Circle className="h-5 w-5 text-[var(--admin-text-muted)] group-hover/check:text-emerald-500 transition-colors" />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded opacity-0 group-hover/check:opacity-100 transition-opacity pointer-events-none">
                  Виконати
                </span>
              </div>
            )}
          </button>
          <Badge className={cn("text-[10px] shrink-0", categoryInfo.bgColor, categoryInfo.color)}>
            {categoryInfo.label}
          </Badge>
        </div>

        {/* Title */}
        <h4 className={cn(
          "font-semibold text-sm mb-2 line-clamp-2",
          isCompleted ? "text-[var(--admin-text-muted)] line-through" : "text-[var(--admin-text-primary)]"
        )}>
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-[var(--admin-text-tertiary)] mb-3 line-clamp-3">
            {task.description}
          </p>
        )}

        {/* Footer: date + badges */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--admin-border-subtle)]">
          <div className={cn(
            "flex items-center gap-1 text-xs",
            overdue ? "text-rose-500 font-medium" : "text-[var(--admin-text-muted)]"
          )}>
            <Clock className="h-3 w-3" />
            {formatDate(task.dueDate)}
          </div>
          <div className="flex items-center gap-1">
            {isInProgress && (
              <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] px-1.5">
                В роботі
              </Badge>
            )}
            {task.priority === "high" && !isCompleted && (
              <Badge className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] px-1.5">
                !
              </Badge>
            )}
          </div>
        </div>

        {/* Actions on hover */}
        <div className="absolute bottom-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-1 py-0.5 shadow-sm">
          {task.status === "pending" && (
            <button
              onClick={() => handleStartProgress(task)}
              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
              title="Почати"
            >
              <PlayCircle className="h-3.5 w-3.5 text-blue-500" />
            </button>
          )}
          <button
            onClick={() => handleEdit(task)}
            className="p-1.5 hover:bg-[var(--admin-bg)] rounded"
            title="Редагувати"
          >
            <Edit2 className="h-3.5 w-3.5 text-[var(--admin-text-muted)]" />
          </button>
          <button
            onClick={() => handleDelete(task)}
            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded"
            title="Видалити"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-400" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <Card className="admin-card border border-slate-100 dark:border-[var(--admin-border)] bg-[var(--admin-bg)] dark:bg-[var(--admin-bg)] shadow-sm overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Завдання</CardTitle>
          <Button onClick={openAddModal} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Додати
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
              activeTab === "pending"
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            Активні ({pendingTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
              activeTab === "completed"
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            Виконані ({completedTasks.length})
          </button>
        </div>
      </CardHeader>

      <CardContent className="bg-white dark:bg-admin-surface rounded-b-lg pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : displayTasks.length === 0 ? (
          <div className="text-center py-12 text-[var(--admin-text-muted)]">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="mb-4">{activeTab === "pending" ? "Немає активних завдань" : "Немає виконаних завдань"}</p>
            {activeTab === "pending" && (
              <Button onClick={openAddModal}>
                <Plus className="h-4 w-4 mr-1" />
                Створити завдання
              </Button>
            )}
          </div>
        ) : activeTab === "pending" ? (
          /* Активні завдання - картки на дошці */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-2">
            {displayTasks.map((task) => (
              <TaskCard key={task.documentId} task={task} />
            ))}
          </div>
        ) : (
          /* Виконані завдання - компактний список */
          <div className="space-y-2 py-2">
            {displayTasks.map((task) => (
              <CompletedTaskRow key={task.documentId} task={task} />
            ))}
          </div>
        )}
      </CardContent>

      {/* Add/Edit Modal */}
      <Modal
        open={showAddModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            setEditingTask(null);
            setFormData(defaultFormData);
          }
        }}
        title={editingTask ? "Редагувати завдання" : "Нове завдання"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Назва завдання <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Що потрібно зробити?"
              required
              autoFocus
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">Коротко опишіть завдання</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Опис
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Додаткові деталі, примітки, контакти..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-admin-border rounded-lg bg-white dark:bg-admin-surface-elevated text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 resize-none transition-colors duration-200"
              rows={3}
            />
          </div>

          {/* Дедлайн - простий вибір */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Дедлайн <span className="text-red-500">*</span>
            </label>

            {/* Швидкі кнопки для дати */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[
                { label: "Сьогодні", days: 0 },
                { label: "Завтра", days: 1 },
                { label: "Через 3 дні", days: 3 },
                { label: "Через тиждень", days: 7 },
              ].map(({ label, days }) => {
                const targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + days);
                const dateStr = targetDate.toISOString().split("T")[0];
                const currentDate = formData.dueDate?.split("T")[0];
                const isSelected = currentDate === dateStr;

                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      const currentTime = formData.dueDate?.split("T")[1] || "12:00";
                      setFormData({ ...formData, dueDate: `${dateStr}T${currentTime}` });
                    }}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors",
                      isSelected
                        ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Дата і час в рядок */}
            <div className="flex gap-2">
              <Input
                type="date"
                value={formData.dueDate?.split("T")[0] || ""}
                onChange={(e) => {
                  const currentTime = formData.dueDate?.split("T")[1] || "12:00";
                  setFormData({ ...formData, dueDate: `${e.target.value}T${currentTime}` });
                }}
                className="flex-1"
                required
              />
              <Input
                type="time"
                value={formData.dueDate?.split("T")[1]?.slice(0, 5) || "12:00"}
                onChange={(e) => {
                  const currentDate = formData.dueDate?.split("T")[0] || new Date().toISOString().split("T")[0];
                  setFormData({ ...formData, dueDate: `${currentDate}T${e.target.value}` });
                }}
                className="w-24"
              />
            </div>

            {/* Показуємо обраний час */}
            {formData.dueDate && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                📅 {new Date(formData.dueDate).toLocaleDateString("uk-UA", { weekday: "long", day: "numeric", month: "long" })} о {formData.dueDate.split("T")[1]?.slice(0, 5) || "12:00"}
              </p>
            )}
          </div>

          {/* Нагадування - опціонально */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Нагадування <span className="text-slate-400 font-normal">(опціонально)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Без нагадування", value: "" },
                { label: "За 1 год", hours: 1 },
                { label: "За 3 год", hours: 3 },
                { label: "За день", hours: 24 },
              ].map((option) => {
                const isNoReminder = option.value === "";
                const isSelected = isNoReminder
                  ? !formData.reminderAt
                  : formData.reminderAt && formData.dueDate && (() => {
                      const due = new Date(formData.dueDate);
                      const reminder = new Date(formData.reminderAt);
                      const diffHours = (due.getTime() - reminder.getTime()) / (1000 * 60 * 60);
                      return Math.abs(diffHours - (option.hours || 0)) < 0.1;
                    })();

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => {
                      if (isNoReminder) {
                        setFormData({ ...formData, reminderAt: "" });
                      } else if (formData.dueDate && option.hours) {
                        const dueDate = new Date(formData.dueDate);
                        dueDate.setHours(dueDate.getHours() - option.hours);
                        setFormData({ ...formData, reminderAt: dueDate.toISOString().slice(0, 16) });
                      }
                    }}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors",
                      isSelected
                        ? "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Категорія
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as TaskCategory })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">🚚 Доставка</SelectItem>
                  <SelectItem value="supply">📦 Поставка</SelectItem>
                  <SelectItem value="maintenance">🔧 Обслуговування</SelectItem>
                  <SelectItem value="meeting">👥 Зустріч</SelectItem>
                  <SelectItem value="other">📝 Інше</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Пріоритет
              </label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">⬇️ Низький</SelectItem>
                  <SelectItem value="medium">➡️ Середній</SelectItem>
                  <SelectItem value="high">⬆️ Високий</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setEditingTask(null);
                setFormData(defaultFormData);
              }}
              className="flex-1"
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              variant="filled"
              className="flex-1"
              disabled={isSubmitting || !formData.title.trim() || !formData.dueDate}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingTask ? (
                "Зберегти"
              ) : (
                "Створити"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
