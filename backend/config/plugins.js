module.exports = ({ env }) => {
  // `PLUGIN_PROVIDERS` allows the use of local providers in production build containers for local testing.
  const profile = env.oneOf(
    'PLUGIN_PROVIDERS',
    ['local', 'external'],
    'external'
  );

  const emails = {
    local: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'mailpit',
        port: 1025,
        ignoreTLS: true,
        auth: false,
      },
    },
    external: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        port: env('SMTP_PORT'),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
    },
  };

  const uploads = {
    local: {},
    external: {
      provider: '@strapi-community/strapi-provider-upload-google-cloud-storage',
      providerOptions: {
        serviceAccount: env.json('GCS_SERVICE_ACCOUNT'),
        bucketName: env('GCS_BUCKET_NAME'),
        basePath: env('GCS_BASE_PATH'),
        baseUrl: env('GCS_BASE_URL'),
        publicFiles: env('GCS_PUBLIC_FILES'),
        uniform: env('GCS_UNIFORM'),
        skipCheckBucket: true,
      },
    },
  };

  return {
    graphql: {
      enabled: true,
      config: {
        endpoint: '/graphql',
        shadowCRUD: true,
        playgroundAlways: true,
        depthLimit: 7,
        amountLimit: 100,
        apolloServer: {
          tracing: false,
        },
      },
    },
    'users-permissions': {
      config: {
        register: {
          allowedFields: [
            'organisation',
            'full_name',
            'stakeholder_role',
            'linkedin',
            'news_consent',
            'looking_fors',
            'focus_regions',
            'topics',
            'profile_image',
            'country',
          ],
        },
      },
    },
    email: {
      config: {
        ...emails[profile],
        settings: {
          defaultFrom: env('SMTP_FROM'),
          defaultReplyTo: env('SMTP_FROM'),
        },
      },
    },
    upload: {
      config: {
        ...uploads[profile],
        sizeLimit: 100 * 1024 * 1024, // 100MB in bytes
      },
    },
  };
};
