import Notification from '../models/Notification.model.js';

export const createNotification = async (userId, type, title, message, relatedId = null, relatedType = 'none') => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const sendNotificationToUser = async (io, userId, notification) => {
  try {
    if (io) {
      io.to(`user-${userId}`).emit('notification', notification);
    }
  } catch (error) {
    console.error('Error sending real-time notification:', error);
  }
};

export const createAndSendNotification = async (io, userId, type, title, message, relatedId = null, relatedType = 'none') => {
  try {
    const notification = await createNotification(userId, type, title, message, relatedId, relatedType);
    
    if (io) {
      await sendNotificationToUser(io, userId, notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating and sending notification:', error);
    throw error;
  }
};

export const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId, limit = 50, skip = 0) => {
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });
    
    return {
      notifications,
      unreadCount,
      total: await Notification.countDocuments({ userId })
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

