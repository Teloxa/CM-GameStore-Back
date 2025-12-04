const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Ruta al archivo JSON generado desde IGDB
const JSON_FILE = path.join(__dirname, "./igdb_catalogo/catalogoVideojuegos_igdb.json");

// Carga la clave privada generada en Firebase Console
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

async function importarVideojuegos() {
  console.log("Leyendo archivo JSON...");
  const data = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));

  console.log(`Subiendo ${data.length} videojuegos a Firestore...`);

  const batch = db.batch();

  data.forEach((juego) => {
    const docRef = db.collection("Videojuegos").doc(String(juego.id));
    batch.set(docRef, juego);
  });

  await batch.commit();
  console.log("🔥 Importación completa. Videojuegos cargados en Firestore.");
}

importarVideojuegos().catch((err) => {
  console.error("❌ Error importando:", err);
});
