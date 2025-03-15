const { yup, validateYupSchema } = require('@strapi/utils');

const forgotPasswordSchema = yup
  .object({
    email: yup.string().email().required(),
  })
  .noUnknown();
const validateForgotPasswordBody = validateYupSchema(forgotPasswordSchema);

module.exports = (plugin) => {
  /// Override confirmation email to allow getting the URL from the environment
  const originalUserServiceFactory = plugin.services.user;
  plugin.services.user = ({ strapi }) => {
    const service = originalUserServiceFactory({ strapi });
    service.sendConfirmationEmail = async (user) => {
      await strapi.service('api::auth.email').sendConfirmationEmail(user);
    };
    return service;
  };

  const originalAuhtControllerFactory = plugin.controllers.auth;
  plugin.controllers.auth = ({ strapi }) => {
    const controller = originalAuhtControllerFactory({ strapi });

    /// Override email confirmation to return user object instead of redirect
    const originalConfirmationHandler = controller.emailConfirmation;
    controller.emailConfirmation = async (ctx, next, returnUser) => {
      returnUser = true;
      await originalConfirmationHandler(ctx, next, returnUser);
    };

    /// Override forgot password handler to allow getting the URL from the environment
    controller.forgotPassword = async (ctx) => {
      const { email } = await validateForgotPasswordBody(ctx.request.body);
      const user = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({ where: { email: email.toLowerCase() } });

      if (!user || user.blocked) {
        return ctx.send({ ok: true });
      }

      await strapi.service('api::auth.email').sendResetPasswordEmail(user);

      ctx.send({ ok: true });
    };

    const originalCallback = controller.callback;
    controller.callback = async (ctx) => {
      await originalCallback(ctx);

      if (!ctx.body || !ctx.body.user) {
        return;
      }
      const { user, jwt } = ctx.body;
      const userId = user.id;

      const fullUser = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        userId,
        {
          populate: {
            connection_requests_sent: true,
            connection_requests_received: true,
          },
        }
      );

      ctx.body = {
        jwt,
        user: fullUser,
      };
    };

    return controller;
  };

  return plugin;
};
