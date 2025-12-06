const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function register(req, res) {
  try {
    const { email, phone, username, password } = req.body;

    if (!email || !phone || !username || !password) {
      return res
        .status(400)
        .json({ message: "Faltan datos: email, phone, username o password" });
    }

    // Validar que no exista el email
    const existingByEmail = await User.findByEmail(email);
    if (existingByEmail) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Validar que no exista el username
    const existingByUsername = await User.findByUsername(username);
    if (existingByUsername) {
      return res
        .status(400)
        .json({ message: "El nombre de usuario ya está en uso" });
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    const now = new Date();

    const userData = {
      email,
      phone,
      username,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    // Crear usuario y subcolecciones favorites & purchases
    const user = await User.createWithCollections(userData);

    const { passwordHash: _, ...safeUser } = user;

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: safeUser,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ message: "Error al registrar usuario" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Faltan datos: email o password" });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Correo o contraseña incorrectos" });
    }

    // Comparar password con el hash
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return res
        .status(401)
        .json({ message: "Correo o contraseña incorrectos" });
    }

    const { passwordHash, ...safeUser } = user;

    return res.status(200).json({
      message: "Login correcto",
      user: safeUser,
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ message: "Error al iniciar sesión" });
  }
}

module.exports = {
  register,
  login,
};
