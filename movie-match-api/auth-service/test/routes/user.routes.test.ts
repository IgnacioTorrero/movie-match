jest.mock("../../src/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

import request from "supertest";
import express from "express";
import userRoutes from "../../src/routes/user.route";
import { prisma } from "../../src/prisma";

const app = express();
app.use(express.json());
app.use(userRoutes);

describe("User Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/users/:id - debe devolver usuario si existe", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: "test@example.com"
    });

    const res = await request(app).get("/api/users/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      email: "test@example.com"
    });
  });

  test("GET /api/users/:id - debe devolver 400 si id no es numérico", async () => {
    const res = await request(app).get("/api/users/abc");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "ID inválido" });
  });

  test("GET /api/users/:id - debe devolver 404 si usuario no existe", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get("/api/users/99");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Usuario no encontrado" });
  });

  test("GET /api/users/:id - debe devolver 500 si ocurre error interno", async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/users/1");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Error interno del servidor" });

    consoleSpy.mockRestore();
   });
});
