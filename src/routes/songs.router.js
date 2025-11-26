import express from "express";
import { SongsController } from "../controllers/songs.controller.js";
import { authenticateToken, requireSongOwner, requireSongOwnerOrAdmin } from "../middleware/authentication.js";

const SongsRouter = express.Router();

// Protected routes - authenticated users can read songs
SongsRouter.get("/all", authenticateToken, SongsController.getAllSongs);
SongsRouter.get("/song/:id", authenticateToken, SongsController.getById);

//alta complejidad
SongsRouter.get("/report/songs-by-author", authenticateToken, SongsController.getSongsReportByAuthor);

// Authenticated users can create songs
SongsRouter.post("/create", authenticateToken, SongsController.createByJson);

// Only song owner can update their songs
SongsRouter.patch("/update", authenticateToken, requireSongOwner, SongsController.updateByJson);

// Song owner or admin can delete songs
SongsRouter.delete("/delete/:id", authenticateToken, requireSongOwnerOrAdmin, SongsController.deleteById);

export default SongsRouter;
