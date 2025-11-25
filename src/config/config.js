import dotenv from "dotenv";

dotenv.config();

const { MONGO_URI, SERVER_PORT, SERVER_HOST, JWT_SECRET } = process.env;

export const config = {
	MONGO_URI,
	SERVER_PORT,
	SERVER_HOST,
	JWT_SECRET,
};
