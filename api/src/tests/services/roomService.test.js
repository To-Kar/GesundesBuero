const roomService = require('../../services/roomService');
const roomRepository = require('../../repository/roomRepository');
const notificationService = require('../../services/notificationService');

// Mock roomRepository and notificationService
jest.mock('../../repository/roomRepository');
jest.mock('../../services/notificationService');

describe('Room Service', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  describe('getRooms', () => {
    test('should return rooms if they exist', async () => {
      const mockRooms = [{ id: 1, name: 'Room A' }, { id: 2, name: 'Room B' }];
      roomRepository.fetchRooms.mockResolvedValue(mockRooms);

      const result = await roomService.getRooms();
      expect(result).toEqual(mockRooms);
      expect(roomRepository.fetchRooms).toHaveBeenCalledWith(undefined);
    });

    test('should throw an error if no rooms are found', async () => {
      roomRepository.fetchRooms.mockResolvedValue([]);

      await expect(roomService.getRooms()).rejects.toThrow('Keine Räume gefunden');
      expect(roomRepository.fetchRooms).toHaveBeenCalledWith(undefined);
    });

    test('should throw an error if roomId is provided but not found', async () => {
      roomRepository.fetchRooms.mockResolvedValue([]);

      await expect(roomService.getRooms(123)).rejects.toThrow('Raum 123 nicht gefunden');
      expect(roomRepository.fetchRooms).toHaveBeenCalledWith(123);
    });
  });

  describe('addRoom', () => {
    test('should add a new room and handle sensor assignment', async () => {
      const mockRoomData = { room_id: 'room123', name: 'Test Room', sensor_id: 'sensor123' };
      const mockAssignedRoom = { room_id: 'room456' };

      roomRepository.saveRoom.mockResolvedValue();
      roomRepository.getRoomBySensor.mockResolvedValue(mockAssignedRoom);
      roomRepository.removeSensorFromRoom.mockResolvedValue();

      const result = await roomService.addRoom(mockRoomData);

      expect(result.message).toEqual('Raum erfolgreich hinzugefügt.');
      expect(roomRepository.saveRoom).toHaveBeenCalledWith(mockRoomData);
      expect(roomRepository.removeSensorFromRoom).toHaveBeenCalledWith(mockAssignedRoom.room_id);
    });
  });

  describe('updateRoom', () => {
    test('should update a room and check notifications', async () => {
      const mockRoomData = { name: 'Updated Room', target_temp: 25, target_humidity: 60 };
      const mockResult = { rowsAffected: [1] };

      roomRepository.updateRoom.mockResolvedValue(mockResult);
      notificationService.checkExistingSensorData.mockResolvedValue();

      const result = await roomService.updateRoom('room123', mockRoomData);

      expect(result.message).toEqual('Room updated successfully.');
      expect(roomRepository.updateRoom).toHaveBeenCalledWith('room123', mockRoomData);
      expect(notificationService.checkExistingSensorData).toHaveBeenCalled();
    });

    test('should throw an error if room is not found', async () => {
      roomRepository.updateRoom.mockResolvedValue({ rowsAffected: [0] });

      await expect(roomService.updateRoom('room123', {})).rejects.toThrow('Room not found.');
      expect(roomRepository.updateRoom).toHaveBeenCalledWith('room123', {});
    });
  });

  describe('deleteRoom', () => {
    test('should delete a room and its notifications', async () => {
      const mockResult = { rowsAffected: [1] };

      roomRepository.deleteNotificationsByRoom.mockResolvedValue();
      roomRepository.deleteRoom.mockResolvedValue(mockResult);

      const result = await roomService.deleteRoom('room123');

      expect(result.message).toEqual('Room and related notifications deleted successfully.');
      expect(roomRepository.deleteNotificationsByRoom).toHaveBeenCalledWith('room123');
      expect(roomRepository.deleteRoom).toHaveBeenCalledWith('room123');
    });

    test('should throw an error if room is not found', async () => {
      roomRepository.deleteRoom.mockResolvedValue({ rowsAffected: [0] });

      await expect(roomService.deleteRoom('room123')).rejects.toThrow('Room not found.');
      expect(roomRepository.deleteRoom).toHaveBeenCalledWith('room123');
    });
  });

  describe('updateRoomTargets', () => {
    test('should update room targets and check notifications', async () => {
      const mockTargets = { target_temp: 22.5, target_humidity: 50 };
      const mockResult = { rowsAffected: [1] };

      roomRepository.updateRoomTargets.mockResolvedValue(mockResult);
      notificationService.checkExistingSensorData.mockResolvedValue();

      const result = await roomService.updateRoomTargets('room123', mockTargets);

      expect(result.message).toEqual('Sollwerte erfolgreich aktualisiert');
      expect(roomRepository.updateRoomTargets).toHaveBeenCalledWith('room123', mockTargets);
      expect(notificationService.checkExistingSensorData).toHaveBeenCalled();
    });

    test('should throw an error if no targets are provided', async () => {
      await expect(roomService.updateRoomTargets('room123', {})).rejects.toThrow('Kein Sollwert zum Aktualisieren angegeben.');
    });

    test('should throw an error if room is not found', async () => {
      roomRepository.updateRoomTargets.mockResolvedValue({ rowsAffected: [0] });

      await expect(roomService.updateRoomTargets('room123', { target_temp: 22.5 })).rejects.toThrow('Raum room123 nicht gefunden');
      expect(roomRepository.updateRoomTargets).toHaveBeenCalledWith('room123', { target_temp: 22.5 });
    });
  });
});
