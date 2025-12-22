/**
 * Shift Routes
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/shifts/close',
      handler: 'shift.closeShift',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/shifts',
      handler: 'shift.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/shifts/:documentId',
      handler: 'shift.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
