/**
 * Import Routes
 *
 * Кастомні маршрути для імпорту Excel файлів
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/imports/excel',
      handler: 'import.excel',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/imports/update-prices',
      handler: 'import.updatePrices',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/imports/:id',
      handler: 'import.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
