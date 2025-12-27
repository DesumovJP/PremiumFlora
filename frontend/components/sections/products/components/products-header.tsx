import { Button } from "@/components/ui/button";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Download } from "lucide-react";

type ProductsHeaderProps = {
  onOpenSupply: () => void;
  onOpenExport: () => void;
  onAddProduct: () => void;
};

export function ProductsHeader({ onOpenSupply, onOpenExport, onAddProduct }: ProductsHeaderProps) {
  return (
    <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start justify-between gap-2 sm:block">
        <div>
          <CardTitle className="text-2xl">Управління товарами</CardTitle>
          <CardDescription>Каталог квітів з варіантами висоти, залишками та діями</CardDescription>
        </div>
        {/* Mobile: Export button next to title */}
        <Button variant="outline" className="sm:hidden shrink-0 text-slate-500 dark:text-admin-text-tertiary" onClick={onOpenExport} size="icon" title="Експортувати">
          <Download className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
        {/* Mobile: 50/50 buttons */}
        <div className="flex gap-2 sm:contents">
          <Button variant="outline" onClick={onOpenSupply} className="flex-1 sm:flex-none sm:w-auto">
            Заплановані закупки
          </Button>
          <Button onClick={onAddProduct} className="flex-1 sm:flex-none sm:w-auto">
            Додати товар
          </Button>
        </div>
        {/* Desktop: Export button */}
        <Button variant="outline" className="hidden sm:flex text-slate-500 dark:text-admin-text-tertiary" onClick={onOpenExport} size="icon" title="Експортувати">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
}
