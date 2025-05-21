module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/knowledge-hubs/count',
      handler: 'knowledge-hub.count',
      config: {
        auth: false,
      },
    },
  ],
};
