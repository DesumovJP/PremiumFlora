export default ({ env }) => ({
  // DigitalOcean Spaces upload provider (only in production)
  ...(env('NODE_ENV') === 'production' && env('DO_SPACE_KEY') && {
    upload: {
      config: {
        provider: '@strapi/provider-upload-aws-s3',
        providerOptions: {
          s3Options: {
            credentials: {
              accessKeyId: env('DO_SPACE_KEY'),
              secretAccessKey: env('DO_SPACE_SECRET'),
            },
            endpoint: env('DO_SPACE_ENDPOINT'),
            region: env('DO_SPACE_REGION'),
            forcePathStyle: true,
            params: {
              Bucket: env('DO_SPACE_BUCKET'),
              ACL: 'public-read',
            },
          },
          baseUrl: `${env('DO_SPACE_ENDPOINT')}/${env('DO_SPACE_BUCKET')}${env('DO_SPACE_ROOT_PATH') ? '/' + env('DO_SPACE_ROOT_PATH') : ''}`,
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
