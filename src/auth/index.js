import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

/**
 * Generates a JWT token for a user
 * @param {Object} payload - User data to include in the token
 * @param {string} payload.id - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.role - User role
 * @returns {string} JWT token
 */
export function signToken(payload) {
	if (!config.JWT_SECRET) {
		throw new Error("JWT_SECRET is not configured");
	}

	return jwt.sign(payload, config.JWT_SECRET, {
		expiresIn: "24h",
	});
}

/**
 * Verifies and decodes a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export function verifyToken(token) {
	if (!config.JWT_SECRET) {
		throw new Error("JWT_SECRET is not configured");
	}

	try {
		return jwt.verify(token, config.JWT_SECRET);
	} catch (error) {
		throw new Error("Invalid token");
	}
}
