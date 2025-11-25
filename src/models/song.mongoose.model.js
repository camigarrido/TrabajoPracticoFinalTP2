import mongoose from "mongoose";
import { Schema } from "mongoose";

const songSchema = new Schema(
	{
		title: {
			type: String, // nombre de la canción
			maxlength: 200,
			require: true,
		},
		author: {
			type: String, // autor o artista
			maxlength: 200,
		},
		release_year: {
			type: Number, // año de lanzamiento
			require: true,
		},
		language: {
			type: String, // idioma
			maxlength: 100,
			default: "Unknown",
		},
		category: {
			type: String, // género/categoría
			maxlength: 200,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true, // cada canción debe tener un creador
		},
	},
	{
		collection: "songs", // nombre de la colección
		versionKey: false,
	},
);

// Exporta el modelo de Mongoose
export const SongModel = mongoose.model("Song", songSchema);
