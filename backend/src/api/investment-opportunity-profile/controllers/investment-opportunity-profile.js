'use strict';

/**
 * investment-opportunity-profile controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  'api::investment-opportunity-profile.investment-opportunity-profile',
  ({ strapi }) => ({
    ...createCoreController(
      'api::investment-opportunity-profile.investment-opportunity-profile'
    ),

    count: async (ctx) => {
      try {
        const query = ctx.query;

        const count = await strapi.db
          .query(
            'api::investment-opportunity-profile.investment-opportunity-profile'
          )
          .count(query);

        return count;
      } catch (error) {
        ctx.throw(500, error);
      }
    },
  })
);
