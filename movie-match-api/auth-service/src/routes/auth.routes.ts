import { Router, Request, Response } from "express";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema } from "../validations/user.validation";
import { registerUser, loginUser } from "../services/auth.service";

const router = Router();

// Registro de Usuario
router.post("/register", validate(registerSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await registerUser(req.body.name, req.body.email, req.body.password);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login de Usuario
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, user } = await loginUser(req.body.email, req.body.password);
    res.status(200).json({ token, user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
