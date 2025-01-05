const sql = require('mssql');
const sensorRepository = require('../../repository/sensorRepository');

// Mock sql.connect and pool
jest.mock('mssql', () => ({
  connect: jest.fn(),
  close: jest.fn(),
  query: jest.fn(),
}));

describe('sensorRepository', () => {
  let mockPool;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPool = {
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      query: jest.fn(),
      close: jest.fn(),
    };
    sql.connect.mockResolvedValue(mockPool);
  });

  describe('updateSensorData', () => {
    it('should update sensor data successfully', async () => {
      mockPool.query.mockResolvedValue({ rowsAffected: [1] });

      const sensorData = {
        sensor_id: '123',
        temperature: 22.5,
        humidity: 50,
        timestamp: new Date(),
        co2: 400,
      };

      await sensorRepository.updateSensorData(sensorData);

      expect(mockPool.request).toHaveBeenCalled();
      expect(mockPool.input).toHaveBeenCalledWith('sensor_id', sql.VarChar, sensorData.sensor_id);
      expect(mockPool.input).toHaveBeenCalledWith('temperature', sql.Decimal(5, 2), sensorData.temperature);
      expect(mockPool.input).toHaveBeenCalledWith('humidity', sql.Int, sensorData.humidity);
      expect(mockPool.input).toHaveBeenCalledWith('timestamp', sql.DateTime, sensorData.timestamp);
      expect(mockPool.input).toHaveBeenCalledWith('co2', sql.Int, sensorData.co2);
      expect(mockPool.query).toHaveBeenCalled();
    });
  });

  describe('fetchSensorData', () => {
    it('should fetch all sensor data when sensorId is not provided', async () => {
      const mockData = [
        {
          sensor_id: '123',
          current_temp: 22.5,
          current_humidity: 50,
          last_updated: new Date(),
          co2: 400,
          is_connected: true,
        },
      ];
      mockPool.query.mockResolvedValue({ recordset: mockData });

      const result = await sensorRepository.fetchSensorData();

      expect(mockPool.request).toHaveBeenCalled();
      expect(mockPool.query).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should fetch specific sensor data when sensorId is provided', async () => {
      const mockData = [
        {
          sensor_id: '123',
          current_temp: 22.5,
          current_humidity: 50,
          last_updated: new Date(),
          co2: 400,
          is_connected: true,
        },
      ];
      mockPool.query.mockResolvedValue({ recordset: mockData });

      const result = await sensorRepository.fetchSensorData('123');

      expect(mockPool.request).toHaveBeenCalled();
      expect(mockPool.input).toHaveBeenCalledWith('sensorId', sql.VarChar, '123');
      expect(mockPool.query).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchAllSensors', () => {
    it('should fetch all sensors with related room data', async () => {
      const mockSensors = [
        { sensor_id: '123', ip_address: '192.168.0.1', room_id: 'room1' },
      ];
      mockPool.query.mockResolvedValue({ recordset: mockSensors });

      const result = await sensorRepository.fetchAllSensors();

      expect(mockPool.request).toHaveBeenCalled();
      expect(mockPool.query).toHaveBeenCalled();
      expect(result).toEqual(mockSensors);
    });
  });

  describe('updateSensorIp', () => {
    it('should update sensor IP address successfully', async () => {
      mockPool.query.mockResolvedValue({ rowsAffected: [1] });

      const result = await sensorRepository.updateSensorIp('123', '192.168.0.1');

      expect(mockPool.request).toHaveBeenCalled();
      expect(mockPool.input).toHaveBeenCalledWith('sensor_id', sql.VarChar, '123');
      expect(mockPool.input).toHaveBeenCalledWith('ip_address', sql.VarChar, '192.168.0.1');
      expect(mockPool.query).toHaveBeenCalled();
      expect(result.rowsAffected[0]).toBe(1);
    });
  });

  describe('getSensorsWithRoomData', () => {
    it('should fetch sensors with room data', async () => {
      const mockData = [
        {
          sensor_id: '123',
          temperature: 22.5,
          humidity: 50,
          co2: 400,
          room_id: 'room1',
          name: 'Room A',
          target_temp: 23.0,
          target_humidity: 55,
        },
      ];
      mockPool.query.mockResolvedValue({ recordset: mockData });

      const result = await sensorRepository.getSensorsWithRoomData();

      expect(mockPool.request).toHaveBeenCalled();
      expect(mockPool.query).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('updateSensorStatus', () => {
    it('should update sensor connection status', async () => {
      mockPool.query.mockResolvedValue({ rowsAffected: [1] });

      await sensorRepository.updateSensorStatus('123', true);

      expect(mockPool.request).toHaveBeenCalled();
      expect(mockPool.input).toHaveBeenCalledWith('sensorId', sql.VarChar, '123');
      expect(mockPool.input).toHaveBeenCalledWith('isConnected', sql.Bit, 1);
      expect(mockPool.query).toHaveBeenCalled();
    });
  });

  describe('insertSensor', () => {
    it('should insert a new sensor successfully', async () => {
      mockPool.query.mockResolvedValue({ rowsAffected: [1] });

      const result = await sensorRepository.insertSensor('123', '192.168.0.1');

      expect(mockPool.request).toHaveBeenCalled();
      expect(mockPool.input).toHaveBeenCalledWith('sensor_id', sql.VarChar, '123');
      expect(mockPool.input).toHaveBeenCalledWith('ip_address', sql.VarChar, '192.168.0.1');
      expect(mockPool.query).toHaveBeenCalled();
      expect(result.rowsAffected[0]).toBe(1);
    });
  });

  describe('removeSensor', () => {
    it('should remove a sensor successfully', async () => {
      mockPool.query.mockResolvedValue({ rowsAffected: [1] });

      const result = await sensorRepository.removeSensor('123');

      expect(mockPool.request).toHaveBeenCalled();
      expect(mockPool.input).toHaveBeenCalledWith('sensor_id', sql.VarChar, '123');
      expect(mockPool.query).toHaveBeenCalled();
      expect(result.rowsAffected[0]).toBe(1);
    });
  });
});
