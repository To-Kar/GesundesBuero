const sensorService = require('../../services/sensorService');
const sensorRepository = require('../../repository/sensorRepository');
const settingsRepository = require('../../repository/settingsRepository');
const notificationService = require('../../services/notificationService');

jest.mock('../../repository/sensorRepository');
jest.mock('../../repository/settingsRepository');
jest.mock('../../services/notificationService');

describe('sensorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateSensorDataAndFetchInterval', () => {
    test('should update sensor data and fetch the update interval', async () => {
      const mockBody = {
        sensor_id: '123',
        temperature: 22.5,
        humidity: 45,
        timestamp: '2025-01-01T12:00:00Z',
        co2: 400,
      };
      const mockInterval = 300;

      sensorRepository.updateSensorData.mockResolvedValue();
      settingsRepository.fetchOffsets.mockResolvedValue([{ temperature_offset: 2, humidity_offset: 5 }]);
      sensorRepository.getSensorsWithRoomData.mockResolvedValue([
        {
          sensor_id: '123',
          room_id: 'room1',
          temperature: 22.5,
          target_temp: 21,
          humidity: 45,
          target_humidity: 50,
          co2: 400,
        },
      ]);
      settingsRepository.fetchIntervalFromSettings.mockResolvedValue(mockInterval);

      const result = await sensorService.updateSensorDataAndFetchInterval(mockBody);

      expect(sensorRepository.updateSensorData).toHaveBeenCalledWith(mockBody);
      expect(notificationService.checkExistingSensorData).toHaveBeenCalled();
      expect(settingsRepository.fetchIntervalFromSettings).toHaveBeenCalled();
      expect(result).toEqual({ interval: mockInterval });
    });

    test('should throw an error if required fields are missing', async () => {
      const mockBody = { sensor_id: '123', temperature: undefined, humidity: undefined };

      await expect(sensorService.updateSensorDataAndFetchInterval(mockBody)).rejects.toThrow(
        'Fehler: sensor_id, temperature und humidity sind erforderlich.'
      );
    });
  });

  describe('getSensorData', () => {
    test('should return sensor data and update connection status', async () => {
      const mockSensors = [
        {
          sensor_id: '123',
          last_updated: '2025-01-01T12:00:00Z',
          is_connected: true,
        },
      ];
      const mockInterval = 300;

      sensorRepository.fetchSensorData.mockResolvedValue(mockSensors);
      settingsRepository.fetchIntervalFromSettings.mockResolvedValue(mockInterval);

      const result = await sensorService.getSensorData('123');

      expect(sensorRepository.fetchSensorData).toHaveBeenCalledWith('123');
      expect(sensorRepository.updateSensorStatus).toHaveBeenCalledWith('123', true);
      expect(result).toEqual(mockSensors[0]);
    });

    test('should throw an error if sensor data is not found', async () => {
      sensorRepository.fetchSensorData.mockResolvedValue([]);

      await expect(sensorService.getSensorData('123')).rejects.toThrow(
        'Sensordaten für Sensor 123 nicht gefunden'
      );
    });
  });

  describe('getAllSensors', () => {
    test('should return all sensors', async () => {
      const mockSensors = [
        { sensor_id: '123', ip_address: '192.168.1.1' },
        { sensor_id: '456', ip_address: '192.168.1.2' },
      ];

      sensorRepository.fetchAllSensors.mockResolvedValue(mockSensors);

      const result = await sensorService.getAllSensors();

      expect(sensorRepository.fetchAllSensors).toHaveBeenCalled();
      expect(result).toEqual(mockSensors);
    });

    test('should throw an error if no sensors are found', async () => {
      sensorRepository.fetchAllSensors.mockResolvedValue([]);

      await expect(sensorService.getAllSensors()).rejects.toThrow('Keine Sensor-Daten gefunden.');
    });
  });

  describe('handleIpUpdate', () => {
    test('should update sensor IP successfully', async () => {
      const sensorId = '123';
      const ipAddress = '192.168.1.1';

      sensorRepository.updateSensorIp.mockResolvedValue({ rowsAffected: [1] });

      const result = await sensorService.handleIpUpdate(sensorId, ipAddress);

      expect(sensorRepository.updateSensorIp).toHaveBeenCalledWith(sensorId, ipAddress);
      expect(result).toEqual({ message: 'IP-Adresse erfolgreich aktualisiert.' });
    });

    test('should throw an error for invalid IP address', async () => {
      const sensorId = '123';
      const ipAddress = 'invalid-ip';

      await expect(sensorService.handleIpUpdate(sensorId, ipAddress)).rejects.toThrow(
        'Ungültige IP-Adresse.'
      );
    });

    test('should throw an error if sensor ID is missing', async () => {
      await expect(sensorService.handleIpUpdate(null, '192.168.1.1')).rejects.toThrow(
        'sensor_id ist erforderlich.'
      );
    });

    test('should throw an error if sensor is not found', async () => {
      sensorRepository.updateSensorIp.mockResolvedValue({ rowsAffected: [0] });

      await expect(sensorService.handleIpUpdate('123', '192.168.1.1')).rejects.toThrow(
        'Sensor nicht gefunden.'
      );
    });
  });

  describe('addSensor', () => {
    test('should add a sensor successfully', async () => {
      const mockSensor = { sensor_id: '123', ip_address: '192.168.1.1' };

      sensorRepository.insertSensor.mockResolvedValue({ rowsAffected: [1] });

      const result = await sensorService.addSensor(mockSensor);

      expect(sensorRepository.insertSensor).toHaveBeenCalledWith(
        mockSensor.sensor_id,
        mockSensor.ip_address
      );
      expect(result).toEqual({
        message: 'Sensor erfolgreich hinzugefügt.',
        sensor_id: mockSensor.sensor_id,
        ip_address: mockSensor.ip_address,
      });
    });

    test('should throw an error for invalid IP address', async () => {
      const mockSensor = { sensor_id: '123', ip_address: 'invalid-ip' };

      await expect(sensorService.addSensor(mockSensor)).rejects.toThrow(
        'Ungültige IP-Adresse.'
      );
    });

    test('should throw an error if required fields are missing', async () => {
      const mockSensor = { sensor_id: null, ip_address: null };

      await expect(sensorService.addSensor(mockSensor)).rejects.toThrow(
        'sensor_id und ip_address sind erforderlich.'
      );
    });
  });

  describe('deleteSensor', () => {
    test('should delete a sensor successfully', async () => {
      sensorRepository.removeSensor.mockResolvedValue({ rowsAffected: [1] });

      const result = await sensorService.deleteSensor('123');

      expect(sensorRepository.removeSensor).toHaveBeenCalledWith('123');
      expect(result).toEqual({ message: 'Sensor 123 erfolgreich gelöscht.' });
    });

    test('should throw an error if sensor ID is missing', async () => {
      await expect(sensorService.deleteSensor(null)).rejects.toThrow(
        'sensor_id ist erforderlich.'
      );
    });

    test('should throw an error if sensor is not found', async () => {
      sensorRepository.removeSensor.mockResolvedValue({ rowsAffected: [0] });

      await expect(sensorService.deleteSensor('123')).rejects.toThrow('Sensor nicht gefunden.');
    });
  });
});
