import { registerUser, loginUser } from "../src/services/auth.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const bcrypt = require("bcryptjs");
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        create: jest.fn((data) => ({
          id: 1,
          ...data.data,
          password: bcrypt.hashSync(data.data.password, 12),
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        findUnique: jest.fn((query) => {
          if (query.where.email === "john@example.com") {
            return {
              id: 1,
              name: "John Doe",
              email: "john@example.com",
              password: bcrypt.hashSync("password123", 12),
            };
          }
          return null;
        }),
      },
    })),
  };
});

describe("Auth Service", () => {
  test("Debe registrar un usuario correctamente", async () => {
    const user = await registerUser("John Doe", "john@example.com", "password123");

    expect(user).toHaveProperty("id");
    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("john@example.com");
    expect(user.password).not.toBe("password123");
  });

  test("Debe permitir login con credenciales correctas", async () => {
    const email = "john@example.com";
    const password = "password123";

    const { token, user } = await loginUser(email, password);

    expect(token).toBeDefined();
    expect(jwt.verify(token, process.env.JWT_SECRET || "abc123")).toBeTruthy();
    expect(user).toHaveProperty("id");
    expect(user.email).toBe(email);
  });

  test("Debe fallar login con credenciales incorrectas", async () => {
    await expect(loginUser("wrong@example.com", "wrongpassword")).rejects.toThrow("Invalid credentials");
  });
});
