module.exports = {
  async isEmailRegistered(ctx) {
    const { email } = ctx.request.body;
    if (!email) {
      return ctx.badRequest('Missing email parameter');
    }

    try {
      const existingUser = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({
          where: { email },
        });

      return ctx.send({ exists: !!existingUser });
    } catch (err) {
      return ctx.internalServerError(
        'An error occurred while checking the email'
      );
    }
  },
};
