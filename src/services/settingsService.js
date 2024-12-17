import { apiClient } from './apiClient';

export const settingsService = {
  async getSettings() {
    try {
      const response = await apiClient.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Einstellungen:', error);
      throw error;
    }
  },
  async updateSettings(settings) {
    try {
      await apiClient.patch('/settings/interval', settings);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Einstellungen:', error);
      throw error;
    }
  },
};
