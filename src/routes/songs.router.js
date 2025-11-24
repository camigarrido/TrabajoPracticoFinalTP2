import express from "express"
import { SongsController } from "../controllers/songs.controller.js";
const SongsRouter = express.Router()

SongsRouter.get("/all", SongsController.getAllSongs)

//CRUD
SongsRouter.get("/song/:id", SongsController.getById)
SongsRouter.delete("/delete/:id", SongsController.deleteById)
SongsRouter.post("/create", SongsController.createByJson)
SongsRouter.patch("/update", SongsController.updateByJson)

export default SongsRouter

