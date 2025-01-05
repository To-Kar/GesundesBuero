const sql = require('mssql');
const roomRepository = require('../../repository/roomRepository');

// Mock SQL connection
jest.mock('mssql');

describe('roomRepository', () => {
  let mockPool, mockRequest;

  beforeEach(() => {
    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn(),
    };

    mockPool = {
      request: jest.fn(() => mockRequest),
      close: jest.fn(),
    };

    sql.connect = jest.fn(() => mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchRooms', () => {
    it('should fetch all rooms when roomId is not provided', async () => {
      const mockRooms = [
        { room_id: '1', name: 'Room A', imageURL: 'imageA.jpg', sensor_id: '123' },
        { room_id: '2', name: 'Room B', imageURL: 'imageB.jpg', sensor_id: '456' },
      ];
      mockRequest.query.mockResolvedValue({ recordset: mockRooms });

      const result = await roomRepository.fetchRooms();

      expect(sql.connect).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.query).toHaveBeenCalled();
      expect(result).toEqual(mockRooms);
      expect(mockPool.close).toHaveBeenCalled();
    });

    it('should fetch a specific room when roomId is provided', async () => {
      const mockRoom = [{ room_id: '1', name: 'Room A', imageURL: 'imageA.jpg', sensor_id: '123' }];
      mockRequest.query.mockResolvedValue({ recordset: mockRoom });

      const result = await roomRepository.fetchRooms('1');

      expect(mockRequest.input).toHaveBeenCalledWith('roomId', sql.VarChar, '1');
      expect(mockRequest.query).toHaveBeenCalled();
      expect(result).toEqual(mockRoom);
    });
  });

  describe('saveRoom', () => {
    it('should insert a new room', async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

      const roomData = {
        room_id: '1',
        name: 'Room A',
        sensor_id: '123',
        image_url: 'https://example.com/image.jpg',
        target_temp: 22.5,
        target_humidity: 50,
      };

      const result = await roomRepository.saveRoom(roomData);

      expect(mockRequest.input).toHaveBeenCalledWith('room_id', sql.VarChar, '1');
      expect(mockRequest.input).toHaveBeenCalledWith('name', sql.NVarChar, 'Room A');
      expect(mockRequest.input).toHaveBeenCalledWith('sensor_id', sql.VarChar, '123');
      expect(mockRequest.input).toHaveBeenCalledWith('image_url', sql.NVarChar, 'https://example.com/image.jpg');
      expect(mockRequest.input).toHaveBeenCalledWith('target_temp', sql.Float, 22.5);
      expect(mockRequest.input).toHaveBeenCalledWith('target_humidity', sql.Float, 50);
      expect(mockRequest.query).toHaveBeenCalled();
      expect(result.rowsAffected[0]).toBe(1);
    });
  });

  describe('getRoomBySensor', () => {
    it('should fetch a room by sensor_id', async () => {
      const mockRoom = [{ room_id: '1', sensor_id: '123' }];
      mockRequest.query.mockResolvedValue({ recordset: mockRoom });

      const result = await roomRepository.getRoomBySensor('123', '2');

      expect(mockRequest.input).toHaveBeenCalledWith('sensor_id', sql.VarChar, '123');
      expect(mockRequest.input).toHaveBeenCalledWith('roomId', sql.VarChar, '2');
      expect(mockRequest.query).toHaveBeenCalled();
      expect(result).toEqual(mockRoom[0]);
    });
  });

  describe('removeSensorFromRoom', () => {
    it('should set sensor_id to NULL for a given room', async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

      await roomRepository.removeSensorFromRoom('1');

      expect(mockRequest.input).toHaveBeenCalledWith('roomId', sql.VarChar, '1');
      expect(mockRequest.query).toHaveBeenCalled();
    });
  });

  describe('updateRoom', () => {
    it('should update a room with provided data', async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

      const roomData = {
        name: 'Updated Room',
        sensor_id: '456',
        target_temp: 23.0,
        target_humidity: 45,
      };

      await roomRepository.updateRoom('1', roomData);

      expect(mockRequest.input).toHaveBeenCalledWith('name', sql.NVarChar, 'Updated Room');
      expect(mockRequest.input).toHaveBeenCalledWith('sensor_id', sql.VarChar, '456');
      expect(mockRequest.input).toHaveBeenCalledWith('target_temp', sql.Float, 23.0);
      expect(mockRequest.input).toHaveBeenCalledWith('target_humidity', sql.Float, 45);
      expect(mockRequest.query).toHaveBeenCalled();
    });
  });

  describe('deleteRoom', () => {
    it('should delete a room by roomId', async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

      const result = await roomRepository.deleteRoom('1');

      expect(mockRequest.input).toHaveBeenCalledWith('roomId', sql.VarChar, '1');
      expect(mockRequest.query).toHaveBeenCalled();
      expect(result.rowsAffected[0]).toBe(1);
    });
  });

  describe('updateRoomTargets', () => {
    it('should update room targets for temperature and humidity', async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

      const targets = { target_temp: 25.0, target_humidity: 55 };

      await roomRepository.updateRoomTargets('1', targets);

      expect(mockRequest.input).toHaveBeenCalledWith('target_temp', sql.Float, 25.0);
      expect(mockRequest.input).toHaveBeenCalledWith('target_humidity', sql.Float, 55);
      expect(mockRequest.query).toHaveBeenCalled();
    });
  });
});
