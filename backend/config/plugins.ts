export default ({ env }) => ({
  // GraphQL plugin configuration
  graphql: {
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      landingPage: true, // Apollo Sandbox for testing
      defaultLimit: 100,
      maxLimit: 500,
      apolloServer: {
        tracing: false,
        introspection: true,
      },
    },
  },

  // DigitalOcean Spaces upload provider (only in production)
  // URL format: https://{bucket}.{region}.digitaloceanspaces.com/{rootPath}/filename
  ...(env('NODE_ENV') === 'production' && env('DO_SPACE_KEY') && {
    upload: {
      config: {
        provider: '@strapi/provider-upload-aws-s3',
        providerOptions: {
          rootPath: env('DO_SPACE_ROOT_PATH'),
          s3Options: {
            credentials: {
              accessKeyId: env('DO_SPACE_KEY'),
              secretAccessKey: env('DO_SPACE_SECRET'),
            },
            endpoint: env('DO_SPACE_ENDPOINT'),
            region: env('DO_SPACE_REGION'),
            // forcePathStyle: false - DO Spaces uses subdomain-style URLs
            params: {
              Bucket: env('DO_SPACE_BUCKET'),
              ACL: 'public-read',
            },
          },
          // Subdomain-style baseUrl БЕЗ rootPath (Strapi додає шлях автоматично)
          baseUrl: `https://${env('DO_SPACE_BUCKET')}.${env('DO_SPACE_REGION')}.digitaloceanspaces.com`,
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
  }),
});
