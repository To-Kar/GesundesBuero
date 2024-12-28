import { apiClient } from './apiClient';

export const notificationService = {
    pollingInterval: null,
    callbacks: new Set(),
    currentInterval: 60000, // Default-Wert

    async getNotifications() {
        try {
            const response = await apiClient.get('/notifications');
            
            if (response.data && response.data.success) {
                return response.data.data || [];
            } else {
                console.error('API response indicates failure:', response.data?.message);
                return [];
            }
        } catch (error) {
            console.error('Fehler beim Abrufen der Benachrichtigungen:', error);
            return [];
        }
    },

    async getUpdateInterval() {
        try {
            const response = await apiClient.get('/settings');
            return response.data.update_interval * 1000;
        } catch (error) {
            console.error('Fehler beim Abrufen des Update-Intervalls:', error);
            return this.currentInterval; // Fallback zum aktuellen Intervall
        }
    },

    async startPolling(callback) {
        this.callbacks.add(callback);
        
        if (!this.pollingInterval) {
            // Initialer Poll
            this.poll();
            
            // Holt das Intervall vom Backend
            this.currentInterval = await this.getUpdateInterval();
            
            // Starte das Polling mit dem Backend-Intervall
            this.pollingInterval = setInterval(() => {
                this.poll();
            }, this.currentInterval);

            // Prüfe periodisch auf Änderungen des Intervalls
            setInterval(async () => {
                const newInterval = await this.getUpdateInterval();
                if (newInterval !== this.currentInterval) {
                    // Wenn sich das Intervall geändert hat, Polling neu starten
                    this.currentInterval = newInterval;
                    if (this.pollingInterval) {
                        clearInterval(this.pollingInterval);
                        this.pollingInterval = setInterval(() => {
                            this.poll();
                        }, this.currentInterval);
                    }
                }
            }, 30000); // Prüft alle 30 sekunden nach neuem Intervall
        }
    },

    async poll() {
        try {
            const data = await this.getNotifications();
            this.callbacks.forEach(callback => callback(data));
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
};