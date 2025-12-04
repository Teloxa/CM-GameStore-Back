const { db } = require("../config/db");

const COLLECTION_NAME = "Videojuegos";

async function getAllGames() {
  const snapshot = await db.collection(COLLECTION_NAME).get();
  const games = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return games;
}

async function getGameById(id) {
  const doc = await db.collection(COLLECTION_NAME).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

module.exports = {
  getAllGames,
  getGameById,
};
