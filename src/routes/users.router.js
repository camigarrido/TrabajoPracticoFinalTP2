import express from "express";
import { UsersController } from "../controllers/users.controller.js";
import {
	authenticateToken,
	requireAdmin,
	requireOwnerOrAdmin,
} from "../middleware/authentication.js";

const UsersRouter = express.Router();

UsersRouter.post("/create", UsersController.createByJson);
UsersRouter.post("/login", UsersController.login);

UsersRouter.get("/all", authenticateToken, UsersController.getAllUsers);
UsersRouter.get("/user/:id", authenticateToken, UsersController.getById);

UsersRouter.get(
	"/export/users",
	authenticateToken,
	UsersController.exportUsers,
);
UsersRouter.get(
	"/indicators/users",
	authenticateToken,
	UsersController.getUserIndicators,
);

UsersRouter.patch(
	"/status/:id",
	authenticateToken,
	requireAdmin,
	UsersController.updateStatus,
);

UsersRouter.delete(
	"/delete/:id",
	authenticateToken,
	requireOwnerOrAdmin,
	UsersController.deleteById,
);

UsersRouter.patch(
	"/update",
	authenticateToken,
	requireOwnerOrAdmin,
	UsersController.updateByJson,
);

export default UsersRouter;
