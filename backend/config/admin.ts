export default ({ env }) => {
  const isProduction = env('NODE_ENV') === 'production';
  
  // Determine admin URL - prioritize PUBLIC_URL, then SERVER_URL
  // If neither is set in production, don't set url to let Strapi auto-detect from request headers
  let adminUrl: string | undefined;
  if (isProduction) {
    adminUrl = env('PUBLIC_URL') || env('SERVER_URL');
    // If URL is set but doesn't start with https, ensure it does
    if (adminUrl && !adminUrl.startsWith('https://')) {
      adminUrl = adminUrl.replace(/^http:\/\//, 'https://');
    }
  }

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT'),
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY'),
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    // Production cookie settings for Railway proxy
    ...(isProduction && {
      ...(adminUrl && { url: adminUrl }),
      serveAdminPanel: true,
      session: {
        cookie: {
          secure: true,
          sameSite: 'none',
          httpOnly: true,
        },
      },
    }),
  };
};
