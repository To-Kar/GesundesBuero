const sensorService = require('../../services/sensorService');
const sensorRepository = require('../../repository/sensorRepository');
const settingsRepository = require('../../repository/settingsRepository');
const notificationService = require('../../services/notificationService');

// Mock dependencies
jest.mock('../../repository/sensorRepository');
jest.mock('../../repository/settingsRepository');
jest.mock('../../services/notificationService');

describe('sensorService', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  describe('updateSensorDataAndFetchInterval', () => {
    test('should update sensor data and fetch interval successfully', async () => {
      const body = {
        sensor_id: 'sensor123',
        temperature: 25.5,
        humidity: 55,
        timestamp: '2025-01-05T10:00:00Z',
        co2: 400,
      };

      const mockOffsets = [{ temperature_offset: 2, humidity_offset: 5 }];
      const mockSensorsWithRoomData = [
        {
          sensor_id: 'sensor123',
          room_id: 'room123',
          temperature: 25,
          humidity: 50,
          target_temp: 24,
          target_humidity: 50,
        },
      ];

      settingsRepository.fetchOffsets.mockResolvedValue(mockOffsets);
      sensorRepository.getSensorsWithRoomData.mockResolvedValue(mockSensorsWithRoomData);
      settingsRepository.fetchIntervalFromSettings.mockResolvedValue(60);

      const result = await sensorService.updateSensorDataAndFetchInterval(body);

      expect(sensorRepository.updateSensorData).toHaveBeenCalledWith(body);
      expect(notificationService.checkExistingSensorData).toHaveBeenCalled();
      expect(result).toEqual({ interval: 60 });
    });

    test('should throw error if required fields are missing', async () => {
      const body = { temperature: 25.5, humidity: 55 };

      await expect(sensorService.updateSensorDataAndFetchInterval(body))
        .rejects.toThrow('Fehler: sensor_id, temperature und humidity sind erforderlich.');
    });
  });

  describe('getSensorData', () => {
    test('should fetch sensor data and update connection status', async () => {
      const mockSensors = [
        {
          sensor_id: 'sensor123',
          last_updated: '2025-01-05T10:00:00Z',
          is_connected: false,
        },
      ];
      const mockInterval = 30;

      sensorRepository.fetchSensorData.mockResolvedValue(mockSensors);
      settingsRepository.fetchIntervalFromSettings.mockResolvedValue(mockInterval);

      const result = await sensorService.getSensorData('sensor123');

      expect(sensorRepository.fetchSensorData).toHaveBeenCalledWith('sensor123');
      expect(sensorRepository.updateSensorStatus).toHaveBeenCalledWith('sensor123', true);
      expect(result).toEqual({ ...mockSensors[0], is_connected: true });
    });

    test('should throw error if sensor data is not found', async () => {
      sensorRepository.fetchSensorData.mockResolvedValue([]);

      await expect(sensorService.getSensorData('invalid_sensor'))
        .rejects.toThrow('Sensordaten für Sensor invalid_sensor nicht gefunden');
    });
  });

  describe('getAllSensors', () => {
    test('should fetch all sensors successfully', async () => {
      const mockSensors = [
        { sensor_id: 'sensor123', ip_address: '192.168.0.1' },
        { sensor_id: 'sensor456', ip_address: '192.168.0.2' },
      ];

      sensorRepository.fetchAllSensors.mockResolvedValue(mockSensors);

      const result = await sensorService.getAllSensors();

      expect(sensorRepository.fetchAllSensors).toHaveBeenCalled();
      expect(result).toEqual(mockSensors);
    });

    test('should throw error if no sensors are found', async () => {
      sensorRepository.fetchAllSensors.mockResolvedValue([]);

      await expect(sensorService.getAllSensors())
        .rejects.toThrow('Keine Sensor-Daten gefunden.');
    });
  });

  describe('handleIpUpdate', () => {
    test('should update sensor IP address successfully', async () => {
      const sensor_id = 'sensor123';
      const ip_address = '192.168.1.1';

      sensorRepository.updateSensorIp.mockResolvedValue({ rowsAffected: [1] });

      const result = await sensorService.handleIpUpdate(sensor_id, ip_address);

      expect(sensorRepository.updateSensorIp).toHaveBeenCalledWith(sensor_id, ip_address);
      expect(result).toEqual({ message: 'IP-Adresse erfolgreich aktualisiert.' });
    });

    test('should throw error if IP address is invalid', async () => {
      const sensor_id = 'sensor123';
      const ip_address = 'invalid_ip';

      await expect(sensorService.handleIpUpdate(sensor_id, ip_address))
        .rejects.toThrow('Ungültige IP-Adresse.');
    });

    test('should throw error if sensor_id is missing', async () => {
      const ip_address = '192.168.1.1';

      await expect(sensorService.handleIpUpdate(null, ip_address))
        .rejects.toThrow('sensor_id ist erforderlich.');
    });
  });

  describe('addSensor', () => {
    test('should add a new sensor successfully', async () => {
      const sensorData = { sensor_id: 'sensor123', ip_address: '192.168.1.1' };

      sensorRepository.insertSensor.mockResolvedValue({ rowsAffected: [1] });

      const result = await sensorService.addSensor(sensorData);

      expect(sensorRepository.insertSensor).toHaveBeenCalledWith('sensor123', '192.168.1.1');
      expect(result).toEqual({
        message: 'Sensor erfolgreich hinzugefügt.',
        sensor_id: 'sensor123',
        ip_address: '192.168.1.1',
      });
    });

    test('should throw error if sensor_id or ip_address is missing', async () => {
      const sensorData = { ip_address: '192.168.1.1' };

      await expect(sensorService.addSensor(sensorData))
        .rejects.toThrow('sensor_id und ip_address sind erforderlich.');
    });

    test('should throw error if IP address is invalid', async () => {
      const sensorData = { sensor_id: 'sensor123', ip_address: 'invalid_ip' };

      await expect(sensorService.addSensor(sensorData))
        .rejects.toThrow('Ungültige IP-Adresse.');
    });
  });

  describe('deleteSensor', () => {
    test('should delete a sensor successfully', async () => {
      const sensor_id = 'sensor123';

      sensorRepository.removeSensor.mockResolvedValue({ rowsAffected: [1] });

      const result = await sensorService.deleteSensor(sensor_id);

      expect(sensorRepository.removeSensor).toHaveBeenCalledWith(sensor_id);
      expect(result).toEqual({ message: `Sensor ${sensor_id} erfolgreich gelöscht.` });
    });

    test('should throw error if sensor_id is missing', async () => {
      await expect(sensorService.deleteSensor(null))
        .rejects.toThrow('sensor_id ist erforderlich.');
    });

    test('should throw error if sensor is not found', async () => {
      const sensor_id = 'sensor123';

      sensorRepository.removeSensor.mockResolvedValue({ rowsAffected: [0] });

      await expect(sensorService.deleteSensor(sensor_id))
        .rejects.toThrow('Sensor nicht gefunden.');
    });
  });
});
