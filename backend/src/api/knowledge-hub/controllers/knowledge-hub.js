'use strict';

/**
 * knowledge-hub controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  'api::knowledge-hub.knowledge-hub',
  ({ strapi }) => ({
    ...createCoreController('api::knowledge-hub.knowledge-hub'),

    count: async (ctx) => {
      try {
        const query = ctx.query;

        const count = await strapi.db
          .query('api::knowledge-hub.knowledge-hub')
          .count(query);

        return count;
      } catch (error) {
        ctx.throw(500, error);
      }
    },
  })
);
