const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./src/routes/auth.routes");    
const gamesRoutes = require("./src/routes/games.routes");
const userRoutes = require("./src/routes/user.routes");  
// const favoritesRoutes = require("./src/routes/favorites.routes");
// const authMiddleware = require("./src/middlewares/auth.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use("/api/auth", authRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/users", userRoutes);

// app.use("/api/favorites", authMiddleware, favoritesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
