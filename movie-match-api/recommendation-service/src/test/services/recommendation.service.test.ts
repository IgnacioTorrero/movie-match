// Mock Prisma Client
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

import { getRecommendedMovies } from "../../services/recommendation.service";
import { jest } from "@jest/globals";

const { PrismaClient } = jest.requireMock("@prisma/client") as any;
const prismaInstance = new PrismaClient();
const { ratingFindManyMock, movieFindManyMock } = prismaInstance.__MOCS__;

jest.mock("../../utils/redisClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn<() => Promise<string | null>>().mockResolvedValue(null),
    set: jest.fn(),
  },
}));

const redis = require("../../utils/redisClient").default;

describe("Recommendation Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    redis.get.mockResolvedValue(null);
  });

  test("Returns cached recommendations if available", async () => {
    const userId = 4;
    const cachedMovies = [{ id: 401, title: "Cached movie", genre: "Action" }];
    redis.get.mockResolvedValueOnce(JSON.stringify(cachedMovies));

    const result = await getRecommendedMovies(userId);

    expect(redis.get).toHaveBeenCalledWith(`recommendations:${userId}`);
    expect(result).toEqual(cachedMovies);
  });

  test("Recommends movies based on favorite genre", async () => {
    const userId = 1;

    ratingFindManyMock.mockResolvedValue([
      { id: 1, userId, score: 5, movie: { id: 101, genre: "Action/Adventure" } },
      { id: 2, userId, score: 4, movie: { id: 102, genre: "Action/Sci-Fi" } },
      { id: 3, userId, score: 4, movie: { id: 103, genre: "Action" } },
    ]);

    movieFindManyMock.mockResolvedValue([
      {
        id: 201,
        title: "Mad Max: Fury Road",
        genre: "Action",
        createdAt: new Date(),
        director: "George Miller",
        year: 2015,
        synopsis: "Post-apocalyptic action",
        updatedAt: new Date(),
      },
    ]);

    const result = await getRecommendedMovies(userId);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Mad Max: Fury Road" }),
      ])
    );
    expect(redis.set).toHaveBeenCalled();
  });

  test("Returns message if user has insufficient ratings", async () => {
    ratingFindManyMock.mockResolvedValue([]);

    const result = await getRecommendedMovies(2);

    expect(result).toEqual({ message: "There is not enough data to recommend movies." });
  });

  test("Returns message if no rated movie has a valid genre", async () => {
    ratingFindManyMock.mockResolvedValue([{ movie: { id: 999, genre: "" } }]);

    const result = await getRecommendedMovies(5);

    expect(result).toEqual({ message: "There is not enough data to recommend movies." });
  });

  test("Returns message if no new recommendations are found", async () => {
    ratingFindManyMock.mockResolvedValue([
      { score: 4, movie: { id: 104, genre: "Drama" } },
    ]);
    movieFindManyMock.mockResolvedValue([]);

    const result = await getRecommendedMovies(3);

    expect(result).toEqual({ message: "No new recommendations were found." });
  });

  test("Returns message if no genres are found to recommend", async () => {
    ratingFindManyMock.mockResolvedValue([{ movie: { id: 888, genre: "" } }]);

    const result = await getRecommendedMovies(6);

    expect(result).toEqual({ message: "There is not enough data to recommend movies." });
  });

  test("Handles Prisma error and throws generic error", async () => {
    ratingFindManyMock.mockRejectedValue(new Error("Prisma Failure"));
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(getRecommendedMovies(7)).rejects.toThrow("Error accessing the database.");
    spy.mockRestore();
  });
});