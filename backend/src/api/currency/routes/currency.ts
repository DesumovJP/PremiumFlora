/**
 * Currency Routes
 *
 * Публічний ендпоінт для отримання курсу валют
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/currency/eur',
      handler: 'currency.getEurRate',
      config: {
        auth: false, // Публічний ендпоінт
      },
    },
  ],
};
