import { createMovie, getMovies, countMovies, getMovieById, updateMovie, deleteMovie } from "../src/services/movie.service";

// Mockeamos Prisma Client
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      movie: {
        create: jest.fn((data) => ({
          id: 1,
          ...data.data,
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
          },
        ]),
        count: jest.fn(() => 1),
        findUnique: jest.fn(({ where }) =>
          where.id === 1
            ? {
                id: 1,
                title: "Inception",
                director: "Christopher Nolan",
                year: 2010,
                genre: "Sci-Fi",
                synopsis: "A mind-bending thriller.",
                rating: [{ score: 5 }],
              }
            : null
        ),
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
      rating: {
        deleteMany: jest.fn(),
      },
    })),
  };
});

// Importamos Prisma después de mockearlo
//import { PrismaClient } from "@prisma/client";

//const prisma = new PrismaClient();

describe("Movie Service", () => {
  test("Debe crear una película correctamente", async () => {
    const movie = await createMovie(
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

  test("Debe obtener una lista de películas con filtros y paginación", async () => {
    const movies = await getMovies({}, 5, 0);
    
    expect(movies.length).toBeGreaterThan(0);
    expect(movies[0]).toHaveProperty("title", "Inception");
  });

  test("Debe contar el total de películas que cumplen los filtros", async () => {
    const totalMovies = await countMovies({});
    expect(totalMovies).toBe(1);
  });

  test("Debe obtener una película por ID", async () => {
    const movie = await getMovieById(1, 1);
    expect(movie).not.toBeNull();
    expect(movie?.title).toBe("Inception");
    expect(movie?.userRating).toBe(5);
  });

  test("Debe actualizar una película correctamente", async () => {
    const updatedMovie = await updateMovie(1, "Interstellar", "Christopher Nolan", 2014, "Sci-Fi", "Space adventure");
    
    expect(updatedMovie).toHaveProperty("id", 1);
    expect(updatedMovie.title).toBe("Interstellar");
    expect(updatedMovie.year).toBe(2014);
  });

  test("Debe eliminar una película correctamente", async () => {
    const deletedMovie = await deleteMovie(1);
    
    expect(deletedMovie).toHaveProperty("id", 1);
    expect(deletedMovie.title).toBe("Deleted Movie");
  });
});
