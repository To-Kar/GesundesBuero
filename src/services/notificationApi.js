import { apiClient } from './apiClient';

// Notification API service
export const notificationApi = {
    // Get all notifications
    async getNotifications() {
        try {
            const response = await apiClient.get('/notifications');
            return this._transformNotificationData(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    // Get notifications for a specific room
    async getNotificationsByRoom(roomId) {
        try {
            const response = await apiClient.get(`/notifications?roomId=${roomId}`);
            return this._transformNotificationData(response.data);
        } catch (error) {
            console.error(`Error fetching notifications for room ${roomId}:`, error);
            throw error;
        }
    },

    // Mark notification as read
    async markAsRead(notificationId) {
        try {
            const response = await apiClient.put(`/notifications/${notificationId}`, {
                status: true
            });
            return this._transformSingleNotification(response.data);
        } catch (error) {
            console.error(`Error marking notification ${notificationId} as read:`, error);
            throw error;
        }
    },

    // Get unread notification count
    async getUnreadCount() {
        try {
            const response = await apiClient.get('/notifications/unread/count');
            return response.data.count;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    },

    // Private method to transform notification data
    _transformNotificationData(data) {
        return Array.isArray(data) ? data.map(this._transformSingleNotification) : this._transformSingleNotification(data);
    },

    _transformSingleNotification(notification) {
        return {
            id: notification.notification_id,
            roomId: notification.room_id,
            type: notification.type,
            message: notification.description,
            timestamp: new Date(notification.timestamp),
            status: notification.status ? 'read' : 'unread'
        };
    }
};