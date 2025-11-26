import SongsRepository from "../repositories/songs.mongoose.repository.js";
import { validate } from "../validators/validator.model.js";


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
				response.status(404).json({ error: "La cancion no existe" });
				return;
			}
			await SongsRepository.deleteSong(id);
			response.json({
				code: 200,
				ok: true,
				payload: {
					message: `La cancion :${song.name} ha sido borrada con exito`,
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

			const validacionTitle = validate(title);
			const validacionAuthor = validate(author);
			const validacionYear = validateYear(release_year);
			const validacionCategory = validate(category);
			
			if (!validacionTitle || !validacionAuthor || !validacionYear || !validacionCategory) {
				return response.status(404).json({ message: "Completar los campos correctamente" });
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
			if (!id) {
				response.status(422).json({
					message: "El id es obligatorio para actualizar la cancion",
				});
				return;
			}
			const validacionTitle = validate(title);
			const validacionAuthor = validate(author);
			const validacionYear = validateYear(release_year);
			const validacionCategory = validate(category);
			
			if (!validacionTitle || !validacionAuthor || !validacionYear || !validacionCategory) {
				return response.status(404).json({ message: "Completar los campos correctamente" });
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

/* 	Caso de Uso: Reporte de Canciones por Autor
	Generar un reporte que agrupe las canciones por autor y calcule estadísticas:
	-Número total de canciones por autor.
	-Años de lanzamiento promedio.
	-Categorías más frecuentes. */
	getSongsReportByAuthor: async (request, response) => {
		try {
			const songs = await SongsRepository.getAll();
			if (songs.length === 0) {
				return response.status(404).json({ message: "No hay canciones disponibles para generar el reporte." });
			}
			const report = songs.reduce((acc, song) => {
				if (!acc[song.author]) {
					acc[song.author] = {
						totalSongs: 0,
						releaseYears: [],
						categories: {},
					};
				}
				acc[song.author].totalSongs += 1;
				acc[song.author].releaseYears.push(song.release_year);
				acc[song.author].categories[song.category] = (acc[song.author].categories[song.category] || 0) + 1;
				return acc;
			}, {});

			console.log(report);
	
			// Calcular estadísticas adicionales
			Object.keys(report).forEach((author) => {
				const data = report[author];
				data.averageReleaseYear = data.releaseYears.reduce((a, b) => a + b, 0) / data.releaseYears.length;
				data.mostFrequentCategory = Object.keys(data.categories).reduce((a, b) =>
					data.categories[a] > data.categories[b] ? a : b
				);
			});
	
			response.status(200).json({ report });
		} catch (error) {
			console.error("Error al generar el reporte:", error.message);
			response.status(500).json({ message: "Error interno del servidor" });
		}
	},
};