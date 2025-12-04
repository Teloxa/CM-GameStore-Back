// src/controllers/games.controller.js
const Games = require("../models/Games");

async function getGames(req, res) {
  try {
    const games = await Games.getAllGames();
    res.json(games);
  } catch (error) {
    console.error("Error obteniendo juegos:", error);
    res.status(500).json({ message: "Error obteniendo juegos" });
  }
}

async function getGame(req, res) {
  try {
    const { id } = req.params;
    const game = await Games.getGameById(id);

    if (!game) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }

    res.json(game);
  } catch (error) {
    console.error("Error obteniendo juego:", error);
    res.status(500).json({ message: "Error obteniendo juego" });
  }
}

module.exports = {
  getGames,
  getGame,
};
