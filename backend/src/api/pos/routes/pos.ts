/**
 * POS Routes
 *
 * Маршрути для POS операцій
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/pos/sales',
      handler: 'pos.createSale',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/pos/write-offs',
      handler: 'pos.createWriteOff',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/pos/transactions/:id/confirm-payment',
      handler: 'pos.confirmPayment',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
