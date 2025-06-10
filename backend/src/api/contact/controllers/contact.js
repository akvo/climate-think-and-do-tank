module.exports = ({ strapi }) => ({
  async send(ctx) {
    try {
      const { name, organization, email, subject, message } = ctx.request.body;

      if (!email || !subject || !message) {
        return ctx.badRequest(
          'Missing required fields: email, subject, and message are required'
        );
      }

      // ——— Role lookup ———
      // Available admin roles (display name → code):
      //  • Super Admin → 'strapi-super-admin'
      //  • Editor      → 'strapi-editor'
      //  • Author      → 'strapi-author'

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

      const recipientEmails =
        editorEmails.length > 0 ? editorEmails : ['nikshingote@gmail.com'];

      if (editorEmails.length === 0) {
        console.warn(
          'No editors found to receive the contact form submission, using fallback email'
        );
      }

      await Promise.all(
        recipientEmails.map(async (recipient) => {
          await strapi.plugins.email.service('email').send({
            to: recipient,
            subject: `New Contact Form Submission: ${subject}`,
            html: `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f7f6;
                  }
                  .container {
                    background-color: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    padding: 30px;
                    border-top: 4px solid #26BDE2;
                  }
                  .header {
                    text-align: center;
                    margin-bottom: 30px;
                    color: #26BDE2;
                  }
                  .detail {
                    margin-bottom: 20px;
                    padding: 15px;
                    background-color: #f9f9f9;
                    border-radius: 5px;
                  }
                  .label {
                    font-weight: bold;
                    color: #26BDE2;
                    margin-right: 10px;
                    display: inline-block;
                    min-width: 100px;
                  }
                  .message {
                    background-color: #f0f0f0;
                    padding: 20px;
                    border-radius: 5px;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    margin-top: 15px;
                  }
                  .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 0.9em;
                    color: #888;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                  }
                  .reply-info {
                    background-color: #e8f4f8;
                    padding: 15px;
                    border-radius: 5px;
                    margin-top: 20px;
                    border-left: 4px solid #26BDE2;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>📧 New Contact Form Submission</h1>
                  </div>
                  
                  <div class="detail">
                    <p><span class="label">👤 Name:</span> ${name || 'Not provided'}</p>
                    <p><span class="label">🏢 Organization:</span> ${organization || 'Not provided'}</p>
                    <p><span class="label">📧 Email:</span> ${email}</p>
                    <p><span class="label">📝 Subject:</span> ${subject}</p>
                    <p><span class="label">📅 Received:</span> ${new Date().toLocaleString()}</p>
                  </div>
                  
                  <div class="message">
                    <p><span class="label">💬 Message:</span></p>
                    ${message}
                  </div>
                  
                  <div class="footer">
                    <p>This is an automated notification from your website's contact form.</p>
                  </div>
                </div>
              </body>
              </html>
            `,
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
