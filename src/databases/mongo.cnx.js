import mongoose from "mongoose";
import { config } from "../config/config.js";

class MongooseConnection {
	constructor() {
		this.connection = null;
	}

	async connect() {
		if (this.connection) {
			return this.connection;
		}
		try {
			// Improved connection options for production and Vercel
			const options = {
				dbName: "ort-database",
				// Connection pool settings for better performance
				maxPoolSize: 10,
				minPoolSize: 1,
				// Timeout settings
				serverSelectionTimeoutMS: 5000,
				socketTimeoutMS: 45000,
				// Useful for serverless functions like Vercel
				bufferCommands: false,
			};

			await mongoose.connect(config.MONGODB_URI, options);
			this.connection = mongoose.connection;
			console.log("✅ Mongoose connected successfully");
			return this.connection;
		} catch (err) {
			console.error("❌ Error connecting to Mongoose:", err.message);
			console.error("Full error:", err);
			throw err;
		}
	}
}

const mongooseConnectionInstance = new MongooseConnection();

export default mongooseConnectionInstance;
