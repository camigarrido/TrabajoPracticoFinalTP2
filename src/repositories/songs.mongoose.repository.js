import { SongModel } from "../models/song.mongoose.model.js";

class SongsRepository {
	constructor(songsModel = SongModel) {
		this.SongsModel = songsModel;
	}

	async getAll() {
		try {
			return await this.SongsModel.find({});
		} catch (error) {
			throw new Error("Error al obtener las canciones: " + error.message);
		}
	}

	async getSongById(id) {
		try {
			const song = await this.SongsModel.findById(id);
			if (!song) {
				throw new Error(`Cancion con id ${id} no encontrada`);
			}
			return song; // Added missing return
		} catch (error) {
			console.error("Error al obtener la cancion:", error);
			throw new Error("Error al obtener la cancion: " + error.message);
		}
	}

	async getSongById(id) {
		try {
			const song = await this.SongsModel.findById(id);
			if (!song) {
				throw new Error(`Cancion con id ${id} no encontrada`);
			}
			return song;
		} catch (error) {
			console.error("Error al obtener la cancion:", error);
			throw new Error("Error al obtener la cancion: " + error.message);
		}
	}

	async createSong(title, author) {
		try {
			const existingSong = await this.SongsModel.create({ title, author });
			return existingSong;
		} catch (error) {
			console.error("Error al crear la cancion:", error);
			throw new Error("Error al crear la cancion: " + error.message);
		}
	}

	async updateSong(id, { title, author }) {
		try {
			const updatedSong = await this.SongsModel.findByIdAndUpdate(
				id,
				{ title, author },
				{ new: true },
			);
			if (!updatedSong) {
				throw new Error(`Cancion con id ${id} no encontrada para actualizar`);
			}
			return updatedSong;
		} catch (error) {
			console.error("Error al actualizar la cancion:", error);
			throw new Error("Error al actualizar la cancion: " + error.message);
		}
	}

	async deleteSong(id) {
		try {
			const deletedSong = await this.SongsModel.findByIdAndDelete(id);
			if (!deletedSong) {
				throw new Error(`Cancion con id ${id} no encontrada para eliminar`);
			}
			return deletedSong;
		} catch (error) {
			console.error("Error al eliminar la cancion:", error);
			throw new Error("Error al eliminar la cancion: " + error.message);
		}
	}
}

export default new SongsRepository();
