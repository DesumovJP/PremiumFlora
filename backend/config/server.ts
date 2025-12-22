export default ({ env }) => {
  const isProduction = env('NODE_ENV') === 'production';
  
  // In production, prioritize PUBLIC_URL, then SERVER_URL
  // If neither is set, don't set url to let Strapi auto-detect from request headers
  let serverUrl: string | undefined;
  if (isProduction) {
    serverUrl = env('PUBLIC_URL') || env('SERVER_URL');
    // If URL is set but doesn't start with https, ensure it does
    if (serverUrl && !serverUrl.startsWith('https://')) {
      serverUrl = serverUrl.replace(/^http:\/\//, 'https://');
    }
  } else {
    // In development, use default localhost
    serverUrl = env('SERVER_URL', env('PUBLIC_URL', 'http://localhost:1337'));
  }

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    ...(serverUrl && { url: serverUrl }),
    proxy: env.bool('PROXY', true),
    app: {
      keys: env.array('APP_KEYS'),
    },
  };
};
