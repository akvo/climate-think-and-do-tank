'use strict';

// Content types whose publication_date falls back to the date the entry was
// added to the platform when an editor leaves it blank.
const PUBLICATION_DATE_MODELS = [
  'api::knowledge-hub.knowledge-hub',
  'api::news-item.news-item',
  'api::investment-opportunity-profile.investment-opportunity-profile',
  'api::social-accountability.social-accountability',
];

const today = () => new Date().toISOString().slice(0, 10);

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      models: PUBLICATION_DATE_MODELS,
      beforeCreate(event) {
        if (!event.params.data.publication_date) {
          event.params.data.publication_date = today();
        }
      },
      beforeUpdate(event) {
        // Only when the editor explicitly clears the field; partial updates
        // that don't touch it are left alone.
        if (
          'publication_date' in event.params.data &&
          !event.params.data.publication_date
        ) {
          event.params.data.publication_date = today();
        }
      },
    });

    // Backfill entries saved before this existed, using their creation date.
    for (const uid of PUBLICATION_DATE_MODELS) {
      const table = strapi.getModel(uid).collectionName;
      const updated = await strapi.db
        .connection(table)
        .whereNull('publication_date')
        .update({
          publication_date: strapi.db.connection.raw('DATE(created_at)'),
        });
      if (updated) {
        strapi.log.info(
          `Backfilled publication_date on ${updated} ${table} entries`
        );
      }
    }
  },
};
