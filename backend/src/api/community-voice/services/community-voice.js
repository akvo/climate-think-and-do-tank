'use strict';

/**
 * community-voice service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::community-voice.community-voice');
