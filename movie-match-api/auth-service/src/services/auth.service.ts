import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Clave secreta para JWT
const SECRET_KEY = process.env.JWT_SECRET!;
if (!SECRET_KEY) throw new Error("JWT_SECRET is required");

const SALT_ROUNDS = 12;

/**
 * Registra un nuevo usuario con nombre, email y contraseña hasheada.
 */
export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      updatedAt: new Date(),
    },
  });

  return newUser;
};

/**
 * Autentica a un usuario y retorna un token JWT junto con los datos del usuario.
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ token: string; user: { id: string; email: string; name: string } }> => {
  const cleanEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    SECRET_KEY,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
};
