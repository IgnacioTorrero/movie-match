process.env.JWT_SECRET = "test-secret";

import { registerUser, loginUser } from "../../services/auth.service";
import jwt from "jsonwebtoken";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const bcrypt = require("bcryptjs");
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        create: jest.fn(({ data }) => ({
          id: 1,
          ...data,
          password: bcrypt.hashSync(data.password, 12),
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        findUnique: jest.fn(({ where }) => {
          if (where.email === "john@example.com") {
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
  test("Should register a user successfully", async () => {
    const user = await registerUser("John Doe", "john@example.com", "password123");

    expect(user).toHaveProperty("id");
    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("john@example.com");
    expect(user.password).not.toBe("password123");
  });

  test("Should allow login with valid credentials", async () => {
    const email = "john@example.com";
    const password = "password123";

    const { token, user } = await loginUser(email, password);

    expect(token).toBeDefined();
    expect(jwt.verify(token, process.env.JWT_SECRET || "abc123")).toBeTruthy();
    expect(user).toHaveProperty("id");
    expect(user.email).toBe(email);
  });

  test("Should fail login with invalid credentials", async () => {
    await expect(loginUser("wrong@example.com", "wrongpassword")).rejects.toThrow("Invalid credentials");
  });

  test("Should fail login if password is incorrect", async () => {
    const email = "john@example.com";
    const passwordIncorrecto = "wrongKey";

    await expect(loginUser(email, passwordIncorrecto)).rejects.toThrow("Invalid credentials");
  });
});