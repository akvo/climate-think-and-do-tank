const { v4: uuidv4 } = require('uuid');

module.exports = {
  async resendVerification(ctx) {
    const { email } = ctx.request.body;

    if (!email) {
      return ctx.badRequest('Email is required');
    }

    try {
      // Find user by email
      const user = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({
          where: { email: email.toLowerCase() },
        });

      if (!user) {
        return ctx.badRequest('User not found');
      }

      if (user.confirmed) {
        return ctx.badRequest('Email is already verified');
      }

      // Generate new confirmation token
      const confirmationToken = uuidv4();

      // Update user with new token
      await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: { confirmationToken },
      });

      // Send verification email
      try {
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${confirmationToken}`;

        await strapi.plugins.email.services.email.send({
          to: user.email,
          from: process.env.SMTP_FROM,
          subject: 'Please confirm your email',
          html: `
            <h1>Welcome to our platform!</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationLink}">Verify Email</a>
            <p>If you did not request this, please ignore this email.</p>
          `,
        });

        return ctx.send({
          success: true,
          message: 'Verification email sent successfully',
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        return ctx.badRequest('Failed to send verification email');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      return ctx.badRequest('Failed to resend verification email');
    }
  },

  async register(ctx) {
    const { email, username, password, organization, sector, country, role } =
      ctx.request.body;

    // Validate input
    if (!email) return ctx.badRequest('Email is required');
    if (!password) return ctx.badRequest('Password is required');
    if (!username) return ctx.badRequest('Username is required');

    try {
      // Check for existing user
      const existingUser = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({
          where: { email: email.toLowerCase() },
        });

      if (existingUser) {
        return ctx.badRequest('Email is already taken');
      }

      // Generate confirmation token
      const confirmationToken = uuidv4();

      // Create user
      const user = await strapi.db
        .query('plugin::users-permissions.user')
        .create({
          data: {
            username,
            email: email.toLowerCase(),
            password,
            organization,
            sector,
            country,
            role,
            provider: 'local',
            confirmed: false,
            confirmationToken,
          },
        });

      // Send verification email
      try {
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${confirmationToken}`;

        await strapi.plugins.email.services.email.send({
          to: user.email,
          from: process.env.SMTP_FROM,
          subject: 'Please confirm your email',
          html: `
            <h1>Welcome to our platform!</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationLink}">Verify Email</a>
            <p>If you did not request this, please ignore this email.</p>
          `,
        });

        const sanitizedUser = { ...user };
        delete sanitizedUser.password;
        delete sanitizedUser.confirmationToken;
        delete sanitizedUser.resetPasswordToken;

        return ctx.send({
          user: sanitizedUser,
          message: 'Confirmation email sent successfully',
        });
      } catch (emailError) {
        // If email fails, still return user but with error message
        console.error('Email sending failed:', emailError);

        const sanitizedUser = { ...user };
        delete sanitizedUser.password;
        delete sanitizedUser.confirmationToken;
        delete sanitizedUser.resetPasswordToken;

        return ctx.send({
          user: sanitizedUser,
          message: 'User created but confirmation email could not be sent',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      return ctx.badRequest('Registration failed', { error: error.message });
    }
  },

  async verify(ctx) {
    const { token } = ctx.query;

    if (!token) {
      return ctx.badRequest('Verification token is required');
    }

    try {
      // Find user with the token
      const user = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({
          where: { confirmationToken: token },
        });

      if (!user) {
        return ctx.badRequest('Invalid or expired verification token');
      }

      // Update user to confirmed status
      await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          confirmed: true,
          confirmationToken: null,
        },
      });

      return ctx.send({
        message: 'Email verified successfully',
      });
    } catch (error) {
      console.error('Verification error:', error);
      return ctx.badRequest('Verification failed', { error: error.message });
    }
  },
};
