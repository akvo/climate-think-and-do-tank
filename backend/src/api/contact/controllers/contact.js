module.exports = ({ strapi }) => ({
  async send(ctx) {
    try {
      const { name, organization, email, subject, message } = ctx.request.body;

      // Validate fields
      if (!email || !subject || !message) {
        return ctx.badRequest('Missing required fields');
      }

      // Send email
      await strapi.plugins['email'].services.email.send({
        to: 'nikshingote@gmail.com',
        from: 'nikshingote@gmail.com',
        replyTo: email,
        subject: `Contact Form: ${subject}`,
        html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Organization:</strong> ${organization}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
          `,
      });

      return ctx.send({ success: true, message: 'Email sent successfully' });
    } catch (err) {
      strapi.log.error('Error sending email:', err);
      return ctx.badRequest('Failed to send email', { error: err.message });
    }
  },
});
