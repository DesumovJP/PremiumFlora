/**
 * POS Routes
 *
 * Маршрути для POS операцій з авторизацією
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/pos/sales',
      handler: 'pos.createSale',
      config: {
        middlewares: ['api::pos.pos-auth'],
      },
    },
    {
      method: 'POST',
      path: '/pos/write-offs',
      handler: 'pos.createWriteOff',
      config: {
        middlewares: ['api::pos.pos-auth'],
      },
    },
    {
      method: 'PUT',
      path: '/pos/transactions/:id/confirm-payment',
      handler: 'pos.confirmPayment',
      config: {
        middlewares: ['api::pos.pos-auth'],
      },
    },
    {
      method: 'POST',
      path: '/pos/sync-balances',
      handler: 'pos.syncBalances',
      config: {
        middlewares: ['api::pos.pos-auth'],
      },
    },
    {
      method: 'POST',
      path: '/pos/transactions/:id/return',
      handler: 'pos.returnSale',
      config: {
        middlewares: ['api::pos.pos-auth'],
      },
    },
  ],
};
