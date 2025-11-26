import express from "express";
import SongsRouter from "./routes/songs.router.js";
import UsersRouter from "./routes/users.router.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = express();
server.use(express.json());

// Root route that serves API documentation
server.get("/", (req, res) => {
	const swaggerPath = join(__dirname, "..", "docs", "swagger.json");
	
	if (fs.existsSync(swaggerPath)) {
		const swaggerDoc = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
		
		// Create a simple HTML page that displays the API info and links
		const htmlResponse = `
<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${swaggerDoc.info.title}</title>
	<style>
		body { 
			font-family: Arial, sans-serif; 
			max-width: 800px; 
			margin: 0 auto; 
			padding: 20px;
			background-color: #f5f5f5;
		}
		.container {
			background-color: white;
			padding: 30px;
			border-radius: 8px;
			box-shadow: 0 2px 10px rgba(0,0,0,0.1);
		}
		h1 { color: #333; }
		h2 { color: #666; }
		.endpoint { 
			background-color: #f8f9fa; 
			padding: 10px; 
			margin: 10px 0; 
			border-radius: 4px;
			border-left: 4px solid #007bff;
		}
		.method { 
			color: white; 
			padding: 2px 8px; 
			border-radius: 3px; 
			font-weight: bold;
			margin-right: 10px;
		}
		.get { background-color: #61affe; }
		.post { background-color: #49cc90; }
		.patch { background-color: #fca130; }
		.delete { background-color: #f93e3e; }
		.link {
			display: inline-block;
			margin: 10px 10px 10px 0;
			padding: 10px 20px;
			background-color: #007bff;
			color: white;
			text-decoration: none;
			border-radius: 5px;
			transition: background-color 0.3s;
		}
		.link:hover { background-color: #0056b3; }
		.json-link { background-color: #28a745; }
		.json-link:hover { background-color: #1e7e34; }
	</style>
</head>
<body>
	<div class="container">
		<h1>🎵 ${swaggerDoc.info.title}</h1>
		<p><strong>Descripción:</strong> ${swaggerDoc.info.description}</p>
		<p><strong>Versión:</strong> ${swaggerDoc.info.version}</p>
		
		<h2>📚 Enlaces de Documentación</h2>
		<a href="/docs/swagger.json" class="link json-link">📄 Ver Swagger JSON</a>
		<a href="https://editor.swagger.io/?url=${encodeURIComponent(req.protocol + '://' + req.get('host') + '/docs/swagger.json')}" class="link" target="_blank">🔧 Abrir en Swagger Editor</a>
		
		<h2>🌐 Servidores Disponibles</h2>
		${swaggerDoc.servers.map(server => `
			<div class="endpoint">
				<strong>${server.description}:</strong> <code>${server.url}</code>
			</div>
		`).join('')}
		
		<h2>📋 Principales Endpoints</h2>
		
		<h3>👥 Usuarios</h3>
		<div class="endpoint"><span class="method post">POST</span><code>/api/users/create</code> - Crear usuario</div>
		<div class="endpoint"><span class="method post">POST</span><code>/api/users/login</code> - Iniciar sesión</div>
		<div class="endpoint"><span class="method get">GET</span><code>/api/users/all</code> - Obtener todos los usuarios</div>
		<div class="endpoint"><span class="method get">GET</span><code>/api/users/user/{id}</code> - Obtener usuario por ID</div>
		<div class="endpoint"><span class="method get">GET</span><code>/api/users/export/users</code> - Exportar usuarios a PDF</div>
		<div class="endpoint"><span class="method get">GET</span><code>/api/users/indicators/users</code> - Indicadores de usuarios</div>
		<div class="endpoint"><span class="method patch">PATCH</span><code>/api/users/update</code> - Actualizar usuario</div>
		<div class="endpoint"><span class="method patch">PATCH</span><code>/api/users/status/{id}</code> - Actualizar estado</div>
		<div class="endpoint"><span class="method delete">DELETE</span><code>/api/users/delete/{id}</code> - Eliminar usuario</div>
		
		<h3>🎵 Canciones</h3>
		<div class="endpoint"><span class="method get">GET</span><code>/api/songs/all</code> - Obtener todas las canciones</div>
		<div class="endpoint"><span class="method get">GET</span><code>/api/songs/song/{id}</code> - Obtener canción por ID</div>
		<div class="endpoint"><span class="method get">GET</span><code>/api/songs/report/songs-by-author</code> - Reporte por autor</div>
		<div class="endpoint"><span class="method post">POST</span><code>/api/songs/create</code> - Crear canción</div>
		<div class="endpoint"><span class="method patch">PATCH</span><code>/api/songs/update</code> - Actualizar canción</div>
		<div class="endpoint"><span class="method delete">DELETE</span><code>/api/songs/delete/{id}</code> - Eliminar canción</div>
		
		<h2>🔐 Autenticación</h2>
		<p>La mayoría de endpoints requieren autenticación JWT. Incluye el token en el header:</p>
		<div class="endpoint">
			<code>Authorization: Bearer &lt;tu-jwt-token&gt;</code>
		</div>
		
		<p><small>Desarrollado por: ${swaggerDoc.info.contact?.name || 'Team ORT TP2'}</small></p>
	</div>
</body>
</html>`;
		
		res.send(htmlResponse);
	} else {
		res.status(404).json({
			message: "Documentación no encontrada",
			error: "El archivo swagger.json no existe"
		});
	}
});

// Static route to serve the swagger.json file
server.get("/docs/swagger.json", (req, res) => {
	const swaggerPath = join(__dirname, "..", "docs", "swagger.json");
	
	if (fs.existsSync(swaggerPath)) {
		res.setHeader('Content-Type', 'application/json');
		res.sendFile(swaggerPath);
	} else {
		res.status(404).json({
			message: "Archivo de documentación no encontrado"
		});
	}
});

server.use("/api/songs", SongsRouter);
server.use("/api/users", UsersRouter);

server.use((request, response, next) => {
	response.status(404).send("No está disponible este endpoint: " + request.url);
});

export default server;
