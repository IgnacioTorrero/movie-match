import { rateMovie } from "../../services/rating.service";
import { jest } from "@jest/globals";

// Mock PrismaClient
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      movie: {
        findUnique: jest.fn(({ where }) =>
          where.id === 99 ? null : { id: where.id }
        ),
      },
      rating: {
        findFirst: jest.fn(({ where }) => {
          if (where.userId === 999) return { id: 99 };
          return null;
        }),
        create: jest.fn(({ data }) => ({
          id: 1,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        update: jest.fn(({ data }) => ({
          id: 99,
          ...data,
          updatedAt: new Date(),
        })),
      },
    })),
  };
});

// Mock Redis
jest.mock("../../utils/redisClient", () => ({
  del: jest.fn(),
}));

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
});

describe("Rating Service", () => {
  test("Should create a rating if it doesn't exist", async () => {
    const rating = await rateMovie(1, 1, 4);
    expect(rating).toHaveProperty("id");
  });

  test("Should update the rating if it already exists", async () => {
    const updated = await rateMovie(999, 1, 5);
    expect(updated).toHaveProperty("id", 99);
    expect(updated.score).toBe(5);
  });

  test("Should throw an error if the movie does not exist", async () => {
    await expect(rateMovie(1, 99, 3)).rejects.toThrow("The film does not exist.");
  });

  test("Should throw an error if the score is invalid", async () => {
    await expect(rateMovie(1, 1, 0)).rejects.toThrow("The rating must be between 1 and 5 stars.");
    await expect(rateMovie(1, 1, 6)).rejects.toThrow("The rating must be between 1 and 5 stars.");
  });

  test("Should throw an error if userId or movieId is missing", async () => {
    await expect(rateMovie(0, 1, 3)).rejects.toThrow("User ID and Movie ID are required.");
    await expect(rateMovie(1, 0, 3)).rejects.toThrow("User ID and Movie ID are required.");
  });

  test("Should throw an error when rating update fails", async () => {
    const { PrismaClient } = require("@prisma/client");
    const mockInstance = PrismaClient.mock.results[0].value;

    mockInstance.rating.findFirst.mockResolvedValueOnce({ id: 99 });
    mockInstance.rating.update.mockRejectedValueOnce(new Error("DB error"));

    await expect(rateMovie(1, 1, 4)).rejects.toThrow("Error updating rating.");
  });

  test("Should throw an error when rating creation fails", async () => {
    const { PrismaClient } = require("@prisma/client");
    const mockInstance = PrismaClient.mock.results[0].value;

    mockInstance.rating.findFirst.mockResolvedValueOnce(null);
    mockInstance.rating.create.mockRejectedValueOnce(new Error("DB error"));

    await expect(rateMovie(1, 1, 4)).rejects.toThrow("Error creating rating.");
  });
});