import { UserModel } from "../models/user.mongoose.model.js";

class UsersRepository {
	constructor(usersModel = UserModel) {
		this.UsersModel = usersModel;
	}

	async getAll() {
		try {
			return await this.UsersModel.find({}).select("-password");
		} catch (error) {
			throw new Error("Error al obtener los usuarios: " + error.message);
		}
	}

	async getUserById(id) {
		try {
			const user = await this.UsersModel.findById(id).select("-password");
			return user;
		} catch (error) {
			console.error("Error al obtener el usuario:", error);
			throw new Error("Error al obtener el usuario: " + error.message);
		}
	}

	async getUserByEmail(email) {
		try {
			const user = await this.UsersModel.findOne({ email });
			return user;
		} catch (error) {
			console.error("Error al obtener el usuario por email:", error);
			throw new Error(
				"Error al obtener el usuario por email: " + error.message,
			);
		}
	}

	async createUser(userData) {
		try {
			const newUser = await this.UsersModel.create(userData);
			// Devolver el usuario sin la contraseña
			const userResponse = newUser.toObject();
			delete userResponse.password;
			return userResponse;
		} catch (error) {
			console.error("Error al crear el usuario:", error);
			if (error.code === 11000) {
				throw new Error("El email ya está registrado");
			}
			throw new Error("Error al crear el usuario: " + error.message);
		}
	}

	async updateUser(id, updateData) {
		try {
			const updatedUser = await this.UsersModel.findByIdAndUpdate(
				id,
				updateData,
				{ new: true, runValidators: true },
			).select("-password");

			if (!updatedUser) {
				throw new Error(`Usuario con id ${id} no encontrado para actualizar`);
			}
			return updatedUser;
		} catch (error) {
			console.error("Error al actualizar el usuario:", error);
			if (error.code === 11000) {
				throw new Error("El email ya está registrado");
			}
			throw new Error("Error al actualizar el usuario: " + error.message);
		}
	}

	async deleteUser(id) {
		try {
			const deletedUser = await this.UsersModel.findByIdAndDelete(id);
			if (!deletedUser) {
				throw new Error(`Usuario con id ${id} no encontrado para eliminar`);
			}
			return deletedUser;
		} catch (error) {
			console.error("Error al eliminar el usuario:", error);
			throw new Error("Error al eliminar el usuario: " + error.message);
		}
	}

	async updateUserStatus(id, isActive) {
		try {
			const updatedUser = await this.UsersModel.findByIdAndUpdate(
				id,
				{ isActive },
				{ new: true },
			).select("-password");

			if (!updatedUser) {
				throw new Error(`Usuario con id ${id} no encontrado`);
			}
			return updatedUser;
		} catch (error) {
			console.error("Error al actualizar el estado del usuario:", error);
			throw new Error(
				"Error al actualizar el estado del usuario: " + error.message,
			);
		}
	}
}

export default new UsersRepository();
