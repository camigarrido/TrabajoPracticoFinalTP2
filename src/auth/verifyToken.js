import { authenticateToken } from "./index.js";

export function verifyToken(req, res, next) {
	return authenticateToken(req, res, next);
}

export * from "./index.js";
