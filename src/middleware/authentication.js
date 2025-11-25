import { verifyToken } from '../auth/index.js';

/**
 * Express middleware to authenticate requests using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.header("Authorization") || "";
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token not provided",
      error: "Authentication required"
    });
  }

  try {
    const payload = verifyToken(token);
    req.user = payload; // Attach user data to request
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Token not valid",
      error: error.message
    });
  }
}

/**
 * Express middleware to check if user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
      error: "User not authenticated"
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: "Admin access required",
      error: "Insufficient permissions"
    });
  }

  next();
}

/**
 * Express middleware to check if user is the owner or admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function requireOwnerOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
      error: "User not authenticated"
    });
  }

  const resourceId = req.params.id || req.params.userId;
  const isOwner = req.user.id === resourceId;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      message: "Access denied",
      error: "You can only access your own resources"
    });
  }

  next();
}

/**
 * Express middleware to check if user is the owner only (not admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function requireOwnerOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
      error: "User not authenticated"
    });
  }

  const resourceId = req.params.id || req.params.songId;
  const isOwner = req.user.id === resourceId;

  if (!isOwner) {
    return res.status(403).json({
      message: "Access denied",
      error: "You can only modify your own resources"
    });
  }

  next();
}

/**
 * Express middleware to check if user is the owner of a song (for PATCH operations)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export async function requireSongOwner(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
      error: "User not authenticated"
    });
  }

  try {
    // Import SongModel here to avoid circular dependencies
    const { SongModel } = await import('../models/song.mongoose.model.js');
    
    const songId = req.params.id || req.body.id;
    const song = await SongModel.findById(songId);
    
    if (!song) {
      return res.status(404).json({
        message: "Song not found",
        error: "The requested song does not exist"
      });
    }

    const isOwner = song.createdBy.toString() === req.user.id;

    if (!isOwner) {
      return res.status(403).json({
        message: "Access denied",
        error: "You can only modify your own songs"
      });
    }

    // Attach song to request for use in controller
    req.song = song;
    next();
  } catch (error) {
    console.error("Error checking song ownership:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: "Failed to verify song ownership"
    });
  }
}

/**
 * Express middleware to check if user is the owner of a song or admin (for DELETE operations)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export async function requireSongOwnerOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
      error: "User not authenticated"
    });
  }

  try {
    // Import SongModel here to avoid circular dependencies
    const { SongModel } = await import('../models/song.mongoose.model.js');
    
    const songId = req.params.id;
    const song = await SongModel.findById(songId);
    
    if (!song) {
      return res.status(404).json({
        message: "Song not found",
        error: "The requested song does not exist"
      });
    }

    const isOwner = song.createdBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Access denied",
        error: "You can only delete your own songs or be an admin"
      });
    }

    // Attach song to request for use in controller
    req.song = song;
    next();
  } catch (error) {
    console.error("Error checking song ownership:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: "Failed to verify song ownership"
    });
  }
}

