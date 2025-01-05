const settingsRepository = require('../../repository/settingsRepository');
const sql = require('mssql');

jest.mock('mssql');

const mockPool = {
    request: jest.fn(() => mockRequest),
    close: jest.fn()
};

const mockRequest = {
    input: jest.fn(() => mockRequest),
    query: jest.fn()
};

describe('settingsRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        sql.connect.mockResolvedValue(mockPool);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('fetchIntervalFromSettings', () => {
        it('should return the update interval from settings', async () => {
            const mockInterval = 15;
            mockRequest.query.mockResolvedValue({ recordset: [{ update_interval: mockInterval }] });

            const result = await settingsRepository.fetchIntervalFromSettings();

            expect(result).toBe(mockInterval);
            expect(sql.connect).toHaveBeenCalled();
            expect(mockRequest.query).toHaveBeenCalled();
            expect(mockPool.close).toHaveBeenCalled();
        });

        it('should throw an error if no settings are found', async () => {
            mockRequest.query.mockResolvedValue({ recordset: [] });

            await expect(settingsRepository.fetchIntervalFromSettings()).rejects.toThrow('Keine Daten in der Tabelle Settings gefunden.');

            expect(sql.connect).toHaveBeenCalled();
            expect(mockRequest.query).toHaveBeenCalled();
            expect(mockPool.close).toHaveBeenCalled();
        });
    });

    describe('fetchSettings', () => {
        it('should fetch settings successfully', async () => {
            const mockSettings = { update_interval: 10 };
            mockRequest.query.mockResolvedValue({ recordset: [mockSettings] });

            const result = await settingsRepository.fetchSettings();

            expect(result).toEqual(mockSettings);
            expect(sql.connect).toHaveBeenCalled();
            expect(mockRequest.query).toHaveBeenCalled();
            expect(mockPool.close).toHaveBeenCalled();
        });
    });

    describe('updateInterval', () => {
        it('should update the interval and return affected rows', async () => {
            const mockAffectedRows = 1;
            mockRequest.query.mockResolvedValue({ recordset: [{ affected: mockAffectedRows }] });

            const result = await settingsRepository.updateInterval(20);

            expect(result).toBe(mockAffectedRows);
            expect(sql.connect).toHaveBeenCalled();
            expect(mockRequest.input).toHaveBeenCalledWith('update_interval', sql.Int, 20);
            expect(mockRequest.query).toHaveBeenCalled();
            expect(mockPool.close).toHaveBeenCalled();
        });
    });

    describe('fetchOffsets', () => {
        it('should fetch offsets successfully', async () => {
            const mockOffsets = { temperature_offset: 2, humidity_offset: 5 };
            mockRequest.query.mockResolvedValue({ recordset: [mockOffsets] });

            const result = await settingsRepository.fetchOffsets();

            expect(result).toEqual([mockOffsets]);
            expect(sql.connect).toHaveBeenCalled();
            expect(mockRequest.query).toHaveBeenCalled();
            expect(mockPool.close).toHaveBeenCalled();
        });

        it('should throw an error if no offsets are found', async () => {
            mockRequest.query.mockResolvedValue({ recordset: [] });

            await expect(settingsRepository.fetchOffsets()).rejects.toThrow();

            expect(sql.connect).toHaveBeenCalled();
            expect(mockRequest.query).toHaveBeenCalled();
            expect(mockPool.close).toHaveBeenCalled();
        });
    });

    describe('updateOffsets', () => {
        it('should update offsets successfully', async () => {
            const mockRowsAffected = 1;
            mockRequest.query.mockResolvedValue({ rowsAffected: [mockRowsAffected] });

            const result = await settingsRepository.updateOffsets(2.5, 6.0);

            expect(result.rowsAffected[0]).toBe(mockRowsAffected);
            expect(sql.connect).toHaveBeenCalled();
            expect(mockRequest.input).toHaveBeenCalledWith('temperature_offset', sql.Float, 2.5);
            expect(mockRequest.input).toHaveBeenCalledWith('humidity_offset', sql.Float, 6.0);
            expect(mockRequest.query).toHaveBeenCalled();
            expect(mockPool.close).toHaveBeenCalled();
        });
    });
});
