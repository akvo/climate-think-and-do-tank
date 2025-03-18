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
            },
            receiver: {
              fields: ['email', 'full_name'],
            }
          },
        });

      const receiver = entity.receiver.full_name || entity.receiver.email;
      const requester = entity.requester.full_name || entity.requester.email;
      const message = `<p>Hi ${receiver},</p>\n\n<p>You got a connection request from ${requester}.</p>\n\n<p>Cheers!</p>`

      await strapi.plugin('email').service('email').send({
        to: entity.receiver.email,
        subject: 'You Got a Connection Request',
        text: message,
        html: message,
      });
    } catch (err) {
      strapi.log.error(err);
    }
  },

  beforeUpdate(event) {
    const { data } = event.params;
    if (data.connection_status === "Accepted") {
      event.state = "sendAcceptedEmail";
    }
  },

  async afterUpdate(event) {
    if (event.state !== "sendAcceptedEmail") {
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
            },
            receiver: {
              fields: ['email', 'full_name'],
            }
          },
        });

      const receiver = entity.receiver.full_name || entity.receiver.email;
      const requester = entity.requester.full_name || entity.requester.email;
      const message = `<p>Hi ${requester},</p>\n\n<p>Your connection request is accepted by ${receiver}.</p>\n\n<p>Cheers!</p>`
      await strapi.plugin('email').service('email').send({
        to: entity.requester.email,
        subject: 'Your Connection Request is Accepted',
        text: message,
        html: message,
      });
    } catch (err) {
      strapi.log.error(err);
    }
  }
};
