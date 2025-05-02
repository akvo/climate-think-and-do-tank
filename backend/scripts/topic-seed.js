async function seedTopics() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  console.log('Starting topics seeding process...');

  const topics = [
    'Agrifood',
    'Energy',
    'Water',
    'Climate Resilience',
    'Social Accountability',
    'Investments',
    'Other',
  ];

  try {
    for (const topicName of topics) {
      const existing = await app.db.query('api::topic.topic').findOne({
        where: { name: topicName },
      });

      if (!existing) {
        await app.db.query('api::topic.topic').create({
          data: {
            name: topicName,
          },
        });
        console.log(`Created Topic: ${topicName}`);
      } else {
        await app.db.query('api::topic.topic').update({
          where: { id: existing.id },
          data: {
            name: topicName,
          },
        });
        console.log(`Updated Topic: ${topicName}`);
      }
    }
  } catch (err) {
    console.error('Error seeding topics:', err);
    process.exit(1);
  } finally {
    await app.destroy();
    console.log('Topics seeding completed.');
    process.exit(0);
  }
}

seedTopics();
