const express = require("express");
const cors = require("cors");
const path = require("path");
const gamesRoutes = require("./src/routes/games.routes");
const userRoutes = require("./src/routes/user.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use("/api/games", gamesRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
