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
}

module.exports = ({ strapi }) => ({
  async sendResetPasswordEmail(user) {
    const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });
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
      settings.message = await getService('users-permissions').template(settings.message, {
        URL: process.env.PASSWORD_RESET_URL,
        SERVER_URL: strapi.config.get('server.absoluteUrl'),
        ADMIN_URL: strapi.config.get('admin.absoluteUrl'),
        USER: userInfo,
        TOKEN: resetPasswordToken,
      });

      settings.object = await getService('users-permissions').template(settings.object, {
        USER: userInfo,
      });
    } catch {
      strapi.log.error(
        '[api::auth.email.sendResetPasswordEmail]: Failed to generate a template for "reset password email". Please make sure your email template is valid and does not contain invalid characters or patterns'
      );
      return;
    }

    await sendEmail(settings, user)
  },

  async sendConfirmationEmail(user) {
    const userPermissionService = getService('users-permissions');
    const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });
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
      settings.message = await userPermissionService.template(settings.message, {
        URL: process.env.EMAIL_CONFIRMATION_URL,
        SERVER_URL: strapi.config.get('server.absoluteUrl'),
        ADMIN_URL: strapi.config.get('admin.absoluteUrl'),
        USER: userInfo,
        CODE: confirmationToken,
      });

      settings.object = await userPermissionService.template(settings.object, {
        USER: userInfo,
      });
    } catch {
      strapi.log.error(
        '[api::auth.email.sendConfirmationEmail]: Failed to generate a template for "user confirmation email". Please make sure your email template is valid and does not contain invalid characters or patterns'
      );
      return;
    }

    await sendEmail(settings, user)
  },
});
