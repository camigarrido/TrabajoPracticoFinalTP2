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
			const { title, author } = request.body;

			const validacionTitle = validate(title);
			const validacionAuthor = validate(author);

			if (!validacionTitle.valid || !validacionAuthor.valid) {
				response.status(422).json({
					message: "Faltan datos obligatorios: title y author",
					errors: {
						title: validacionTitle.message,
						author: validacionAuthor.message,
					},
				});
				return;
			}

			const newSong = await SongsRepository.createSong(title, author);

			response.status(201).json({
				ok: true,
				payload: {
					message: `La cancion: ${newSong.title} fue creada exitosamente`,
					song: newSong,
				},
			});
		} catch (error) {
			console.log("Error al crear la cancion", error.message);
			response.status(500).json({
				message: "Error interno del servidor",
			});
		}
	},

	updateByJson: async (request, response) => {
		try {
			const { id, title, author } = request.body;
			if (!id) {
				response.status(422).json({
					message: "El id es obligatorio para actualizar la cancion",
				});
				return;
			}

			const updated = await SongsRepository.updateSong(id, { title, author });
			response.status(200).json({
				ok: true,
				payload: {
					message: `La cancion: ${updated.title} fue actualizada exitosamente`,
					song: updated,
				},
			});
		} catch (error) {
			console.log("Error al actualizar la cancion", error.message);
			response.status(500).json({
				message: "Error interno del servidor",
			});
		}
	},
};
