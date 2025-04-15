'use strict';

/**
 * value-chain router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::value-chain.value-chain');
