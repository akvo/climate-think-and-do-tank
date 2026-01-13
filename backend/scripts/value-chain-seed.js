async function seedValueChains() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  console.log('Starting value chain seeding process...');

  const valueChains = ['Fish', 'Livestock', 'Crops'];

  try {
    for (const valueChainName of valueChains) {
      const existing = await app.db
        .query('api::value-chain.value-chain')
        .findOne({
          where: { name: valueChainName },
        });

      if (!existing) {
        await app.db.query('api::value-chain.value-chain').create({
          data: {
            name: valueChainName,
          },
        });
        console.log(`Created Value Chain: ${valueChainName}`);
      } else {
        await app.db.query('api::value-chain.value-chain').update({
          where: { id: existing.id },
          data: {
            name: valueChainName,
          },
        });
        console.log(`Updated Value Chain: ${valueChainName}`);
      }
    }
  } catch (err) {
    console.error('Error seeding value chains:', err);
    process.exit(1);
  } finally {
    await app.destroy();
    console.log('Value chain seeding completed.');
    process.exit(0);
  }
}

seedValueChains();
