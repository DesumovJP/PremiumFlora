/**
 * useModal Hook
 *
 * Універсальний хук для керування станом модальних вікон.
 * Замінює повторюване використання useState для isOpen/data в компонентах.
 *
 * @example
 * // Модалка без даних
 * const addModal = useModal();
 * addModal.open();
 * addModal.close();
 *
 * @example
 * // Модалка з даними (напр. редагування продукту)
 * const editModal = useModal<Product>();
 * editModal.open(selectedProduct);
 * // editModal.data містить Product | null
 *
 * @example
 * // В JSX
 * <Modal open={editModal.isOpen} onClose={editModal.close}>
 *   {editModal.data && <EditForm product={editModal.data} />}
 * </Modal>
 */

import { useState, useCallback } from 'react';

export interface UseModalReturn<T = void> {
  /** Чи відкрита модалка */
  isOpen: boolean;
  /** Дані, передані при відкритті (null якщо закрита або без даних) */
  data: T | null;
  /** Відкрити модалку, опціонально з даними */
  open: (data?: T) => void;
  /** Закрити модалку та очистити дані */
  close: () => void;
  /** Перемкнути стан модалки */
  toggle: () => void;
  /** Оновити дані без зміни стану відкриття */
  setData: (data: T | null) => void;
}

/**
 * Хук для керування станом модального вікна
 *
 * @param initialOpen - Початковий стан (за замовчуванням: false)
 * @returns Об'єкт з методами керування модалкою
 */
export function useModal<T = void>(initialOpen = false): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((newData?: T) => {
    if (newData !== undefined) {
      setData(newData);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Затримка очищення даних для анімації закриття
    setTimeout(() => setData(null), 150);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    setData,
  };
}

/**
 * Хук для модалки підтвердження дії
 *
 * @example
 * const deleteConfirm = useConfirmModal<{ id: string; name: string }>();
 * deleteConfirm.open({ id: '123', name: 'Троянда' });
 * // При підтвердженні: deleteConfirm.confirm() повертає дані та закриває
 */
export interface UseConfirmModalReturn<T> extends UseModalReturn<T> {
  /** Підтвердити та отримати дані */
  confirm: () => T | null;
  /** Скасувати (те саме що close) */
  cancel: () => void;
}

export function useConfirmModal<T = void>(): UseConfirmModalReturn<T> {
  const modal = useModal<T>();

  const confirm = useCallback(() => {
    const currentData = modal.data;
    modal.close();
    return currentData;
  }, [modal]);

  return {
    ...modal,
    confirm,
    cancel: modal.close,
  };
}
