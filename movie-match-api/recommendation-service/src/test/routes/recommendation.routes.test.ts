jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      rating: { findMany: jest.fn() },
      movie: { findMany: jest.fn() },
    })),
  };
});

process.env.JWT_SECRET = "test-secret";

jest.mock("../../utils/redisClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
  },
}));

jest.mock("../../services/recommendation.service");
jest.mock("../../middlewares/auth.middleware");

import request from "supertest";
import express from "express";
import recommendationRoutes from "../../routes/recommendation.routes";
import * as recommendationService from "../../services/recommendation.service";
import * as authMiddleware from "../../middlewares/auth.middleware";
import redisClient from "../../utils/redisClient";

const app = express();
app.use(express.json());
app.use("/recommendations", recommendationRoutes);

describe("Recommendation Routes", () => {
  const mockUser = { id: 1 };

  beforeEach(() => {
    jest.clearAllMocks();

    // Simular autenticación
    (authMiddleware.authenticateToken as jest.Mock).mockImplementation(
      (req, _res, next) => {
        req.user = mockUser;
        next();
      }
    );
  });

  test("GET /recommendations debería devolver recomendaciones exitosamente", async () => {
    const mockRecs = [{ id: 1, title: "Pelicula recomendada" }];
    (recommendationService.getRecommendedMovies as jest.Mock).mockResolvedValue(mockRecs);

    const res = await request(app).get("/recommendations");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockRecs);
    expect(recommendationService.getRecommendedMovies).toHaveBeenCalledWith(mockUser.id);
  });

  test("GET /recommendations debería manejar errores del servicio", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    (recommendationService.getRecommendedMovies as jest.Mock).mockRejectedValue(new Error("Fallo en recomendación"));

    const res = await request(app).get("/recommendations");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Fallo en recomendación");
    consoleSpy.mockRestore();
  });

  test("DELETE /recommendations/cache debería borrar la caché del usuario", async () => {
    (redisClient.del as jest.Mock).mockResolvedValue(1);

    const res = await request(app).delete("/recommendations/cache");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Caché de recomendaciones borrada correctamente." });
    expect(redisClient.del).toHaveBeenCalledWith(`recommendations:${mockUser.id}`);
  });

  test("DELETE /recommendations/cache debería manejar errores", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    (redisClient.del as jest.Mock).mockRejectedValue(new Error("Fallo en redis"));

    const res = await request(app).delete("/recommendations/cache");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Fallo en redis");
    consoleSpy.mockRestore();
  });

  test("GET /recommendations debería devolver 400 si no hay userId", async () => {
    (authMiddleware.authenticateToken as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = undefined;
      next();
    });

    const res = await request(app).get("/recommendations");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "User ID no proporcionado." });
  });

  test("DELETE /recommendations/cache debería devolver 400 si no hay userId", async () => {
    (authMiddleware.authenticateToken as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = undefined;
      next();
    });

    const res = await request(app).delete("/recommendations/cache");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "User ID no proporcionado." });
  });
});
