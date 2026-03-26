const {
  emailTemplate,
  detailRow,
  detailsTable,
} = require('../../../helpers/email-template');

module.exports = ({ strapi }) => ({
  async send(ctx) {
    try {
      const { name, organization, email, subject, message } = ctx.request.body;

      if (!email || !subject || !message) {
        return ctx.badRequest(
          'Missing required fields: email, subject, and message are required'
        );
      }

      const editorRole = await strapi.db.query('admin::role').findOne({
        where: { code: { $eq: 'strapi-editor' } },
      });

      const editors = await strapi.db.query('admin::user').findMany({
        where: {
          roles: {
            id: { $eq: editorRole.id },
          },
        },
        populate: ['roles'],
      });

      const editorEmails = editors.map((editor) => editor.email);

      if (editorEmails.length === 0) {
        console.warn(
          'No editors found to receive the contact form submission, using fallback email'
        );
      }

      const body = `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">A new contact form submission has been received.</p>
        ${detailsTable(
          detailRow('Name', name) +
          detailRow('Organization', organization) +
          detailRow('Email', `<a href="mailto:${email}" style="color:#B5654A;text-decoration:none;">${email}</a>`) +
          detailRow('Subject', subject) +
          detailRow('Received', new Date().toLocaleString())
        )}
        <div style="background-color:#fafafa;border-radius:8px;padding:16px 20px;margin-top:16px;">
          <p style="margin:0 0 8px;font-size:13px;color:#999999;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
          <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;word-wrap:break-word;">${message}</p>
        </div>
      `;

      const html = emailTemplate({
        title: 'New Contact Form Submission',
        body,
      });

      await Promise.all(
        editorEmails.map(async (recipient) => {
          await strapi.plugin('email').service('email').send({
            to: recipient,
            subject: `New Contact Form Submission: ${subject}`,
            html,
          });
        })
      );

      strapi.log.info(
        `Contact form submission received from ${email} with subject: ${subject}`
      );

      return ctx.send({
        success: true,
        message:
          'Your message has been sent successfully. We will get back to you soon!',
      });
    } catch (err) {
      strapi.log.error('Contact form email send error:', {
        error: err.message,
        stack: err.stack,
        requestBody: ctx.request.body,
      });

      return ctx.badRequest(
        'Failed to send your message. Please try again later.',
        {
          error: err.message,
        }
      );
    }
  },
});
