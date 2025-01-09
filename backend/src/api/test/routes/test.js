// backend/src/api/test/routes/test.js
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/test-email',
      handler: 'test.testEmail',
      config: {
        auth: false,
      },
    },
  ],
};
