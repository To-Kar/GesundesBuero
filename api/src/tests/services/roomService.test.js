const roomService = require('../../services/roomService');
const roomRepository = require('../../repository/roomRepository');

// Mock roomRepository
jest.mock('../../repository/roomRepository');

describe('Room Service - getRooms', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Mock-Zustand vor jedem Test zurücksetzen
  });

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
