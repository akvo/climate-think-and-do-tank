module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/investment-opportunity-profiles/count',
      handler: 'investment-opportunity-profile.count',
      config: {
        auth: false,
      },
    },
  ],
};
