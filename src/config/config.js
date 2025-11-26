import dotenv from "dotenv";

dotenv.config();

const { MONGODB_URI, SERVER_PORT, SERVER_HOST, JWT_SECRET } = process.env;

// Validate required environment variables
const requiredEnvVars = {
	MONGODB_URI,
	JWT_SECRET,
};

const missingVars = Object.entries(requiredEnvVars)
	.filter(([key, value]) => !value)
	.map(([key]) => key);

if (missingVars.length > 0) {
	console.error(
		`❌ Missing required environment variables: ${missingVars.join(", ")}`,
	);
	console.error(
		"Please check your .env file and ensure all required variables are set.",
	);
	process.exit(1);
}

export const config = {
	MONGODB_URI,
	SERVER_PORT: SERVER_PORT || 3000,
	SERVER_HOST: SERVER_HOST || "0.0.0.0",
	JWT_SECRET,
};
