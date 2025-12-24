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
import { Modal } from "@/components/ui/modal";
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
  Bell,
  Trash2,
  Edit2,
  Loader2,
  AlertCircle,
  Package,
  Truck,
  Wrench,
  Users,
  MoreHorizontal,
  X,
  PlayCircle,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

// Simple toast helper (TODO: replace with proper toast library if needed)
const toast = {
  success: (msg: string) => console.log(`[SUCCESS] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
};

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

const statusColors = {
  pending: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  in_progress: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  completed: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
};

const statusLabels = {
  pending: "Очікує",
  in_progress: "В роботі",
  completed: "Виконано",
  cancelled: "Скасовано",
};

const categoryIcons = {
  delivery: Truck,
  supply: Package,
  maintenance: Wrench,
  meeting: Users,
  other: MoreHorizontal,
};

const categoryLabels = {
  delivery: "Доставка",
  supply: "Поставка",
  maintenance: "Обслуговування",
  meeting: "Зустріч",
  other: "Інше",
};

type TaskPriority = "low" | "medium" | "high";
type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
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

export function TodoSection() {
  const [tasks, setTasks] = useState<GraphQLTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<GraphQLTask | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");

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
    // Polling кожні 30 секунд
    const interval = setInterval(loadTasks, 30000);
    return () => clearInterval(interval);
  }, [loadTasks]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const hasUpcomingReminder = (task: GraphQLTask) => {
    if (!task.reminderAt) return false;
    const reminder = new Date(task.reminderAt);
    const now = new Date();
    const diff = reminder.getTime() - now.getTime();
    // Нагадування за 1 годину
    return diff > 0 && diff < 60 * 60 * 1000;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dueDate) return;

    setIsSubmitting(true);

    try {
      if (editingTask) {
        // Оновлення
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
        } else {
          toast.error("Не вдалося оновити завдання");
        }
      } else {
        // Створення
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
        } else {
          toast.error("Не вдалося створити завдання");
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
        toast.success("Завдання виконано");
        await loadTasks();
      } else {
        toast.error("Не вдалося оновити статус");
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Помилка оновлення");
    }
  };

  const handleStartProgress = async (task: GraphQLTask) => {
    try {
      const result = await updateTask(task.documentId, { status: "in_progress" });
      if (result.success) {
        toast.success("Завдання в роботі");
        await loadTasks();
      } else {
        toast.error("Не вдалося оновити статус");
      }
    } catch (error) {
      console.error("Error starting task:", error);
      toast.error("Помилка оновлення");
    }
  };

  const handleDelete = async (task: GraphQLTask) => {
    if (!confirm("Видалити це завдання?")) return;

    try {
      const result = await deleteTask(task.documentId);
      if (result.success) {
        toast.success("Завдання видалено");
        await loadTasks();
      } else {
        toast.error("Не вдалося видалити завдання");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Помилка видалення");
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

  const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const TaskItem = ({ task }: { task: GraphQLTask }) => {
    const CategoryIcon = categoryIcons[task.category] || MoreHorizontal;
    const overdue = task.status !== "completed" && isOverdue(task.dueDate);
    const reminder = hasUpcomingReminder(task);

    return (
      <div
        className={cn(
          "flex items-start gap-3 p-3 rounded-xl border transition-colors group",
          task.status === "completed"
            ? "border-slate-100 dark:border-admin-border bg-slate-50/50 dark:bg-admin-surface-elevated/50 opacity-60"
            : overdue
            ? "border-rose-200 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-900/10"
            : "border-slate-100 dark:border-admin-border bg-white/90 dark:bg-admin-surface-elevated hover:border-emerald-200 dark:hover:border-emerald-700"
        )}
      >
        {/* Status button */}
        <button
          onClick={() => task.status !== "completed" && handleComplete(task)}
          className="shrink-0 mt-0.5"
          disabled={task.status === "completed"}
        >
          {task.status === "completed" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : task.status === "in_progress" ? (
            <PlayCircle className="h-5 w-5 text-blue-500" />
          ) : (
            <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600 hover:text-emerald-500" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start gap-2">
            <p
              className={cn(
                "text-sm font-medium",
                task.status === "completed"
                  ? "text-slate-500 dark:text-admin-text-tertiary line-through"
                  : "text-slate-900 dark:text-admin-text-primary"
              )}
            >
              {task.title}
            </p>
            {reminder && (
              <Bell className="h-4 w-4 text-amber-500 animate-pulse shrink-0" />
            )}
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 dark:text-admin-text-tertiary line-clamp-1">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-admin-text-tertiary">
              <CategoryIcon className="h-3.5 w-3.5" />
              <span>{categoryLabels[task.category]}</span>
            </div>
            <Badge
              tone="outline"
              className={cn("text-xs", priorityColors[task.priority])}
            >
              {priorityLabels[task.priority]}
            </Badge>
            {task.status !== "completed" && (
              <Badge
                tone="outline"
                className={cn("text-xs", statusColors[task.status])}
              >
                {statusLabels[task.status]}
              </Badge>
            )}
          </div>
        </div>

        {/* Date & Actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className={cn(
              "text-xs",
              overdue
                ? "text-rose-600 dark:text-rose-400 font-medium"
                : "text-slate-500 dark:text-admin-text-tertiary"
            )}
          >
            {formatDate(task.dueDate)}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {task.status === "pending" && (
              <button
                onClick={() => handleStartProgress(task)}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                title="Почати"
              >
                <PlayCircle className="h-4 w-4 text-blue-500" />
              </button>
            )}
            <button
              onClick={() => handleEdit(task)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              title="Редагувати"
            >
              <Edit2 className="h-4 w-4 text-slate-500" />
            </button>
            <button
              onClick={() => handleDelete(task)}
              className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded"
              title="Видалити"
            >
              <Trash2 className="h-4 w-4 text-rose-500" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="admin-card border border-slate-100 dark:border-[#30363d] bg-white/90 dark:bg-admin-surface shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Завдання</CardTitle>
            <CardDescription>
              Планування завдань з прив'язкою до календаря
            </CardDescription>
          </div>
          <Button
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Додати
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-admin-border">
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "pending"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            )}
          >
            <Clock className="h-4 w-4 inline mr-1.5" />
            Активні ({pendingTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "completed"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            )}
          >
            <CheckCircle2 className="h-4 w-4 inline mr-1.5" />
            Виконані ({completedTasks.length})
          </button>
        </div>

        {/* Tasks List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : activeTab === "pending" ? (
          <div className="space-y-2">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-admin-text-tertiary">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Немає активних завдань</p>
              </div>
            ) : (
              pendingTasks.map((task) => <TaskItem key={task.documentId} task={task} />)
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {completedTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-admin-text-tertiary">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Немає виконаних завдань</p>
              </div>
            ) : (
              completedTasks.map((task) => <TaskItem key={task.documentId} task={task} />)
            )}
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
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Назва *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Введіть назву завдання"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Опис
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Додаткова інформація..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-admin-border rounded-lg bg-white dark:bg-admin-surface-elevated text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Термін виконання *
              </label>
              <Input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <Bell className="h-4 w-4 inline mr-1" />
                Нагадування
              </label>
              <Input
                type="datetime-local"
                value={formData.reminderAt}
                onChange={(e) => setFormData({ ...formData, reminderAt: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Пріоритет
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-admin-border rounded-lg bg-white dark:bg-admin-surface-elevated text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="low">Низький</option>
                <option value="medium">Середній</option>
                <option value="high">Високий</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Категорія
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-admin-border rounded-lg bg-white dark:bg-admin-surface-elevated text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="delivery">Доставка</option>
                <option value="supply">Поставка</option>
                <option value="maintenance">Обслуговування</option>
                <option value="meeting">Зустріч</option>
                <option value="other">Інше</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
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
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting || !formData.title.trim() || !formData.dueDate}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
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
