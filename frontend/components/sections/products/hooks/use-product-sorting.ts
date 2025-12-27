import { useState, useMemo } from "react";
import type { Product } from "@/lib/types";
import type { SortKey, SortDirection } from "../types";

export function useProductSorting(products: Product[]) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'uk');
          break;
        case 'price':
          // Sort by minimum price
          const minPriceA = Math.min(...a.variants.map(v => v.price));
          const minPriceB = Math.min(...b.variants.map(v => v.price));
          comparison = minPriceA - minPriceB;
          break;
        case 'stock':
          // Sort by total stock
          const totalStockA = a.variants.reduce((sum, v) => sum + v.stock, 0);
          const totalStockB = b.variants.reduce((sum, v) => sum + v.stock, 0);
          comparison = totalStockA - totalStockB;
          break;
        case 'updatedAt':
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [products, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // If clicking same key, toggle direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New key - set it and default direction
      setSortKey(key);
      setSortDirection(key === 'updatedAt' || key === 'stock' ? 'desc' : 'asc');
    }
  };

  return {
    sortKey,
    sortDirection,
    sortedProducts,
    handleSort,
    setSortKey,
    setSortDirection,
  };
}
