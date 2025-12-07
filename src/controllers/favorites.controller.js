const { db } = require("../config/db");

async function getFavorites(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId es requerido" });
    }

    const favoritesSnap = await db
      .collection("users")
      .doc(userId)
      .collection("favorites")
      .where("gameId", "!=", null)
      .get();

    const favorites = favoritesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ favorites });
  } catch (error) {
    console.error("Error obteniendo favoritos:", error);
    return res.status(500).json({ message: "Error al obtener favoritos" });
  }
}

async function addFavorite(req, res) {
  try {
    const { userId } = req.params;
    const { gameId } = req.body;

    if (!userId || !gameId) {
      return res.status(400).json({ message: "userId y gameId son requeridos" });
    }

    const userRef = db.collection("users").doc(userId);
    const favRef = userRef.collection("favorites").doc(String(gameId));
    const gameRef = db.collection("games").doc(String(gameId));

    await db.runTransaction(async (t) => {
      const [favSnap, gameSnap] = await Promise.all([
        t.get(favRef),
        t.get(gameRef),
      ]);

      if (favSnap.exists) {
        return;
      }

      t.set(favRef, {
        gameId: String(gameId),
        createdAt: new Date(),
      });

      if (gameSnap.exists) {
        const data = gameSnap.data();
        const currentCount =
          typeof data.favoritosCount === "number" ? data.favoritosCount : 0;

        t.update(gameRef, {
          favoritosCount: currentCount + 1,
        });
      }
    });

    return res.status(201).json({
      message: "Juego agregado a favoritos",
      favorite: { gameId: String(gameId) },
    });
  } catch (error) {
    console.error("Error agregando favorito:", error);
    return res.status(500).json({ message: "Error al agregar favorito" });
  }
}

async function removeFavorite(req, res) {
  try {
    const { userId, gameId } = req.params;

    if (!userId || !gameId) {
      return res.status(400).json({ message: "userId y gameId son requeridos" });
    }

    const userRef = db.collection("users").doc(userId);
    const favRef = userRef.collection("favorites").doc(String(gameId));
    const gameRef = db.collection("games").doc(String(gameId));

    await db.runTransaction(async (t) => {
      const [favSnap, gameSnap] = await Promise.all([
        t.get(favRef),
        t.get(gameRef),
      ]);

      if (!favSnap.exists) {
        throw new Error("FAVORITE_NOT_FOUND");
      }

      t.delete(favRef);

      if (gameSnap.exists) {
        const data = gameSnap.data();
        const currentCount =
          typeof data.favoritosCount === "number" ? data.favoritosCount : 0;
        const newCount = currentCount > 0 ? currentCount - 1 : 0;

        t.update(gameRef, { favoritosCount: newCount });
      }
    });

    return res.status(200).json({ message: "Favorito eliminado" });
  } catch (error) {
    console.error("Error eliminando favorito:", error);

    if (error.message === "FAVORITE_NOT_FOUND") {
      return res.status(404).json({ message: "El favorito no existe" });
    }

    return res.status(500).json({ message: "Error al eliminar favorito" });
  }
}

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};
