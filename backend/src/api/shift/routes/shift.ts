/**
 * Shift Routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/shifts/current',
      handler: 'shift.getCurrent',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/shifts/current/activity',
      handler: 'shift.addActivity',
      config: {
        policies: [],
        middlewares: [],
      },
    },
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
      method: 'POST',
      path: '/shifts/cleanup',
      handler: 'shift.cleanup',
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
