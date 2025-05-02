import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "abc123";

export const registerUser = async (name: string, email: string, password: string) => {
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      updatedAt: new Date(), 
    },
  });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const cleanEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

  console.log("EMAIL:", email);
  console.log("PASSWORD:", password);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1d" });

  return { token, user };
};
