const { yup, validateYupSchema } = require('@strapi/utils');

const forgotPasswordSchema = yup
  .object({
    email: yup.string().email().required(),
  })
  .noUnknown();

const resetPasswordSchema = yup
  .object({
    code: yup.string().length(6).required(),
    password: yup.string().min(6).required(),
    passwordConfirmation: yup.string().min(6).required(),
  })
  .noUnknown();

const validateForgotPasswordBody = validateYupSchema(forgotPasswordSchema);
const validateResetPasswordBody = validateYupSchema(resetPasswordSchema);

module.exports = (plugin) => {
  // Override user service

  const generateRandomCode = (length) => {
    const digits = '0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    return code;
  };

  const originalUserServiceFactory = plugin.services.user;
  plugin.services.user = ({ strapi }) => {
    const service = originalUserServiceFactory({ strapi });

    service.sendConfirmationEmail = async (user) => {
      await strapi.service('api::auth.email').sendConfirmationEmail(user);
    };

    // Add a method to generate and store a reset code
    service.generateResetCode = async (user) => {
      // Generate a 6-digit code
      const resetCode = generateRandomCode(6);

      // Store the code and its expiration time (e.g., valid for 10 minutes)
      const resetCodeExpiration = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Update the user with the reset code
      await strapi.entityService.update(
        'plugin::users-permissions.user',
        user.id,
        {
          data: {
            resetCode,
            resetCodeExpiration,
          },
        }
      );

      return resetCode;
    };

    return service;
  };

  // Override auth controller
  const originalAuhtControllerFactory = plugin.controllers.auth;
  plugin.controllers.auth = ({ strapi }) => {
    const controller = originalAuhtControllerFactory({ strapi });

    const originalRegister = controller.register;
    controller.register = async (ctx) => {
      await originalRegister(ctx);

      if (ctx.body && ctx.body.user) {
        const { user } = ctx.body;

        const updatedUser = await strapi.entityService.update(
          'plugin::users-permissions.user',
          user.id,
          {
            data: {
              blocked: true,
            },
          }
        );

        ctx.body.user = updatedUser;
        ctx.body.message =
          "Your account has been created but requires admin approval. You'll be notified once your account is activated.";
      }
    };

    // Override email confirmation
    const originalConfirmationHandler = controller.emailConfirmation;
    controller.emailConfirmation = async (ctx, next, returnUser) => {
      returnUser = true;
      await originalConfirmationHandler(ctx, next, returnUser);
    };

    // Override forgot password to use 6-digit code
    controller.forgotPassword = async (ctx) => {
      const { email } = await validateForgotPasswordBody(ctx.request.body);
      const user = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({ where: { email: email.toLowerCase() } });

      if (!user || user.blocked) {
        return ctx.send({ ok: true });
      }

      // Generate the reset code
      const resetCode = await strapi
        .service('plugin::users-permissions.user')
        .generateResetCode(user);

      // Send the email with the code
      await strapi
        .service('api::auth.email')
        .sendResetPasswordCode(user, resetCode);

      ctx.send({ ok: true });
    };

    // Add new handler for validating the reset code and changing the password
    controller.resetPassword = async (ctx) => {
      const { code, password, passwordConfirmation } =
        await validateResetPasswordBody(ctx.request.body);

      if (password !== passwordConfirmation) {
        return ctx.badRequest('Passwords do not match');
      }

      // Find the user with this reset code
      const user = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({ where: { resetCode: code } });

      if (!user) {
        return ctx.badRequest('Invalid code');
      }

      // Check if the code has expired
      if (user.resetCodeExpiration < Date.now()) {
        return ctx.badRequest('Reset code has expired');
      }

      // Update the user's password and clear the reset code
      await strapi.entityService.update(
        'plugin::users-permissions.user',
        user.id,
        {
          data: {
            password,
            resetCode: null,
            resetCodeExpiration: null,
          },
        }
      );

      ctx.send({ ok: true });
    };

    // Original callback handler with extended user info
    const originalCallback = controller.callback;
    controller.callback = async (ctx) => {
      // Get credentials from request body
      const { identifier, password } = ctx.request.body;

      // Find the user
      const user = await strapi
        .query('plugin::users-permissions.user')
        .findOne({
          where: {
            provider: 'local',
            $or: [
              { email: identifier.toLowerCase() },
              { username: identifier },
            ],
          },
        });

      // Check if user exists and is blocked
      if (user && user.blocked) {
        return ctx.badRequest(
          'Your account is pending approval. An administrator will review your information and activate your account shortly.'
        );
      }

      // If user is not blocked, continue with original login flow
      await originalCallback(ctx);

      // If we got this far and have a user in the response, populate additional fields
      if (ctx.body && ctx.body.user) {
        const { user, jwt } = ctx.body;
        const userId = user.id;

        const fullUser = await strapi.entityService.findOne(
          'plugin::users-permissions.user',
          userId,
          {
            populate: {
              connection_requests_sent: true,
              connection_requests_received: true,
              profile_image: true,
              organisation: true,
            },
          }
        );

        ctx.body = {
          jwt,
          user: fullUser,
        };
      }
    };

    return controller;
  };

  // Add the new route for reset password
  plugin.routes['content-api'].routes.push({
    method: 'POST',
    path: '/auth/reset-password',
    handler: 'auth.resetPassword',
    config: {
      prefix: '',
    },
  });

  return plugin;
};
