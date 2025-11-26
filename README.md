# 🎵 Trabajo Práctico Final - Gestión de Canciones

API RESTful desarrollada con **Node.js, Express y MongoDB** para la gestión de un catálogo musical. El sistema permite la administración de usuarios y canciones, implementando autenticación segura mediante JWT y control de acceso basado en roles.

## 🚀 Características

* **🔐 Autenticación y Seguridad:** Implementación de JWT (JSON Web Tokens) para rutas protegidas y hash de contraseñas con Bcrypt.
* **🎶 Gestión de Canciones:** CRUD completo (Crear, Leer, Actualizar, Eliminar).
* **👥 Roles de Usuario:**
    * **Admin:** Acceso total y gestión de usuarios.
    * **User:** Gestión de sus propias creaciones y lectura del catálogo.
* **📊 Reportes:** Generación de estadísticas avanzadas (ej. canciones por autor).
* **✅ Validaciones:** Control de datos de entrada para asegurar la integridad de la base de datos.

---

## 📋 Requisitos Previos

* **Node.js**: v14.x o superior.
* **MongoDB**: Instancia local corriendo o conexión a MongoDB Atlas.
* **Cliente API**: Insomnia o Postman (para pruebas manuales).

---

## 🛠️ Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/tu-repositorio.git](https://github.com/tu-usuario/tu-repositorio.git)
    cd tu-repositorio
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
    ```env
    PORT=3004
    MONGO_URI=mongodb://localhost:27017/inmonia_db
    JWT_SECRET=tu_clave_secreta_super_segura
    ```

4.  **Iniciar el servidor:**
    ```bash
    npm run dev
    ```


## 📡 Documentación de la API

### 👤 Usuarios (Auth)

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/register` | Registrar un nuevo usuario | Público |
| `POST` | `/api/users/login` | Iniciar sesión (retorna Token) | Público |
| `GET` | `/api/users/all` | Listar todos los usuarios | Admin |

### 🎵 Canciones

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/songs/all` | Listar todas las canciones | Auth |
| `POST` | `/api/songs/create` | Crear una nueva canción | Auth |
| `GET` | `/api/songs/song/:id` | Obtener una canción por ID | Auth |
| `PATCH` | `/api/songs/update` | Actualizar una canción | Owner/Admin |
| `DELETE` | `/api/songs/delete/:id` | Eliminar una canción | Owner/Admin |

### 📈 Reportes

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/songs/report/songs-by-author` | Estadísticas agrupadas por autor | Auth |

---

## 📝 Ejemplo de Uso

**Crear una Canción**

* **URL:** `POST /api/songs/create`
* **Headers:**
    * `Authorization`: `Bearer <tu_token_jwt>`
    * `Content-Type`: `application/json`

**Body (JSON):**
```json
{
  "title": "Bohemian Rhapsody",
  "author": "Queen",
  "release_year": 1975,
  "language": "English",
  "category": "Rock"
}

**Respuesta Exitosa (201 Created)**
{
  "ok": true,
  "payload": {
    "message": "La canción: Bohemian Rhapsody fue creada exitosamente",
    "song": {
      "id": "64a7f8c2b5e4f2a5d8c9e123",
      "title": "Bohemian Rhapsody",
      "author": "Queen",
      "release_year": 1975,
      "category": "Rock",
      "createdAt": "2024-11-26T10:00:00.000Z"
    }
  }
}