import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Secret key used to sign JWT tokens
const SECRET_KEY = process.env.JWT_SECRET!;
if (!SECRET_KEY) throw new Error("JWT_SECRET is required");

const SALT_ROUNDS = 12;

/**
 * Registers a new user in the database.
 * 
 * Hashes the password using bcrypt before saving the record.
 * Normalizes the email to lowercase and trims whitespace from name and email.
 * 
 * @param name - User's name
 * @param email - User's email
 * @param password - Plain text password
 * @returns Created user object
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
 * Authenticates an existing user using email and password.
 * 
 * Compares the provided password with the stored hashed password.
 * If authentication is successful, generates and returns a signed JWT token.
 * 
 * @param email - User's email
 * @param password - Plain text password
 * @returns Object containing the JWT token and basic user data
 * @throws Error if credentials are invalid
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