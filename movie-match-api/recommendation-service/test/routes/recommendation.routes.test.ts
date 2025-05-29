jest.mock("@prisma/client", () => {
  const ratingFindManyMock = jest.fn();
  const movieFindManyMock = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      rating: { findMany: ratingFindManyMock },
      movie: { findMany: movieFindManyMock },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $on: jest.fn(),
      $transaction: jest.fn(),
      $use: jest.fn(),
      $executeRaw: jest.fn(),
      $queryRaw: jest.fn(),
      __MOCS__: { ratingFindManyMock, movieFindManyMock },
    })),
  };
});

process.env.JWT_SECRET = "test-secret";

import request from "supertest";
import express from "express";
import recommendationRoutes from "../../src/routes/recommendation.routes";
import * as recommendationService from "../../src/services/recommendation.service";
import * as authMiddleware from "../../src/middlewares/auth.middleware";
import redisClient from "../../src/utils/redisClient";

const app = express();
app.use(express.json());
app.use("/", recommendationRoutes);

jest.mock("../../src/utils/redisClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
  },
}));

jest.mock("../../src/services/recommendation.service");
jest.mock("../../src/middlewares/auth.middleware");
jest.mock("../../src/utils/redisClient");

describe("Recommendation Routes", () => {
  const mockUser = { id: 1 };

  beforeEach(() => {
    // Simula autenticación exitosa
    (authMiddleware.authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
      req.user = mockUser;
      next();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET / debería devolver recomendaciones exitosamente", async () => {
    const mockRecs = [{ id: 1, title: "Pelicula recomendada" }];
    (recommendationService.getRecommendedMovies as jest.Mock).mockResolvedValue(mockRecs);

    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockRecs);
    expect(recommendationService.getRecommendedMovies).toHaveBeenCalledWith(mockUser.id);
  });

  test("GET / debería manejar error si getRecommendedMovies lanza excepción", async () => {
    (recommendationService.getRecommendedMovies as jest.Mock).mockRejectedValue(new Error("Fallo en recomendación"));
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const res = await request(app).get("/");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Fallo en recomendación" });

    console.error = originalConsoleError;
  });

  test("DELETE /cache debería borrar la caché del usuario", async () => {
    (redisClient.del as jest.Mock).mockResolvedValue(1);

    const res = await request(app).delete("/cache");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Caché de recomendaciones borrada" });
    expect(redisClient.del).toHaveBeenCalledWith(`recommendations:${mockUser.id}`);
  });
});
