import {
  createMovie,
  getMovies,
  countMoviesByUser,
  getMovieById,
  updateMovie,
  deleteMovie,
} from "../../services/movie.service";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      movie: {
        create: jest.fn(({ data }) => ({
          id: 1,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        findMany: jest.fn(() => [
          {
            id: 1,
            title: "Inception",
            director: "Christopher Nolan",
            year: 2010,
            genre: "Sci-Fi",
            synopsis: "A mind-bending thriller.",
            createdAt: new Date(),
            updatedAt: new Date(),
            userMovies: [{ userId: 1 }],
          },
        ]),
        count: jest.fn(() => 1),
        findFirst: jest.fn(() => ({
          id: 1,
          title: "Inception",
          director: "Christopher Nolan",
          year: 2010,
          genre: "Sci-Fi",
          synopsis: "A mind-bending thriller.",
          rating: [{ score: 5 }],
          createdAt: new Date(),
          updatedAt: new Date(),
          userMovies: [{ userId: 1 }],
        })),
        update: jest.fn(({ where, data }) => ({
          id: where.id,
          ...data,
          updatedAt: new Date(),
        })),
        delete: jest.fn(({ where }) => ({
          id: where.id,
          title: "Deleted Movie",
        })),
      },
      userMovies: {
        findMany: jest.fn(() => [{ userId: 1 }, { userId: 2 }]),
        deleteMany: jest.fn(),
      },
      rating: {
        findMany: jest.fn(() => [{ userId: 2 }, { userId: 3 }]),
        deleteMany: jest.fn(),
      },
    })),
  };
});

// Mock Redis client
jest.mock("../../utils/redisClient", () => ({
  del: jest.fn(),
}));

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("Movie Service", () => {
  test("Should create a movie successfully", async () => {
    const movie = await createMovie(
      1,
      "Inception",
      "Christopher Nolan",
      2010,
      "Sci-Fi",
      "A mind-bending thriller."
    );

    expect(movie).toHaveProperty("id");
    expect(movie.title).toBe("Inception");
    expect(movie.director).toBe("Christopher Nolan");
    expect(movie.year).toBe(2010);
    expect(movie.genre).toBe("Sci-Fi");
  });

  test("Should get a list of movies with filters and pagination", async () => {
    const movies = await getMovies(1, {}, 5, 0);

    expect(movies.length).toBeGreaterThan(0);
    expect(movies[0]).toHaveProperty("title", "Inception");
  });

  test("Should count total movies that match filters", async () => {
    const totalMovies = await countMoviesByUser(1, {});
    expect(totalMovies).toBe(1);
  });

  test("Should retrieve a movie by ID", async () => {
    const movie = await getMovieById(1, 1);
    expect(movie).not.toBeNull();
    expect(movie?.title).toBe("Inception");
    expect(movie?.userRating).toBe(5);
  });

  test("Should update a movie successfully", async () => {
    const updatedMovie = await updateMovie(
      1,
      "Interstellar",
      "Christopher Nolan",
      2014,
      "Sci-Fi",
      "Space adventure"
    );

    expect(updatedMovie).toHaveProperty("id", 1);
    expect(updatedMovie.title).toBe("Interstellar");
    expect(updatedMovie.year).toBe(2014);
  });

  test("Should delete a movie successfully", async () => {
    const { PrismaClient } = require("@prisma/client");
    const mockInstance = PrismaClient.mock.results[0].value;
    const redis = require("../../utils/redisClient");

    const deletedMovie = await deleteMovie(1);

    expect(deletedMovie).toHaveProperty("id", 1);
    expect(deletedMovie.title).toBe("Deleted Movie");

    expect(mockInstance.rating.findMany).toHaveBeenCalledWith({
      where: { movieId: 1 },
      select: { userId: true },
    });
    expect(mockInstance.userMovies.findMany).toHaveBeenCalledWith({
      where: { movieId: 1 },
      select: { userId: true },
    });

    expect(mockInstance.rating.deleteMany).toHaveBeenCalledWith({
      where: { movieId: 1 },
    });
    expect(mockInstance.userMovies.deleteMany).toHaveBeenCalledWith({
      where: { movieId: 1 },
    });

    expect(mockInstance.movie.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(redis.del).toHaveBeenCalledTimes(3);
    expect(redis.del).toHaveBeenCalledWith("recommendations:1");
    expect(redis.del).toHaveBeenCalledWith("recommendations:2");
    expect(redis.del).toHaveBeenCalledWith("recommendations:3");
  });

  test("Should throw error if movie does not exist", async () => {
    const { PrismaClient } = require("@prisma/client");
    const mockInstance = PrismaClient.mock.results[0].value;
    mockInstance.movie.findFirst.mockResolvedValue(null);

    await expect(getMovieById(999, 1)).rejects.toThrow("Película no encontrada");
  });

  test("Should throw error if deleting a movie fails", async () => {
    const { PrismaClient } = require("@prisma/client");
    const mockInstance = PrismaClient.mock.results[0].value;
    mockInstance.userMovies.findMany.mockImplementation(() => {
      throw new Error("DB failure");
    });

    await expect(deleteMovie(1)).rejects.toThrow("Movie not found");
  });

  test("Should throw error if creating a movie fails", async () => {
    const { PrismaClient } = require("@prisma/client");
    const mockInstance = PrismaClient.mock.results[0].value;
    mockInstance.movie.create.mockRejectedValueOnce(new Error("DB create error"));

    await expect(
      createMovie(1, "Inception", "Christopher Nolan", 2010, "Sci-Fi", "desc")
    ).rejects.toThrow("Error al crear la película: DB create error");
  });

  test("Should return 'No hay rate' if user did not rate the movie", async () => {
    const { PrismaClient } = require("@prisma/client");
    const mockInstance = PrismaClient.mock.results[0].value;

    mockInstance.movie.findFirst.mockResolvedValueOnce({
      id: 2,
      title: "Sin rating",
      director: "Director X",
      year: 2023,
      genre: "Drama",
      synopsis: "Sinopsis",
      rating: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      userMovies: [{ userId: 1 }],
    });

    const movie = await getMovieById(2, 1);
    expect(movie.userRating).toBe("No hay rate");
  });
});