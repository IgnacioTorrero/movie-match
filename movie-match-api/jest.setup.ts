import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.user.deleteMany(); // Limpia la tabla de usuarios antes de cada test
});
