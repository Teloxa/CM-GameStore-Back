const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const favoritesController = require("../controllers/favorites.controller");

// Auth
router.post("/register", userController.register);
router.post("/login", userController.login);

// Favoritos
// GET /api/users/:userId/favorites
router.get("/:userId/favorites", favoritesController.getFavorites);

// POST /api/users/:userId/favorites
router.post("/:userId/favorites", favoritesController.addFavorite);

// DELETE
router.delete("/:userId/favorites/:gameId", favoritesController.removeFavorite);


module.exports = router;
