module.exports = {
  async testEmail(ctx) {
    try {
      // Log environment variables (don't do this in production)
      console.log({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USERNAME,
        // Don't log the actual password
        hasPassword: !!process.env.SMTP_PASSWORD,
      });

      // Try to send a test email
      await strapi.plugins['email'].services.email.send({
        to: process.env.SMTP_USERNAME,
        from: process.env.SMTP_FROM,
        subject: 'Test Email',
        text: 'Test email from Strapi',
      });

      return ctx.send({ message: 'Test email sent' });
    } catch (err) {
      console.error('Detailed error:', err);
      return ctx.badRequest(null, err.message);
    }
  },
};
