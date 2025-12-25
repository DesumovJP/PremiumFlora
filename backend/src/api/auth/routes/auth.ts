export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/admin/login',
      handler: 'auth.adminLogin',
      config: {
        auth: false,
      },
    },
  ],
};









