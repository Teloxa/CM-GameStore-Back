const { db, admin } = require("../config/db");

const USERS_COLLECTION = "users";
const GAMES_COLLECTION = "Videojuegos";

async function getFavorites(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "Falta userId en la URL" });
    }

    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const favsSnap = await userRef.collection("favorites").get();

    const favorites = [];

    favsSnap.forEach((doc) => {
      if (doc.id === "_meta") return;

      favorites.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    const favoriteIds = favorites.map((f) => String(f.gameId));

    return res.status(200).json({
      favorites,
      favoriteIds,
    });
  } catch (error) {
    console.error("Error obteniendo favoritos:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener favoritos del usuario" });
  }
}

async function addFavorite(req, res) {
  try {
    const { userId } = req.params;
    const { gameId } = req.body;

    if (!userId || !gameId) {
      return res
        .status(400)
        .json({ message: "Faltan datos: userId o gameId" });
    }

    const gameIdStr = String(gameId);

    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const favRef = userRef.collection("favorites").doc(gameIdStr);
    const gameRef = db.collection(GAMES_COLLECTION).doc(gameIdStr);

    await db.runTransaction(async (t) => {
      const favSnap = await t.get(favRef);

      if (favSnap.exists) {
        return;
      }

      t.set(favRef, {
        gameId: gameIdStr,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      t.set(
        gameRef,
        {
          favoritosCount: admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );
    });

    return res.status(201).json({
      message: "Favorito agregado correctamente",
      gameId: gameIdStr,
    });
  } catch (error) {
    console.error("Error agregando favorito:", error);
    return res.status(500).json({ message: "Error al agregar favorito" });
  }
}

module.exports = {
  getFavorites,
  addFavorite,
};
