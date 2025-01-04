import { apiClient } from './apiClient';

export const historyService = {
  async fetchRoomHistory(roomId, startDate, endDate, hourly = false) {
    try {
      const hourlyParam = hourly ? "&hourly=true" : "";
      const response = await apiClient.get(
        `/room-history/${roomId}?startDate=${startDate}&endDate=${endDate}${hourlyParam}`
      );
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Ungültige Datenstruktur von der API");
      }
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Raumhistorie:', error.message);
      throw error;
    }
  },
};
