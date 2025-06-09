import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Clave secreta utilizada para firmar los tokens JWT
const SECRET_KEY = process.env.JWT_SECRET!;
if (!SECRET_KEY) throw new Error("JWT_SECRET is required");

const SALT_ROUNDS = 12;

/**
 * Registra un nuevo usuario en la base de datos.
 * 
 * Hashea la contraseña utilizando bcrypt antes de guardar el registro.
 * Normaliza el email a minúsculas y limpia espacios en blanco del nombre y email.
 * 
 * @param name - Nombre del usuario
 * @param email - Email del usuario
 * @param password - Contraseña en texto plano
 * @returns Objeto del usuario creado
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
 * Autentica a un usuario existente con email y contraseña.
 * 
 * Compara la contraseña proporcionada con la contraseña hasheada almacenada.
 * Si la autenticación es exitosa, genera y retorna un token JWT firmado.
 * 
 * @param email - Email del usuario
 * @param password - Contraseña en texto plano
 * @returns Objeto que contiene el token JWT y los datos básicos del usuario
 * @throws Error si las credenciales son inválidas
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
