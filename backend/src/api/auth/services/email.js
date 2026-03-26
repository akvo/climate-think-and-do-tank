const crypto = require('crypto');
const { sanitize } = require('@strapi/utils');
const { emailTemplate } = require('../../../helpers/email-template');

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
    const body = `
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">We received a request to reset your password.</p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">Use the verification code below to complete the password reset process:</p>
      <div style="background-color:#fafafa;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
        <p style="font-size:13px;margin:0 0 8px;color:#999999;">Your verification code is:</p>
        <p style="font-family:monospace;font-size:36px;font-weight:bold;letter-spacing:8px;margin:0;color:#B5654A;">${resetCode}</p>
      </div>
      <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#666666;">This code will expire in 10 minutes for security reasons.</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#666666;">If you didn't request this password reset, please ignore this email.</p>
    `;

    const html = emailTemplate({
      title: 'Password Reset',
      body,
    });

    await strapi.plugin('email').service('email').send({
      to: user.email,
      subject: 'Reset your password',
      text: `Your reset code is ${resetCode}. It will expire in 10 minutes.`,
      html,
    });
  },
});
