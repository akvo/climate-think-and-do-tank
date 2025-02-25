'use strict';

/**
 * looking-for service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::looking-for.looking-for');
