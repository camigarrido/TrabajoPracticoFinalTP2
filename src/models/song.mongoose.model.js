import mongoose from "mongoose";
import { Schema } from "mongoose";

const songSchema = new Schema(
	{
		title: {
			type: String,
			maxlength: 200,
			require: true,
		},
		author: {
			type: String,
			maxlength: 200,
		},
		release_year: {
			type: Number,
			require: true,
		},
		language: {
			type: String,
			maxlength: 100,
			default: "Unknown",
		},
		category: {
			type: String,
			maxlength: 200,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		collection: "songs",
		versionKey: false,
	},
);

// Exporta el modelo de Mongoose
export const SongModel = mongoose.model("Song", songSchema);
