// src/extensions/users-permissions/strapi-server.js
module.exports = (plugin) => {
  const sanitizeUser = (user) => {
    const {
      password,
      resetPasswordToken,
      confirmationToken,
      ...sanitizedUser
    } = user;
    return sanitizedUser;
  };

  plugin.controllers.user.me = async (ctx) => {
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }
    const user = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      ctx.state.user.id,
      { populate: '*' }
    );

    ctx.body = sanitizeUser(user);
  };

  plugin.controllers.auth.register = async (ctx) => {
    const pluginStore = await strapi.store({
      type: 'plugin',
      name: 'users-permissions',
    });
    const settings = await pluginStore.get({ key: 'advanced' });

    const { email, username, password } = ctx.request.body;

    const user = await strapi.query('plugin::users-permissions.user').create({
      data: {
        email,
        username,
        password,
        provider: 'local',
        confirmed: false,
        confirmationToken: Math.random().toString(36).substring(2, 15),
      },
    });

    // Send confirmation email
    try {
      await strapi.plugins['email'].services.email.send({
        to: user.email,
        from: process.env.SMTP_FROM,
        subject: 'Email confirmation',
        text: `Please confirm your email by clicking this link: ${process.env.FRONTEND_URL}/verify-email?token=${user.confirmationToken}`,
        html: `
            <p>Please confirm your email by clicking this link:</p>
            <a href="${process.env.FRONTEND_URL}/verify-email?token=${user.confirmationToken}">
              Confirm Email
            </a>
          `,
      });
    } catch (err) {
      console.error('Error sending confirmation email:', err);
    }

    return {
      user: sanitizeUser(user),
    };
  };

  plugin.controllers.auth.emailConfirmation = async (ctx) => {
    const { token } = ctx.query;

    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: { confirmationToken: token },
    });

    if (!user) {
      throw new Error('Invalid token');
    }

    await strapi.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data: {
        confirmed: true,
        confirmationToken: null,
      },
    });

    return {
      message: 'Email confirmed successfully',
    };
  };

  return plugin;
};
