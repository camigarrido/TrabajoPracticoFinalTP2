import SongsRepository from "../repositories/songs.mongoose.repository.js";
import { validate } from "../validators/validator.model.js";
import { validateYear } from "../validators/validator.model.js";

export const SongsController = {
	getAllSongs: async (request, response) => {
		try {
			const songs = await SongsRepository.getAll();
			response.status(200).json({
				message: "OK - Lista de canciones:",
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
		const { title, author, release_year, language, category } = request.body;
		// Obtener todas las canciones y verificar si ya existe una con el mismo título
		const allSongs = await SongsRepository.getAll();
		const existingSong = allSongs.find((song) => song.title === title);

		if (existingSong) {
			return response.status(409).json({
				message: `La canción con el título "${title}" ya existe.`,
			});
		}

		try {
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
				return response.status(422).json({
					message: "Completar los campos correctamente",
					errors: {
						title: validacionTitle.message,
						author: validacionAuthor.message,
						release_year: validacionYear.message,
						category: validacionCategory.message,
					},
				});
			}

			console.log("Usuario autenticado:", request.user);

			// Crear la canción con el usuario autenticado como creador
			const newSong = await SongsRepository.createSong({
				title,
				author: author,
				release_year: release_year,
				language: language,
				category: category,
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
			console.error("Error al crear la canción:", error);

			// Manejo de errores específicos
			if (error.name === "ValidationError") {
				return response.status(400).json({
					ok: false,
					error: "Error de validación",
					message: error.message,
				});
			}

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

			if (
				!validacionTitle ||
				!validacionAuthor ||
				!validacionYear ||
				!validacionCategory
			) {
				return response
					.status(404)
					.json({ message: "Completar los campos correctamente" });
			}

			const song = await SongsRepository.getSongById(id);
			if (!song) {
				response.status(404).json({
					message: "Canción no encontrada",
				});
				return;
			}

			if (
				song.createdBy.toString() !== request.user.id &&
				request.user.role !== "admin"
			) {
				response.status(403).json({
					message: "No tienes permisos para actualizar esta canción",
				});
				return;
			}

			const updatedSong = await SongsRepository.updateSong(id, {
				title,
				artist: author,
				year: release_year,
				genre: category,
				duration: song.duration,
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

			if (!songs || songs.length === 0) {
				return response.status(404).json({
					ok: false, // Estandarizamos respuesta
					message: "No hay canciones disponibles.",
				});
			}

			const report = songs.reduce((acc, song) => {
				if (!song.author) return acc;

				const authorName = song.author.trim();
				const categoryName = song.category
					? song.category.trim()
					: "Sin Categoría";
				const year = song.release_year;

				if (!acc[authorName]) {
					acc[authorName] = {
						totalSongs: 0,
						releaseYears: [],
						categories: {},
					};
				}

				// Lógica de acumuladores
				acc[authorName].totalSongs += 1;

				// Solo agregamos años válidos
				if (year && !isNaN(year)) {
					acc[authorName].releaseYears.push(year);
				}

				acc[authorName].categories[categoryName] =
					(acc[authorName].categories[categoryName] || 0) + 1;

				return acc;
			}, {});

			// Cálculos finales (Promedios y Máximos)
			Object.keys(report).forEach((authorKey) => {
				const data = report[authorKey];

				// Promedio
				if (data.releaseYears.length > 0) {
					const total = data.releaseYears.reduce((a, b) => a + b, 0);
					data.averageReleaseYear = Math.floor(
						total / data.releaseYears.length,
					);
				} else {
					data.averageReleaseYear = null;
				}

				// Categoría Top
				const catKeys = Object.keys(data.categories);
				if (catKeys.length > 0) {
					data.mostFrequentCategory = catKeys.reduce((a, b) =>
						data.categories[a] > data.categories[b] ? a : b,
					);
				} else {
					data.mostFrequentCategory = "N/A";
				}
			});

			response.status(200).json({
				ok: true,
				reporte: report,
			});
		} catch (error) {
			console.error("Error reporte:", error);
			response.status(500).json({
				ok: false,
				message: "Error interno del servidor",
			});
		}
	},
};
