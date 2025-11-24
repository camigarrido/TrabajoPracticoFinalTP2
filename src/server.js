import express from "express"
import SongsRouter from "./routes/songs.router.js"

const server = express()
server.use(express.json()) 

server.use("/api/songs", SongsRouter)


server.use((request,response,next) => {
    response.status(404).send('No está disponible este endpoint: ' + request.url);
})    

export default server
