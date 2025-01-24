module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'mailpit',
        port: 1025,
        ignoreTLS: true,
        auth: false,
      },
    },
    'users-permissions': {
      config: {
        email_confirmation: false,
      },
    },
  },
});
