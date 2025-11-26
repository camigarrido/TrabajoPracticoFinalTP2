import UsersRepository from "../repositories/users.mongoose.repository.js";
import bcrypt from "bcrypt";
import { signToken } from "../auth/index.js";
import { validateEmail } from "../validators/validator.model.js";
import { validate } from "../validators/validator.model.js";
import PDFDocument from "pdfkit";

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

			const validEmail = validateEmail(email);
			const validName = validate(name);
			const validPassword = validate(password);

			if (!validName || !validEmail || !validPassword) {
				return response.status(422).json({
					message: "completar los datos correctamente",
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

			const validateEmail = validateEmail(email);
			const validatePassword = validate(password);

			if (!validateEmail || !validatePassword) {
				return response.status(422).json({
					message: "Faltan datos obligatorios: email y password",
				});
			}
			const user = await UsersRepository.getUserByEmail(email);
			if (!user) {
				return response.status(401).json({
					message: "Credenciales inválidas",
				});
			}

			if (!user.isActive) {
				return response.status(401).json({
					message: "Usuario inactivo",
				});
			}

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
				const validEmail = validateEmail(email);
				if (!validEmail) {
					return response.status(422).json({
						message: "Formato de email inválido.",
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

	/* 
	Caso de Uso: Indicadores de Usuarios
	Calcula:
	Promedio de edad de los usuarios.
	Distribución de roles (porcentaje de administradores vs usuarios normales).
	Usuarios más jóvenes y más viejos. */
	async getUserIndicators(request, response) {
		try {
			const users = await UsersRepository.getAll();
			const totalUsers = users.length;
			const totalAge = users.reduce((sum, user) => sum + user.age, 0);
			const roleDistribution = users.reduce((acc, user) => {
				acc[user.role] = (acc[user.role] || 0) + 1;
				return acc;
			}, {});

			const youngestUser = users.reduce((youngest, user) =>
				user.age < youngest.age ? user : youngest,
			);
			const oldestUser = users.reduce((oldest, user) =>
				user.age > oldest.age ? user : oldest,
			);

			response.status(200).json({
				"total de usuarios": totalUsers,
				"promedio de edad": totalAge / totalUsers,
				"distribución de roles": roleDistribution,
				"Usuario mas joven": youngestUser,
				"Usuario mas grande": oldestUser,
			});
		} catch (error) {
			console.error("Error al calcular indicadores:", error.message);
			response.status(500).json({ message: "Error interno del servidor" });
		}
	},

	/* Exportar Usuarios
	Permite a los administradores exportar la lista de usuarios en formato PDF. */
	exportUsers: async (request, response) => {
		try {
			const users = await UsersRepository.getAll();

			response.setHeader("Content-Type", "application/pdf");
			response.setHeader(
				"Content-Disposition",
				'attachment; filename="usuarios.pdf"',
			);

			const doc = new PDFDocument();
			doc.pipe(response); // Conecta el documento PDF al stream de respuesta HTTP

			doc
				.fontSize(25)
				.text("Reporte de Usuarios Registrados", { align: "center" });
			doc.moveDown(1.5);

			if (users && users.length > 0) {
				doc.fontSize(12).font("Helvetica-Bold");
				doc.text("Nombre", 50, doc.y, { width: 150, continued: true });
				doc.text("Email", 200, doc.y, { width: 150, continued: true });
				doc.text("Edad", 350, doc.y, { width: 50, continued: true });
				doc.text("Rol", 450, doc.y, { width: 100 });
				doc
					.lineWidth(1)
					.strokeOpacity(0.5)
					.moveTo(50, doc.y)
					.lineTo(550, doc.y)
					.stroke();
				doc.moveDown(0.2);

				doc.fontSize(10).font("Helvetica");
				users.forEach((user) => {
					doc.text(user.name, 50, doc.y, { width: 150, continued: true });
					doc.text(user.email, 200, doc.y, { width: 150, continued: true });
					doc.text(user.age.toString(), 350, doc.y, {
						width: 50,
						continued: true,
					});
					doc.text(user.role, 450, doc.y, { width: 100 });
					doc.moveDown(0.2);
				});
			} else {
				doc.fontSize(12).text("No hay usuarios registrados.");
			}
			doc.end();
		} catch (error) {
			console.error("Error al exportar usuarios a PDF:", error.message);
			response
				.status(500)
				.json({ message: "Error interno del servidor al generar el PDF" });
		}
	},
};
