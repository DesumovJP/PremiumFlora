/**
 * Products Table Component (Desktop)
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Pencil, PackageMinus, Trash, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { stockTone } from "../types";

type ProductsTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onWriteOff: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductsTable({
  products,
  onEdit,
  onWriteOff,
  onDelete,
}: ProductsTableProps) {
  return (
    <div className="hidden overflow-x-auto sm:block">
      <Table className="min-w-[56.25rem] overflow-hidden rounded-2xl border border-slate-100 table-border-dark bg-white dark:bg-admin-surface">
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 text-center">Назва</TableHead>
            <TableHead className="text-center">Висоти / ціни / кількість</TableHead>
            <TableHead className="text-center min-w-[7.5rem] px-6">Загальний запас</TableHead>
            <TableHead className="text-center min-w-[6.5rem] px-4">Оновлено</TableHead>
            <TableHead className="text-center min-w-[11.25rem] px-6">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => {
            const total = product.variants.reduce((acc, variant) => acc + variant.stock, 0);
            const key = product.documentId || product.slug || `product-fallback-${index}-${product.name}`;
            return (
              <TableRow key={key} className="align-top">
                <TableCell className="px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-xl bg-slate-100 dark:bg-admin-surface">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-admin-text-primary">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="space-y-1">
                  <div className="flex flex-wrap gap-2 max-w-md">
                    {product.variants.map((variant) => (
                      <Badge
                        key={variant.size}
                        className={cn("text-xs px-2.5 py-1 w-auto flex items-center gap-1", stockTone(variant.stock))}
                      >
                        {variant.size} · {variant.price} грн · <Package className="h-3 w-3 shrink-0" /> {variant.stock} шт
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-emerald-700 min-w-[7.5rem] px-6 text-center align-middle">{total} шт</TableCell>
                <TableCell className="text-xs text-slate-500 dark:text-admin-text-tertiary min-w-[7.5rem] px-4 text-center align-middle">
                  {product.updatedAt
                    ? (
                      <div className="flex flex-col">
                        <span>{new Date(product.updatedAt).toLocaleDateString('uk-UA', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}</span>
                        <span className="text-slate-400">{new Date(product.updatedAt).toLocaleTimeString('uk-UA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</span>
                      </div>
                    )
                    : '—'}
                </TableCell>
                <TableCell className="min-w-[11.25rem] px-6 text-center align-middle">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Показувати на сайті"
                      title="Показувати на сайті"
                      onClick={() => {
                        const productUrl = `/catalog/${product.slug || product.documentId}`;
                        if (productUrl !== '/catalog/') {
                          window.open(productUrl, '_blank');
                        }
                      }}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Редагувати товар"
                      title="Редагувати товар"
                      onClick={() => onEdit(product)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4 text-emerald-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Списати товар"
                      title="Списати товар"
                      onClick={() => onWriteOff(product)}
                      className="h-8 w-8"
                    >
                      <PackageMinus className="h-4 w-4 text-amber-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Видалити товар"
                      title="Видалити товар"
                      onClick={() => onDelete(product)}
                      className="h-8 w-8"
                    >
                      <Trash className="h-4 w-4 text-rose-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
