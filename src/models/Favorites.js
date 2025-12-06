const { db, admin } = require("../config/db");

const USERS_COLLECTION = "users";
const GAMES_COLLECTION = "Videojuegos";

class Favorites {
  static async addFavorite(userId, gameId) {
    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const favRef = userRef.collection("favorites").doc(gameId);
    const gameRef = db.collection(GAMES_COLLECTION).doc(gameId);

    await db.runTransaction(async (t) => {
      const [favSnap, gameSnap] = await Promise.all([
        t.get(favRef),
        t.get(gameRef),
      ]);

      if (!gameSnap.exists) {
        throw new Error("GAME_NOT_FOUND");
      }

      if (favSnap.exists) return;

      t.set(favRef, {
        gameId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      t.update(gameRef, {
        favoritosCount: admin.firestore.FieldValue.increment(1),
      });
    });

    return { ok: true };
  }

  static async getFavorites(userId) {
    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const favSnap = await userRef.collection("favorites").get();

    if (favSnap.empty) return [];

    const gameIds = favSnap.docs.map((d) => d.data().gameId || d.id);

    const chunks = [];
    while (gameIds.length) {
      chunks.push(gameIds.splice(0, 10));
    }

    const results = [];

    for (const chunk of chunks) {
      const gamesSnap = await db
        .collection(GAMES_COLLECTION)
        .where(admin.firestore.FieldPath.documentId(), "in", chunk)
        .get();

      gamesSnap.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
    }

    return results;
  }

  static async removeFavorite(userId, gameId) {
    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const favRef = userRef.collection("favorites").doc(gameId);
    const gameRef = db.collection(GAMES_COLLECTION).doc(gameId);

    await db.runTransaction(async (t) => {
      const [favSnap, gameSnap] = await Promise.all([
        t.get(favRef),
        t.get(gameRef),
      ]);

      if (!favSnap.exists || !gameSnap.exists) return;

      t.delete(favRef);

      const currentCount = gameSnap.data().favoritosCount || 0;
      const newCount = currentCount > 0 ? currentCount - 1 : 0;

      t.update(gameRef, { favoritosCount: newCount });
    });

    return { ok: true };
  }
}

module.exports = Favorites;
