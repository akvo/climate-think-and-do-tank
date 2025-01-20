module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        port: env('SMTP_PORT'),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
        secure: false, // Changed to false for port 587
        requireTLS: true, // Added this
        tls: {
          ciphers: 'SSLv3', // Added this
          rejectUnauthorized: false, // Added this
        },
      },
      settings: {
        defaultFrom: env('SMTP_FROM'),
        defaultReplyTo: env('SMTP_FROM'),
      },
    },
  },
  'users-permissions': {
    config: {
      email_confirmation: false,
    },
  },
});
