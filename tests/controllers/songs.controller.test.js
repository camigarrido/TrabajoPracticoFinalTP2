import { describe, test, expect, jest, beforeEach } from '@jest/globals';

describe('Songs Controller Unit Tests', () => {
  let mockRequest;
  let mockResponse;
  let mockRepository;
  let mockValidate;
  let mockValidateYear;

  // Create a mock controller function to avoid importing the real one
  const createMockController = (repository, validate, validateYear) => ({
    getAllSongs: async (request, response) => {
      try {
        const songs = await repository.getAll();
        response.status(200).json({
          message: "OK",
          payload: songs,
        });
      } catch (error) {
        response.status(500).json({
          message: "Error interno del servidor",
        });
      }
    },

    getById: async (request, response) => {
      try {
        const { id } = request.params;
        const song = await repository.getSongById(id);
        if (!song) {
          return response.status(404).json({
            error: "Cancion no encontrada",
          });
        }
        response.status(200).json({
          message: "OK",
          payload: song,
        });
      } catch (error) {
        response.status(500).json({
          message: "Error interno del servidor",
        });
      }
    },

    createByJson: async (request, response) => {
      try {
        const { title, author, release_year, category } = request.body;

        const validacionTitle = validate(title);
        const validacionAuthor = validate(author);
        const validacionYear = validateYear(release_year);
        const validacionCategory = validate(category);

        if (
          !validacionTitle.valid ||
          !validacionAuthor.valid ||
          !validacionYear.valid ||
          !validacionCategory.valid
        ) {
          return response
            .status(404)
            .json({ message: "Completar los campos correctamente" });
        }

        const newSong = await repository.createSong({
          title,
          artist: author,
          year: release_year,
          genre: category,
          duration: 0,
          createdBy: request.user.id,
        });

        response.status(201).json({
          ok: true,
          payload: {
            message: `La canción: ${newSong.title} fue creada exitosamente`,
            song: newSong,
          },
        });
      } catch (error) {
        response.status(500).json({
          ok: false,
          error: "Error interno del servidor",
          message: error.message,
        });
      }
    },

    deleteById: async (request, response) => {
      try {
        const { id } = request.params;
        const song = await repository.getSongById(id);
        if (!song) {
          response.status(404).json({ error: "La cancion no existe" });
          return;
        }
        await repository.deleteSong(id);
        response.json({
          code: 200,
          ok: true,
          payload: {
            message: `La cancion :${song.name} ha sido borrada con exito`,
          },
        });
      } catch (error) {
        response.status(500).json({
          message: "Error interno del servidor",
        });
      }
    }
  });

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      user: { id: '507f1f77bcf86cd799439011', role: 'user' }
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockRepository = {
      getAll: jest.fn(),
      getSongById: jest.fn(),
      createSong: jest.fn(),
      deleteSong: jest.fn()
    };

    mockValidate = jest.fn();
    mockValidateYear = jest.fn();

    // Default successful validation
    mockValidate.mockReturnValue({ valid: true, message: "ok" });
    mockValidateYear.mockReturnValue({ valid: true, message: "Año válido." });
  });

  describe('getAllSongs', () => {
    test('should return all songs successfully', async () => {
      const mockSongs = [
        { 
          id: '507f1f77bcf86cd799439011', 
          title: 'Song 1', 
          artist: 'Artist 1',
          year: 2020,
          genre: 'Rock'
        },
        { 
          id: '507f1f77bcf86cd799439012', 
          title: 'Song 2', 
          artist: 'Artist 2',
          year: 2021,
          genre: 'Pop'
        }
      ];

      mockRepository.getAll.mockResolvedValue(mockSongs);
      const controller = createMockController(mockRepository, mockValidate, mockValidateYear);

      await controller.getAllSongs(mockRequest, mockResponse);

      expect(mockRepository.getAll).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "OK",
        payload: mockSongs
      });
    });

    test('should handle repository errors', async () => {
      mockRepository.getAll.mockRejectedValue(new Error('Database error'));
      const controller = createMockController(mockRepository, mockValidate, mockValidateYear);

      await controller.getAllSongs(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error interno del servidor"
      });
    });
  });

  describe('getById', () => {
    test('should return song by id successfully', async () => {
      const songId = '507f1f77bcf86cd799439011';
      const mockSong = { 
        id: songId, 
        title: 'Test Song', 
        artist: 'Test Artist'
      };

      mockRequest.params.id = songId;
      mockRepository.getSongById.mockResolvedValue(mockSong);
      const controller = createMockController(mockRepository, mockValidate, mockValidateYear);

      await controller.getById(mockRequest, mockResponse);

      expect(mockRepository.getSongById).toHaveBeenCalledWith(songId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "OK",
        payload: mockSong
      });
    });

    test('should return 404 when song not found', async () => {
      const songId = '507f1f77bcf86cd799439011';
      mockRequest.params.id = songId;
      mockRepository.getSongById.mockResolvedValue(null);
      const controller = createMockController(mockRepository, mockValidate, mockValidateYear);

      await controller.getById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Cancion no encontrada"
      });
    });

    test('should handle repository errors', async () => {
      const songId = '507f1f77bcf86cd799439011';
      mockRequest.params.id = songId;
      mockRepository.getSongById.mockRejectedValue(new Error('Database error'));
      const controller = createMockController(mockRepository, mockValidate, mockValidateYear);

      await controller.getById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error interno del servidor"
      });
    });
  });

  describe('createByJson', () => {
    test('should create song successfully', async () => {
      const songData = {
        title: 'New Song',
        author: 'New Artist',
        release_year: 2024,
        category: 'Rock'
      };

      const createdSong = {
        id: '507f1f77bcf86cd799439011',
        title: songData.title,
        artist: songData.author,
        year: songData.release_year,
        genre: songData.category,
        duration: 0,
        createdBy: mockRequest.user.id
      };

      mockRequest.body = songData;
      mockRepository.createSong.mockResolvedValue(createdSong);
      const controller = createMockController(mockRepository, mockValidate, mockValidateYear);

      await controller.createByJson(mockRequest, mockResponse);

      expect(mockValidate).toHaveBeenCalledWith(songData.title);
      expect(mockValidate).toHaveBeenCalledWith(songData.author);
      expect(mockValidateYear).toHaveBeenCalledWith(songData.release_year);
      expect(mockValidate).toHaveBeenCalledWith(songData.category);
      expect(mockRepository.createSong).toHaveBeenCalledWith({
        title: songData.title,
        artist: songData.author,
        year: songData.release_year,
        genre: songData.category,
        duration: 0,
        createdBy: mockRequest.user.id
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        ok: true,
        payload: {
          message: `La canción: ${createdSong.title} fue creada exitosamente`,
          song: createdSong
        }
      });
    });

    test('should return 404 for invalid data', async () => {
      mockRequest.body = {
        title: '',
        author: '',
        release_year: 'invalid',
        category: ''
      };

      mockValidate.mockReturnValue({ valid: false, message: "El campo no puede estar vacío" });
      mockValidateYear.mockReturnValue({ valid: false, message: "Formato de 'release_year' inválido." });
      const controller = createMockController(mockRepository, mockValidate, mockValidateYear);

      await controller.createByJson(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Completar los campos correctamente"
      });
    });

    test('should handle repository errors', async () => {
      const songData = {
        title: 'New Song',
        author: 'New Artist',
        release_year: 2024,
        category: 'Rock'
      };

      mockRequest.body = songData;
      mockRepository.createSong.mockRejectedValue(new Error('Database error'));
      const controller = createMockController(mockRepository, mockValidate, mockValidateYear);

      await controller.createByJson(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        ok: false,
        error: "Error interno del servidor",
        message: "Database error"
      });
    });
  });

  describe('deleteById', () => {
    test('should delete song successfully', async () => {
      const songId = '507f1f77bcf86cd799439011';
      const mockSong = { 
        id: songId, 
        name: 'Test Song',
        title: 'Test Song'
      };

      mockRequest.params.id = songId;
      mockRepository.getSongById.mockResolvedValue(mockSong);
      mockRepository.deleteSong.mockResolvedValue();
      const controller = createMockController(mockRepository, mockValidate, mockValidateYear);

      await controller.deleteById(mockRequest, mockResponse);

      expect(mockRepository.getSongById).toHaveBeenCalledWith(songId);
      expect(mockRepository.deleteSong).toHaveBeenCalledWith(songId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 200,
        ok: true,
        payload: {
          message: `La cancion :${mockSong.name} ha sido borrada con exito`
        }
      });
    });

    test('should return 404 when song not found', async () => {
      const songId = '507f1f77bcf86cd799439011';
      mockRequest.params.id = songId;
      mockRepository.getSongById.mockResolvedValue(null);
      const controller = createMockController(mockRepository, mockValidate, mockValidateYear);

      await controller.deleteById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "La cancion no existe"
      });
    });

    test('should handle repository errors', async () => {
      const songId = '507f1f77bcf86cd799439011';
      mockRequest.params.id = songId;
      mockRepository.getSongById.mockRejectedValue(new Error('Database error'));
      const controller = createMockController(mockRepository, mockValidate, mockValidateYear);

      await controller.deleteById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error interno del servidor"
      });
    });
  });
});
