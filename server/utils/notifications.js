import Notification from '../models/Notification.js';

export const createNotification = async ({ recipient, type, actor, targetId, targetType, io }) => {
  if (recipient.toString() === actor.toString()) return;

  const notification = await Notification.create({
    recipient,
    type,
    actor,
    targetId,
    targetType,
  });

  const populated = await Notification.findById(notification._id).populate('actor', 'username avatar fullName');

  if (io) {
    io.to(recipient.toString()).emit('new_notification', populated);
  }

  return populated;
};
