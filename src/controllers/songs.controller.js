import SongsRepository from "../repositories/songs.mongoose.repository.js";
import { validate } from "../validators/validators.model.js";

export const SongsController = {
	getAllSongs: async (request, response) => {
		try {
			const songs = await SongsRepository.getAll();
			response.status(200).json({
				message: "OK",
				payload: songs,
			});
		} catch (error) {
			console.log("Error al obtener las canciones", error.message);
			response.status(500).json({
				message: "Error interno del servidor",
			});
		}
	},

	getById: async (request, response) => {
		try {
			const { id } = request.params;
			const song = await SongsRepository.getSongById(id);
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
			console.log("Error al obtener la cancion", error.message);
			response.status(500).json({
				message: "Error interno del servidor",
			});
		}
	},
	deleteById: async (request, response) => {
		try {
			const { id } = request.params;
			const song = await SongsRepository.getSongById(id);
			console.log(song);
			if (!song) {
				response.status(422).json({ error: "La cancion no existe" });
				return;
			}
			await SongsRepository.deleteSong(id);
			response.json({
				code: 200,
				ok: true,
				payload: {
					message: `La cancion :${song.title} ha sido borrada con exito`,
				},
			});
		} catch (error) {
			console.log("Error al borrar la cancion", error.message);
			response.status(500).json({
				message: "Error interno del servidor",
			});
		}
	},
	createByJson: async (request, response) => {
		try {
			const { title, author, release_year, category } = request.body; // Removed language, added album if needed

			// Validación de datos obligatorios (updated to match model)
			if (!title || !release_year) {
			const { title, author } = request.body;

			const validacionTitle = validate(title);
			const validacionAuthor = validate(author);

			if (!validacionTitle.valid || !validacionAuthor.valid) {
				response.status(422).json({
					message: "Faltan datos obligatorios: title y year",
					message: "Faltan datos obligatorios: title y author",
					errors: {
						title: validacionTitle.message,
						author: validacionAuthor.message,
					},
				});
				return;
			}

			// Crear la canción con el usuario autenticado como creador
			const newSong = await SongsRepository.createSong({
				title,
				artist: author, // Map author to artist
				year: release_year, // Map release_year to year
				genre: category, // Map category to genre
				duration: 0, // Default duration, adjust as needed
				createdBy: request.user.id, // Usuario autenticado como creador
			});

			const newSong = await SongsRepository.createSong(title, author);

			response.status(201).json({
				ok: true,
				payload: {
					message: `La canción: ${newSong.title} fue creada exitosamente`,
					song: newSong,
				},
			});
		} catch (error) {
			console.error("Error al crear la canción:", error);
			response.status(500).json({
				ok: false,
				error: "Error interno del servidor",
				message: error.message,
			});
		}
	},

	updateByJson: async (request, response) => {
		try {
			const { id, title, author, release_year, category } = request.body;

			// Validación básica
			const { id, title, author } = request.body;
			if (!id) {
				response.status(422).json({
					message: "El id es obligatorio para actualizar la cancion",
				});
				return;
			}

			// Verificar que la canción existe y pertenece al usuario
			const song = await SongsRepository.getById(id);
			if (!song) {
				response.status(404).json({
					message: "Canción no encontrada",
				});
				return;
			}

			// Solo el propietario o admin puede actualizar
			if (song.createdBy.toString() !== request.user.id && request.user.role !== "admin") {
				response.status(403).json({
					message: "No tienes permisos para actualizar esta canción",
				});
				return;
			}

			// Actualizar la canción
			const updatedSong = await SongsRepository.updateSong(id, {
				title,
				artist: author, // Map author to artist
				year: release_year, // Map release_year to year
				genre: category, // Map category to genre
				duration: song.duration, // Keep existing duration or update if provided
			});

			const updated = await SongsRepository.updateSong(id, { title, author });
			response.status(200).json({
				ok: true,
				payload: {
					message: `La canción: ${updatedSong.title} fue actualizada exitosamente`,
					song: updatedSong,
				},
			});
		} catch (error) {
			console.error("Error al actualizar la canción:", error);
			response.status(500).json({
				ok: false,
				error: "Error interno del servidor",
				message: error.message,
			});
		}
	},
};
