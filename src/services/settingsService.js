import { apiClient } from './apiClient';


export const settingsService = {
  async getSettings() {
    try {
      const response = await apiClient.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Einstellungen:', error.message);
      throw error;
    }
  },

  async fetchAndReturnInterval() {
    try {
      const response = await this.getSettings();
      const updateInterval = response.update_interval * 1000; // Sekunden zu Millisekunden
      console.log("Update-Intervall geladen:", updateInterval, "ms");
      return updateInterval;
    } catch (error) {
      console.error("Fehler beim Laden des Update-Intervalls:", error.message);
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

  async updateOffsets(offsets) {
    try {
      await apiClient.patch('/settings/offsets', offsets);
      console.log('Offsets erfolgreich aktualisiert.');
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Offsets:', error);
      throw error;
    }
  },
  
  async getSensors() {
    try {
      const response = await apiClient.get('/sensors');
      console.log('Sensoren erfolgreich geladen.');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Sensor-Daten:', error);
      throw error;
    }
  },
  
  async getOffsets() {
    try {
      const response = await apiClient.get('/settings/offsets');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Offsets:', error);
      throw error;
    }
  },
  
  
};
