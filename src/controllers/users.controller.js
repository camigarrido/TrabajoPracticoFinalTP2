import UsersRepository from "../repositories/users.mongoose.repository.js";
import bcrypt from 'bcrypt';
import { signToken } from '../auth/index.js';

export const UsersController = {
	getAllUsers: async (request, response) => {
		try {
			const users = await UsersRepository.getAll();
			response.status(200).json({
				message: "OK",
				payload: users,
			});
		} catch (error) {
			console.log("Error al obtener los usuarios", error.message);
			response.status(500).json({
				message: "Error interno del servidor",
			});
		}
	},

	getById: async (request, response) => {
		try {
			const { id } = request.params;
			const user = await UsersRepository.getUserById(id);
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
			console.log("Error al obtener el usuario", error.message);
			response.status(500).json({
				message: "Error interno del servidor",
			});
		}
	},

	deleteById: async (request, response) => {
		try {
			const { id } = request.params;
			const user = await UsersRepository.getUserById(id);

			if (!user) {
				return response.status(422).json({
					error: "El usuario no existe",
				});
			}

			await UsersRepository.deleteUser(id);
			response.json({
				code: 200,
				ok: true,
				payload: {
					message: `El usuario ${user.name} ha sido borrado con éxito`,
				},
			});
		} catch (error) {
			console.log("Error al borrar el usuario", error.message);
			response.status(500).json({
				message: "Error interno del servidor",
			});
		}
	},

	createByJson: async (request, response) => {
		try {
			const { name, email, password, age, role } = request.body;

			if (!name || !email || !password) {
				return response.status(422).json({
					message: "Faltan datos obligatorios: name, email y password",
				});
			}

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return response.status(422).json({
					message: "Formato de email inválido",
				});
			}

			const existingUser = await UsersRepository.getUserByEmail(email);
			if (existingUser) {
				return response.status(409).json({
					message: "El email ya está registrado",
				});
			}

			const saltRounds = 10;
			const hashedPassword = await bcrypt.hash(password, saltRounds);

			const newUser = await UsersRepository.createUser({
				name,
				email,
				password: hashedPassword,
				age,
				role: role || "user",
			});

			response.status(201).json({
				ok: true,
				payload: {
					message: `El usuario ${newUser.name} fue creado exitosamente`,
					user: newUser,
				},
			});
		} catch (error) {
			console.log("Error al crear el usuario", error.message);
			if (error.message.includes("El email ya está registrado")) {
				return response.status(409).json({
					message: error.message,
				});
			}
			response.status(500).json({
				message: "Error interno del servidor",
			});
		}
	},

	login: async (request, response) => {
		try {
			const { email, password } = request.body;

			// Validación de datos obligatorios
			if (!email || !password) {
				return response.status(422).json({
					message: "Faltan datos obligatorios: email y password",
				});
			}

			// Buscar usuario por email
			const user = await UsersRepository.getUserByEmail(email);
			if (!user) {
				return response.status(401).json({
					message: "Credenciales inválidas",
				});
			}

			// Verificar si el usuario está activo
			if (!user.isActive) {
				return response.status(401).json({
					message: "Usuario inactivo",
				});
			}

			// Verificar contraseña
			const isValidPassword = await bcrypt.compare(password, user.password);
			if (!isValidPassword) {
				return response.status(401).json({
					message: "Credenciales inválidas",
				});
			}

			// Generar token JWT
			const token = signToken({
				id: user._id.toString(),
				email: user.email,
				name: user.name,
				role: user.role,
			});

			response.status(200).json({
				ok: true,
				payload: {
					message: "Login exitoso",
					token,
					user: {
						id: user._id,
						name: user.name,
						email: user.email,
						role: user.role,
						age: user.age,
					},
				},
			});
		} catch (error) {
			console.log("Error en login", error.message);
			response.status(500).json({
				message: "Error interno del servidor",
			});
		}
	},

	updateByJson: async (request, response) => {
		try {
			const { id, name, email, age, role, isActive } = request.body;

			if (!id) {
				return response.status(422).json({
					message: "El id es obligatorio para actualizar el usuario",
				});
			}

			if (email) {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(email)) {
					return response.status(422).json({
						message: "Formato de email inválido",
					});
				}

				const existingUser = await UsersRepository.getUserByEmail(email);
				if (existingUser && existingUser._id.toString() !== id) {
					return response.status(409).json({
						message: "El email ya está registrado por otro usuario",
					});
				}
			}

			const updateData = {};
			if (name !== undefined) updateData.name = name;
			if (email !== undefined) updateData.email = email;
			if (age !== undefined) updateData.age = age;
			if (role !== undefined) updateData.role = role;
			if (isActive !== undefined) updateData.isActive = isActive;

			const updated = await UsersRepository.updateUser(id, updateData);

			response.status(200).json({
				ok: true,
				payload: {
					message: `El usuario ${updated.name} fue actualizado exitosamente`,
					user: updated,
				},
			});
		} catch (error) {
			console.log("Error al actualizar el usuario", error.message);
			if (
				error.message.includes("no encontrado") ||
				error.message.includes("not found")
			) {
				return response.status(404).json({
					message: "Usuario no encontrado",
				});
			}
			if (error.message.includes("El email ya está registrado")) {
				return response.status(409).json({
					message: error.message,
				});
			}
			response.status(500).json({
				message: "Error interno del servidor",
			});
		}
	},

	updateStatus: async (request, response) => {
		try {
			const { id } = request.params;
			const { isActive } = request.body;

			if (isActive === undefined) {
				return response.status(422).json({
					message: "El campo isActive es obligatorio",
				});
			}

			const updated = await UsersRepository.updateUserStatus(id, isActive);

			response.status(200).json({
				ok: true,
				payload: {
					message: `Estado del usuario ${updated.name} actualizado exitosamente`,
					user: updated,
				},
			});
		} catch (error) {
			console.log("Error al actualizar el estado del usuario", error.message);
			if (error.message.includes("no encontrado")) {
				return response.status(404).json({
					message: "Usuario no encontrado",
				});
			}
			response.status(500).json({
				message: "Error interno del servidor",
			});
		}
	},
};
