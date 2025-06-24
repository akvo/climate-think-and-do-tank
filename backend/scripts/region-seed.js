async function seedRegions() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  console.log('Starting regions seeding process...');

  const regions = [
    'Turkana',
    'Marsabit',
    'Isiolo',
    'Samburu',
    'Laikipia',
    'Narok',
    'Kajiado',
    'Taita Taveta',
    'Kenya',
    'Other',
  ];

  try {
    for (const regionName of regions) {
      const existing = await app.db.query('api::region.region').findOne({
        where: { name: regionName },
      });

      if (!existing) {
        await app.db.query('api::region.region').create({
          data: {
            name: regionName,
          },
        });
        console.log(`Created Region: ${regionName}`);
      } else {
        await app.db.query('api::region.region').update({
          where: { id: existing.id },
          data: {
            name: regionName,
          },
        });
        console.log(`Updated Region: ${regionName}`);
      }
    }
  } catch (err) {
    console.error('Error seeding regions:', err);
    process.exit(1);
  } finally {
    await app.destroy();
    console.log('Regions seeding completed.');
    process.exit(0);
  }
}

seedRegions();
