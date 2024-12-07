import { apiClient } from './apiClient';

export const notificationService = {
    pollingInterval: null,
    callbacks: new Set(),

    async getNotifications() {
        try{
            const response = await apiClient.get('/notifications');
            return response.data;
        } catch(error) {
            console.error('Fehler beim Abrufen')
            return [];
        }
    },
   
    startPolling(callback) {
        this.callbacks.add(callback);
        
        if (!this.pollingInterval) {
            this.poll();
            
            this.pollingInterval = setInterval(() => {
                this.poll();
            }, 60000);
        }
    },

    async poll() {
        try {
            const data = await this.getNotifications();
            if (data) {
                this.callbacks.forEach(callback => callback(data));
            }
        } catch (error) {
            console.error('Polling error:', error);
            this.callbacks.forEach(callback => callback([]));
        }
    },

    stopPolling(callback) {
        this.callbacks.delete(callback);

        if (this.callbacks.size === 0 && this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
}

