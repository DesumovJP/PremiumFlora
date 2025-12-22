export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('SERVER_URL', env('PUBLIC_URL', 'http://localhost:1337')),
  proxy: env.bool('PROXY', true),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
