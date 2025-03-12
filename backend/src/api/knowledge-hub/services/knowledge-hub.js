'use strict';

/**
 * knowledge-hub service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::knowledge-hub.knowledge-hub');
