import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema } from "../validations/user.validation";
import { registerUser, loginUser } from "../services/auth.service";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registra un nuevo usuario
 * @access  Public
 */
router.post(
  "/register",
  validate(registerSchema),
  async (req, res) => {
    const { name, email, password } = req.body;

    try {
      const user = await registerUser(name, email, password);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Inicia sesión y retorna token
 * @access  Public
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { token, user } = await loginUser(email, password);
    res.status(200).json({ token, user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
