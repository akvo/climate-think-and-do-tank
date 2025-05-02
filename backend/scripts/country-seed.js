const { countries } = require('countries-list');

async function seedCountries() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  console.log('Starting country seeding process...');
  try {
    const entries = Object.entries(countries);

    for (const [alpha2, data] of entries) {
      const existing = await app.db.query('api::country.country').findOne({
        where: { country_code: alpha2 },
      });

      if (!existing) {
        await app.db.query('api::country.country').create({
          data: {
            country_code: alpha2,
            country_name: data.name,
          },
        });
        console.log(`Created Country: ${data.name} (${alpha2})`);
      }
    }
  } catch (err) {
    console.error('Error seeding countries:', err);
    process.exit(1);
  } finally {
    await app.destroy();
    console.log('Country seeding completed.');
    process.exit(0);
  }
}

seedCountries();
