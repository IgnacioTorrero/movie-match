import request from "supertest";
import express, { Express } from "express";
import userRoutes from "../../routes/user.route";
import { prisma } from "../../prisma";

// Prisma mock
jest.mock("../../prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use("/api/users", userRoutes);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("User Routes", () => {
  describe("GET /api/users/:id", () => {
    it("should return the user if it exists", async () => {
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

    it("should return 400 if the ID is not a valid number", async () => {
      const res = await request(app).get("/api/users/abc");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "ID inválido" });
    });

    it("should return 404 if the user does not exist", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get("/api/users/99");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Usuario no encontrado" });
    });

    it("should return 500 if an internal error occurs", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/api/users/1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: "Error interno del servidor" });

      consoleSpy.mockRestore();
    });
  });
});