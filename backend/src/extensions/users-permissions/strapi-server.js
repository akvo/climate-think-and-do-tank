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
      // Extract relation fields before calling original register
      const {
        organisation,
        focus_regions,
        looking_fors,
        topics,
        country,
        ...rest
      } = ctx.request.body;

      // Pass only non-relation fields to original register
      ctx.request.body = rest;

      await originalRegister(ctx);

      if (ctx.body && ctx.body.user) {
        const { user } = ctx.body;

        // Build relation data
        const relationData = { approved: false };

        if (organisation) {
          relationData.organisation = { connect: [organisation] };
        }
        if (Array.isArray(focus_regions) && focus_regions.length > 0) {
          relationData.focus_regions = { connect: focus_regions };
        }
        if (Array.isArray(looking_fors) && looking_fors.length > 0) {
          relationData.looking_fors = { connect: looking_fors };
        }
        if (Array.isArray(topics) && topics.length > 0) {
          relationData.topics = { connect: topics };
        }
        if (country) {
          relationData.country = { connect: [country] };
        }

        const updatedUser = await strapi.entityService.update(
          'plugin::users-permissions.user',
          user.id,
          {
            data: relationData,
          }
        );

        ctx.body.user = updatedUser;
        ctx.body.message =
          "Your account has been created but requires admin approval. You'll be notified once your account is activated.";

        // Notify admin/editors about new registration
        try {
          const editorRole = await strapi.db
            .query('admin::role')
            .findOne({ where: { code: { $eq: 'strapi-editor' } } });

          const editors = await strapi.db.query('admin::user').findMany({
            where: { roles: { id: { $eq: editorRole.id } } },
            populate: ['roles'],
          });

          const editorEmails = editors.map((editor) => editor.email);

          if (editorEmails.length > 0) {
            // Fetch organisation name if connected
            let orgName = 'Not provided';
            if (organisation) {
              const org = await strapi.entityService.findOne(
                'api::organisation.organisation',
                organisation
              );
              if (org) orgName = org.name;
            }

            await Promise.all(
              editorEmails.map(async (recipient) => {
                await strapi.plugins.email.service('email').send({
                  to: recipient,
                  subject: `New User Registration: ${rest.full_name || rest.email}`,
                  html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7f6; }
                        .container { background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 30px; border-top: 4px solid #B5654A; }
                        .header { text-align: center; margin-bottom: 30px; color: #B5654A; }
                        .detail { margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
                        .label { font-weight: bold; color: #B5654A; margin-right: 10px; display: inline-block; min-width: 100px; }
                        .footer { text-align: center; margin-top: 30px; font-size: 0.9em; color: #888; padding-top: 20px; border-top: 1px solid #eee; }
                        .action-note { background-color: #fef3e8; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #B5654A; }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <div class="header">
                          <h1>New User Registration</h1>
                        </div>
                        <div class="detail">
                          <p><span class="label">Name:</span> ${rest.full_name || 'Not provided'}</p>
                          <p><span class="label">Email:</span> ${rest.email}</p>
                          <p><span class="label">Organization:</span> ${orgName}</p>
                          <p><span class="label">Role:</span> ${rest.stakeholder_role || 'Not provided'}</p>
                          <p><span class="label">Registered:</span> ${new Date().toLocaleString()}</p>
                        </div>
                        <div class="action-note">
                          <p><strong>Action required:</strong> This user's account is pending approval. Please review and approve or reject the account in the admin panel.</p>
                        </div>
                        <div class="footer">
                          <p>This is an automated notification from the Kenya Drylands Investment Hub.</p>
                        </div>
                      </div>
                    </body>
                    </html>
                  `,
                });
              })
            );
          }
        } catch (emailError) {
          strapi.log.error(
            'Failed to send new registration notification email:',
            emailError.message
          );
        }
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

      if (!user || !user.approved) {
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
      if (user && !user.approved) {
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

  plugin.controllers.user.find = async (ctx) => {
    const { query } = ctx;

    const { page = 1, pageSize = 12, start, limit } = query;

    const queryOptions = {
      ...query,
      pagination: {
        pageSize: parseInt(String(pageSize)),
        page: parseInt(String(page)),
        ...(start !== undefined && limit !== undefined ? { start, limit } : {}),
      },
    };

    try {
      const { results, pagination } = await strapi.entityService.findPage(
        'plugin::users-permissions.user',
        queryOptions
      );

      const sanitizedUsers = results.map((user) => {
        const {
          password,
          resetPasswordToken,
          confirmationToken,
          ...sanitizedUser
        } = user;
        return sanitizedUser;
      });

      ctx.body = {
        data: sanitizedUsers,
        meta: {
          pagination: {
            page: pagination.page,
            pageSize: 12,
            pageCount: pagination.pageCount,
            total: pagination.total,
          },
        },
      };
    } catch (error) {
      ctx.throw(500, error);
    }
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
