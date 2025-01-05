const notificationService = require('../../services/notificationService');
const notificationRepository = require('../../repository/notificationRepository');
const settingsRepository = require('../../repository/settingsRepository');
const sensorRepository = require('../../repository/sensorRepository');

jest.mock('../../repository/notificationRepository');
jest.mock('../../repository/settingsRepository');
jest.mock('../../repository/sensorRepository');

describe('Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification after deleting existing ones of the same type', async () => {
      notificationRepository.deleteByRoomAndType.mockResolvedValue();
      notificationRepository.getNextNotificationId.mockResolvedValue('1');
      notificationRepository.createNotification.mockResolvedValue();

      await notificationService.createNotification('sensor1', 'room1', 'Description of notification', 'Type1');

      expect(notificationRepository.deleteByRoomAndType).toHaveBeenCalledWith('room1', 'Type1');
      expect(notificationRepository.getNextNotificationId).toHaveBeenCalled();
      expect(notificationRepository.createNotification).toHaveBeenCalledWith({
        notificationId: '1',
        sensorId: 'sensor1',
        roomId: 'room1',
        type: 'Type1',
        description: 'Description of notification',
        timestamp: expect.any(Date),
      });
    });

    it('should throw an error if creating a notification fails', async () => {
      notificationRepository.createNotification.mockRejectedValue(new Error('Database error'));

      await expect(
        notificationService.createNotification('sensor1', 'room1', 'Description', 'Type1')
      ).rejects.toThrow('Database error');
    });
  });

  describe('getAllNotifications', () => {
    it('should return all notifications with room names', async () => {
      const mockNotifications = [
        { notification_id: '1', room_name: 'Room A', type: 'Type1', description: 'Desc1' },
        { notification_id: '2', room_name: 'Room B', type: 'Type2', description: 'Desc2' },
      ];
      notificationRepository.getAllWithRoomNames.mockResolvedValue(mockNotifications);

      const result = await notificationService.getAllNotifications();

      expect(result).toEqual(mockNotifications);
      expect(notificationRepository.getAllWithRoomNames).toHaveBeenCalled();
    });

    it('should throw an error if fetching notifications fails', async () => {
      notificationRepository.getAllWithRoomNames.mockRejectedValue(new Error('Database error'));

      await expect(notificationService.getAllNotifications()).rejects.toThrow('Database error');
    });
  });

  describe('checkExistingSensorData', () => {
    it('should check sensor data and create notifications if thresholds are exceeded', async () => {
      const mockSettings = [{ temperature_offset: 2, humidity_offset: 5 }];
      const mockSensors = [
        {
          sensor_id: 'sensor1',
          room_id: 'room1',
          temperature: 25,
          target_temp: 22,
          humidity: 60,
          target_humidity: 50,
          co2: 1200,
        },
      ];

      settingsRepository.fetchOffsets.mockResolvedValue(mockSettings);
      sensorRepository.getSensorsWithRoomData.mockResolvedValue(mockSensors);
      notificationService.createNotification = jest.fn();

      await notificationService.checkExistingSensorData();

      expect(settingsRepository.fetchOffsets).toHaveBeenCalled();
      expect(sensorRepository.getSensorsWithRoomData).toHaveBeenCalled();
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        'sensor1',
        'room1',
        'Temperatur (25°C) weicht um 3°C vom Zielwert (22°C) ab',
        'Temperatur'
      );
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        'sensor1',
        'room1',
        'Luftfeuchtigkeit (60%) weicht um 10% vom Zielwert (50%) ab',
        'Feuchtigkeit'
      );
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        'sensor1',
        'room1',
        'CO₂-Wert ist zu hoch (1200 ppm)',
        'CO2'
      );
    });

    it('should handle errors gracefully if something fails', async () => {
      settingsRepository.fetchOffsets.mockRejectedValue(new Error('Settings error'));

      await expect(notificationService.checkExistingSensorData()).rejects.toThrow('Settings error');
    });
  });
});
