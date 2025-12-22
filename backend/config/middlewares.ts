export default ({ env }) => {
  const middlewares: any[] = [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': ["'self'", 'data:', 'blob:', 'https:'],
            'media-src': ["'self'", 'data:', 'blob:', 'https:'],
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    {
      name: 'strapi::cors',
      config: {
        enabled: true,
        headers: '*',
        origin: env('NODE_ENV') === 'production'
          ? [
              env('FRONTEND_URL', 'https://your-app.vercel.app'),
              /\.vercel\.app$/,
              'http://localhost:3000',
            ]
          : ['http://localhost:3000', 'http://127.0.0.1:3000'],
      },
    },
    'strapi::poweredBy',
    'strapi::query',
    {
      name: 'strapi::body',
      config: {
        multipart: true,
        includeUnparsed: true,
      },
    },
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];

  // Add force-https middleware in production (at the beginning)
  if (env('NODE_ENV') === 'production') {
    middlewares.unshift('global::force-https');
  }

  return middlewares;
};
