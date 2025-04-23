const crypto = require('crypto');
const urlJoin = require('url-join');
const { sanitize } = require('@strapi/utils');

const USER_MODEL_UID = 'plugin::users-permissions.user';

const getService = (name) => {
  return strapi.plugin('users-permissions').service(name);
};

const sendEmail = async (settings, user) => {
  await strapi
    .plugin('email')
    .service('email')
    .send({
      to: user.email,
      from:
        settings.from.email || settings.from.name
          ? `${settings.from.name} <${settings.from.email}>`
          : undefined,
      replyTo: settings.response_email,
      subject: settings.object,
      text: settings.message,
      html: settings.message,
    });
};

module.exports = ({ strapi }) => ({
  async sendResetPasswordEmail(user) {
    const pluginStore = await strapi.store({
      type: 'plugin',
      name: 'users-permissions',
    });
    const userSchema = strapi.getModel(USER_MODEL_UID);

    const settings = await pluginStore
      .get({ key: 'email' })
      .then((storeEmail) => storeEmail.reset_password.options);

    const userInfo = await sanitize.sanitizers.defaultSanitizeOutput(
      {
        schema: userSchema,
        getModel: strapi.getModel.bind(strapi),
      },
      user
    );

    const resetPasswordToken = crypto.randomBytes(64).toString('hex');
    await getService('user').edit(user.id, { resetPasswordToken });

    try {
      settings.message = await getService('users-permissions').template(
        settings.message,
        {
          URL: process.env.PASSWORD_RESET_URL,
          SERVER_URL: strapi.config.get('server.absoluteUrl'),
          ADMIN_URL: strapi.config.get('admin.absoluteUrl'),
          USER: userInfo,
          TOKEN: resetPasswordToken,
        }
      );

      settings.object = await getService('users-permissions').template(
        settings.object,
        {
          USER: userInfo,
        }
      );
    } catch {
      strapi.log.error(
        '[api::auth.email.sendResetPasswordEmail]: Failed to generate a template for "reset password email". Please make sure your email template is valid and does not contain invalid characters or patterns'
      );
      return;
    }

    await sendEmail(settings, user);
  },

  async sendConfirmationEmail(user) {
    const userPermissionService = getService('users-permissions');
    const pluginStore = await strapi.store({
      type: 'plugin',
      name: 'users-permissions',
    });
    const userSchema = strapi.getModel(USER_MODEL_UID);

    const settings = await pluginStore
      .get({ key: 'email' })
      .then((storeEmail) => storeEmail.email_confirmation.options);

    const userInfo = await sanitize.sanitizers.defaultSanitizeOutput(
      {
        schema: userSchema,
        getModel: strapi.getModel.bind(strapi),
      },
      user
    );

    const confirmationToken = crypto.randomBytes(20).toString('hex');

    await getService('user').edit(user.id, { confirmationToken });

    try {
      settings.message = await userPermissionService.template(
        settings.message,
        {
          URL: process.env.EMAIL_CONFIRMATION_URL,
          SERVER_URL: strapi.config.get('server.absoluteUrl'),
          ADMIN_URL: strapi.config.get('admin.absoluteUrl'),
          USER: userInfo,
          CODE: confirmationToken,
        }
      );

      settings.object = await userPermissionService.template(settings.object, {
        USER: userInfo,
      });
    } catch {
      strapi.log.error(
        '[api::auth.email.sendConfirmationEmail]: Failed to generate a template for "user confirmation email". Please make sure your email template is valid and does not contain invalid characters or patterns'
      );
      return;
    }

    await sendEmail(settings, user);
  },

  async sendResetPasswordCode(user, resetCode) {
    const emailTemplate = {
      subject: 'Reset your password',
      text: `Your reset code is ${resetCode}. It will expire in 10 minutes.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7f9; color: #333333;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 30px 40px; text-align: center; background-color: #16a34a; border-radius: 8px 8px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Password Reset</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin-top: 0; margin-bottom: 20px; font-size: 16px; line-height: 1.5;">We received a request to reset your password.</p>
                      <p style="margin-top: 0; margin-bottom: 20px; font-size: 16px; line-height: 1.5;">Use the verification code below to complete the password reset process:</p>
                      
                      <div style="background-color: #f7f9fa; border-radius: 6px; padding: 20px; text-align: center; margin: 30px 0;">
                        <p style="font-size: 16px; margin-bottom: 10px; color: #555;">Your verification code is:</p>
                        <p style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 0; color: #16a34a;">${resetCode}</p>
                      </div>
                      
                      <p style="margin-top: 0; margin-bottom: 10px; font-size: 16px; line-height: 1.5;">This code will expire in 10 minutes for security reasons.</p>
                      <p style="margin-top: 0; margin-bottom: 20px; font-size: 16px; line-height: 1.5;">If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f7f9fa; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0; font-size: 14px; color: #777777;">This is an automated message from Think and do tank.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await strapi.plugins['email'].services.email.send({
      to: user.email,
      ...emailTemplate,
    });
  },
});
