/**
 * Products Card List Component (Mobile)
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, PackageMinus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { stockTone } from "../types";

type ProductsCardListProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onWriteOff: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductsCardList({
  products,
  onEdit,
  onWriteOff,
  onDelete,
}: ProductsCardListProps) {
  return (
    <div className="grid gap-3 sm:hidden animate-stagger">
      {products.map((product, index) => {
        const total = product.variants.reduce((acc, variant) => acc + variant.stock, 0);
        const key = product.documentId || product.slug || `product-fallback-${index}-${product.name}`;
        return (
          <Card key={key} className="admin-card border border-slate-100 dark:border-admin-border bg-white/90 dark:bg-admin-surface animate-fade-in">
            <CardContent className="flex gap-3 p-3">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-admin-surface">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-admin-text-primary">{product.name}</p>
                    <p className="text-xs text-slate-500 dark:text-admin-text-tertiary">Загальний запас: {total} шт</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Редагувати товар"
                      title="Редагувати товар"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(product);
                      }}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4 text-emerald-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Списати товар"
                      title="Списати товар"
                      onClick={(e) => {
                        e.stopPropagation();
                        onWriteOff(product);
                      }}
                      className="h-8 w-8"
                    >
                      <PackageMinus className="h-4 w-4 text-amber-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Видалити товар"
                      title="Видалити товар"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(product);
                      }}
                      className="h-8 w-8"
                    >
                      <Trash className="h-4 w-4 text-rose-600" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <Badge
                      key={variant.size}
                      className={cn("text-xs px-2.5 py-1 w-auto", stockTone(variant.stock))}
                    >
                      {variant.size} · {variant.price} грн · {variant.stock} шт
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
