import express from "express";
import { SongsController } from "../controllers/songs.controller.js";
import {
	authenticateToken,
	requireSongOwner,
	requireSongOwnerOrAdmin,
} from "../middleware/authentication.js";

const SongsRouter = express.Router();

SongsRouter.get("/all", authenticateToken, SongsController.getAllSongs);
SongsRouter.get("/song/:id", authenticateToken, SongsController.getById);

SongsRouter.get(
	"/report/songs-by-author",
	authenticateToken,
	SongsController.getSongsReportByAuthor,
);

SongsRouter.post("/create", authenticateToken, SongsController.createByJson);

SongsRouter.patch(
	"/update",
	authenticateToken,
	requireSongOwner,
	SongsController.updateByJson,
);

SongsRouter.delete(
	"/delete/:id",
	authenticateToken,
	requireSongOwnerOrAdmin,
	SongsController.deleteById,
);

export default SongsRouter;
