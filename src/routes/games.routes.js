// src/routes/games.routes.js
const express = require("express");
const router = express.Router();
const gamesController = require("../controllers/games.controller");

// GET /api/games  → todos los juegos
router.get("/", gamesController.getGames);

// GET /api/games/:id  → un juego por id
router.get("/:id", gamesController.getGame);

module.exports = router;
