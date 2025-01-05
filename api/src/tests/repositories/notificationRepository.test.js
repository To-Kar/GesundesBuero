const notificationRepository = require('../../repository/notificationRepository');
const sql = require('mssql');

// Mock sql.connect and pool
jest.mock('mssql', () => ({
  connect: jest.fn(),
}));

describe('notificationRepository', () => {
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

  test('should create a notification', async () => {
    mockPool.query.mockResolvedValue({ rowsAffected: [1] });

    const notification = {
      notificationId: '1',
      sensorId: 'sensor1',
      roomId: 'room1',
      type: 'Temperature',
      description: 'Test notification',
      timestamp: new Date(),
    };

    await notificationRepository.createNotification(notification);

    expect(mockPool.request).toHaveBeenCalled();
    expect(mockPool.input).toHaveBeenCalledWith('notification_id', sql.VarChar, notification.notificationId);
    expect(mockPool.input).toHaveBeenCalledWith('sensor_id', sql.VarChar, notification.sensorId);
    expect(mockPool.input).toHaveBeenCalledWith('room_id', sql.VarChar, notification.roomId);
    expect(mockPool.input).toHaveBeenCalledWith('type', sql.VarChar, notification.type);
    expect(mockPool.input).toHaveBeenCalledWith('description', sql.NVarChar, notification.description);
    expect(mockPool.input).toHaveBeenCalledWith('timestamp', sql.DateTime2, notification.timestamp);
    expect(mockPool.query).toHaveBeenCalled();
  });

  test('should delete notifications by room and type', async () => {
    mockPool.query.mockResolvedValue({ rowsAffected: [1] });

    const roomId = 'room1';
    const type = 'Temperature';

    await notificationRepository.deleteByRoomAndType(roomId, type);

    expect(mockPool.request).toHaveBeenCalled();
    expect(mockPool.input).toHaveBeenCalledWith('room_id', sql.VarChar, roomId);
    expect(mockPool.input).toHaveBeenCalledWith('type', sql.VarChar, type);
    expect(mockPool.query).toHaveBeenCalled();
  });

  test('should get the next notification ID', async () => {
    mockPool.query.mockResolvedValue({ recordset: [{ next_id: '2' }] });

    const nextId = await notificationRepository.getNextNotificationId();

    expect(nextId).toBe('2');
    expect(mockPool.request).toHaveBeenCalled();
    expect(mockPool.query).toHaveBeenCalled();
  });

  test('should get all notifications with room names', async () => {
    const mockNotifications = [
      { notification_id: '1', type: 'Temperature', room_name: 'Room A' },
      { notification_id: '2', type: 'Humidity', room_name: 'Room B' },
    ];

    mockPool.query.mockResolvedValue({ recordset: mockNotifications });

    const notifications = await notificationRepository.getAllWithRoomNames();

    expect(notifications).toEqual(mockNotifications);
    expect(mockPool.request).toHaveBeenCalled();
    expect(mockPool.query).toHaveBeenCalled();
  });
});
