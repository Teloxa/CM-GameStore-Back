const { db } = require("../config/db");

const COLLECTION = "users";

class User {
  static async create(data) {
    const docRef = db.collection(COLLECTION).doc(); // id automático
    await docRef.set(data);
    return { id: docRef.id, ...data };
  }

  static async findByEmail(email) {
    const snapshot = await db
      .collection(COLLECTION)
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  static async findById(id) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }
}

module.exports = User;
