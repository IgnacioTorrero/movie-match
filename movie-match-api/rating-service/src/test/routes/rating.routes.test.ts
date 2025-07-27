process.env.AUTH_SERVICE_URL = "http://localhost:3001";

import express, { Express } from "express";
import request from "supertest";

let app: Express;
let rateMovie: jest.Mock;
let validateUser: jest.Mock;

beforeEach(async () => {
  jest.resetModules();

  jest.mock("../../utils/redisClient", () => ({
    __esModule: true,
    default: {
      on: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    },
  }));

  jest.mock("../../prisma", () => ({
    __esModule: true,
    prisma: {
      movie: {
        findUnique: jest.fn().mockResolvedValue({ id: 10, title: "Fake movie" }),
      },
      rating: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
    },
  }));

  jest.mock("../../services/rating.service");
  jest.mock("../../middlewares/auth.middleware", () => ({
    // @ts-ignore
    authenticateToken: (req, res, next) => {
      req.user = { id: 1 };
      next();
    },
  }));

  jest.mock("../../utils/validateUser");

  const ratingRoutes = require("../../routes/rating.routes").default;
  rateMovie = require("../../services/rating.service").rateMovie;
  validateUser = require("../../utils/validateUser").validateUser;

  app = express();
  app.use(express.json());
  app.use("/", ratingRoutes);
});

describe("Rating Routes", () => {
  test("POST /rate - should successfully rate a movie", async () => {
    validateUser.mockResolvedValue(true);
    rateMovie.mockResolvedValue({ id: 1, score: 5 });

    const res = await request(app).post("/rate").send({ movieId: 10, score: 5 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(rateMovie).toHaveBeenCalledWith(1, 10, 5);
  });

  test("POST /rate - should return 401 if the user is invalid", async () => {
    validateUser.mockResolvedValue(false);

    const res = await request(app).post("/rate").send({ movieId: 10, score: 5 });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("Unauthorized or invalid user.");
  });

  test("POST /rate - should handle rateMovie service errors", async () => {
    validateUser.mockResolvedValue(true);
    rateMovie.mockRejectedValue(new Error("Unexpected failure"));

    const res = await request(app).post("/rate").send({ movieId: 10, score: 3 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Unexpected failure");
  });
});