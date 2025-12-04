const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.join(
  __dirname,
  "../../serviceAccountKey.json"
));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const db = admin.firestore();

module.exports = { admin, db };
