module.exports = {
  async afterCreate(event) {
    const { documentId } = event.result;
    try {
      const entity = await strapi
        .documents('api::stakeholder-connection.stakeholder-connection')
        .findOne({
          documentId,
          populate: {
            requester: {
              fields: ['email', 'full_name'],
              populate: ['profile_image'],
            },
            receiver: {
              fields: ['email', 'full_name'],
              populate: ['profile_image'],
            },
          },
        });

      const receiver = entity.receiver.full_name || entity.receiver.email;
      const requester = entity.requester.full_name || entity.requester.email;

      const message = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connection Request</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-container {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    .email-header {
      background-color: #4a88db;
      padding: 20px 30px;
    }
    .email-header h1 {
      color: white;
      margin: 0;
      font-size: 22px;
      font-weight: 500;
    }
    .email-body {
      padding: 30px;
      background-color: white;
    }
    .email-footer {
      background-color: #f8f9fa;
      padding: 15px 30px;
      font-size: 14px;
      color: #6c757d;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }
    .button {
      display: inline-block;
      background-color: #4a88db;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 500;
      margin-top: 20px;
    }
    .profile {
      display: flex;
      align-items: center;
      margin: 20px 0;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 6px;
    }
    .profile-image {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 15px;
      background-color: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #4a88db;
    }
    .profile-info {
      flex: 1;
    }
    .profile-name {
      font-weight: bold;
      font-size: 16px;
      margin: 0 0 5px 0;
    }
    p {
      margin: 0 0 15px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Connection Request</h1>
    </div>
    <div class="email-body">
      <p>Hi ${receiver},</p>
      
      <p>You've received a new connection request from:</p>
      
      <div class="profile">
        <div class="profile-image">
          ${requester.charAt(0).toUpperCase()}
        </div>
        <div class="profile-info">
          <p class="profile-name">${requester}</p>
        </div>
      </div>
      
      <p>Building connections is a great way to collaborate with fellow stakeholders in your network.</p>
      
      <p>You can review this request and other pending connections by visiting your profile dashboard.</p>
      
      <a href="${process.env.FRONTEND_URL || 'https://yourplatform.com'}/connections" class="button">View Connection Request</a>
    </div>
    <div class="email-footer">
      <p>© ${new Date().getFullYear()} Your Platform Name. All rights reserved.</p>
      <p>If you have any questions, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
      `;

      const textMessage = `
Hi ${receiver},

You've received a new connection request from ${requester}.

Building connections is a great way to collaborate with fellow stakeholders in your network.

You can review this request and other pending connections by visiting your profile dashboard at:
${process.env.FRONTEND_URL || 'https://yourplatform.com'}/connections

Regards,
Your Platform Team
      `;

      await strapi.plugin('email').service('email').send({
        to: entity.receiver.email,
        subject: 'New Connection Request',
        text: textMessage,
        html: message,
      });
    } catch (err) {
      strapi.log.error(err);
    }
  },

  beforeUpdate(event) {
    const { data } = event.params;
    if (data.connection_status === 'Accepted') {
      event.state = 'sendAcceptedEmail';
    }
  },

  async afterUpdate(event) {
    if (event.state !== 'sendAcceptedEmail') {
      return;
    }
    const { documentId } = event.result;
    try {
      const entity = await strapi
        .documents('api::stakeholder-connection.stakeholder-connection')
        .findOne({
          documentId,
          populate: {
            requester: {
              fields: ['email', 'full_name'],
              populate: ['profile_image'],
            },
            receiver: {
              fields: ['email', 'full_name'],
              populate: ['profile_image'],
            },
          },
        });

      const receiver = entity.receiver.full_name || entity.receiver.email;
      const requester = entity.requester.full_name || entity.requester.email;

      const acceptedMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connection Accepted</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-container {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    .email-header {
      background-color: #28a745;
      padding: 20px 30px;
    }
    .email-header h1 {
      color: white;
      margin: 0;
      font-size: 22px;
      font-weight: 500;
    }
    .email-body {
      padding: 30px;
      background-color: white;
    }
    .email-footer {
      background-color: #f8f9fa;
      padding: 15px 30px;
      font-size: 14px;
      color: #6c757d;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }
    .button {
      display: inline-block;
      background-color: #28a745;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 500;
      margin-top: 20px;
    }
    .profile {
      display: flex;
      align-items: center;
      margin: 20px 0;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 6px;
    }
    .profile-image {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 15px;
      background-color: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #28a745;
    }
    .profile-info {
      flex: 1;
    }
    .profile-name {
      font-weight: bold;
      font-size: 16px;
      margin: 0 0 5px 0;
    }
    .checkmark {
      display: block;
      text-align: center;
      font-size: 64px;
      margin: 10px 0;
      color: #28a745;
    }
    p {
      margin: 0 0 15px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Connection Accepted!</h1>
    </div>
    <div class="email-body">
      <p>Hi ${requester},</p>
      
      <div class="checkmark">✓</div>
      <p style="text-align: center; font-weight: bold; font-size: 18px;">Good news! Your connection request has been accepted.</p>
      
      <div class="profile">
        <div class="profile-image">
          ${receiver.charAt(0).toUpperCase()}
        </div>
        <div class="profile-info">
          <p class="profile-name">${receiver}</p>
          <p>is now connected with you</p>
        </div>
      </div>
      
      <p>You can now collaborate, share resources, and communicate directly with your new connection.</p>
      
      <a href="${process.env.FRONTEND_URL || 'https://yourplatform.com'}/connections" class="button">View Your Connections</a>
    </div>
    <div class="email-footer">
      <p>© ${new Date().getFullYear()} Your Platform Name. All rights reserved.</p>
      <p>If you have any questions, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
      `;

      const acceptedTextMessage = `
Hi ${requester},

Good news! Your connection request has been accepted by ${receiver}.

You can now collaborate, share resources, and communicate directly with your new connection.

Visit your connections page at:
${process.env.FRONTEND_URL || 'https://yourplatform.com'}/connections

Regards,
Your Platform Team
      `;

      await strapi.plugin('email').service('email').send({
        to: entity.requester.email,
        subject: 'Connection Request Accepted',
        text: acceptedTextMessage,
        html: acceptedMessage,
      });
    } catch (err) {
      strapi.log.error(err);
    }
  },
};
