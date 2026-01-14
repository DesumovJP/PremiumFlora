/**
 * Currency Routes
 *
 * Публічні ендпоінти для отримання та встановлення курсу валют
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/currency/usd',
      handler: 'currency.getUsdRate',
      config: {
        auth: false, // Публічний ендпоінт
      },
    },
    {
      method: 'POST',
      path: '/currency/usd/manual',
      handler: 'currency.setManualRate',
      config: {
        auth: false, // TODO: Додати авторизацію для зміни курсу
      },
    },
    {
      method: 'GET',
      path: '/currency/usd/manual',
      handler: 'currency.getManualRate',
      config: {
        auth: false,
      },
    },
    // Backward compatibility (deprecated)
    {
      method: 'GET',
      path: '/currency/eur',
      handler: 'currency.getUsdRate', // Тепер повертає USD
      config: {
        auth: false,
      },
    },
  ],
};
