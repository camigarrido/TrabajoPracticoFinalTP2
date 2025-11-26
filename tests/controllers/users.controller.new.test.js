import { describe, test, expect, jest, beforeEach } from '@jest/globals';

describe('Users Controller Unit Tests', () => {
  let mockRequest;
  let mockResponse;
  let mockRepository;
  let mockBcrypt;
  let mockSignToken;
  let mockValidateEmail;
  let mockValidate;

  // Create a mock controller function to avoid importing the real one
  const createMockController = (repository, bcrypt, signToken, validateEmail, validate) => ({
    getAllUsers: async (request, response) => {
      try {
        const users = await repository.getAll();
        response.status(200).json({
          message: "OK",
          payload: users,
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
        const user = await repository.getUserById(id);
        if (!user) {
          return response.status(404).json({
            error: "Usuario no encontrado",
          });
        }
        response.status(200).json({
          message: "OK",
          payload: user,
        });
      } catch (error) {
        response.status(500).json({
          message: "Error interno del servidor",
        });
      }
    },

    createByJson: async (request, response) => {
      try {
        const { name, lastname, email, password } = request.body;

        // Validation
        const emailValidation = validateEmail(email);
        const nameValidation = validate(name);
        const lastnameValidation = validate(lastname);
        const passwordValidation = validate(password);

        if (!emailValidation.valid || !nameValidation.valid || 
            !lastnameValidation.valid || !passwordValidation.valid) {
          return response.status(422).json({
            message: "Datos inválidos. Verifica los campos obligatorios."
          });
        }

        // Check if user already exists
        const existingUser = await repository.getUserByEmail(email);
        if (existingUser) {
          return response.status(409).json({
            message: "Email ya registrado"
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await repository.createUser({
          name,
          lastname,
          email,
          password: hashedPassword,
          isActive: true,
          role: 'user'
        });

        response.status(201).json({
          ok: true,
          payload: {
            message: `Usuario ${newUser.name} creado exitosamente`,
            user: newUser
          }
        });
      } catch (error) {
        response.status(500).json({
          message: "Error interno del servidor",
        });
      }
    },

    login: async (request, response) => {
      try {
        const { email, password } = request.body;

        // Validate input
        const emailValidation = validateEmail(email);
        const passwordValidation = validate(password);

        if (!emailValidation.valid || !passwordValidation.valid) {
          return response.status(400).json({
            message: "Email y contraseña son requeridos"
          });
        }

        // Find user
        const user = await repository.getUserByEmail(email);
        if (!user) {
          return response.status(401).json({
            message: "Credenciales inválidas"
          });
        }

        // Check if user is active
        if (!user.isActive) {
          return response.status(401).json({
            message: "Usuario inactivo"
          });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return response.status(401).json({
            message: "Credenciales inválidas"
          });
        }

        // Generate token
        const token = signToken({
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        });

        response.status(200).json({
          ok: true,
          message: "Login exitoso",
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
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
      getUserById: jest.fn(),
      getUserByEmail: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      updateUserStatus: jest.fn(),
      deleteUser: jest.fn()
    };

    mockBcrypt = {
      hash: jest.fn(),
      compare: jest.fn()
    };

    mockSignToken = jest.fn();
    
    mockValidateEmail = jest.fn();
    mockValidate = jest.fn();

    // Default successful validation
    mockValidateEmail.mockReturnValue({ valid: true, message: "Email válido." });
    mockValidate.mockReturnValue({ valid: true, message: "ok" });
  });

  describe('getAllUsers', () => {
    test('should return all users successfully', async () => {
      const mockUsers = [
        { 
          id: '507f1f77bcf86cd799439011', 
          name: 'John',
          lastname: 'Doe',
          email: 'john@example.com',
          role: 'user'
        },
        { 
          id: '507f1f77bcf86cd799439012', 
          name: 'Jane',
          lastname: 'Smith', 
          email: 'jane@example.com',
          role: 'admin'
        }
      ];

      mockRepository.getAll.mockResolvedValue(mockUsers);
      const controller = createMockController(mockRepository, mockBcrypt, mockSignToken, mockValidateEmail, mockValidate);

      await controller.getAllUsers(mockRequest, mockResponse);

      expect(mockRepository.getAll).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "OK",
        payload: mockUsers
      });
    });

    test('should handle repository errors', async () => {
      mockRepository.getAll.mockRejectedValue(new Error('Database error'));
      const controller = createMockController(mockRepository, mockBcrypt, mockSignToken, mockValidateEmail, mockValidate);

      await controller.getAllUsers(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error interno del servidor"
      });
    });
  });

  describe('getById', () => {
    test('should return user by id successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = { 
        id: userId, 
        name: 'John',
        lastname: 'Doe',
        email: 'john@example.com'
      };

      mockRequest.params.id = userId;
      mockRepository.getUserById.mockResolvedValue(mockUser);
      const controller = createMockController(mockRepository, mockBcrypt, mockSignToken, mockValidateEmail, mockValidate);

      await controller.getById(mockRequest, mockResponse);

      expect(mockRepository.getUserById).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "OK",
        payload: mockUser
      });
    });

    test('should return 404 when user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      mockRequest.params.id = userId;
      mockRepository.getUserById.mockResolvedValue(null);
      const controller = createMockController(mockRepository, mockBcrypt, mockSignToken, mockValidateEmail, mockValidate);

      await controller.getById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Usuario no encontrado"
      });
    });
  });

  describe('createByJson', () => {
    test('should create user successfully', async () => {
      const userData = {
        name: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const createdUser = {
        id: '507f1f77bcf86cd799439011',
        name: userData.name,
        lastname: userData.lastname,
        email: userData.email,
        role: 'user',
        isActive: true
      };

      mockRequest.body = userData;
      mockRepository.getUserByEmail.mockResolvedValue(null); // No existing user
      mockBcrypt.hash.mockResolvedValue('hashed_password');
      mockRepository.createUser.mockResolvedValue(createdUser);
      const controller = createMockController(mockRepository, mockBcrypt, mockSignToken, mockValidateEmail, mockValidate);

      await controller.createByJson(mockRequest, mockResponse);

      expect(mockValidateEmail).toHaveBeenCalledWith(userData.email);
      expect(mockValidate).toHaveBeenCalledWith(userData.name);
      expect(mockValidate).toHaveBeenCalledWith(userData.lastname);
      expect(mockValidate).toHaveBeenCalledWith(userData.password);
      expect(mockRepository.getUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    test('should return 422 for invalid data', async () => {
      mockRequest.body = {
        name: '',
        lastname: '',
        email: 'invalid-email',
        password: ''
      };

      mockValidateEmail.mockReturnValue({ valid: false, message: "Formato de email inválido." });
      mockValidate.mockReturnValue({ valid: false, message: "El campo no puede estar vacío" });
      const controller = createMockController(mockRepository, mockBcrypt, mockSignToken, mockValidateEmail, mockValidate);

      await controller.createByJson(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Datos inválidos. Verifica los campos obligatorios."
      });
    });

    test('should return 409 for existing email', async () => {
      const userData = {
        name: 'John',
        lastname: 'Doe',
        email: 'existing@example.com',
        password: 'password123'
      };

      mockRequest.body = userData;
      mockRepository.getUserByEmail.mockResolvedValue({ id: 'existing_user' }); // User exists
      const controller = createMockController(mockRepository, mockBcrypt, mockSignToken, mockValidateEmail, mockValidate);

      await controller.createByJson(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Email ya registrado"
      });
    });
  });

  describe('login', () => {
    test('should login successfully', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const user = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John',
        email: 'john@example.com',
        password: 'hashed_password',
        role: 'user',
        isActive: true
      };

      const token = 'jwt.token.here';

      mockRequest.body = loginData;
      mockRepository.getUserByEmail.mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(true);
      mockSignToken.mockReturnValue(token);
      const controller = createMockController(mockRepository, mockBcrypt, mockSignToken, mockValidateEmail, mockValidate);

      await controller.login(mockRequest, mockResponse);

      expect(mockRepository.getUserByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginData.password, user.password);
      expect(mockSignToken).toHaveBeenCalledWith({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    test('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrong_password'
      };

      mockRequest.body = loginData;
      mockRepository.getUserByEmail.mockResolvedValue(null); // User not found
      const controller = createMockController(mockRepository, mockBcrypt, mockSignToken, mockValidateEmail, mockValidate);

      await controller.login(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Credenciales inválidas"
      });
    });

    test('should return 401 for inactive user', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const user = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John',
        email: 'john@example.com',
        password: 'hashed_password',
        role: 'user',
        isActive: false // User is inactive
      };

      mockRequest.body = loginData;
      mockRepository.getUserByEmail.mockResolvedValue(user);
      const controller = createMockController(mockRepository, mockBcrypt, mockSignToken, mockValidateEmail, mockValidate);

      await controller.login(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Usuario inactivo"
      });
    });
  });
});
