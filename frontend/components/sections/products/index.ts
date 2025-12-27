/**
 * Products Section Module
 *
 * Експорт компонентів для секції товарів
 */

// Types
export * from './types';

// Hooks
export { useProductForm } from './hooks/use-product-form';
export { useProductSorting } from './hooks/use-product-sorting';

// Components
export { LowStockAlert } from './components/low-stock-alert';
export { ProductsTable } from './components/products-table';
export { ProductsCardList } from './components/products-card-list';
export { ProductsHeader } from './components/products-header';

// Modals
export { AddProductModal } from './modals/add-product-modal';
export { EditProductModal } from './modals/edit-product-modal';
export { WriteOffModal } from './modals/write-off-modal';
export { DeleteModal } from './modals/delete-modal';

// Main component (re-export from parent for backward compatibility)
export { ProductsSection } from '../products-section';
