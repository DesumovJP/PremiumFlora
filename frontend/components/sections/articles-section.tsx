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
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  type GraphQLArticle,
  type CreateArticleInput,
} from "@/lib/strapi";
import type { GraphQLBlock } from "@/lib/graphql/types";
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Pin,
  Book,
  FileQuestion,
  Lightbulb,
  Info,
  Search,
  ChevronDown,
  ChevronUp,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Image as ImageIcon,
  Leaf,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

// Simple toast helper (TODO: replace with proper toast library if needed)
const toast = {
  success: (msg: string) => console.log(`[SUCCESS] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
};

const categoryIcons: Record<string, typeof FileText> = {
  note: FileText,
  guide: Book,
  procedure: FileQuestion,
  info: Lightbulb,
  blog: FileText,
  care: Leaf,
};

const categoryLabels: Record<string, string> = {
  note: "Нотатка",
  guide: "Гайд",
  procedure: "Процедура",
  info: "Інформація",
  blog: "Блог",
  care: "Догляд",
};

const categoryColors: Record<string, string> = {
  note: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  guide: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  procedure: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  info: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  blog: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  care: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
};

const priorityLabels = {
  low: "Низький",
  medium: "Середній",
  high: "Високий",
};

type ArticleCategory = "note" | "guide" | "procedure" | "info" | "blog" | "care";
type ArticlePriority = "low" | "medium" | "high";

interface ArticleFormData {
  title: string;
  content: string;
  category: ArticleCategory;
  priority: ArticlePriority;
  pinned: boolean;
}

const defaultFormData: ArticleFormData = {
  title: "",
  content: "",
  category: "note",
  priority: "medium",
  pinned: false,
};

/**
 * Конвертує Strapi blocks у простий текст
 */
function blocksToText(blocks: GraphQLBlock[] | null): string {
  if (!blocks || !Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      if (block.type === "paragraph" && block.children) {
        return block.children.map((child: any) => child.text || "").join("");
      }
      if (block.type === "heading" && block.children) {
        const level = (block as any).level || 2;
        const text = block.children.map((child: any) => child.text || "").join("");
        return "#".repeat(level) + " " + text;
      }
      if (block.type === "list" && (block as any).children) {
        return (block as any).children
          .map((item: any) => {
            const text = item.children
              ?.map((c: any) => c.children?.map((t: any) => t.text || "").join("") || "")
              .join("") || "";
            return "• " + text;
          })
          .join("\n");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Конвертує простий текст у Strapi blocks
 */
function textToBlocks(text: string): GraphQLBlock[] {
  if (!text.trim()) return [];

  const lines = text.split("\n");
  const blocks: GraphQLBlock[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Заголовки
    if (trimmed.startsWith("### ")) {
      blocks.push({
        type: "heading",
        children: [{ type: "text", text: trimmed.slice(4) }],
        // @ts-expect-error - level is valid for heading type
        level: 3,
      });
    } else if (trimmed.startsWith("## ")) {
      blocks.push({
        type: "heading",
        children: [{ type: "text", text: trimmed.slice(3) }],
        // @ts-expect-error - level is valid for heading type
        level: 2,
      });
    } else if (trimmed.startsWith("# ")) {
      blocks.push({
        type: "heading",
        children: [{ type: "text", text: trimmed.slice(2) }],
        // @ts-expect-error - level is valid for heading type
        level: 1,
      });
    } else {
      // Звичайний параграф
      blocks.push({
        type: "paragraph",
        children: [{ type: "text", text: trimmed }],
      });
    }
  }

  return blocks;
}

export function ArticlesSection() {
  const [articles, setArticles] = useState<GraphQLArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<GraphQLArticle | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>(defaultFormData);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | "all">("all");

  const loadArticles = useCallback(async () => {
    try {
      const result = await getArticles();
      if (result.success && result.data) {
        setArticles(result.data);
      }
    } catch (error) {
      console.error("Error loading articles:", error);
      toast.error("Не вдалося завантажити статті");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);

    try {
      const contentBlocks = textToBlocks(formData.content);

      if (editingArticle) {
        const result = await updateArticle(editingArticle.documentId, {
          title: formData.title,
          content: contentBlocks,
          category: formData.category,
          priority: formData.priority,
          pinned: formData.pinned,
        });

        if (result.success) {
          toast.success("Статтю оновлено");
          await loadArticles();
        } else {
          toast.error("Не вдалося оновити статтю");
        }
      } else {
        const articleData: CreateArticleInput = {
          title: formData.title,
          content: contentBlocks,
          category: formData.category,
          priority: formData.priority,
          pinned: formData.pinned,
        };

        const result = await createArticle(articleData);

        if (result.success) {
          toast.success("Статтю створено");
          await loadArticles();
        } else {
          toast.error("Не вдалося створити статтю");
        }
      }

      setShowAddModal(false);
      setEditingArticle(null);
      setFormData(defaultFormData);
    } catch (error) {
      console.error("Error submitting article:", error);
      toast.error("Помилка збереження");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (article: GraphQLArticle) => {
    if (!confirm("Видалити цю статтю?")) return;

    try {
      const result = await deleteArticle(article.documentId);
      if (result.success) {
        toast.success("Статтю видалено");
        await loadArticles();
      } else {
        toast.error("Не вдалося видалити статтю");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Помилка видалення");
    }
  };

  const handleEdit = (article: GraphQLArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: blocksToText(article.content),
      category: article.category,
      priority: article.priority,
      pinned: article.pinned,
    });
    setShowAddModal(true);
  };

  const handleTogglePin = async (article: GraphQLArticle) => {
    try {
      const result = await updateArticle(article.documentId, {
        pinned: !article.pinned,
      });
      if (result.success) {
        toast.success(article.pinned ? "Статтю відкріплено" : "Статтю закріплено");
        await loadArticles();
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast.error("Помилка оновлення");
    }
  };

  const openAddModal = () => {
    setEditingArticle(null);
    setFormData(defaultFormData);
    setShowAddModal(true);
  };

  // Фільтрація статей
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blocksToText(article.content).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Сортування: закріплені першими
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const ArticleItem = ({ article }: { article: GraphQLArticle }) => {
    const CategoryIcon = categoryIcons[article.category] || FileText;
    const isExpanded = expandedArticle === article.documentId;
    const contentText = blocksToText(article.content);

    return (
      <div
        className={cn(
          "border rounded-xl transition-colors",
          article.pinned
            ? "border-amber-200 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-900/10"
            : "border-slate-100 dark:border-admin-border bg-white/90 dark:bg-admin-surface-elevated"
        )}
      >
        <div
          className="flex items-start gap-3 p-3 cursor-pointer"
          onClick={() => setExpandedArticle(isExpanded ? null : article.documentId)}
        >
          <div
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
              categoryColors[article.category]
            )}
          >
            <CategoryIcon className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <p className="text-sm font-medium text-slate-900 dark:text-admin-text-primary">
                {article.title}
              </p>
              {article.pinned && (
                <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge tone="outline" className={cn("text-xs", categoryColors[article.category])}>
                {categoryLabels[article.category]}
              </Badge>
              <span className="text-xs text-slate-500 dark:text-admin-text-tertiary">
                {formatDate(article.updatedAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePin(article);
              }}
              className={cn(
                "p-1.5 rounded transition-colors",
                article.pinned
                  ? "text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                  : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              title={article.pinned ? "Відкріпити" : "Закріпити"}
            >
              <Pin className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(article);
              }}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              title="Редагувати"
            >
              <Edit2 className="h-4 w-4 text-slate-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(article);
              }}
              className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded"
              title="Видалити"
            >
              <Trash2 className="h-4 w-4 text-rose-500" />
            </button>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>

        {isExpanded && contentText && (
          <div className="px-3 pb-3 pt-0">
            <div className="pl-12 border-t border-slate-100 dark:border-admin-border pt-3">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-admin-text-secondary font-sans">
                  {contentText}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="admin-card border border-slate-100 dark:border-[var(--admin-border)] bg-white/90 dark:bg-admin-surface shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Статті</CardTitle>
            <CardDescription>Внутрішні нотатки, гайди та процедури</CardDescription>
          </div>
          <Button onClick={openAddModal} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-1" />
            Додати
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Пошук статей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ArticleCategory | "all")}
            className="px-3 py-2 border border-slate-200 dark:border-admin-border rounded-lg bg-white dark:bg-admin-surface-elevated text-sm"
          >
            <option value="all">Всі категорії</option>
            <option value="note">Нотатки</option>
            <option value="guide">Гайди</option>
            <option value="procedure">Процедури</option>
            <option value="info">Інформація</option>
            <option value="blog">Блог</option>
            <option value="care">Догляд</option>
          </select>
        </div>

        {/* Articles List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : sortedArticles.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-admin-text-tertiary">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{searchQuery ? "Нічого не знайдено" : "Немає статей"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedArticles.map((article) => (
              <ArticleItem key={article.documentId} article={article} />
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
            setEditingArticle(null);
            setFormData(defaultFormData);
          }
        }}
        title={editingArticle ? "Редагувати статтю" : "Нова стаття"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Заголовок *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Введіть заголовок"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Зміст
            </label>
            <div className="text-xs text-slate-500 dark:text-admin-text-tertiary mb-2">
              Використовуйте # для заголовків (# H1, ## H2, ### H3)
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Напишіть вміст статті...&#10;&#10;# Заголовок&#10;## Підзаголовок&#10;&#10;Текст параграфу..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-admin-border rounded-lg bg-white dark:bg-admin-surface-elevated text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-mono text-sm transition-colors"
              rows={10}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Категорія
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as ArticleCategory })
                }
                className="w-full px-3 py-2 border border-slate-200 dark:border-admin-border rounded-lg bg-white dark:bg-admin-surface-elevated text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
              >
                <option value="note">Нотатка</option>
                <option value="guide">Гайд</option>
                <option value="procedure">Процедура</option>
                <option value="info">Інформація</option>
                <option value="blog">Блог</option>
                <option value="care">Догляд</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Пріоритет
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as ArticlePriority })
                }
                className="w-full px-3 py-2 border border-slate-200 dark:border-admin-border rounded-lg bg-white dark:bg-admin-surface-elevated text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
              >
                <option value="low">Низький</option>
                <option value="medium">Середній</option>
                <option value="high">Високий</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinned"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label
              htmlFor="pinned"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Закріпити статтю
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setEditingArticle(null);
                setFormData(defaultFormData);
              }}
              className="flex-1"
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting || !formData.title.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : editingArticle ? (
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
