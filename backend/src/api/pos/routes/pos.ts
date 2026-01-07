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
        auth: false,
        middlewares: ['api::pos.pos-auth'],
      },
    },
    {
      method: 'POST',
      path: '/pos/write-offs',
      handler: 'pos.createWriteOff',
      config: {
        auth: false,
        middlewares: ['api::pos.pos-auth'],
      },
    },
    {
      method: 'PUT',
      path: '/pos/transactions/:id/confirm-payment',
      handler: 'pos.confirmPayment',
      config: {
        auth: false,
        middlewares: ['api::pos.pos-auth'],
      },
    },
    {
      method: 'POST',
      path: '/pos/sync-balances',
      handler: 'pos.syncBalances',
      config: {
        auth: false,
        middlewares: ['api::pos.pos-auth'],
      },
    },
    {
      method: 'POST',
      path: '/pos/transactions/:id/return',
      handler: 'pos.returnSale',
      config: {
        auth: false,
        middlewares: ['api::pos.pos-auth'],
      },
    },
  ],
};
