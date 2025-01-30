const { mergeConfig } = require('vite');

module.exports = (config) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    server: {
      fs: {
        allow: [
          '/opt/node_modules',// this is the abs path OUTSIDE the project root causing the Vite error
          '/opt/app',
        ],
      }
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  });
};

