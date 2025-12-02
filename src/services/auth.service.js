const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("../utils/jwt");

async function register({ name, lastName, email, password }) {
  // ¿Ya existe ese email?
  const existing = await User.findByEmail(email);
  if (existing) {
    const error = new Error("EMAIL_ALREADY_IN_USE");
    throw error;
  }

  // Hashear contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear usuario en Firestore
  const user = await User.create({
    name,
    lastName,
    email,
    password: hashedPassword,
    role: "USER",
    createdAt: new Date().toISOString()
  });

  // Crear token JWT
  const token = jwt.generateToken({ id: user.id, role: user.role });

  return { user, token };
}

async function login({ email, password }) {
  // Buscar usuario
  const user = await User.findByEmail(email);
  if (!user) {
    const error = new Error("INVALID_CREDENTIALS");
    throw error;
  }

  // Comparar contraseña
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const error = new Error("INVALID_CREDENTIALS");
    throw error;
  }

  // Generar token
  const token = jwt.generateToken({ id: user.id, role: user.role });

  return { user, token };
}

module.exports = {
  register,
  login,
};
