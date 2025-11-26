import express from "express";
import { UsersController } from "../controllers/users.controller.js";
import { authenticateToken, requireAdmin, requireOwnerOrAdmin } from "../middleware/authentication.js";

const UsersRouter = express.Router();

// Public routes (no authentication required)
UsersRouter.post("/create", UsersController.createByJson);
UsersRouter.post("/login", UsersController.login);

// Protected routes (require authentication)
UsersRouter.get("/all", authenticateToken, UsersController.getAllUsers);
UsersRouter.get("/user/:id", authenticateToken, UsersController.getById);

// alta complejidad
UsersRouter.get("/export/users", authenticateToken, UsersController.exportUsers);
UsersRouter.get("/indicators/users", authenticateToken, UsersController.getUserIndicators);

// Admin only routes
UsersRouter.patch("/status/:id", authenticateToken, requireAdmin, UsersController.updateStatus);

// Owner or Admin routes (user can delete their own account, admin can delete any)
UsersRouter.delete("/delete/:id", authenticateToken, requireOwnerOrAdmin, UsersController.deleteById);

// Owner or Admin routes (user can modify their own data, admin can modify any)
UsersRouter.patch("/update", authenticateToken, requireOwnerOrAdmin, UsersController.updateByJson);

export default UsersRouter;
