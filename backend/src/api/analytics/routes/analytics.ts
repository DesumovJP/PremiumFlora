/**
 * Analytics Routes
 *
 * Маршрути для отримання аналітичних даних
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/analytics/dashboard',
      handler: 'analytics.dashboard',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/analytics/stock',
      handler: 'analytics.stock',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/analytics/sales',
      handler: 'analytics.sales',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/analytics/write-offs',
      handler: 'analytics.writeOffs',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/analytics/customers/top',
      handler: 'analytics.topCustomers',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/analytics/daily-sales',
      handler: 'analytics.dailySales',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
