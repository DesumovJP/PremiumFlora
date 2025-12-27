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
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

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
      } else {
        toast.error(result.error?.message || "Помилка видалення");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
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

  // Task row component
  const TaskRow = ({ task }: { task: GraphQLTask }) => {
    const overdue = task.status !== "completed" && isOverdue(task.dueDate);
    const isCompleted = task.status === "completed";
    const isInProgress = task.status === "in_progress";
    const isExpanded = expandedTaskId === task.documentId;

    const categoryInfo = categoryConfig[task.category as TaskCategory] || categoryConfig.other;

    return (
      <div
        className={cn(
          "rounded-xl border border-l-4 transition-colors",
          priorityBorderColor[task.priority as TaskPriority] || priorityBorderColor.medium,
          isCompleted
            ? "bg-slate-50/50 dark:bg-slate-800/40 border-y-transparent border-r-transparent opacity-70"
            : overdue
            ? "bg-rose-50/50 dark:bg-rose-900/10 border-y-rose-100 border-r-rose-100 dark:border-y-rose-900/30 dark:border-r-rose-900/30"
            : "bg-white dark:bg-admin-surface-elevated border-y-slate-100 border-r-slate-100 dark:border-y-admin-border dark:border-r-admin-border"
        )}
      >
        {/* Main row - always visible */}
        <div className="group flex items-center gap-3 px-4 py-3">
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isCompleted) handleComplete(task);
            }}
            className="shrink-0"
            disabled={isCompleted}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : isInProgress ? (
              <PlayCircle className="h-5 w-5 text-blue-500" />
            ) : (
              <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600 hover:text-emerald-500 transition-colors" />
            )}
          </button>


          {/* Title - clickable on mobile to expand */}
          <button
            onClick={() => toggleExpand(task.documentId)}
            className="flex-1 min-w-0 text-left sm:pointer-events-none"
          >
            <p className={cn(
              "text-sm font-medium truncate",
              isCompleted ? "text-slate-400 line-through" : "text-slate-800 dark:text-admin-text-primary"
            )}>
              {task.title}
            </p>
          </button>

          {/* Mobile expand indicator */}
          <ChevronDown className={cn(
            "h-4 w-4 text-slate-400 shrink-0 sm:hidden transition-transform",
            isExpanded && "rotate-180"
          )} />

          {/* Category badge - desktop only */}
          <Badge className={cn("text-xs shrink-0 hidden sm:inline-flex", categoryInfo.bgColor, categoryInfo.color)}>
            {categoryInfo.label}
          </Badge>

          {/* Priority badge - desktop only (high only shows extra badge) */}
          {task.priority === "high" && !isCompleted && (
            <Badge className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs shrink-0 hidden sm:inline-flex">
              Терміново
            </Badge>
          )}

          {/* In progress badge - desktop only */}
          {isInProgress && (
            <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs shrink-0 hidden sm:inline-flex">
              В роботі
            </Badge>
          )}

          {/* Date - desktop only */}
          <div className={cn(
            "text-xs shrink-0 hidden sm:block",
            overdue ? "text-rose-500 font-medium" : "text-slate-400"
          )}>
            {formatDate(task.dueDate)}
          </div>

          {/* Actions - desktop only */}
          <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {task.status === "pending" && (
              <button
                onClick={() => handleStartProgress(task)}
                className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                title="Почати"
              >
                <PlayCircle className="h-4 w-4 text-blue-500" />
              </button>
            )}
            <button
              onClick={() => handleEdit(task)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              title="Редагувати"
            >
              <Edit2 className="h-4 w-4 text-slate-400" />
            </button>
            <button
              onClick={() => handleDelete(task)}
              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
              title="Видалити"
            >
              <Trash2 className="h-4 w-4 text-rose-400" />
            </button>
          </div>
        </div>

        {/* Expanded content - mobile only */}
        <div className={cn(
          "sm:hidden overflow-hidden transition-all duration-200",
          isExpanded ? "max-h-96" : "max-h-0"
        )}>
          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-100 dark:border-admin-border">
            {/* Description */}
            {task.description && (
              <p className="text-sm text-slate-600 dark:text-admin-text-secondary">
                {task.description}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap gap-2">
              {/* Category */}
              <Badge className={cn("text-xs", categoryInfo.bgColor, categoryInfo.color)}>
                {categoryInfo.label}
              </Badge>

              {/* Priority */}
              {task.priority === "high" && (
                <Badge className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs">
                  Терміново
                </Badge>
              )}

              {/* Status */}
              {isInProgress && (
                <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs">
                  В роботі
                </Badge>
              )}
            </div>

            {/* Date */}
            <div className={cn(
              "flex items-center gap-1.5 text-sm",
              overdue ? "text-rose-500 font-medium" : "text-slate-500"
            )}>
              <Clock className="h-4 w-4" />
              {formatDate(task.dueDate)}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {task.status === "pending" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartProgress(task)}
                  className="flex-1"
                >
                  <PlayCircle className="h-4 w-4 mr-1.5" />
                  Почати
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(task)}
                className="flex-1"
              >
                <Edit2 className="h-4 w-4 mr-1.5" />
                Редагувати
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(task)}
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border border-slate-100 dark:border-[#30363d] bg-white/90 dark:bg-admin-surface shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Завдання</CardTitle>
          <Button onClick={openAddModal} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
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

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : displayTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="mb-4">{activeTab === "pending" ? "Немає активних завдань" : "Немає виконаних завдань"}</p>
            {activeTab === "pending" && (
              <Button onClick={openAddModal} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-1" />
                Створити завдання
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayTasks.map((task) => (
              <TaskRow key={task.documentId} task={task} />
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Дедлайн *
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
                Нагадування
              </label>
              <Input
                type="datetime-local"
                value={formData.reminderAt}
                onChange={(e) => setFormData({ ...formData, reminderAt: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Категорія
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                className="w-full h-11 px-3 py-2 border border-slate-200 dark:border-admin-border rounded-xl bg-white dark:bg-admin-surface-elevated text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 transition-colors duration-200"
              >
                <option value="delivery">🚚 Доставка</option>
                <option value="supply">📦 Поставка</option>
                <option value="maintenance">🔧 Обслуговування</option>
                <option value="meeting">👥 Зустріч</option>
                <option value="other">📝 Інше</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Пріоритет
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full h-11 px-3 py-2 border border-slate-200 dark:border-admin-border rounded-xl bg-white dark:bg-admin-surface-elevated text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 transition-colors duration-200"
              >
                <option value="low">⬇️ Низький</option>
                <option value="medium">➡️ Середній</option>
                <option value="high">⬆️ Високий</option>
              </select>
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
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
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
