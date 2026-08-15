const Notification = require('../models/notificationModel');

const normalizeUserIds = (userIds = []) => {
  const seen = new Set();
  const normalized = [];

  for (const userId of userIds) {
    const key = String(userId || '');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    normalized.push(userId);
  }

  return normalized;
};

async function createNotificationsForUsers({ userIds = [], message, type = 'info' }) {
  const normalizedUserIds = normalizeUserIds(userIds);

  if (!message || normalizedUserIds.length === 0) {
    return [];
  }

  const payload = normalizedUserIds.map((userId) => ({
    userId,
    message,
    type,
    isRead: false,
  }));

  return Notification.insertMany(payload, { ordered: false });
}

async function createNotificationForUser({ userId, message, type = 'info' }) {
  if (!userId || !message) return null;
  return Notification.create({ userId, message, type, isRead: false });
}

module.exports = {
  createNotificationsForUsers,
  createNotificationForUser,
};
