'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/email-check',
      handler: 'email-check.isEmailRegistered',
      config: {
        auth: false,
      },
    },
  ],
};
