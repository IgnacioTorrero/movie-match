import request from "supertest";
import express, { Express } from "express";
import authRoutes from "../../routes/auth.routes";
import { registerUser, loginUser } from "../../services/auth.service";

// Mock de servicios
jest.mock("../../services/auth.service", () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn()
}));

// Mock de validación para no bloquear por esquema
jest.mock("../../middlewares/validate.middleware", () => ({
  validate: () => (req: any, res: any, next: any) => next()
}));

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Auth Routes", () => {
  describe("POST /api/auth/register", () => {
    it("debe registrar un usuario y devolver 201", async () => {
      const mockUser = {
        id: 1,
        name: "Juan",
        email: "juan@example.com",
        password: "hashed123"
      };

      (registerUser as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Juan",
          email: "juan@example.com",
          password: "123456"
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: 1,
        name: "Juan",
        email: "juan@example.com"
      });
    });

    it("debe devolver 400 si el registro falla", async () => {
      (registerUser as jest.Mock).mockRejectedValue(new Error("Registro fallido"));

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Juan",
          email: "juan@example.com",
          password: "123456"
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Registro fallido");
    });
  });

  describe("POST /api/auth/login", () => {
    it("debe loguear correctamente y devolver token", async () => {
      const mockData = {
        token: "token123",
        user: {
          id: 1,
          name: "Juan",
          email: "juan@example.com"
        }
      };

      (loginUser as jest.Mock).mockResolvedValue(mockData);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "juan@example.com",
          password: "123456"
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe("token123");
      expect(res.body.user).toHaveProperty("email", "juan@example.com");
    });

    it("debe fallar con credenciales inválidas", async () => {
      (loginUser as jest.Mock).mockRejectedValue(new Error("Invalid credentials"));

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "fake@example.com",
          password: "wrong"
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Invalid credentials");
    });
  });
});
