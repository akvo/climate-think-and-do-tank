'use strict';

/**
 * value-chain service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::value-chain.value-chain');
