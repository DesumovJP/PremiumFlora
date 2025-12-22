export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 3000), // або просто env.int('PORT')
  url: env('SERVER_URL', env('PUBLIC_URL')),
  proxy: true, // Railway працює через проксі, краще увімкнути
  app: {
    keys: env.array('APP_KEYS'),
  },
});
