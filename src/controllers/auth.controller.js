const authService = require("../services/auth.service");

async function register(req, res) {
  try {
    const { name, lastName, email, password } = req.body;

    const result = await authService.register({
      name,
      lastName,
      email,
      password,
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);

    if (err.message === "EMAIL_ALREADY_IN_USE") {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    return res
      .status(500)
      .json({ message: "Error al registrar usuario" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);

    if (err.message === "INVALID_CREDENTIALS") {
      return res
        .status(401)
        .json({ message: "Correo o contraseña incorrectos" });
    }

    return res
      .status(500)
      .json({ message: "Error al iniciar sesión" });
  }
}

module.exports = {
  register,
  login,
};
