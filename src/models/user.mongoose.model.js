import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema(
	{
		name: {
			type: String,
			maxlength: 100,
			required: true,
		},
		email: {
			type: String,
			maxlength: 200,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		age: {
			type: Number,
			min: 13,
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		collection: "users",
		versionKey: false,
		timestamps: true,
	},
);

export const UserModel = mongoose.model("User", userSchema);
