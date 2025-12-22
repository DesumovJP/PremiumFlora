/**
 * Planned Supply Routes
 *
 * Маршрути для роботи з запланованими поставками
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/planned-supply/low-stock',
      handler: 'planned-supply.lowStock',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/planned-supply/search',
      handler: 'planned-supply.search',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/planned-supply/all-flowers',
      handler: 'planned-supply.allFlowers',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
