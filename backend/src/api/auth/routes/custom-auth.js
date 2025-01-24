module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/register',
      handler: 'custom-auth.register',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/auth/verify',
      handler: 'custom-auth.verify',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/auth/send-email-confirmation',
      handler: 'custom-auth.resendVerification',
      config: {
        auth: false,
      },
    },
  ],
};
