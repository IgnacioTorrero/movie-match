import request from "supertest";
import express, { Express } from "express";
import ratingRoutes from "../../routes/rating.routes";
import { rateMovie } from "../../services/rating.service";
import { validateUser } from "../../utils/validateUser";

jest.mock("../../src/utils/redisClient", () => ({
  __esModule: true,
  default: {
    on: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock("../../src/prisma", () => ({
  __esModule: true,
  prisma: {
    movie: {
      findUnique: jest.fn().mockResolvedValue({ id: 10, title: "Pelicula falsa" }),
    },
    rating: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock("../../src/services/rating.service");
jest.mock("../../src/middlewares/auth.middleware", () => ({
  // @ts-ignore
  authenticateToken: (req, res, next) => {
    req.user = { id: 1 };
    next();
  },
}));
jest.mock("../../src/middlewares/validate.middleware", () => ({
  // @ts-ignore
  validate: () => (req, res, next) => next(),
}));
jest.mock("../../src/utils/validateUser");

const app: Express = express();
app.use(express.json());
app.use("/", ratingRoutes);

describe("POST /rate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debería calificar correctamente una película", async () => {
    (validateUser as jest.Mock).mockResolvedValue(true);
    (rateMovie as jest.Mock).mockResolvedValue({ id: 1, score: 5 });

    const res = await request(app).post("/rate").send({ movieId: 10, score: 5 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(rateMovie).toHaveBeenCalledWith(1, 10, 5);
  });

  it("debería devolver 401 si no hay usuario autenticado", async () => {
    jest.resetModules();
    const appWithoutUser = express();
    appWithoutUser.use(express.json());

    jest.doMock("../../src/middlewares/auth.middleware", () => ({
        // @ts-ignore
      authenticateToken: (req, res, next) => next(),
    }));
    const { default: ratingRoutesNoUser } = await import("../../routes/rating.routes");
    appWithoutUser.use("/", ratingRoutesNoUser);

    const res = await request(appWithoutUser).post("/rate").send({ movieId: 10, score: 5 });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("Unauthorized");
  });

  it("debería devolver 400 si falta movieId o score", async () => {
    const res1 = await request(app).post("/rate").send({ score: 4 });
    expect(res1.status).toBe(400);
    expect(res1.body.error).toContain("Movie ID");

    const res2 = await request(app).post("/rate").send({ movieId: 10 });
    expect(res2.status).toBe(400);
    expect(res2.body.error).toContain("Movie ID");
  });

  it("debería devolver 400 si el usuario no es válido", async () => {
    (validateUser as jest.Mock).mockResolvedValue(false);

    const res = await request(app).post("/rate").send({ movieId: 10, score: 5 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("usuario no existe");
  });

  it("debería manejar errores del servicio rateMovie", async () => {
    (validateUser as jest.Mock).mockResolvedValue(true);
    (rateMovie as jest.Mock).mockRejectedValue(new Error("Fallo inesperado"));

    const res = await request(app).post("/rate").send({ movieId: 10, score: 3 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Fallo inesperado");
  });
});
